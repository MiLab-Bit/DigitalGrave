// Contribution heatmap via GitHub GraphQL. Requires a token (passed by the SPA,
// stored only in the user's browser, forwarded here as `Authorization: Bearer`).
// Returns a responsive SVG the SPA injects into the tombstone.

const GH_GRAPHQL = 'https://api.github.com/graphql';

interface DayCell {
  date: string;
  contributionCount: number;
}

function levelFor(count: number): number {
  if (count <= 0) return 0;
  if (count < 3) return 1;
  if (count < 6) return 2;
  if (count < 10) return 3;
  return 4;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const LEVEL_COLORS = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];

function errorSvg(msg: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="60" viewBox="0 0 320 60">
  <rect width="320" height="60" fill="#1a0a0a"/>
  <text x="160" y="34" fill="#f87171" font-family="monospace" font-size="13" text-anchor="middle">${esc(msg)}</text>
</svg>`;
}

export async function renderHeatmap(user: string, token: string): Promise<Response> {
  if (!token) {
    return new Response(errorSvg('GitHub Token required'), {
      status: 400,
      headers: { 'content-type': 'image/svg+xml; charset=utf-8' },
    });
  }

  const query = `query($login:String!){ user(login:$login){ contributionsCollection{ contributionCalendar{ totalContributions weeks{ contributionDays{ contributionCount date } } } } } }`;

  let json: any = null;
  try {
    const res = await fetch(GH_GRAPHQL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'DigitalGrave-Edge',
      },
      body: JSON.stringify({ query, variables: { login: user } }),
    });
    json = await res.json();
  } catch {
    return new Response(errorSvg('GraphQL request failed'), {
      status: 502,
      headers: { 'content-type': 'image/svg+xml; charset=utf-8' },
    });
  }

  const calendar =
    json?.data?.user?.contributionsCollection?.contributionCalendar ?? null;
  const weeks: Array<{ contributionDays: DayCell[] }> = calendar?.weeks ?? [];
  const total: number = calendar?.totalContributions ?? 0;

  if (!weeks.length) {
    return new Response(errorSvg('No contribution data'), {
      status: 404,
      headers: { 'content-type': 'image/svg+xml; charset=utf-8' },
    });
  }

  const cols = weeks.length;
  const cell = 11;
  const gap = 3;
  const w = cols * (cell + gap) + 10;
  const h = 7 * (cell + gap) + 30;

  let rects = '';
  weeks.forEach((wk, ci) => {
    wk.contributionDays.forEach((d, ri) => {
      const lvl = levelFor(d.contributionCount);
      const x = 5 + ci * (cell + gap);
      const y = 20 + ri * (cell + gap);
      rects += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="2" fill="${LEVEL_COLORS[lvl]}"/>`;
    });
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 ${w} ${h}" role="img" aria-label="Contribution heatmap for ${esc(
    user
  )}">
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <text x="5" y="12" fill="#a1a1aa" font-family="monospace" font-size="11">${esc(user)} · ${total} contributions</text>
  ${rects}
</svg>`;

  return new Response(svg, {
    headers: {
      'content-type': 'image/svg+xml; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}
