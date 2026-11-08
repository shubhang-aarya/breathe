'use client';
import { useEffect, useRef } from 'react';
import { useExperience } from '@/store/experience';
export function useRadioNavigation(closePanels: () => void) {
  const request = useExperience(s => s.radioRequest), handled = useRef(0);
  useEffect(() => {
    if (!request || request <= handled.current) return;
    let focusFrame = 0;
    const closeFrame = requestAnimationFrame(() => {
      handled.current = request;
      closePanels();
      // Let modal focus restoration finish before moving focus to the player.
      focusFrame = requestAnimationFrame(() => {
        const player = document.getElementById('local-radio-player');
        const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
        player?.scrollIntoView?.({ behavior: reduced ? 'instant' : 'smooth', block: 'center' });
        player?.focus({ preventScroll: true });
      });
    });
    return () => { cancelAnimationFrame(closeFrame); cancelAnimationFrame(focusFrame); };
  }, [request, closePanels]);
}
