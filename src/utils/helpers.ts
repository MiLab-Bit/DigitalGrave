import { clsx, type ClassValue } from 'clsx';

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Delay execution (for dramatic effect)
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Clamp a number between min and max
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: string[]) => void>(
  fn: T,
  ms: number
): ((...args: Parameters<T>) => void) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Check if string is valid GitHub username
 * GitHub username: alphanumeric, hyphens, no consecutive, 1-39 chars
 */
export function isValidGitHubUsername(username: string): boolean {
  return /^[a-zA-Z\d](?:[a-zA-Z\d]|-(?=[a-zA-Z\d])){0,38}$/.test(username.trim());
}

/**
 * Estimate commit count from public repos (rough heuristic)
 */
export function estimateCommits(reposCount: number): number {
  // Rough average: 50 commits per repo
  return reposCount * 50;
}