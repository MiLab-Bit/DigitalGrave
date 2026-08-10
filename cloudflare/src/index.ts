import { renderOgImage } from './og';
import { renderBadge } from './badge';
import { renderHeatmap } from './heatmap';

// Where the interactive SPA is hosted (GitHub Pages). The /og page links
// crawlers and users through to the actual, interactive tombstone.
const SPA_BASE = 'https://milab-bit.github.io/DigitalGrave/';

function decodeMsg(raw: string): string {
  try {
    const bytes = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return raw;
  }
}

function enc(s: string): string {
  return encodeURIComponent(s);
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default {
  async fetch(request: Request, _env: unknown, _ctx: unknown): Promise<Response> {
    const url = new URL(request.url);
    const p = url.pathname.replace(/\/+$/, '') || '/';
    const q = url.searchParams;

    try {
      // ---- OG share card landing page (read by social crawlers) ----
      if (p === '/og') {
        const user = q.get('user') || '';
        if (!user) return new Response('Missing ?user=', { status: 400 });
        const msg = q.get('msg') || '';
        const theme = q.get('theme') || 'pixel';
        const imgUrl = `${url.origin}/og-image?user=${enc(user)}&msg=${enc(msg)}&theme=${enc(theme)}`;
        const spaUrl = `${SPA_BASE}?user=${enc(user)}&msg=${enc(msg)}&theme=${enc(theme)}`;
        const desc = msg ? decodeMsg(msg) : 'Rest in commits.';

        const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"/>
<meta property="og:title" content="DigitalGrave · @${esc(user)}"/>
<meta property="og:description" content="${esc(desc)}"/>
<meta property="og:image" content="${imgUrl}"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="DigitalGrave · @${esc(user)}"/>
<meta name="twitter:description" content="${esc(desc)}"/>
<meta name="twitter:image" content="${imgUrl}"/>
<title>DigitalGrave · @${esc(user)}</title>
</head>
<body style="background:#0a0a0a;color:#d4d4d4;font-family:monospace;text-align:center;padding:40px">
<h1>@${esc(user)}</h1>
<p>${esc(desc)}</p>
<p><a style="color:#b8860b" href="${spaUrl}">打开交互式墓碑 &rarr;</a></p>
</body>
</html>`;
        return new Response(html, {
          headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=1800' },
        });
      }

      // ---- OG image (PNG) ----
      if (p === '/og-image') {
        return renderOgImage({
          user: q.get('user') || '',
          msg: q.get('msg') || '',
          theme: q.get('theme') || 'pixel',
        });
      }

      // ---- Dynamic README badge (SVG) ----
      if (p === '/badge') {
        return renderBadge(q.get('user') || '', q.get('metric') || 'repos');
      }

      // ---- Contribution heatmap (GraphQL, token required) ----
      if (p === '/heatmap') {
        const user = q.get('user') || '';
        const auth = request.headers.get('Authorization') || '';
        const token = auth.startsWith('Bearer ') ? auth.slice(7) : q.get('token') || '';
        return renderHeatmap(user, token);
      }

      // ---- Index / route map ----
      return new Response(
        [
          'DigitalGrave Edge',
          '',
          'Routes:',
          '  /og?user=&msg=&theme=        → OG share card (HTML + meta)',
          '  /og-image?user=&msg=&theme=  → OG image (PNG 1200x630)',
          '  /badge?user=&metric=repos|stars|last → README badge (SVG)',
          '  /heatmap?user=  (Authorization: Bearer <token>) → contribution heatmap (SVG)',
        ].join('\n'),
        { status: 200, headers: { 'content-type': 'text/plain; charset=utf-8' } }
      );
    } catch (e) {
      return new Response('Edge error: ' + (e as Error).message, { status: 500 });
    }
  },
};
