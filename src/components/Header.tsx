import { signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import pl from '@/locales/pl.json';

type HeaderProps = {
  user: User | null;
};

export function Header({ user }: HeaderProps) {
  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <header className="bg-gov-blue-800 border-b border-gov-blue-700/50 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-white tracking-tight">
              {pl.header.logo}
            </span>
            <span className="hidden sm:inline text-gov-blue-300 text-sm font-medium">
              {pl.app.tagline}
            </span>
          </a>
          {user && (
            <div className="flex items-center gap-3">
              <span className="text-gov-blue-200 text-sm truncate max-w-[180px] sm:max-w-[240px]" title={user.email ?? ''}>
                {user.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm font-medium text-gov-blue-200 hover:text-white hover:bg-gov-blue-700 rounded-lg transition-colors"
              >
                Wyloguj
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
