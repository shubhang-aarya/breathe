'use client';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import type { Air } from '@/lib/air';
import { pastDay } from '@/lib/trends';
import { DataBadge } from './glass';
export default function AirTrend({air,stale}:{air:Air;stale:boolean}){
 const hours=pastDay(air);
 return <section className="air-trend" aria-label="Previous 24 hours of modeled US AQI"><div><span>Previous 24 hours · US AQI</span><DataBadge kind={stale?'STALE':'HISTORICAL'}/></div>{hours.some(h=>h.aqi!==null)?<><div className="trend-chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={hours}><XAxis dataKey="time" hide/><YAxis hide domain={[0,'auto']}/><Tooltip labelFormatter={label=>new Date(String(label)).toLocaleString()} formatter={value=>[value??'No data','Modeled US AQI']}/><Line type="linear" dataKey="aqi" stroke="#b7d7a0" strokeWidth={2} dot={false} connectNulls={false} isAnimationActive={false}/></LineChart></ResponsiveContainer></div><details><summary>Read hourly values</summary><ul>{hours.map(h=><li key={h.time}>{new Date(h.time).toLocaleString()}: {h.aqi??'No data'}</li>)}</ul></details></>:<p>No data for the previous 24 hours.</p>}<small>Open-Meteo · CAMS model · Through {air.observedAt?new Date(air.observedAt).toLocaleString():'unavailable'}{stale?' · Not live':''}</small></section>
}
