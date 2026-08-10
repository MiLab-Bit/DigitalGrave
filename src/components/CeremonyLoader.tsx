import { useEffect, useState } from 'react';

/**
 * P0-5: Ceremonial loading narrative.
 * The tombstone isn't "loading" — it's being ritually constructed.
 * Stages cycle on a timer while the (real) GitHub fetch + dramatic pause runs.
 */

interface Rite {
  en: string;
  zh: string;
}

const RITES: Rite[] = [
  { en: 'Digging the grave', zh: '挖掘墓穴' },
  { en: 'Gathering the relics', zh: '收敛遗物' },
  { en: 'Carving the epitaph', zh: '镌刻墓志铭' },
  { en: 'Erecting the stone', zh: '立碑' },
  { en: 'Sealing the tomb', zh: '封土为记' },
];

export function CeremonyLoader() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStage(s => (s + 1) % RITES.length);
    }, 700);
    return () => clearInterval(id);
  }, []);

  const progress = ((stage + 1) / RITES.length) * 100;

  return (
    <div className="min-h-screen bg-[var(--dg-bg)] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-10 animate-fade-in">
        {/* Spinner */}
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 border-2 border-[var(--dg-edge)] rounded-full" />
          <div
            className="absolute inset-0 border-2 border-transparent border-t-[var(--dg-accent)] rounded-full animate-spin"
            style={{ animationDuration: '1.2s' }}
          />
        </div>

        {/* Current rite */}
        <div className="text-center">
          <p className="text-[var(--dg-muted)] font-mono text-sm tracking-widest uppercase">
            {RITES[stage].en}
          </p>
          <p className="text-[var(--dg-faint)] font-mono text-xs mt-2">{RITES[stage].zh}</p>
        </div>

        {/* Ritual step list */}
        <ul className="space-y-2 font-mono text-xs">
          {RITES.map((r, i) => (
            <li
              key={r.en}
              className={`flex items-center gap-3 transition-colors ${
                i <= stage ? 'text-[var(--dg-fg)]' : 'text-[var(--dg-faint)]'
              }`}
            >
              <span className="w-4 text-center">{i < stage ? '✦' : i === stage ? '›' : '·'}</span>
              <span className="uppercase tracking-widest">{r.en}</span>
            </li>
          ))}
        </ul>

        {/* Progress */}
        <div className="space-y-2">
          <div className="h-px w-full bg-[var(--dg-edge)] relative overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-[var(--dg-accent)] transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-[var(--dg-faint)] text-[10px] uppercase tracking-[0.3em]">
            Finalizing Legacy
          </p>
        </div>
      </div>
    </div>
  );
}
