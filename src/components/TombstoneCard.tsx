import { useState } from 'react';
import type { TombstoneCardProps } from '../types';
import { GitHubUserBadge } from './GitHubUserBadge';
import { RepoCard } from './RepoCard';
import { IpfsPanel } from './IpfsPanel';
import { formatDate, formatNumber } from '../utils/formatters';
import { generateIpfsCid } from '../utils/hash';
import { Code2, Star, GitFork, BookOpen, RefreshCw } from 'lucide-react';

interface Props extends TombstoneCardProps {
  onReset: () => void;
}

export function TombstoneCard({ data, onReset }: Props) {
  const [isMinting, setIsMinting] = useState(false);
  const [ipfsHash, setIpfsHash] = useState(data.ipfsHash);
  const [showStats, setShowStats] = useState(false);

  const { user, configMessage, topRepo, lastPush, lastHash, stats } = data;

  const handleMint = () => {
    setIsMinting(true);
    setTimeout(() => {
      setIpfsHash(generateIpfsCid());
      setIsMinting(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-400 font-serif flex flex-col items-center py-12 px-4 selection:bg-stone-700 selection:text-white">

      {/* Tombstone Card */}
      <div className="max-w-3xl w-full bg-black border border-stone-800 shadow-2xl relative p-8 md:p-16 mb-12 animate-slide-from-bottom">

        {/* Ornamental Corners */}
        <CornerMarker position="top-left" />
        <CornerMarker position="top-right" />
        <CornerMarker position="bottom-left" />
        <CornerMarker position="bottom-right" />

        {/* User Identity */}
        <div className="flex flex-col items-center text-center space-y-6 mb-12">
          <GitHubUserBadge user={user} variant="large" />
        </div>

        {/* Timeline */}
        <div className="flex justify-center items-center gap-8 mb-16 font-mono text-xs md:text-sm text-stone-500 border-t border-b border-stone-900 py-6">
          <div className="text-center">
            <span className="block text-stone-700 uppercase mb-1 text-[10px] tracking-[0.2em]">Initialized</span>
            <span className="text-stone-400">{formatDate(user.created_at)}</span>
          </div>
          <div className="h-px w-12 bg-stone-800 relative">
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-stone-700 text-xs">✦</span>
          </div>
          <div className="text-center">
            <span className="block text-stone-700 uppercase mb-1 text-[10px] tracking-[0.2em]">Terminated</span>
            <span className="text-stone-400">{formatDate(lastPush)}</span>
          </div>
        </div>

        {/* Epitaph */}
        <div className="mb-16 text-center space-y-6">
          <div className="flex justify-center">
            <Code2 size={20} className="text-stone-700" />
          </div>
          <p className="text-xl md:text-2xl text-stone-300 leading-relaxed italic font-light max-w-2xl mx-auto">
            "{configMessage}"
          </p>
        </div>

        {/* Magnum Opus */}
        {topRepo && (
          <div className="mb-12">
            <h3 className="text-center text-stone-700 text-[10px] uppercase tracking-[0.3em] mb-6">
              Magnum Opus
            </h3>
            <RepoCard repo={topRepo} variant="magnum-opus" />
          </div>
        )}

        {/* Stats Toggle */}
        <div className="mb-12">
          <button
            onClick={() => setShowStats(s => !s)}
            className="w-full text-center text-stone-700 text-[10px] uppercase tracking-[0.2em] hover:text-stone-500 transition-colors flex items-center justify-center gap-2"
          >
            <BookOpen size={10} />
            {showStats ? 'Hide Stats' : 'Show GitHub Legacy Stats'}
          </button>
          {showStats && (
            <div className="mt-4 grid grid-cols-4 gap-4 text-center animate-fade-in">
              <StatItem icon={<Star size={14} />} value={formatNumber(stats.totalStars)} label="Stars" />
              <StatItem icon={<GitFork size={14} />} value={formatNumber(stats.totalForks)} label="Forks" />
              <StatItem icon={<Code2 size={14} />} value={formatNumber(stats.estimatedCommits)} label="Commits" />
              <StatItem icon={<BookOpen size={14} />} value={stats.originalRepos} label="Repos" />
            </div>
          )}
        </div>

        {/* Footer: Commit Hash */}
        <div className="text-center space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-stone-700 font-mono">Final Commit Hash</p>
          <p className="font-mono text-stone-600 text-xs md:text-sm break-all">
            {lastHash}
          </p>
        </div>
      </div>

      {/* Action Area */}
      <div className="flex flex-col items-center gap-6">
        <IpfsPanel
          isMinting={isMinting}
          ipfsHash={ipfsHash}
          onMint={handleMint}
        />

        <button
          onClick={onReset}
          className="flex items-center gap-2 text-stone-600 hover:text-stone-400 text-xs uppercase tracking-widest transition-colors font-mono"
        >
          <RefreshCw size={12} />
          Create Another Tombstone
        </button>
      </div>
    </div>
  );
}

function CornerMarker({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const className = 'absolute w-4 h-4 border-stone-600';
  const corners: Record<string, string> = {
    'top-left': 'top-4 left-4 border-t border-l',
    'top-right': 'top-4 right-4 border-t border-r',
    'bottom-left': 'bottom-4 left-4 border-b border-l',
    'bottom-right': 'bottom-4 right-4 border-b border-r',
  };
  return <div className={`${className} ${corners[position]}`} />;
}

function StatItem({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="bg-stone-900/30 border border-stone-900 p-3 text-center">
      <div className="flex justify-center mb-1 text-stone-500">{icon}</div>
      <div className="text-stone-300 font-mono text-sm">{value}</div>
      <div className="text-stone-700 text-[10px] uppercase tracking-widest">{label}</div>
    </div>
  );
}