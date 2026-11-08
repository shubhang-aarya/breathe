import type { Air } from './air';
/** Exact hourly frame lookup: never interpolate across missing provider hours. */
export function frameAt(air:Air,offset:number):Air{
 if(offset===0)return air;
 const reference=Date.parse(air.observedAt??'');
 if(!Number.isFinite(reference))return {...air,aqi:null};
 const target=Math.floor(reference/3600000)*3600000+offset*3600000;
 const hour=air.hours.find(h=>Date.parse(h.time)===target);
 return {...air,aqi:hour?.aqi??null,observedAt:hour?.time??new Date(target).toISOString()};
}
export function frameKind(offset:number){return offset>0?'FORECAST':offset<0?'HISTORICAL':'MODELED'}
