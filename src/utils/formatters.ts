/**
 * Format a date string to display format
 * e.g. "2010-01-01T00:00:00Z" → "JANUARY 1, 2010"
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'UNKNOWN';
  try {
    const date = new Date(dateString);
    return date
      .toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      .toUpperCase();
  } catch {
    return 'UNKNOWN';
  }
}

/**
 * Format date to short format
 * e.g. "2010-01-01" → "2010.01.01"
 */
export function formatDateShort(dateString: string | null | undefined): string {
  if (!dateString) return '----.--.--';
  try {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 10).replace(/-/g, '.');
  } catch {
    return '----.--.--';
  }
}

/**
 * Format relative time (e.g. "3 months ago", "yesterday")
 */
export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return 'unknown';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${diffMonths} days ago`;
    if (diffYears < 1) return `${diffMonths} months ago`;
    return `${diffYears} years ago`;
  } catch {
    return 'unknown';
  }
}

/**
 * Format number with locale separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Generate initials from a name
 */
export function getInitials(name: string | null, login: string): string {
  if (name) {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return login.slice(0, 2).toUpperCase();
}