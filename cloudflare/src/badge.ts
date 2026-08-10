// Dynamic README badge (shields-style SVG) derived from PUBLIC GitHub data.
// No token required. metric: repos | stars | last

const BASE = 'https://api.github.com';

interface BadgeData {
  value: string;
  color: string;
}

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(BASE + path, {
      headers: { Accept: 'application/vnd.github.v3+json', 'User-Agent': 'DigitalGrave-Edge' },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function renderBadge(user: string, metric: string): Promise<Response> {
  const data: BadgeData = { value: 'unknown', color: '#555' };

  const [u, repos] = await Promise.all([
    fetchJson<{ public_repos: number }>(`/users/${user}`),
    fetchJson<Array<{ stargazers_count: number; pushed_at: string; fork: boolean }>>(
      `/users/${user}/repos?per_page=100&sort=pushed`
    ),
  ]);

  if (metric === 'stars') {
    const stars = (repos ?? []).filter((r) => !r.fork).reduce((s, r) => s + r.stargazers_count, 0);
    data.value = `${stars} ★`;
    data.color = '#b8860b';
  } else if (metric === 'last') {
    const dates = (repos ?? []).map((r) => new Date(r.pushed_at).getTime()).filter((t) => !isNaN(t));
    const last = dates.length ? new Date(Math.max(...dates)) : null;
    data.value = last ? last.toISOString().slice(0, 10) : 'n/a';
    data.color = '#22d3ee';
  } else {
    // repos
    data.value = `${u?.public_repos ?? (repos ?? []).length} repos`;
    data.color = '#9a3412';
  }

  if (!u && !repos) {
    data.value = 'user not found';
    data.color = '#8b0000';
  }

  const label = 'DigitalGrave';
  const labelW = 96;
  const valueW = Math.max(40, data.value.length * 8 + 16);
  const totalW = labelW + valueW;
  const h = 20;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${h}" role="img" aria-label="${esc(
    label
  )}: ${esc(data.value)}">
  <rect width="${labelW}" height="${h}" fill="#555"/>
  <rect x="${labelW}" width="${valueW}" height="${h}" fill="${data.color}"/>
  <g font-family="Verdana,Geneva,sans-serif" font-size="11">
    <text x="${labelW / 2}" y="14" fill="#fff" text-anchor="middle">${esc(label)}</text>
    <text x="${labelW + valueW / 2}" y="14" fill="#fff" text-anchor="middle">${esc(data.value)}</text>
  </g>
</svg>`;

  return new Response(svg, {
    headers: {
      'content-type': 'image/svg+xml; charset=utf-8',
      'cache-control': 'public, max-age=600',
    },
  });
}
