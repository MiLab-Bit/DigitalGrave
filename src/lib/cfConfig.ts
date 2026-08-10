import type { ThemeId } from '../types';

/**
 * Cloudflare Edge feature flag (Route B).
 *
 * Set VITE_CF_ENDPOINT at build time to your deployed Worker URL, e.g.
 *   https://digitalgrave-edge.<sub>.workers.dev
 * Leave it unset to keep the pure-frontend fallback (deep-link share + local PNG).
 */
export const CF_ENDPOINT: string = (import.meta.env.VITE_CF_ENDPOINT ?? '')
  .toString()
  .replace(/\/+$/, '');
export const HAS_CF = CF_ENDPOINT.length > 0;

function enc(s: string): string {
  return encodeURIComponent(s);
}

/** OG-rich share URL (Cloudflare /og). null when CF is not configured. */
export function buildOgShareUrl(p: { user: string; message: string; theme: ThemeId }): string | null {
  if (!HAS_CF) return null;
  const params = new URLSearchParams();
  params.set('user', p.user);
  params.set('msg', btoa(encodeURIComponent(p.message)));
  params.set('theme', p.theme);
  return `${CF_ENDPOINT}/og?${params.toString()}`;
}

/** README badge <img> snippet. null when CF is not configured. */
export function buildBadgeMarkdown(user: string): string | null {
  if (!HAS_CF) return null;
  return `![DigitalGrave](${CF_ENDPOINT}/badge?user=${enc(user)})`;
}
