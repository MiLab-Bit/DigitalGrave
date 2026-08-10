import { useState } from 'react';
import { CalendarDays, Loader2, Eye } from 'lucide-react';
import { CF_ENDPOINT, HAS_CF } from '../lib/cfConfig';
import { track } from '../lib/metrics';

const TOKEN_KEY = 'dg_gh_token';

/**
 * P0-2 enrichment (Route B): contribution heatmap ("贡献年轮").
 * Proxies GitHub GraphQL through the Cloudflare Worker. The GitHub token is
 * supplied by the user, kept in localStorage only, and sent as a Bearer header —
 * it never leaves the browser except to GitHub via the edge.
 */
export function HeatmapCard({ user }: { user: string }) {
  const [token, setToken] = useState<string>(() => {
    try {
      return localStorage.getItem(TOKEN_KEY) || '';
    } catch {
      return '';
    }
  });
  const [svg, setSvg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!HAS_CF) return null;

  const saveToken = (t: string) => {
    setToken(t);
    try {
      if (t) localStorage.setItem(TOKEN_KEY, t);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${CF_ENDPOINT}/heatmap?user=${encodeURIComponent(user)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const text = await res.text();
      if (!res.ok) {
        setError('无法生成贡献年轮（可能需要有效 GitHub Token）');
        return;
      }
      setSvg(text);
      track('heatmap_view', { user });
    } catch {
      setError('请求失败，请检查网络或端点');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-12">
      <div className="text-center mb-6">
        <span className="block text-[10px] uppercase tracking-[0.3em] text-[var(--dg-faint)] mb-2">
          Eternal Rings
        </span>
        <h3 className="text-[var(--dg-muted)] text-sm uppercase tracking-[0.3em]">贡献年轮</h3>
      </div>

      <div className="max-w-xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="password"
            value={token}
            onChange={(e) => saveToken(e.target.value)}
            placeholder="GitHub Token（可选，提升额度）"
            className="flex-1 min-w-0 bg-[var(--dg-bg)] border border-[var(--dg-edge)] px-3 py-2 text-xs font-mono text-[var(--dg-fg)] placeholder-[var(--dg-faint)] focus:border-[var(--dg-accent)] focus:outline-none"
          />
          <button
            onClick={load}
            disabled={loading}
            className="px-4 py-2 bg-[var(--dg-accent)] text-[var(--dg-bg)] text-xs uppercase tracking-widest hover:opacity-80 disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Eye size={12} />}
            生成年轮
          </button>
        </div>

        {error && <p className="text-red-500 text-xs text-center">{error}</p>}

        {svg && (
          <div
            className="bg-[var(--dg-bg)] border border-[var(--dg-edge)] p-3 overflow-x-auto animate-fade-in"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}

        <p className="text-[var(--dg-faint)] text-[10px] text-center leading-relaxed">
          <CalendarDays size={10} className="inline mr-1" />
          由 Cloudflare 边缘函数代理 GitHub GraphQL · Token 仅存于本地浏览器，不离开你的设备
        </p>
      </div>
    </div>
  );
}
