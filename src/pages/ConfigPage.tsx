import { useState } from 'react';
import { Github, Code2, ArrowRight, ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react';
import { AvatarPreview } from '../components/GitHubUserBadge';
import { isValidGitHubUsername, debounce } from '../utils/helpers';

interface ConfigPageProps {
  onSubmit: (data: { username: string; message: string }) => void;
  onBack: () => void;
}

const STEP1_PLACEHOLDER = 'torvalds';
const STEP2_PLACEHOLDER = '它曾让某个深夜调试的陌生人感到不再孤单...';
const MAX_MESSAGE_LENGTH = 280;

export function ConfigPage({ onSubmit, onBack }: ConfigPageProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Debounced validation
  const validateUsername = debounce(async (name: string) => {
    if (!name.trim()) {
      setValidationError(null);
      setIsValidating(false);
      return;
    }
    if (!isValidGitHubUsername(name)) {
      setValidationError('Invalid GitHub username format');
      setIsValidating(false);
      return;
    }
    setIsValidating(false);
    setValidationError(null);
  }, 300);

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setIsValidating(true);
    validateUsername(value);
  };

  const handleStep1Next = () => {
    if (username.trim() && !validationError) {
      setStep(2);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSubmit({ username: username.trim(), message: message.trim() });
    }
  };

  const charCount = message.length;
  const isStep1Valid = username.trim().length > 0 && !validationError;
  const isStep2Valid = message.trim().length > 0;

  return (
    <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-zinc-900 border border-zinc-800 p-8 shadow-2xl relative overflow-hidden">

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1 bg-zinc-800 w-full">
          <div
            className="h-full bg-white transition-all duration-500 ease-out"
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>

        {/* Step 1: GitHub Identity */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in-up" key="step1">
            <div className="flex items-center gap-3 text-gray-400 mb-8">
              <Github size={24} />
              <span className="text-sm uppercase tracking-widest">Step 1: 身份锚定</span>
            </div>

            {/* Avatar Preview */}
            {username.trim() && !validationError && (
              <div className="flex justify-center mb-4">
                <AvatarPreview username={username} />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm uppercase tracking-widest text-gray-500">
                GitHub ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={e => handleUsernameChange(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleStep1Next()}
                  placeholder={STEP1_PLACEHOLDER}
                  autoFocus
                  className="w-full bg-black border-b-2 p-4 text-2xl focus:outline-none transition-colors placeholder-gray-800"
                  style={{
                    borderColor: validationError ? '#ef4444' : username && !validationError ? '#ffffff' : '#374151',
                  }}
                />
                {isValidating && (
                  <Loader2
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 animate-spin"
                  />
                )}
              </div>

              {validationError && (
                <div className="flex items-center gap-2 text-red-500 text-xs mt-2">
                  <AlertTriangle size={12} />
                  {validationError}
                </div>
              )}
            </div>

            <div className="pt-8 flex justify-end">
              <button
                onClick={handleStep1Next}
                disabled={!isStep1Valid}
                className="px-6 py-2 bg-white text-black hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                下一步
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: The Will */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up" key="step2">
            <div className="flex items-center gap-3 text-gray-400 mb-8">
              <Code2 size={24} />
              <span className="text-sm uppercase tracking-widest">Step 2: 最后的 Commit</span>
            </div>

            {/* Username reminder */}
            <div className="flex items-center gap-2 text-stone-500 text-xs mb-4">
              <Github size={12} />
              <span>@ {username}</span>
            </div>

            <div className="space-y-4">
              <label className="text-sm uppercase tracking-widest text-gray-500 block">
                如果我明天消失，我希望我的代码被记住是因为...
              </label>
              <div className="relative">
                <textarea
                  value={message}
                  onChange={e => {
                    if (e.target.value.length <= MAX_MESSAGE_LENGTH) {
                      setMessage(e.target.value);
                    }
                  }}
                  placeholder={STEP2_PLACEHOLDER}
                  autoFocus
                  className="w-full h-40 bg-black border border-gray-700 p-4 text-lg focus:outline-none focus:border-white transition-colors resize-none leading-relaxed text-gray-300 placeholder-gray-800"
                />
                <div className="absolute bottom-3 right-3 text-stone-700 text-xs font-mono">
                  {charCount}/{MAX_MESSAGE_LENGTH}
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-gray-500 hover:text-white transition-colors text-sm flex items-center gap-2"
              >
                <ArrowLeft size={14} />
                返回
              </button>
              <button
                type="submit"
                disabled={!isStep2Valid}
                className="px-6 py-2 bg-white text-black hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                生成墓碑
              </button>
            </div>
          </form>
        )}

        {/* Legal footer */}
        <div className="mt-8 pt-4 border-t border-zinc-800 text-center">
          <p className="text-gray-700 text-[10px]">
            你的数据仅在本地浏览器处理，GitHub 数据来自公开 API
          </p>
        </div>
      </div>
    </div>
  );
}