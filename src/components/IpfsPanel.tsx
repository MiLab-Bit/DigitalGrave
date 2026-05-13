import { useState } from 'react';
import { Globe, Share2, ShieldAlert } from 'lucide-react';
import type { IpfsPanelProps } from '../types';

export function IpfsPanel({ isMinting, ipfsHash, onMint }: IpfsPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!ipfsHash) return;
    try {
      await navigator.clipboard.writeText(`ipfs://${ipfsHash}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select text
    }
  };

  const handleShare = async () => {
    if (!ipfsHash) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Digital Grave',
          text: 'Check out my GitHub Digital Grave!',
          url: window.location.href,
        });
      } catch {
        // User cancelled or not supported
      }
    } else {
      handleCopy();
    }
  };

  if (ipfsHash) {
    return (
      <div className="text-center space-y-4 animate-fade-in-up">
        <div className="bg-stone-900/50 border border-stone-800 p-4 rounded text-left font-mono text-xs text-green-500/80 w-full max-w-md mx-auto break-all">
          <span className="text-stone-500 block mb-1 text-[10px] uppercase tracking-widest">
            IPFS CID Generated
          </span>
          <span className="text-green-400">ipfs://{ipfsHash}</span>
        </div>
        <div className="flex gap-6 justify-center">
          <button
            onClick={handleCopy}
            className="text-stone-500 hover:text-stone-300 text-xs uppercase tracking-widest flex items-center gap-2 transition-colors"
          >
            <Share2 size={14} />
            {copied ? 'Copied!' : 'Copy CID'}
          </button>
          <button
            onClick={handleShare}
            className="text-stone-500 hover:text-stone-300 text-xs uppercase tracking-widest flex items-center gap-2 transition-colors"
          >
            <Share2 size={14} />
            Share
          </button>
          <button
            className="text-stone-500 hover:text-red-400 text-xs uppercase tracking-widest flex items-center gap-2 transition-colors"
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
      className="flex items-center gap-3 px-8 py-3 bg-stone-200 text-stone-900 hover:bg-white transition-all font-mono text-sm font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer"
    >
      {isMinting ? (
        <>
          <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
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