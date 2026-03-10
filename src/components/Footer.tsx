import pl from '@/locales/pl.json';

export function Footer() {
  return (
    <footer className="border-t border-gov-blue-200 bg-gov-blue-50/50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-gov-blue-700 text-sm">
          {pl.footer.copyright}
        </p>
        <p className="text-center text-gov-blue-600 text-xs mt-2 max-w-2xl mx-auto">
          {pl.footer.disclaimer}
        </p>
      </div>
    </footer>
  );
}
