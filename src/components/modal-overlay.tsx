'use client';
import { useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useExperience } from '@/store/experience';
const subscribe = () => () => {};
const client = () => true;
const server = () => false;
/** Escape transformed/isolated globe ancestors so panels cover the application header. */
export function ModalOverlay({ children, onClose, className = '' }: { children: ReactNode; onClose: () => void; className?: string }) {
  const mounted = useSyncExternalStore(subscribe, client, server);
  const lowPower = useExperience(s => s.lowPower);
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);
  return mounted ? createPortal(<div className={`app-modal-overlay ${lowPower ? 'low-power' : ''} ${className}`} onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>{children}</div>, document.body) : null;
}
