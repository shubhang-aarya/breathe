'use client';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PanelNavigation } from './panel-navigation';
import { category, type Air, type Place } from '@/lib/air';
import { airColor } from '@/lib/air-color';
import { summarizeAir, isFreshAir } from '@/lib/air-summary';
import { fetchAirWithOffline } from '@/lib/offline-air';
import { useAlerts } from '@/store/alerts';
import { useClock } from '@/lib/use-clock';
import { useOffline } from '@/lib/use-offline';
import { printReport, shareAirCard } from '@/lib/export-air';
import { Glass, DataBadge } from './glass';
import { VoiceControl } from './voice-control';
const Estimate = dynamic(() => import('./estimate-panel').then(m => m.EstimatePanel), { ssr: false });
type Reply = { answer: string; mode: string; note: string; air: Air; summary: ReturnType<typeof summarizeAir> };
export function ToolsPanel({ place, onPin, onClose }: { place: Place | null; onPin: (place: Place) => void; onClose: () => void }) {
  const now=useClock();
  const root = useRef<HTMLDialogElement>(null), card = useRef<HTMLDivElement>(null), offline = useOffline();
  const [tab, setTab] = useState('Assistant'), [question, setQuestion] = useState('How is the air trending?'), [reply, setReply] = useState<Reply | null>(null), [busy, setBusy] = useState(false), [status, setStatus] = useState('');
  const alerts = useAlerts(); const cancel = useRef<AbortController | null>(null);
  useEffect(() => { const previous = document.activeElement as HTMLElement; root.current?.showModal(); return () => { cancel.current?.abort(); previous?.focus(); }; }, []);
  const query = useQuery({ queryKey: ['tools-air', place?.lat, place?.lon], queryFn: async () => (await fetchAirWithOffline(`/api/air?lat=${place!.lat}&lon=${place!.lon}&history=true`))[0], enabled: !!place, retry: 1, networkMode: 'always' });
  const raw = query.data, air = raw && place ? { ...raw, place, offlineCached: offline || query.isError || raw.offlineCached } : undefined;
  const currentReply=reply&&reply.air.place.lat===place?.lat&&reply.air.place.lon===place?.lon?reply:null;
  const summary = air ? summarizeAir(air) : null;
  async function ask(event: React.FormEvent) {
    event.preventDefault(); if (!place) return;
    cancel.current?.abort(); cancel.current = new AbortController(); setBusy(true); setStatus('');
    try {
      const response = await fetch('/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lat: place.lat, lon: place.lon, question }), signal: cancel.current.signal });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Assistant unavailable'); setReply(data);
    } catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) setStatus(error instanceof Error ? error.message : 'Assistant unavailable.'); }
    finally { setBusy(false); }
  }
  return <dialog ref={root} className="tools-dialog" aria-labelledby="tools-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}><Glass className="tools-panel"><header><div><p className="eyebrow">SMALL ACTIONS. CLEARER AIR.</p><h2 id="tools-title">Your air toolkit.</h2></div><PanelNavigation onBack={onClose}/></header><nav aria-label="Air tools">{['Assistant', 'Alerts', 'Share & report', 'Voice', 'ML estimate'].map(name => <button key={name} aria-pressed={tab === name} onClick={() => setTab(name)}>{name}</button>)}</nav>
    {place && <p>{place.name}</p>}{air && <p className="reading-source"><DataBadge kind="MODELED" />{(!isFreshAir(air,now) || offline) && <DataBadge kind="STALE" />} {air.source} · Valid {air.observedAt ?? 'unavailable'} · Retrieved {air.fetchedAt}</p>}
    {query.isPending && place && <p role="status">Loading sourced location data…</p>}{query.isError && <p>No location data is available. <button onClick={() => void query.refetch()}>Retry</button></p>}
    {tab === 'Assistant' && <><h3>A little context for your air.</h3>{!place ? <p>Pin a place first to ground the assistant in its actual data.</p> : <>{summary && <><p>{summary.text}</p><p>{summary.trend}. Recent mean: {summary.recentMean?.toFixed(1) ?? 'No data'} US AQI ({summary.hours} available hours). Compared-day change: {summary.change == null ? 'No comparable percentage' : `${summary.change.toFixed(1)}%`}.</p><small>Data summary calculated from available modeled history. Partial coverage can affect comparisons.</small></>}<form onSubmit={event => void ask(event)}><label>Your air-quality question<textarea maxLength={600} value={question} onChange={e => setQuestion(e.target.value)} rows={3} required /></label><button className="quiet-button" disabled={busy || offline || !question.trim()}>{busy ? 'Preparing explanation…' : 'Ask BREATHE'}</button></form>{currentReply && <article className="assistant-reply" aria-live="polite"><strong>{currentReply.mode === 'ai' ? 'AI explanation' : 'Data summary'}</strong><p>{currentReply.answer}</p><small>{currentReply.note}</small><p><DataBadge kind="MODELED" />{(offline || !isFreshAir(currentReply.air,now)) && <DataBadge kind="STALE" />}{currentReply.air.source} · Valid {currentReply.air.observedAt ?? 'unavailable'} · Retrieved {currentReply.air.fetchedAt}</p></article>}</>}{offline && <p>AI requests are unavailable offline. Last-known data remains labeled above.</p>}</>}
    {tab === 'Alerts' && <><h3>Your threshold. Your choice.</h3><p>Alerts monitor the active pin while BREATHE is open and connected. They do not run in the background when the app is closed. Only fresh current modeled AQI can trigger them.</p><label className="tool-option"><input type="checkbox" checked={alerts.enabled} onChange={e => alerts.settings({ enabled: e.target.checked })} />Enable in-app threshold alerts</label><label>US AQI threshold<input type="number" min={0} max={500} step={1} value={alerts.threshold} onChange={e => { const value = Number(e.target.value); if (Number.isFinite(value) && value >= 0 && value <= 500) alerts.settings({ threshold: value }); }} /></label><button className="quiet-button" onClick={async () => { if (!('Notification' in window)) { setStatus('Browser notifications are unavailable. In-app alerts still work.'); return; } try { const permission = await Notification.requestPermission(); alerts.settings({ notifications: permission === 'granted' }); setStatus(permission === 'granted' ? 'Browser notifications enabled.' : 'Permission was not granted. In-app alerts still work.'); } catch { setStatus('Browser notifications are unavailable.'); } }}>Enable browser notifications</button><button className="quiet-button" disabled={!alerts.notifications} onClick={() => alerts.settings({ notifications: false })}>Disable browser notifications</button><h4>Recent alerts</h4>{alerts.events.length ? alerts.events.map(event => <p key={event.id}>{event.text}<br /><DataBadge kind="HISTORICAL" /><small>{event.source} · Valid {event.observedAt} · Retrieved {event.fetchedAt}</small></p>) : <p>No threshold crossings recorded.</p>}</>}
    {tab === 'Share & report' && <>{air ? <><div ref={card} className="share-air-card"><p>B R E A T H E</p><h3>{place?.name}</h3><DataBadge kind="MODELED" />{!isFreshAir(air,now) && <DataBadge kind="STALE" />}<div className="share-aqi" style={{color:airColor(air.aqi)}}>{air.aqi ?? 'No data'}</div><p>{category(air.aqi)} · US AQI</p><small>{air.source}<br />Valid {air.observedAt ?? 'unavailable'}<br />Retrieved {air.fetchedAt}</small></div><button className="quiet-button" disabled={busy} onClick={async () => { if (!card.current) return; setBusy(true); try { setStatus(await shareAirCard(card.current, air, offline)); } catch { setStatus('Image export failed. Try the printable report instead.'); } finally { setBusy(false); } }}>{busy ? 'Preparing PNG…' : 'Share / download PNG'}</button><button className="quiet-button" onClick={() => printReport(air)}>Print report / Save as PDF</button><p>The report includes sourced pollutant values, daily summaries and data limitations. Your browser’s print dialog provides PDF export.</p></> : <p>Pin a place with available data to create a share card or report.</p>}</>}
    {tab === 'Voice' && <VoiceControl onPin={onPin} offline={offline} />}
    {tab === 'ML estimate' && <Estimate place={place} />}
    {status && <p role="status">{status}</p>}
  </Glass></dialog>;
}
