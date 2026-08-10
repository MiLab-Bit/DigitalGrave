// OG image generation for DigitalGrave share cards.
// satori lays out a VDOM tree; @resvg/resvg-wasm rasterizes to PNG — both run
// inside the Worker (no external image service, no API keys).

import satori from 'satori';
import { Resvg } from '@resvg/resvg-wasm';

// Palettes mirrored from the SPA (src/lib/themes.ts -> src/index.css).
// Keys MUST match ThemeId: pixel | cyber | ink | glitch | marble
const PALETTES: Record<string, { bg: string; fg: string; accent: string }> = {
  pixel: { bg: '#0a0a0a', fg: '#d4d4d4', accent: '#b8860b' },
  cyber: { bg: '#04111d', fg: '#cffafe', accent: '#22d3ee' },
  ink: { bg: '#e9e5db', fg: '#1c1917', accent: '#9a3412' },
  glitch: { bg: '#0c0014', fg: '#f5e1ff', accent: '#f43f5e' },
  marble: { bg: '#15151a', fg: '#f1f5f9', accent: '#94a3b8' },
};

let FONT_REGULAR: ArrayBuffer | null = null;
let FONT_BOLD: ArrayBuffer | null = null;

async function loadFonts(): Promise<void> {
  if (FONT_REGULAR && FONT_BOLD) return;
  const base = 'https://raw.githubusercontent.com/google/fonts/main/ofl/inter/';
  const [r, b] = await Promise.all([
    fetch(base + 'Inter-Regular.ttf').then((res) => res.arrayBuffer()),
    fetch(base + 'Inter-Bold.ttf').then((res) => res.arrayBuffer()),
  ]);
  FONT_REGULAR = r;
  FONT_BOLD = b;
}

function decodeMsg(raw: string): string {
  try {
    const bytes = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return raw;
  }
}

export async function renderOgImage(opts: {
  user: string;
  msg: string; // base64(encodeURIComponent(message))
  theme: string;
}): Promise<Response> {
  const user = opts.user || 'unknown';
  const message = opts.msg ? decodeMsg(opts.msg) : 'Rest in commits.';
  const c = PALETTES[opts.theme] ?? PALETTES.pixel;

  await loadFonts();

  // satori accepts plain VDOM nodes ({ type, props }) — no React dependency.
  const node = {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: c.bg,
        color: c.fg,
        fontFamily: 'Inter',
        padding: '64px',
        position: 'relative',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              fontSize: 26,
              letterSpacing: 10,
              color: c.accent,
              textTransform: 'uppercase',
              fontWeight: 700,
            },
            children: 'DigitalGrave',
          },
        },
        {
          type: 'div',
          props: {
            style: { fontSize: 60, fontWeight: 700, marginTop: 18 },
            children: `@${user}`,
          },
        },
        {
          type: 'div',
          props: {
            style: {
              fontSize: 32,
              fontStyle: 'italic',
              marginTop: 28,
              maxWidth: 920,
              textAlign: 'center',
              lineHeight: 1.4,
            },
            children: message,
          },
        },
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              bottom: 36,
              fontSize: 20,
              letterSpacing: 4,
              color: c.accent,
            },
            children: 'your github is your digital grave',
          },
        },
      ],
    },
  };

  const svg = await satori(node as unknown as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Inter', data: FONT_REGULAR!, weight: 400, style: 'normal' },
      { name: 'Inter', data: FONT_BOLD!, weight: 700, style: 'normal' },
    ],
  });

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  const png = resvg.render().asPng();

  return new Response(png, {
    headers: {
      'content-type': 'image/png',
      'cache-control': 'public, max-age=3600',
    },
  });
}
