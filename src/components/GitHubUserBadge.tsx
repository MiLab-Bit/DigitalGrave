import type { GitHubUser } from '../types';
import { formatDate } from '../utils/formatters';

interface GitHubUserBadgeProps {
  user: GitHubUser;
  variant?: 'badge' | 'large';
}

export function GitHubUserBadge({ user, variant = 'badge' }: GitHubUserBadgeProps) {
  if (variant === 'large') {
    return (
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden grayscale contrast-125 border-4 border-[var(--dg-edge)] shadow-lg">
          <img
            src={user.avatar_url}
            alt={user.login}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl text-[var(--dg-fg)] tracking-widest uppercase font-bold">
            {user.name || user.login}
          </h1>
          <p className="text-[var(--dg-muted)] font-mono text-sm tracking-widest">
            @{user.login}
          </p>
          {user.bio && (
            <p className="text-[var(--dg-muted)] text-sm max-w-sm mx-auto italic">
              {user.bio}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-[var(--dg-surface)] border border-[var(--dg-edge)] rounded">
      <img
        src={user.avatar_url}
        alt={user.login}
        className="w-10 h-10 rounded-full grayscale"
      />
      <div className="flex-1 min-w-0">
        <div className="font-mono text-[var(--dg-fg)] text-sm truncate">
          {user.name || user.login}
        </div>
        <div className="text-[var(--dg-muted)] text-xs font-mono">
          {formatDate(user.created_at)}
        </div>
      </div>
    </div>
  );
}

/**
 * Live avatar preview component shown while typing username
 */
export function AvatarPreview({ username }: { username: string }) {
  if (!username.trim()) return null;

  const avatarUrl = `https://github.com/${username}.png?size=80`;

  return (
    <div className="flex flex-col items-center gap-2 animate-fade-in">
      <img
        src={avatarUrl}
        alt={username}
        className="w-16 h-16 rounded-full border-2 border-[var(--dg-edge)] grayscale"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      <span className="text-[var(--dg-muted)] text-xs font-mono">@{username}</span>
    </div>
  );
}