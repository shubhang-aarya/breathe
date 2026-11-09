import { validCoordinates } from './air';
import { distanceKm } from './openaq';
import type { ReportedAQI } from './reported-aqi';
const object=(v:unknown):Record<string,unknown>=>v!==null&&typeof v==='object'?v as Record<string,unknown>:{};
/** Community API reports are city-level US AQI, never exact-pin measurements. */
export function parseIQAir(raw:unknown,lat:number,lon:number,now=Date.now()):ReportedAQI|null{
 const root=object(raw),data=object(root.data),location=object(data.location),pollution=object(object(data.current).pollution);
 const coordinates=location.coordinates;
 if(root.status!=='success'||!validCoordinates(lat,lon)||!Array.isArray(coordinates)||coordinates.length!==2||typeof coordinates[0]!=='number'||typeof coordinates[1]!=='number'||!validCoordinates(coordinates[1],coordinates[0]))return null;
 const aqi=pollution.aqius,ts=pollution.ts;
 if(typeof aqi!=='number'||!Number.isFinite(aqi)||aqi<0||typeof ts!=='string'||!/(Z|[+-]\d{2}:\d{2})$/.test(ts)||!Number.isFinite(Date.parse(ts))||typeof data.city!=='string'||!data.city.trim())return null;
 return {source:'IQAir',scope:'city',aqi,station:[data.city,data.state,data.country].filter((v):v is string=>typeof v==='string'&&!!v.trim()).map(v=>v.trim().slice(0,150)).join(', '),distanceKm:distanceKm(lat,lon,coordinates[1],coordinates[0]),observedAt:new Date(ts).toISOString(),fetchedAt:new Date(now).toISOString(),url:'https://www.iqair.com/',attribution:[{name:'IQAir / AirVisual',url:'https://www.iqair.com/'}],subindices:{}};
}
