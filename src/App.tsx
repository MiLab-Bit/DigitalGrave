import { useState } from 'react';
import type { AppView, GraveData } from './types';
import { useGitHubData } from './hooks/useGitHub';
import { LandingPage } from './pages/LandingPage';
import { ConfigPage } from './pages/ConfigPage';
import { TombstonePage } from './pages/TombstonePage';
import { generateCommitHash } from './utils/hash';

export default function App() {
  const [view, setView] = useState<AppView>('landing');
  const [graveData, setGraveData] = useState<GraveData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const github = useGitHubData();

  // ---- Handlers ----

  const handleStart = () => setView('config');

  const handleConfigSubmit = async ({ username, message }: { username: string; message: string }) => {
    setIsLoading(true);
    setGlobalError(null);

    try {
      await github.fetchData(username);
    } catch {
      setGlobalError('Failed to fetch GitHub data. Please try again.');
      setIsLoading(false);
      return;
    }

    if (github.status === 'not_found') {
      setGlobalError(`User "${username}" not found on GitHub`);
      setIsLoading(false);
      return;
    }

    if (github.status === 'rate_limited' && !github.user) {
      setGlobalError('GitHub API rate limit reached (60 req/hr). Please wait or provide a GitHub Token.');
      setIsLoading(false);
      return;
    }

    const data = {
      user: github.user!,
      configMessage: message,
      topRepo: github.topRepo,
      recentRepo: github.recentRepo,
      lastPush: github.lastPush,
      lastHash: generateCommitHash(),
      ipfsHash: null,
      createdAt: new Date().toISOString(),
      apiStatus: github.status,
      stats: github.stats,
    };

    // Dramatic pause
    await new Promise(resolve => setTimeout(resolve, 800));
    setGraveData(data);
    setIsLoading(false);
    setView('tombstone');
  };

  const handleReset = () => {
    setView('landing');
    setGraveData(null);
    setGlobalError(null);
    github.reset();
  };

  // ---- Render ----

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-2 border-stone-700 rounded-full" />
            <div
              className="absolute inset-0 border-2 border-transparent border-t-stone-400 rounded-full animate-spin"
              style={{ animationDuration: '1.2s' }}
            />
          </div>
          <div>
            <p className="text-stone-500 font-mono text-sm tracking-widest uppercase">
              Extracting GitHub Data...
            </p>
            <p className="text-stone-700 font-mono text-xs mt-2">Building tombstone</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="antialiased">
      {globalError && (
        <div className="fixed top-0 left-0 right-0 bg-red-950 border-b border-red-800 text-red-400 font-mono text-sm px-6 py-3 z-50 flex items-center justify-between">
          <span>⚠ {globalError}</span>
          <button onClick={() => setGlobalError(null)} className="text-red-600 hover:text-red-400 ml-4">✕</button>
        </div>
      )}

      {view === 'landing' && <LandingPage onStart={handleStart} />}
      {view === 'config' && <ConfigPage onSubmit={handleConfigSubmit} />}
      {view === 'tombstone' && graveData && (
        <TombstonePage data={graveData} onReset={handleReset} />
      )}
    </div>
  );
}