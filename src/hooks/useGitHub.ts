import { useState, useCallback } from 'react';

interface FetchOutcome {
  ok: boolean;
  error?: string;
  snapshot?: UseGitHubDataResult;
}
import type { GitHubUser, GitHubRepo, GitHubStats, GraveData, ThemeId } from '../types';
import {
  fetchGitHubUser,
  fetchGitHubRepos,
  computeTopRepo,
  computeRecentRepo,
  computeStats,
  computeEnrichment,
} from '../services/github';
import { generateCommitHash } from '../utils/hash';

interface UseGitHubDataResult {
  user: GitHubUser | null;
  repos: GitHubRepo[];
  stats: GitHubStats;
  topRepo: GitHubRepo | null;
  recentRepo: GitHubRepo | null;
  lastPush: string;
  status: 'idle' | 'loading' | 'success' | 'error' | 'rate_limited' | 'not_found';
  errorMessage: string | null;
}

export function useGitHubData() {
  const [state, setState] = useState<UseGitHubDataResult>({
    user: null,
    repos: [],
    stats: { totalStars: 0, totalForks: 0, estimatedCommits: 0, originalRepos: 0 },
    topRepo: null,
    recentRepo: null,
    lastPush: new Date().toISOString(),
    status: 'idle',
    errorMessage: null,
  });

  const fetchData = useCallback(async (username: string): Promise<FetchOutcome> => {
    setState(prev => ({ ...prev, status: 'loading', errorMessage: null }));

    const [userResult, reposResult] = await Promise.all([
      fetchGitHubUser(username),
      fetchGitHubRepos(username),
    ]);

    // Handle user not found
    if (userResult.status === 'not_found') {
      const err = userResult.error || 'User not found';
      setState(prev => ({ ...prev, status: 'not_found', errorMessage: err }));
      return { ok: false, error: err };
    }

    // Handle rate limit (no fallback user available)
    if (userResult.status === 'rate_limited' && !userResult.user) {
      const err = userResult.error || 'Rate limited';
      setState(prev => ({ ...prev, status: 'rate_limited', errorMessage: err }));
      return { ok: false, error: err };
    }

    const user = userResult.user!;
    const repos = reposResult.repos;
    const topRepo = computeTopRepo(repos);
    const recentRepo = computeRecentRepo(repos);
    const stats = computeStats(repos);
    const lastPush = recentRepo?.pushed_at || new Date().toISOString();

    const snapshot: UseGitHubDataResult = {
      user,
      repos,
      stats,
      topRepo,
      recentRepo,
      lastPush,
      status: userResult.status === 'error' ? 'error' : 'success',
      errorMessage: userResult.error || reposResult.status === 'error'
        ? 'Some data could not be loaded' : null,
    };
    setState(snapshot);
    return { ok: true, snapshot };
  }, []);

  // NOTE: reads the freshly-fetched snapshot passed in by the caller, NOT the
  // hook's closure state — avoids the stale-closure bug where buildGraveData
  // ran before fetchData's setState had re-rendered the component.
  const buildGraveData = useCallback(
    (message: string, theme: ThemeId, snapshot: UseGitHubDataResult): GraveData => {
      return {
        user: snapshot.user!, // ok===true guarantees a non-null user (not_found / rate_limited return early)
        configMessage: message,
        topRepo: snapshot.topRepo,
        recentRepo: snapshot.recentRepo,
        lastPush: snapshot.lastPush,
        lastHash: generateCommitHash(),
        ipfsHash: null,
        createdAt: new Date().toISOString(),
        apiStatus: snapshot.status,
        stats: snapshot.stats,
        enrichment: computeEnrichment(snapshot.repos),
        theme,
      };
    },
    [],
  );

  const reset = useCallback(() => {
    setState({
      user: null,
      repos: [],
      stats: { totalStars: 0, totalForks: 0, estimatedCommits: 0, originalRepos: 0 },
      topRepo: null,
      recentRepo: null,
      lastPush: new Date().toISOString(),
      status: 'idle',
      errorMessage: null,
    });
  }, []);

  return { ...state, fetchData, buildGraveData, reset };
}