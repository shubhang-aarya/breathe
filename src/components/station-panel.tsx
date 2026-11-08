'use client';
import { useEffect,useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Place } from '@/lib/air';
import { isStaleObservation,type StationResult } from '@/lib/openaq';
import { DataBadge } from './glass';
export function StationPanel({place}:{place:Place}){
 const [clock,setClock]=useState(0);useEffect(()=>{const tick=()=>setClock(Date.now());const timer=setInterval(tick,60000);tick();return()=>clearInterval(timer)},[]);
 const query=useQuery({queryKey:['station',place.lat,place.lon],queryFn:async():Promise<StationResult>=>{const r=await fetch(`/api/station?lat=${place.lat}&lon=${place.lon}`);if(!r.ok)throw new Error(r.status===429?'Station provider is rate limited. Please try again later.':'Station readings are temporarily unavailable.');return r.json()},retry:false,staleTime:15*60000});
 const result=query.data;const station=result?.status==='ok'?result.station:null;
 return <section className="station-panel" aria-label="Nearby station measurements"><h3>On the ground</h3><DataBadge kind="MEASURED"/>{query.isPending?<p role="status">Finding a nearby station…</p>:query.isError&&!station?<p role="status">{query.error.message}</p>:result?.status==='unconfigured'?<p>Station data is not connected yet. The AQI above is a model estimate.</p>:!station?<p>No data · No fixed station returned within 25 km.</p>:<><h4>{station.name}</h4><p>{station.distanceKm.toFixed(1)} km from pin · {station.provider}</p><p>Raw concentrations, not US AQI. Each sensor can have a different observation time.</p>{station.values.length?<ul>{station.values.map(v=><li key={v.sensorId}><strong>{v.parameter.toUpperCase()}: {v.value} {v.unit}</strong><DataBadge kind="MEASURED"/>{(query.isError||clock>0&&isStaleObservation(v.observedAt,clock))&&<DataBadge kind="STALE"/>}<small>Observed {new Date(v.observedAt).toLocaleString()}</small></li>)}</ul>:<p>No data for the six supported pollutants at this station.</p>}<small>{station.source} · {station.provider}<br/>Retrieved {new Date(station.fetchedAt).toLocaleString()}</small></>}{query.isError&&station&&<p role="status">Station refresh failed. Displaying last known measurements, not live.</p>}<small>Source: OpenAQ v3 · {station?'Latest sensor observations':'Last updated: unavailable'}</small><a href="https://openaq.org/" target="_blank" rel="noreferrer">OpenAQ attribution</a></section>
}
