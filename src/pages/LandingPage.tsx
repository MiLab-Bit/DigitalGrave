import { Terminal, Cpu } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const EPITAPH = '"在比特的海洋里，我们将如同法老一般，将我们的思维固化在提交记录的金字塔中。当肉体消逝，git log 将是我们唯一的呼吸。"';

export function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-black text-gray-300 font-mono flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-8 text-center animate-fade-in-up">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Cpu size={64} className="text-gray-600 animate-pulse-slow" />
          </div>
        </div>

        {/* Title */}
        <div>
          <h1
            className="text-4xl md:text-6xl font-bold tracking-tighter text-white"
            style={{ textShadow: '2px 0 #ff0000, -2px 0 #00ff00, 0 0 10px rgba(255,0,0,0.3)' }}
          >
            DIGITAL GRAVE
          </h1>
          <p className="text-xl text-gray-500 mt-4">
            你的 GitHub，是你的数字墓碑。
          </p>
        </div>

        {/* Epitaph Quote */}
        <div className="border-l-2 border-gray-700 pl-6 text-left py-4 my-8 bg-gray-900/30">
          <p className="italic text-gray-400 leading-relaxed">{EPITAPH}</p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-600 uppercase tracking-widest">
          <span className="border border-gray-800 px-3 py-1 rounded-full">GitHub Integration</span>
          <span className="border border-gray-800 px-3 py-1 rounded-full">IPFS Archive</span>
          <span className="border border-gray-800 px-3 py-1 rounded-full">Digital Legacy</span>
        </div>

        {/* CTA Button */}
        <div className="pt-4">
          <button
            onClick={onStart}
            className="group relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium text-white transition duration-300 ease-out border-2 border-white hover:bg-white hover:text-black"
          >
            {/* Slide-in layer */}
            <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full bg-black group-hover:translate-x-0 ease">
              <Terminal size={20} />
            </span>
            {/* Default layer */}
            <span className="absolute flex items-center justify-center w-full h-full text-white transition-all duration-300 transform group-hover:translate-x-full ease">
              初始化遗嘱
            </span>
            <span className="relative invisible">初始化遗嘱</span>
          </button>
        </div>

        {/* Footer */}
        <div className="pt-8 text-center">
          <p className="text-gray-700 text-xs">
            Built with grief and TypeScript ·{' '}
            <a
              href="https://github.com/MiLab-Bit/DigitalGrave"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-white transition-colors"
            >
              View on GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}