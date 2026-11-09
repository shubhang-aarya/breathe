import { distanceKm } from './openaq';
export type ReportedAQI = { source?:'IQAir'; scope?:'city'; aqi:number; station:string; distanceKm:number; observedAt:string; fetchedAt:string; url:string; attribution:{name:string;url:string}[]; subindices:Partial<Record<'pm25'|'pm10'|'no2'|'so2'|'co'|'o3',number>> };
export type ReportedResult = {status:'ok';reading:ReportedAQI}|{status:'unconfigured'|'unavailable';reason?:string};
const safeUrl=(value:unknown)=>{try{const u=new URL(String(value));return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password?u.href:null}catch{return null}};
export function reportedFresh(reading:ReportedAQI,now:number){const time=Date.parse(reading.observedAt);return Number.isFinite(time)&&time<=now&&now-time<=2*3600000;}
/** WAQI iaqi values are pollutant SUBINDICES, not concentrations. Never attach µg/m³. */
export function parseReportedAQI(raw:unknown,lat:number,lon:number,now=Date.now()):ReportedAQI|null{
 if(!raw||typeof raw!=='object'||!('status'in raw)||raw.status!=='ok'||!('data'in raw)||!raw.data||typeof raw.data!=='object')return null;
 const d=raw.data as Record<string,unknown>,city=d.city as Record<string,unknown>|undefined,time=d.time as Record<string,unknown>|undefined;
 if(typeof d.aqi!=='number'||!Number.isFinite(d.aqi)||d.aqi<0||d.aqi>1000||typeof city?.name!=='string'||!city.name.trim()||!Array.isArray(city.geo)||city.geo.length!==2)return null;
 const coords=city.geo.map(v=>typeof v==='number'?v:typeof v==='string'&&v.trim()?Number(v):NaN);
 if(!coords.every(Number.isFinite)||Math.abs(coords[0])>90||Math.abs(coords[1])>180)return null;
 const distance=distanceKm(lat,lon,coords[0],coords[1]);
 const explicit=typeof time?.iso==='string'&&/(Z|[+-]\d{2}:\d{2})$/.test(time.iso)?time.iso:typeof time?.s==='string'&&typeof time.tz==='string'&&/^[+-](?:0\d|1[0-4]):[0-5]\d$/.test(time.tz)?time.s.replace(' ','T')+time.tz:null;
 if(!explicit||!Number.isFinite(Date.parse(explicit)))return null;
 const url=safeUrl(city.url);if(!url)return null;
 const attribution=Array.isArray(d.attributions)?d.attributions.flatMap(a=>{const u=safeUrl(a?.url);return typeof a?.name==='string'&&a.name.trim()&&u?[{name:a.name.slice(0,200),url:u}]:[]}):[];
 // Preserve originating provider attribution; do not silently discard it.
 if(!attribution.length)return null;
 const subindices:ReportedAQI['subindices']={};const iaqi=d.iaqi as Record<string,{v?:unknown}>|undefined;
 for(const name of ['pm25','pm10','no2','so2','co','o3'] as const){const value=iaqi?.[name]?.v;if(typeof value==='number'&&Number.isFinite(value)&&value>=0)subindices[name]=value;}
 return {aqi:d.aqi,station:city.name.slice(0,200),distanceKm:distance,observedAt:new Date(explicit).toISOString(),fetchedAt:new Date(now).toISOString(),url,attribution,subindices};
}

/** Prefer fresh, nearby observations; a city or distant station is a reference. */
export function selectReportedAQI(readings:ReportedAQI[],now=Date.now()):ReportedAQI|null{
 return [...readings].sort((a,b)=>Number(reportedFresh(b,now))-Number(reportedFresh(a,now))||a.distanceKm-b.distanceKm||Date.parse(b.observedAt)-Date.parse(a.observedAt))[0]??null;
}
