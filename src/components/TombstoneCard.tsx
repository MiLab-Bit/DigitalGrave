import { useState } from 'react';
import type { TombstoneCardProps, GraveEnrichment } from '../types';
import { IpfsPanel } from './IpfsPanel';
import { ExportPngButton } from './ExportPngButton';
import { HeatmapCard } from './HeatmapCard';
import { buildShareUrl } from '../lib/share';
import { HAS_CF, buildOgShareUrl } from '../lib/cfConfig';
import { formatDateShort, formatNumber } from '../utils/formatters';
import { generateIpfsCid } from '../utils/hash';
import { Star, GitFork, Code2, BookOpen, RefreshCw, Crown } from 'lucide-react';

interface Props extends TombstoneCardProps {
  onReset: () => void;
}

export function TombstoneCard({ data, onReset }: Props) {
  const [isMinting, setIsMinting] = useState(false);
  const [ipfsHash, setIpfsHash] = useState(data.ipfsHash);

  const { user, configMessage, topRepo, lastPush, lastHash, stats } = data;
  const enrichment = data.enrichment;
  const isL2 = !!enrichment && enrichment.level === 'L2';

  // P0-1: deep-link that re-renders this exact tombstone.
  const shareUrl = buildShareUrl({
    user: user.login,
    message: configMessage,
    theme: data.theme,
  });

  // Route B: Cloudflare OG share URL (rich social preview). null when CF unset.
  const ogUrl = buildOgShareUrl({
    user: user.login,
    message: configMessage,
    theme: data.theme,
  });

  const handleMint = () => {
    setIsMinting(true);
    setTimeout(() => {
      setIpfsHash(generateIpfsCid());
      setIsMinting(false);
    }, 2500);
  };

  // 享 · TENURE: years between account creation and last activity.
  const tenureYears =
    user && lastPush
      ? Math.max(0, Math.floor((new Date(lastPush).getTime() - new Date(user.created_at).getTime()) / 31_536_000_000))
      : 0;

  return (
    <div className="min-h-screen bg-[var(--dg-bg)] text-[var(--dg-fg)] font-serif flex flex-col items-center py-12 px-4 selection:bg-[var(--dg-surface)] selection:text-[var(--dg-fg)]">

      {/* ============ The Headstone Slab ============ */}
      <div className="tomb-slab max-w-3xl w-full bg-[var(--dg-surface)] p-6 sm:p-8 md:p-14 mb-12 animate-slide-from-bottom">

        {/* Top motif + kicker */}
        <div className="text-center mb-8">
          <div className="tomb-motif engraved">✝</div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--dg-faint)]">
            Digital Grave · 数字墓碑
          </p>
        </div>

        {/* Identity medallion */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="avatar-frame w-24 h-24 md:w-28 md:h-28 mb-4">
            <img
              src={user.avatar_url}
              alt={user.login}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }}
            />
          </div>
          <h2 className="engraved text-3xl md:text-5xl font-bold tracking-wide uppercase text-[var(--dg-fg)]">
            {user.name || user.login}
          </h2>
          <p className="font-mono text-[var(--dg-muted)] text-sm mt-1">@{user.login}</p>
        </div>

        {/* Vital: 生 · 享 · 卒 */}
        <div className="vital-row mb-10 font-mono">
          <Vital label="生 · BORN" value={formatDateShort(user.created_at)} />
          <span className="vital-divider" />
          <Vital label="享 · TENURE" value={`${tenureYears} 年`} />
          <span className="vital-divider" />
          <Vital label="卒 · ENDED" value={formatDateShort(lastPush)} />
        </div>

        {/* Epitaph (墓志铭) */}
        <div className="mb-12 text-center">
          <div className="mx-auto w-16 h-px bg-[var(--dg-edge)] mb-6" />
          <p className="engraved text-lg sm:text-xl md:text-2xl text-[var(--dg-fg)] leading-relaxed italic font-light max-w-2xl mx-auto break-words">
            “{configMessage}”
          </p>
          <div className="mx-auto w-16 h-px bg-[var(--dg-edge)] mt-6" />
        </div>

        {/* Life stats (生平) */}
        <Section kicker="生平 · LEGACY" title="GitHub 遗产">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatItem icon={<Star size={14} />} value={formatNumber(stats.totalStars)} label="Stars" />
            <StatItem icon={<GitFork size={14} />} value={formatNumber(stats.totalForks)} label="Forks" />
            <StatItem icon={<Code2 size={14} />} value={formatNumber(stats.estimatedCommits)} label="Commits" />
            <StatItem icon={<BookOpen size={14} />} value={stats.originalRepos} label="Repos" />
          </div>
        </Section>

        {/* Magnum Opus */}
        {topRepo && (
          <Section kicker="代表作 · MAGNUM OPUS" title="">
            <div className="flex items-center gap-3 mb-3 text-[var(--dg-faint)] justify-center">
              <Crown size={14} className="text-[var(--dg-accent)]" />
              <span className="font-mono text-xs uppercase tracking-[0.3em]">{topRepo.name}</span>
            </div>
            <a
              href={topRepo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-[var(--dg-bg)] border border-[var(--dg-edge)] p-4 hover:border-[var(--dg-accent)] transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[var(--dg-fg)] text-sm truncate">{topRepo.name}</span>
                {topRepo.language && (
                  <span className="text-[10px] uppercase text-[var(--dg-muted)] border border-[var(--dg-edge)] px-2 py-0.5 rounded-full flex-shrink-0">
                    {topRepo.language}
                  </span>
                )}
              </div>
              {topRepo.description && (
                <p className="text-[var(--dg-muted)] text-xs mt-2 line-clamp-2">{topRepo.description}</p>
              )}
              <div className="flex items-center gap-4 text-[var(--dg-faint)] text-xs font-mono mt-2">
                <span>★ {formatNumber(topRepo.stargazers_count)}</span>
                <span>⑂ {formatNumber(topRepo.forks_count)}</span>
              </div>
            </a>
          </Section>
        )}

        {/* L2 Enrichment */}
        {isL2 && enrichment && (
          <>
            {enrichment.languages.length > 0 && (
              <Section kicker="陪葬品 · OFFERINGS" title="语言陪葬">
                <LanguageBar enrichment={enrichment} />
              </Section>
            )}

            {enrichment.archivedRepos.length > 0 && (
              <Section kicker="封存的遗产 · SEALED" title="">
                <ul className="flex flex-col items-center gap-2 max-w-xl mx-auto">
                  {enrichment.archivedRepos.slice(0, 5).map((r) => (
                    <li
                      key={r.name}
                      className="flex items-center gap-3 w-full bg-[var(--dg-bg)] border border-[var(--dg-edge)] px-3 py-2"
                    >
                      <span className="seal-mark">封</span>
                      <a
                        href={r.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[var(--dg-muted)] text-sm truncate hover:text-[var(--dg-fg)] transition-colors"
                      >
                        {r.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {enrichment.longestGapDays !== null && enrichment.firstPushAt && enrichment.lastPushAt && (
              <Section kicker="假死期 · DORMANCY" title="">
                <GapTimeline enrichment={enrichment} />
              </Section>
            )}
          </>
        )}

        {/* Route B: Contribution heatmap */}
        {HAS_CF && <HeatmapCard user={user.login} />}

        {/* Footer: commit-hash seal */}
        <div className="text-center mt-10 space-y-3">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--dg-faint)] font-mono">Final Commit</p>
          <span className="commit-seal">{lastHash.slice(0, 16)}</span>
          <div>
            <a
              href={user.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[var(--dg-muted)] text-xs hover:text-[var(--dg-fg)] transition-colors underline decoration-[var(--dg-edge)]"
            >
              github.com/{user.login}
            </a>
          </div>
        </div>
      </div>

      {/* ============ Action Area ============ */}
      <div className="flex flex-col items-center gap-6">
        <IpfsPanel
          isMinting={isMinting}
          ipfsHash={ipfsHash}
          onMint={handleMint}
          shareUrl={shareUrl}
          ogUrl={ogUrl}
          userLogin={user.login}
        />

        <div className="flex items-center gap-6">
          <ExportPngButton data={data} />
          <button
            onClick={onReset}
            className="flex items-center gap-2 text-[var(--dg-muted)] hover:text-[var(--dg-fg)] text-xs uppercase tracking-widest transition-colors font-mono"
          >
            <RefreshCw size={12} />
            Create Another
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============ Sub-components ============ */

function Section({ kicker, title, children }: { kicker: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-12">
      <div className="text-center mb-6">
        <span className="block text-[10px] uppercase tracking-[0.35em] text-[var(--dg-faint)] mb-2">{kicker}</span>
        {title && <h3 className="engraved text-[var(--dg-muted)] text-sm uppercase tracking-[0.3em]">{title}</h3>}
      </div>
      {children}
    </div>
  );
}

function Vital({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center px-1">
      <span className="block text-[9px] uppercase tracking-[0.2em] text-[var(--dg-faint)] mb-1.5">{label}</span>
      <span className="engraved text-[var(--dg-fg)] text-sm md:text-base whitespace-nowrap">{value}</span>
    </div>
  );
}

function StatItem({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="bg-[var(--dg-bg)] border border-[var(--dg-edge)] p-3 text-center">
      <div className="flex justify-center mb-1 text-[var(--dg-muted)]">{icon}</div>
      <div className="engraved text-[var(--dg-fg)] font-mono text-sm">{value}</div>
      <div className="text-[var(--dg-faint)] text-[10px] uppercase tracking-widest mt-0.5">{label}</div>
    </div>
  );
}

function LanguageBar({ enrichment }: { enrichment: GraveEnrichment }) {
  const langs = enrichment.languages.slice(0, 8);
  const total = langs.reduce((s, l) => s + l.count, 0) || 1;
  return (
    <div className="max-w-xl mx-auto">
      <div className="lang-bar">
        {langs.map((l, i) => {
          const pct = (l.count / total) * 100;
          const alpha = Math.max(28, 95 - i * 9);
          return (
            <div
              key={l.language}
              className="lang-seg"
              style={{ width: `${pct}%`, background: `color-mix(in srgb, var(--dg-accent) ${alpha}%, var(--dg-edge))` }}
              title={`${l.language} ×${l.count}`}
            />
          );
        })}
      </div>
      <div className="lang-legend">
        {langs.map((l) => (
          <span key={l.language} className="text-[var(--dg-muted)] text-xs font-mono">
            {l.language} <span className="text-[var(--dg-faint)]">×{l.count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function GapTimeline({ enrichment }: { enrichment: GraveEnrichment }) {
  const gap = enrichment.longestGapDays ?? 0;
  const first = enrichment.firstPushAt!;
  const last = enrichment.lastPushAt!;
  const spanMs = new Date(last).getTime() - new Date(first).getTime();
  const gapMs = gap * 86_400_000;
  const fillPct = spanMs > 0 ? Math.min(100, Math.max(6, (gapMs / spanMs) * 100)) : 6;

  return (
    <div className="max-w-xl mx-auto text-center">
      <p className="engraved text-[var(--dg-fg)] text-3xl font-mono mb-1">{gap}</p>
      <p className="text-[var(--dg-muted)] text-xs mb-5">天 · 最长的提交空窗</p>
      <div className="gap-track">
        <div className="gap-fill" style={{ width: `${fillPct}%` }} />
      </div>
      <div className="flex justify-between mt-2 font-mono text-[10px] text-[var(--dg-faint)]">
        <span>最早 {formatDateShort(first)}</span>
        <span>最近 {formatDateShort(last)}</span>
      </div>
    </div>
  );
}
