'use client';
import { useEffect } from 'react';
import { category, type Air } from '@/lib/air';
import { evaluateAlert } from '@/lib/alerts';
import { useAlerts } from '@/store/alerts';
import { playUiSound } from '@/lib/ui-sound';
export function AlertMonitor({ air, offline, onAlert }: { air?: Air; offline: boolean; onAlert: (text: string) => void }) {
  const enabled = useAlerts(s => s.enabled), threshold = useAlerts(s => s.threshold);
  useEffect(() => { void useAlerts.persist.rehydrate(); }, []);
  useEffect(() => {
    if (!enabled || offline || !air) return;
    const state = useAlerts.getState();
    const key = `${air.place.lat.toFixed(3)},${air.place.lon.toFixed(3)}`;
    const result = evaluateAlert(air, threshold, state.markers[key]);
    if (!result) return;
    const text = `${air.place.name}: modeled US AQI ${air.aqi} (${category(air.aqi)}) reached your ${threshold} threshold.`;
    const event = result.alert ? { id: `${key}:${air.observedAt}`, text, observedAt: air.observedAt!, fetchedAt: air.fetchedAt, source: air.source } : undefined;
    state.remember(result.marker, event);
    if (!result.alert) return;
    playUiSound('alert'); onAlert(text);
    if (state.notifications && 'Notification' in window && Notification.permission === 'granted') {
      const options = { body: `${text} ${air.source} · Valid ${air.observedAt}`, tag: `breathe:${key}`, icon: '/api/icon?size=192' };
      const registration = 'serviceWorker' in navigator ? navigator.serviceWorker.getRegistration() : Promise.resolve(undefined);
      void registration.then(registration => {
        if (registration) return registration.showNotification('BREATHE air quality alert', options);
        new Notification('BREATHE air quality alert', options);
      }).catch(() => { /* The in-app alert remains available. */ });
    }
  }, [air, enabled, threshold, offline, onAlert]);
  return null;
}
