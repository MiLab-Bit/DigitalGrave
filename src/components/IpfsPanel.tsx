import { useState } from 'react';
import { Globe, Share2, ShieldAlert, Link as LinkIcon, Copy } from 'lucide-react';
import type { IpfsPanelProps } from '../types';
import { track } from '../lib/metrics';
import { HAS_CF, buildBadgeMarkdown } from '../lib/cfConfig';

interface Props extends IpfsPanelProps {
  shareUrl?: string;
  /** Cloudflare OG share URL (rich preview). Takes precedence over shareUrl. */
  ogUrl?: string | null;
  /** GitHub login, used to build the README badge snippet. */
  userLogin?: string;
}

export function IpfsPanel({ isMinting, ipfsHash, onMint, shareUrl, ogUrl, userLogin }: Props) {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBadge, setCopiedBadge] = useState(false);

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };

  const handleCopyCid = async () => {
    if (!ipfsHash) return;
    const ok = await copyText(`ipfs://${ipfsHash}`);
    if (ok) {
      track('copy_ipfs');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    const url = ogUrl ?? shareUrl ?? window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Digital Grave',
          text: 'Check out my GitHub Digital Grave!',
          url,
        });
        track('share_native');
      } catch {
        // User cancelled or not supported
      }
    } else {
      const ok = await copyText(url);
      if (ok) {
        track('share_link');
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    }
  };

  const handleCopyBadge = async () => {
    if (!userLogin) return;
    const md = buildBadgeMarkdown(userLogin);
    if (!md) return;
    const ok = await copyText(md);
    if (ok) {
      track('badge_copy', { user: userLogin });
      setCopiedBadge(true);
      setTimeout(() => setCopiedBadge(false), 2000);
    }
  };

  const showBadge = HAS_CF && !!userLogin;

  if (ipfsHash) {
    return (
      <div className="text-center space-y-4 animate-fade-in-up">
        <div className="bg-[var(--dg-bg)] border border-[var(--dg-edge)] p-4 rounded text-left font-mono text-xs text-[var(--dg-accent)] w-full max-w-md mx-auto break-all">
          <span className="text-[var(--dg-faint)] block mb-1 text-[10px] uppercase tracking-widest">
            IPFS CID Generated
          </span>
          <span className="text-[var(--dg-muted)]">ipfs://{ipfsHash}</span>
        </div>
        <div className="flex flex-wrap gap-6 justify-center">
          <button
            onClick={handleCopyCid}
            className="text-[var(--dg-muted)] hover:text-[var(--dg-fg)] text-xs uppercase tracking-widest flex items-center gap-2 transition-colors"
          >
            <LinkIcon size={14} />
            {copied ? 'Copied!' : 'Copy CID'}
          </button>
          <button
            onClick={handleShare}
            className="text-[var(--dg-muted)] hover:text-[var(--dg-fg)] text-xs uppercase tracking-widest flex items-center gap-2 transition-colors"
          >
            <Share2 size={14} />
            {copiedLink ? 'Link Copied!' : 'Share'}
          </button>
          {showBadge && (
            <button
              onClick={handleCopyBadge}
              className="text-[var(--dg-muted)] hover:text-[var(--dg-fg)] text-xs uppercase tracking-widest flex items-center gap-2 transition-colors"
            >
              <Copy size={14} />
              {copiedBadge ? 'Badge Copied!' : 'Badge'}
            </button>
          )}
          <button
            className="text-[var(--dg-muted)] hover:text-[var(--dg-accent)] text-xs uppercase tracking-widest flex items-center gap-2 transition-colors"
            title="Coming soon"
          >
            <ShieldAlert size={14} />
            Dead Man's Switch
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onMint}
      disabled={isMinting}
      className="flex items-center gap-3 px-8 py-3 bg-[var(--dg-fg)] text-[var(--dg-bg)] hover:opacity-80 transition-all font-mono text-sm font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer"
    >
      {isMinting ? (
        <>
          <div className="w-4 h-4 border-2 border-[var(--dg-bg)] border-t-transparent rounded-full animate-spin" />
          <AnimatedMintingText />
        </>
      ) : (
        <>
          <Globe size={16} />
          永久封存 (Simulate IPFS)
        </>
      )}
    </button>
  );
}

function AnimatedMintingText() {
  const stages = ['Connecting to IPFS...', 'Pinata pinning...', 'Generating CID...', 'Finalizing...'];
  const [stage, setStage] = useState(0);

  useState(() => {
    const interval = setInterval(() => {
      setStage(s => (s + 1) % stages.length);
    }, 600);
    return () => clearInterval(interval);
  });

  return <span>{stages[stage]}</span>;
}
