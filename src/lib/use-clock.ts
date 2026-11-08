'use client';
import { useEffect, useState } from 'react';
/** External wall clock: age-sensitive UI expires even when queries stop updating. */
export function useClock(interval = 30000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), interval); return () => clearInterval(id); }, [interval]);
  return now;
}
