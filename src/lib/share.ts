import type { ThemeId } from '../types';
import { isThemeId } from './themes';

export interface ShareParams {
  user: string;
  message: string;
  theme: ThemeId;
}

/** Build a deep-link URL that re-renders the exact tombstone. */
export function buildShareUrl(p: ShareParams): string {
  const base = `${window.location.origin}${window.location.pathname}`;
  const params = new URLSearchParams();
  params.set('user', p.user);
  // msg carries user input -> base64 to survive URL encoding safely
  params.set('msg', btoa(encodeURIComponent(p.message)));
  params.set('theme', p.theme);
  return `${base}?${params.toString()}`;
}

/** Parse deep-link params from a URLSearchParams. Returns null when no `user`. */
export function parseShareParams(search: string): ShareParams | null {
  const params = new URLSearchParams(search);
  const user = params.get('user');
  if (!user) return null;

  let message = '';
  const rawMsg = params.get('msg');
  if (rawMsg) {
    try {
      message = decodeURIComponent(atob(rawMsg));
    } catch {
      message = rawMsg; // fall back to raw if not valid base64
    }
  }

  const rawTheme = params.get('theme');
  const theme: ThemeId = isThemeId(rawTheme) ? rawTheme : 'pixel';

  return { user, message, theme };
}
