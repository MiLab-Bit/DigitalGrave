import type { GraveData } from '../types';
import { TombstoneCard } from '../components/TombstoneCard';
import { Github } from 'lucide-react';

interface TombstonePageProps {
  data: GraveData;
  onReset: () => void;
}

export function TombstonePage({ data, onReset }: TombstonePageProps) {
  return (
    <div className="antialiased">
      {/* GitHub Attribution */}
      <div className="fixed bottom-4 right-4 z-50">
        <a
          href={data.user.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 bg-black/80 backdrop-blur border border-stone-800 text-stone-600 hover:text-white text-xs font-mono transition-colors rounded"
        >
          <Github size={12} />
          View on GitHub
        </a>
      </div>

      <TombstoneCard data={data} onReset={onReset} />
    </div>
  );
}