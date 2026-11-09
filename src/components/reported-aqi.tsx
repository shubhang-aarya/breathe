'use client';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { category,type Place } from '@/lib/air';
import { airColor } from '@/lib/air-color';
import { reportedFresh,type ReportedResult } from '@/lib/reported-aqi';
import { useClock } from '@/lib/use-clock';
import { useOffline } from '@/lib/use-offline';
import { DataBadge } from './glass';
export function ReportedAQI({place,fallback}:{place:Place;fallback:ReactNode}){
 const offline=useOffline(),now=useClock();
 const query=useQuery({queryKey:['reported-live-aqi-v2',place.lat,place.lon],queryFn:async()=>{
  const r=await fetch(`/api/live-aqi?lat=${place.lat}&lon=${place.lon}`,{cache:'no-store'});
  if(!r.ok)throw new Error('Live AQI sources unavailable');
  return r.json() as Promise<ReportedResult>;
 },enabled:!offline,staleTime:120000,refetchInterval:120000,refetchOnWindowFocus:true,retry:false,gcTime:0});
 const reading=query.data?.status==='ok'?query.data.reading:null;
 const source=reading?.source==='IQAir'?'IQAir / AirVisual':'World Air Quality Index (WAQI)';
 const scope=reading?.scope==='city'?'city':'station';
 const fresh=!!reading&&reportedFresh(reading,now)&&!offline&&!query.isError;
 const near=!!reading&&reading.distanceKm<=50;
 const refresh=<button className="quiet-button" disabled={query.isFetching||offline} onClick={()=>void query.refetch()}>{query.isFetching?'Checking…':'Refresh current AQI'}</button>;
 const provenance=reading&&<><p className="reading-source">{source}<br/>Observed <time dateTime={reading.observedAt}>{new Date(reading.observedAt).toLocaleString(undefined,{timeZoneName:'short'})}</time><br/>Retrieved {new Date(reading.fetchedAt).toLocaleString(undefined,{timeZoneName:'short'})}</p><p><a href={reading.url} target="_blank" rel="noreferrer">Source page</a></p>{reading.attribution.map((a,i)=><p key={i}><a href={a.url} target="_blank" rel="noreferrer">{a.name}</a></p>)}</>;
 if(!fresh||!near)return <>
  <section aria-label="Live AQI provider status" role="status"><p>{offline?'Live AQI reports require an internet connection.':query.isPending?'Checking current AQI providers…':query.isError?'Current AQI sources could not be refreshed. The separate OpenAQ result is below.':query.data?.status==='unconfigured'?'Connect a personal WAQI token or IQAir key to enable reported AQI.':!reading?'No usable current report was returned. The separate OpenAQ result is below.':!fresh?`${source} has no fresh report. The separate OpenAQ result is below.`:'The reported source is more than 50 km away. Checking nearby OpenAQ observations below.'}</p>{refresh}</section>
  {fallback}
  {reading&&<details className="fine-print"><summary>{fresh?'Regional reference':'Last known report'} · {reading.station} · {reading.distanceKm.toFixed(1)} km from pin</summary>
   <DataBadge kind={fresh?'MEASURED':'STALE'}/><p>{fresh?'Regional reference only — not a measurement at your pin.':'Not live; excluded from the current AQI.'}</p>
   <p>{reading.aqi} US AQI · {category(reading.aqi)} · {scope} report for {reading.station}</p>{provenance}
  </details>}
 </>;
 return <section className="live-reading" aria-label="Latest measured air quality">
  <h3>Latest reported {scope} AQI</h3><DataBadge kind="MEASURED"/>
  <div className="aqi-number" style={{color:airColor(reading!.aqi)}}>{reading!.aqi}</div>
  <p>{category(reading!.aqi)} · US AQI · Provider-reported</p>
  <p>{reading!.station} · {reading!.distanceKm.toFixed(1)} km from pin</p>
  {scope==='city'&&<p className="fine-print">City-level report, not an exact-pin measurement.</p>}
  {provenance}
  <p className="fine-print">Latest available {scope} report, not a continuous sensor stream. It may differ from another station or a city average.</p>
  <details><summary>Pollutant AQI subindices</summary><p>{scope==='city'?'The IQAir Community plan does not provide these pollutant values. N/A means unavailable.':'These are AQI subindices, not concentrations in µg/m³. Missing pollutants show N/A.'}</p>{(['pm25','pm10','no2','so2','co','o3'] as const).map(p=><p key={p}>{p==='pm25'?'PM2.5':p.toUpperCase()}: {reading!.subindices[p]??'N/A'}</p>)}</details>
  {refresh}
 </section>;
}
