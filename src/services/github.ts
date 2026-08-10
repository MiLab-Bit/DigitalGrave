/**
 * GitHub API Service
 *
 * Strategy: Try real API first, graceful fallback on failure/limit.
 * All responses are cached in localStorage for 5 minutes.
 */

import type { GitHubUser, GitHubRepo, ApiStatus, FetchUserResult, FetchReposResult, GitHubStats, GraveEnrichment, LanguageSlice } from '../types';

const BASE_URL = 'https://api.github.com';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const CACHE_PREFIX = 'dg_cache_';

// ==================== Caching ====================

function getCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return entry.data as T;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch {
    // localStorage might be full or unavailable
  }
}

// ==================== Rate Limit Detection ====================

function checkRateLimit(response: Response): boolean {
  const remaining = response.headers.get('x-ratelimit-remaining');
  if (remaining === '0') return true;
  if (response.status === 403) return true;
  return false;
}

// ==================== Core Fetch ====================

async function githubFetch<T>(path: string, username: string): Promise<{ data: T | null; status: ApiStatus }> {
  const cacheKey = `${username}_${path}`;
  const cached = getCache<T>(cacheKey);
  if (cached) {
    return { data: cached, status: 'success' };
  }

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'DigitalGrave-v1',
      },
    });

    if (response.status === 404) {
      return { data: null, status: 'not_found' };
    }

    if (checkRateLimit(response)) {
      return { data: cached ?? null, status: 'rate_limited' };
    }

    if (!response.ok) {
      return { data: null, status: 'error' };
    }

    const data = await response.json();
    setCache(cacheKey, data);
    return { data, status: 'success' };
  } catch {
    return { data: cached ?? null, status: 'error' };
  }
}

// ==================== Build Fallback Data ====================

function buildFallbackUser(username: string): GitHubUser {
  return {
    login: username,
    name: username,
    avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=1a1a1a&color=a8a8a8&size=200&font-size=0.4`,
    bio: 'GitHub 用户',
    created_at: new Date().toISOString(),
    public_repos: 0,
    followers: 0,
    following: 0,
    html_url: `https://github.com/${username}`,
    company: null,
    blog: '',
    location: null,
    email: null,
    hireable: null,
    twitter_username: null,
  };
}

// ==================== Public API ====================

export async function fetchGitHubUser(username: string): Promise<FetchUserResult> {
  const result = await githubFetch<GitHubUser>(`/users/${username}`, username);

  if (result.status === 'not_found') {
    return { user: null, status: 'not_found', error: `User "${username}" not found on GitHub`, fromCache: false };
  }

  if (result.status === 'error' && !result.data) {
    return {
      user: buildFallbackUser(username),
      status: 'error',
      error: 'Failed to fetch GitHub data. Showing fallback preview.',
      fromCache: false,
    };
  }

  if (result.status === 'rate_limited' && !result.data) {
    return {
      user: null,
      status: 'rate_limited',
      error: 'GitHub API rate limit reached (60 requests/hour). Please try again later.',
      fromCache: false,
    };
  }

  return { user: result.data!, status: 'success', fromCache: false };
}

export async function fetchGitHubRepos(username: string): Promise<FetchReposResult> {
  const result = await githubFetch<GitHubRepo[]>(
    `/users/${username}/repos?sort=pushed&per_page=100&type=owner`,
    `${username}_repos`
  );

  if (result.status === 'error' || result.status === 'rate_limited') {
    return { repos: [], status: result.status };
  }

  if (result.status === 'not_found') {
    return { repos: [], status: 'not_found' };
  }

  // Filter out forks, keep only original repos
  const originalRepos = (result.data || []).filter(r => !r.fork);

  return { repos: originalRepos, status: 'success' };
}

export function computeTopRepo(repos: GitHubRepo[]): GitHubRepo | null {
  if (repos.length === 0) return null;
  return repos.reduce((best, current) =>
    current.stargazers_count > best.stargazers_count ? current : best
  );
}

export function computeRecentRepo(repos: GitHubRepo[]): GitHubRepo | null {
  if (repos.length === 0) return null;
  return repos.reduce((latest, current) =>
    new Date(current.pushed_at) > new Date(latest.pushed_at) ? current : latest
  );
}

export function computeStats(repos: GitHubRepo[]): GitHubStats {
  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const totalForks = repos.reduce((sum, r) => sum + r.forks_count, 0);
  const originalRepos = repos.filter(r => !r.fork).length;

  return {
    totalStars,
    totalForks,
    estimatedCommits: originalRepos * 50, // rough heuristic
    originalRepos,
  };
}

/**
 * Enrichment for the tombstone (P0-2). Cheap: derives everything from the
 * already-fetched repos list — NO extra API calls (per competitive-analyst
 * cost analysis: pure-front has 30x rate-limit headroom with 2 calls).
 *
 * Layers (graceful degradation):
 *  - L0 core is always rendered by the card (username + avatar + epitaph).
 *  - L1 = timeline (created_at / lastPush) — caller renders when repos exist.
 *  - L2 = languages / archived repos / longest gap — this payload.
 */
export function computeEnrichment(repos: GitHubRepo[]): GraveEnrichment {
  const original = repos.filter(r => !r.fork);

  const langCount = new Map<string, number>();
  for (const r of original) {
    if (r.language) langCount.set(r.language, (langCount.get(r.language) ?? 0) + 1);
  }
  const languages: LanguageSlice[] = Array.from(langCount.entries())
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count);

  const archivedRepos = original.filter(r => r.archived);

  // 假死期: longest gap (days) between consecutive repo push dates.
  const pushes = original
    .map(r => new Date(r.pushed_at).getTime())
    .filter(t => !Number.isNaN(t))
    .sort((a, b) => a - b);
  let longestGapDays: number | null = null;
  if (pushes.length >= 2) {
    let maxGap = 0;
    for (let i = 1; i < pushes.length; i++) {
      const gap = pushes[i] - pushes[i - 1];
      if (gap > maxGap) maxGap = gap;
    }
    longestGapDays = Math.floor(maxGap / 86_400_000);
  }

  const firstPushAt = pushes.length > 0 ? new Date(pushes[0]).toISOString() : null;
  const lastPushAt = pushes.length > 0 ? new Date(pushes[pushes.length - 1]).toISOString() : null;

  return {
    languages,
    archivedRepos,
    longestGapDays,
    firstPushAt,
    lastPushAt,
    level: repos.length > 0 ? 'L2' : 'L1',
  };
}

export function buildGraveMessage(): string {
  const messages = [
    `它曾让某个深夜调试的陌生人感到不再孤单。`,
    `留下的是代码，带不走的是时间。`,
    `每一行提交，都是存在的证明。`,
    `愿我的代码被后人读懂，愿我的 bug 被后人修复。`,
    `The code remains. The coder moves on.`,
    `在 git log 里，我曾活过。`,
    `Fork not found. Pull request denied.`,
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}