import { useState } from 'react';
import { Download } from 'lucide-react';
import type { GraveData } from '../types';
import { track } from '../lib/metrics';
import { formatDateShort } from '../utils/formatters';

interface ExportPngButtonProps {
  data: GraveData;
}

const W = 1200;
const H = 630;

/** Render the tombstone to a 1200x630 PNG and trigger a download (P0-3). */
export function ExportPngButton({ data }: ExportPngButtonProps) {
  const [busy, setBusy] = useState(false);

  const handleExport = () => {
    setBusy(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const styles = getComputedStyle(document.documentElement);
      const bg = styles.getPropertyValue('--dg-bg').trim() || '#0a0a0a';
      const fg = styles.getPropertyValue('--dg-fg').trim() || '#d4d4d4';
      const accent = styles.getPropertyValue('--dg-accent').trim() || '#b8860b';
      const muted = styles.getPropertyValue('--dg-muted').trim() || '#a1a1aa';
      const faint = styles.getPropertyValue('--dg-faint').trim() || '#52525b';
      const edge = styles.getPropertyValue('--dg-edge').trim() || '#27272a';
      const surface = styles.getPropertyValue('--dg-surface').trim() || '#18181b';

      const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
      };

      // Background
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Headstone slab (rounded-top)
      ctx.fillStyle = surface;
      ctx.strokeStyle = edge;
      ctx.lineWidth = 3;
      roundRect(70, 40, W - 140, H - 80, 80);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'center';

      // Top motif
      ctx.fillStyle = faint;
      ctx.font = '40px Georgia, serif';
      ctx.fillText('✝', W / 2, 110);

      // Name
      ctx.fillStyle = fg;
      ctx.font = 'bold 56px Georgia, serif';
      ctx.fillText(data.user.name || data.user.login, W / 2, 185);
      ctx.fillStyle = muted;
      ctx.font = '22px "JetBrains Mono", monospace';
      ctx.fillText(`@${data.user.login}`, W / 2, 225);

      // Vital: 生 / 享 / 卒
      const born = formatDateShort(data.user.created_at);
      const ended = formatDateShort(data.lastPush);
      const tenure = Math.max(
        0,
        Math.floor(
          (new Date(data.lastPush).getTime() - new Date(data.user.created_at).getTime()) / 31_536_000_000,
        ),
      );
      ctx.font = '20px "JetBrains Mono", monospace';
      ctx.fillStyle = faint;
      ctx.fillText('生 BORN', W / 2 - 250, 280);
      ctx.fillText('享 TENURE', W / 2, 280);
      ctx.fillText('卒 ENDED', W / 2 + 250, 280);
      ctx.fillStyle = fg;
      ctx.font = 'bold 26px "JetBrains Mono", monospace';
      ctx.fillText(born, W / 2 - 250, 315);
      ctx.fillText(`${tenure}y`, W / 2, 315);
      ctx.fillText(ended, W / 2 + 250, 315);

      // Epitaph
      ctx.fillStyle = fg;
      ctx.font = 'italic 34px Georgia, serif';
      wrapText(ctx, `“${data.configMessage}”`, W / 2, 380, W - 240, 46);

      // Language proportion bar
      const langs = data.enrichment?.languages.slice(0, 8) ?? [];
      let barY = 470;
      if (langs.length > 0) {
        const total = langs.reduce((s, l) => s + l.count, 0) || 1;
        let cursorX = W / 2 - 360;
        const barW = 720;
        const segH = 14;
        for (const l of langs) {
          const w = (l.count / total) * barW;
          ctx.fillStyle = accent;
          ctx.globalAlpha = 0.85;
          ctx.fillRect(cursorX, barY, w, segH);
          ctx.globalAlpha = 1;
          cursorX += w;
        }
        ctx.strokeStyle = edge;
        ctx.lineWidth = 1;
        ctx.strokeRect(W / 2 - 360, barY, barW, segH);
        ctx.fillStyle = muted;
        ctx.font = '18px "JetBrains Mono", monospace';
        ctx.fillText(langs.slice(0, 5).map((l) => `${l.language}×${l.count}`).join('   '), W / 2, barY + 44);
        barY += 70;
      }

      // Footer: stats + commit seal
      ctx.fillStyle = muted;
      ctx.font = '20px "JetBrains Mono", monospace';
      const statLine = `${data.stats.totalStars} ★   ·   ${data.stats.originalRepos} repos   ·   born ${new Date(
        data.user.created_at,
      ).getFullYear()}`;
      ctx.fillText(statLine, W / 2, H - 95);

      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      roundRect(W / 2 - 160, H - 75, 320, 34, 5);
      ctx.stroke();
      ctx.fillStyle = accent;
      ctx.font = '16px "JetBrains Mono", monospace';
      ctx.fillText(data.lastHash.slice(0, 18), W / 2, H - 52);

      canvas.toBlob(blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `digital-grave-${data.user.login}.png`;
        a.click();
        URL.revokeObjectURL(url);
        track('export_png', { theme: data.theme });
      }, 'image/png');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={busy}
      className="flex items-center gap-2 text-[var(--dg-muted)] hover:text-[var(--dg-accent)] text-xs uppercase tracking-widest transition-colors font-mono disabled:opacity-50"
    >
      <Download size={14} />
      {busy ? 'Rendering...' : 'Export PNG'}
    </button>
  );
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): void {
  const chars = Array.from(text);
  let line = '';
  let cursorY = y;
  for (const ch of chars) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY);
      line = ch;
      cursorY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cursorY);
}
