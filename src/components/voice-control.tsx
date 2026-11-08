'use client';
import { useEffect, useRef, useState } from 'react';
import { type Place, category } from '@/lib/air';
import type { SearchPlace } from '@/lib/geocoding';
import { fetchAirWithOffline } from '@/lib/offline-air';
import { isFreshAir } from '@/lib/air-summary';
type Recognition = { lang: string; continuous: boolean; interimResults: boolean; onresult: ((e: { results: { transcript: string }[][] }) => void) | null; onerror: (() => void) | null; onend: (() => void) | null; start: () => void; stop: () => void; abort: () => void };
type VoiceWindow = Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
export function VoiceControl({ onPin, offline }: { onPin: (place: Place) => void; offline: boolean }) {
  const [status, setStatus] = useState('Press Listen and say “What is the air like in Delhi?”');
  const [listening, setListening] = useState(false), [matches, setMatches] = useState<SearchPlace[]>([]);
  const generation=useRef(0);
  const recognition = useRef<Recognition | null>(null), timer = useRef<ReturnType<typeof setTimeout> | null>(null), controller = useRef<AbortController | null>(null);
  useEffect(() => () => { generation.current++;recognition.current?.abort(); if (timer.current) clearTimeout(timer.current); controller.current?.abort(); window.speechSynthesis?.cancel(); }, []);
  async function search(transcript: string) {
    const term = transcript.replace(/^.*?(?:air (?:quality )?(?:like )?(?:in|at)|(?:go|fly|take me) to|search(?: for)?)\s+/i, '').replace(/[?.!]+$/, '').trim();
    if (!term || term.length > 80) { setStatus('Try a short city name.'); return; }
    setStatus(`Looking for ${term}…`); controller.current?.abort(); controller.current = new AbortController();
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: controller.current.signal }); if (!response.ok) throw new Error();
      const result = await response.json(); setMatches(result.places ?? []); setStatus(result.places?.length ? 'Choose the matching place to hear its air quality.' : 'No matching city found. Try city search.');
    } catch { setStatus('Voice search is unavailable. You can still type in city search.'); }
  }
  function listen() {
    const Constructor = (window as VoiceWindow).SpeechRecognition ?? (window as VoiceWindow).webkitSpeechRecognition;
    if (!Constructor) { setStatus('Speech recognition is unavailable in this browser. Use city search instead.'); return; }
    const engine = new Constructor(); recognition.current?.abort(); recognition.current = engine;
    engine.lang = 'en-IN'; engine.continuous = false; engine.interimResults = false;
    engine.onresult = e => { const transcript = e.results[0]?.[0]?.transcript; if (transcript) void search(transcript); };
    engine.onerror = () => { setStatus('Microphone access or recognition failed. Try typing instead.'); setListening(false); };
    engine.onend = () => { setListening(false); if (timer.current) clearTimeout(timer.current); };
    try { engine.start(); setListening(true); setStatus('Listening…'); timer.current = setTimeout(() => engine.stop(), 12000); } catch { setStatus('Unable to start recognition. Try again.'); }
  }
  async function choose(place: SearchPlace) {
    const token=++generation.current;
    onPin(place); setMatches([]); setStatus('Loading a sourced spoken summary…');
    try {
      const [air] = await fetchAirWithOffline(`/api/air?lat=${place.lat}&lon=${place.lon}`);
      if(token!==generation.current)return;
      const text = !air ? 'No air data is available.' : `${place.name}. ${!isFreshAir(air) ? 'Stale, not live. ' : ''}Modeled US air quality index ${air.aqi ?? 'unavailable'}. ${category(air.aqi)}. Source Open Meteo, CAMS. Valid time ${air.observedAt ?? 'unavailable'}. Retrieved ${air.fetchedAt}.`;
      setStatus(text); window.speechSynthesis?.cancel(); if ('SpeechSynthesisUtterance' in window) window.speechSynthesis?.speak(new SpeechSynthesisUtterance(text));
    } catch { setStatus('No data available for a spoken summary.'); }
  }
  return <div><p>Voice uses your browser’s speech service, which may send audio to its provider. BREATHE does not store recordings. Recognition support varies by browser.</p><button className="quiet-button" disabled={offline || listening} onClick={listen}>Listen</button><button className="quiet-button" onClick={() => { generation.current++;recognition.current?.stop(); window.speechSynthesis?.cancel(); setListening(false); }}>Stop speech</button><p role="status">{offline ? 'Voice search is unavailable offline.' : status}</p>{matches.map(place => <button className="quiet-button" key={place.id} onClick={() => void choose(place)}>{place.name}</button>)}</div>;
}
