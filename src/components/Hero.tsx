import { useCountdown } from '@/hooks/useCountdown';
import pl from '@/locales/pl.json';

export function Hero() {
  const { days, hours, minutes, seconds } = useCountdown(new Date('2026-04-01T00:00:00'));

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gov-blue-800 to-gov-blue-900 text-white py-16 sm:py-24">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            {pl.landing.heroTitle}
          </h1>
          <p className="text-lg sm:text-xl text-gov-blue-200 mb-10">
            {pl.landing.heroSubtitle}
          </p>
          <div className="inline-flex flex-col items-center gap-2 rounded-xl bg-white/5 backdrop-blur border border-white/10 px-6 py-5">
            <span className="text-sm font-medium text-gov-blue-200 uppercase tracking-wider">
              {pl.landing.countdownLabel}
            </span>
            <div className="flex gap-3 sm:gap-4">
              <CountdownBox value={days} label={pl.landing.days} />
              <CountdownBox value={hours} label={pl.landing.hours} />
              <CountdownBox value={minutes} label={pl.landing.minutes} />
              <CountdownBox value={seconds} label={pl.landing.seconds} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CountdownBox({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <span className="block w-14 sm:w-16 h-14 sm:h-16 flex items-center justify-center rounded-lg bg-white/10 text-xl sm:text-2xl font-bold tabular-nums">
        {value}
      </span>
      <span className="text-xs text-gov-blue-300 mt-1">{label}</span>
    </div>
  );
}
