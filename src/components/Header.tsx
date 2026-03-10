import pl from '@/locales/pl.json';

export function Header() {
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
        </div>
      </div>
    </header>
  );
}
