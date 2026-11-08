'use client';
import { category,type Place } from '@/lib/air';
import { airColor } from '@/lib/air-color';
import { freshParticleIndex } from '@/lib/particle-aqi';
import { useStation } from '@/lib/use-station';
import { useClock } from '@/lib/use-clock';
import { useOffline } from '@/lib/use-offline';
import { DataBadge } from './glass';
import { StationPanel } from './station-panel';
import { ReportedAQI } from './reported-aqi';
export function LiveReading({place}:{place:Place}){return <ReportedAQI place={place} fallback={<OpenAQReading place={place}/>}/>;}
function OpenAQReading({place}:{place:Place}){
 const query=useStation(place),now=useClock(),offline=useOffline();
 const station=query.data?.status==='ok'?query.data.station:null,index=station?.particleIndex;
 const live=!offline&&!query.isError&&!query.data?.offlineCached&&freshParticleIndex(index,now);
 return <section className="live-reading" aria-label="Latest measured air quality"><h3>Latest station air quality</h3><DataBadge kind="MEASURED"/>{(offline||query.data?.offlineCached||index&&!live)&&<DataBadge kind="STALE"/>}
 {query.isPending?<p role="status">Checking recent station observations…</p>:live&&index?<><div className="aqi-number" style={{color:airColor(index.aboveScale?500:index.aqi)}}>{index.aboveScale?'>500':index.aqi??'No data'}</div><p>{index.aboveScale?'Hazardous · Beyond the AQI scale':category(index.aqi)} · Particle AQI (US)</p><p className="reading-source">{station!.source} · {station!.provider}<br/>{station!.name} · {station!.distanceKm.toFixed(1)} km from pin<br/>Valid through <time dateTime={index.observedAt}>{new Date(index.observedAt).toLocaleString(undefined,{timeZoneName:'short'})}</time><br/>Retrieved {new Date(station!.fetchedAt).toLocaleString(undefined,{timeZoneName:'short'})}</p><p className="fine-print">Calculated from measured {index.basis.map(p=>p==='pm25'?'PM2.5':'PM10').join(' + ')} hourly observations. {index.method}; {index.hoursUsed} valid hours in the 12-hour window. This is a particle-only index, not an official all-pollutant city AQI.</p></>:<><p className="live-unavailable">Live AQI unavailable</p><p>{offline?'You are offline. Stored observations are not live.':query.isError?'Station data could not be refreshed.':query.data?.status==='unconfigured'?'The station source is not configured.':!station?'No station was returned within 25 km.':station.indexUnavailableReason??'There are not enough fresh hourly observations to calculate an index.'}</p><p className="fine-print">Source: OpenAQ v3 · We do not replace missing measured AQI with a model estimate.</p></>}
 <button className="quiet-button" disabled={query.isFetching||offline} onClick={()=>void query.refetch()}>{query.isFetching?'Checking…':'Check latest station data'}</button><StationPanel place={place}/>
 </section>;
}
