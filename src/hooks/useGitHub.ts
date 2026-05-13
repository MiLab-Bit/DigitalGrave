import { useState, useCallback } from 'react';
import type { GitHubUser, GitHubRepo, GitHubStats, GraveData } from '../types';
import {
  fetchGitHubUser,
  fetchGitHubRepos,
  computeTopRepo,
  computeRecentRepo,
  computeStats,
  buildGraveMessage,
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

  const fetchData = useCallback(async (username: string) => {
    setState(prev => ({ ...prev, status: 'loading', errorMessage: null }));

    const [userResult, reposResult] = await Promise.all([
      fetchGitHubUser(username),
      fetchGitHubRepos(username),
    ]);

    // Handle user not found
    if (userResult.status === 'not_found') {
      setState(prev => ({
        ...prev,
        status: 'not_found',
        errorMessage: userResult.error || 'User not found',
      }));
      return;
    }

    // Handle rate limit
    if (userResult.status === 'rate_limited' && !userResult.user) {
      setState(prev => ({
        ...prev,
        status: 'rate_limited',
        errorMessage: userResult.error || 'Rate limited',
      }));
      return;
    }

    const user = userResult.user!;
    const repos = reposResult.repos;
    const topRepo = computeTopRepo(repos);
    const recentRepo = computeRecentRepo(repos);
    const stats = computeStats(repos);
    const lastPush = recentRepo?.pushed_at || new Date().toISOString();

    setState({
      user,
      repos,
      stats,
      topRepo,
      recentRepo,
      lastPush,
      status: userResult.status === 'error' ? 'error' : 'success',
      errorMessage: userResult.errorMessage || reposResult.status === 'error'
        ? 'Some data could not be loaded' : null,
    });
  }, []);

  const buildGraveData = useCallback((message: string): GraveData => {
    return {
      user: state.user!,
      configMessage: message,
      topRepo: state.topRepo,
      recentRepo: state.recentRepo,
      lastPush: state.lastPush,
      lastHash: generateCommitHash(),
      ipfsHash: null,
      createdAt: new Date().toISOString(),
      apiStatus: state.status,
      stats: state.stats,
    };
  }, [state]);

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

export { buildGraveMessage } from '../services/github';