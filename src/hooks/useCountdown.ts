import { useEffect, useState } from 'react';

function pad(n: number): string {
  return String(Math.max(0, n)).padStart(2, '0');
}

export function useCountdown(targetDate: Date) {
  const [diff, setDiff] = useState(targetDate.getTime() - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const d = targetDate.getTime() - Date.now();
      setDiff(d);
      if (d <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const totalSeconds = Math.max(0, Math.floor(diff / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days: pad(days),
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
  };
}
