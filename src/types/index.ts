// ==================== GitHub Data Types ====================

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  created_at: string;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  hireable: boolean | null;
  twitter_username: string | null;
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
  html_url: string;
  forks_count: number;
  open_issues_count: number;
  watchers_count: number;
  topics: string[];
  license: { spdx_id: string; name: string } | null;
}

export interface GitHubCommitActivity {
  total: number;
  week: number;
}

// ==================== App State Types ====================

export interface ConfigData {
  username: string;
  message: string;
}

export interface GraveData {
  user: GitHubUser;
  configMessage: string;
  topRepo: GitHubRepo | null;
  recentRepo: GitHubRepo | null;
  lastPush: string;
  lastHash: string;
  ipfsHash: string | null;
  createdAt: string;
  apiStatus: ApiStatus;
  stats: GitHubStats;
  enrichment: GraveEnrichment | null;
  theme: ThemeId;
}

export interface GitHubStats {
  totalStars: number;
  totalForks: number;
  estimatedCommits: number;
  originalRepos: number;
}

// ==================== Theme ====================

export type ThemeId = 'pixel' | 'cyber' | 'ink' | 'glitch' | 'marble';

export interface ThemeMeta {
  id: ThemeId;
  label: string;
  /** Accent swatch for the picker */
  swatch: string;
}

// ==================== Grave Enrichment (L0/L1/L2) ====================

export interface LanguageSlice {
  language: string;
  count: number;
}

export interface GraveEnrichment {
  /** L1: 生卒时间轴已由 GraveData.lastPush/created_at 覆盖 */
  languages: LanguageSlice[]; // 陪葬品
  archivedRepos: GitHubRepo[]; // 陪葬项目
  longestGapDays: number | null; // 假死期：最长贡献空窗(天)
  firstPushAt: string | null; // 最早提交时间（驱动时间轴）
  lastPushAt: string | null; // 最晚提交时间（驱动时间轴）
  level: 'L0' | 'L1' | 'L2'; // 实际渲染到的数据层级
}

export type AppView = 'landing' | 'config' | 'tombstone';

export type ApiStatus = 'idle' | 'loading' | 'success' | 'error' | 'rate_limited' | 'not_found';

// ==================== Service Types ====================

export interface GitHubApiResponse<T> {
  data: T | null;
  status: ApiStatus;
  error?: string;
  fromCache: boolean;
}

export interface FetchUserResult {
  user: GitHubUser | null;
  status: ApiStatus;
  error?: string;
  fromCache: boolean;
}

export interface FetchReposResult {
  repos: GitHubRepo[];
  status: ApiStatus;
  error?: string;
}

// ==================== Component Props Types ====================

export interface TombstoneCardProps {
  data: GraveData;
  onReset: () => void;
}

export interface IpfsPanelProps {
  isMinting: boolean;
  ipfsHash: string | null;
  onMint: () => void;
}

export interface GitHubUserBadgeProps {
  user: GitHubUser;
  showPreview?: boolean;
}

// ==================== Utility Types ====================

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export type AnimationVariant = 'fade-in' | 'fade-in-up' | 'slide-from-bottom' | 'glitch' | 'pulse-slow';

// ==================== Form Types ====================

export interface ConfigFormStep1 {
  username: string;
  isValidating: boolean;
  preview: GitHubUser | null;
  validationError: string | null;
}

export interface ConfigFormStep2 {
  message: string;
  charCount: number;
  maxChars: number;
}

// ==================== Storage Types ====================

export interface SavedGrave {
  data: GraveData;
  savedAt: string;
}

export interface AppStorage {
  recentSearches: string[];
  savedGraves: SavedGrave[];
  lastViewed: string | null;
}