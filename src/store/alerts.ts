'use client';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AlertMarker } from '@/lib/alerts';
type Alert = { id: string; text: string; observedAt: string; fetchedAt: string; source: string };
type State = {
  enabled: boolean; threshold: number; notifications: boolean; markers: Record<string, AlertMarker>; events: Alert[];
  settings: (patch: Partial<Pick<State, 'enabled' | 'threshold' | 'notifications'>>) => void;
  remember: (marker: AlertMarker, event?: Alert) => void;
};
export const useAlerts = create<State>()(persist((set) => ({
  enabled: false, threshold: 100, notifications: false, markers: {}, events: [],
  settings: patch => set(patch),
  remember: (marker, event) => set(state => ({
    markers: Object.fromEntries([...Object.entries(state.markers).filter(([key]) => key !== marker.key), [marker.key, marker]].slice(-30)),
    events: event ? [event, ...state.events].slice(0, 10) : state.events,
  })),
}), { name: 'breathe-alerts', storage: createJSONStorage(() => localStorage), skipHydration: true, version: 1,
  merge: (stored, current) => {
    const s = stored as Partial<State> | undefined;
    return { ...current, enabled: s?.enabled === true, notifications: s?.notifications === true,
      threshold: typeof s?.threshold === 'number' && Number.isFinite(s.threshold) && s.threshold >= 0 && s.threshold <= 500 ? s.threshold : 100,
      markers: s?.markers && typeof s.markers === 'object' ? s.markers : {}, events: Array.isArray(s?.events) ? s.events.slice(0, 10) : [] };
  },
}));
