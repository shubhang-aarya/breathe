'use client';
import { useSyncExternalStore } from 'react';
function subscribe(notify:()=>void){addEventListener('online',notify);addEventListener('offline',notify);return()=>{removeEventListener('online',notify);removeEventListener('offline',notify)}}
export function useOffline(){return useSyncExternalStore(subscribe,()=>!navigator.onLine,()=>false)}
