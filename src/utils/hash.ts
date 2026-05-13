/**
 * Generate a simulated 40-character Git commit hash
 */
export function generateCommitHash(): string {
  return Array.from({ length: 40 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

/**
 * Generate a simulated IPFS CID (Qm...)
 * Uses real CIDv0 format for authenticity
 */
export function generateIpfsCid(): string {
  // const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const base58chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  // IPFS CIDv0 starts with Qm, 46 characters total
  let result = 'Qm';
  for (let i = 0; i < 44; i++) {
    result += base58chars[Math.floor(Math.random() * base58chars.length)];
  }
  return result;
}

/**
 * Simple string hash for consistent tombstone IDs
 */
export function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return `grave-${Date.now()}-${simpleHash(Math.random().toString())}`;
}