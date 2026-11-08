export type MeasuredValue={parameter:string;value:number;unit:string;observedAt:string;sensorId:number};
export type StationData={id:number;name:string;lat:number;lon:number;distanceKm:number;provider:string;values:MeasuredValue[];fetchedAt:string;source:'OpenAQ v3'};
export type StationResult={status:'ok';station:StationData|null}|{status:'unconfigured'};
export function distanceKm(lat:number,lon:number,y:number,x:number){const rad=Math.PI/180;const a=Math.sin((y-lat)*rad/2)**2+Math.cos(lat*rad)*Math.cos(y*rad)*Math.sin((x-lon)*rad/2)**2;return 6371*2*Math.asin(Math.min(1,Math.sqrt(a)))}
type Sensor={id:number;parameter?:{name?:string;units?:string}};
export type AQStation={id:number;name?:string;coordinates:{latitude:number;longitude:number};sensors?:Sensor[];provider?:{name?:string};isMobile?:boolean};
export function nearestStation(raw:unknown,lat:number,lon:number):AQStation|null{
 if(!Array.isArray(raw))return null;const locations=raw.filter((row):row is AQStation=>!!row&&typeof row==='object'&&Number.isInteger(row.id)&&row.isMobile!==true&&typeof row.coordinates?.latitude==='number'&&Number.isFinite(row.coordinates.latitude)&&Math.abs(row.coordinates.latitude)<=90&&typeof row.coordinates?.longitude==='number'&&Number.isFinite(row.coordinates.longitude)&&Math.abs(row.coordinates.longitude)<=180);
 return locations.sort((a,b)=>distanceKm(lat,lon,a.coordinates.latitude,a.coordinates.longitude)-distanceKm(lat,lon,b.coordinates.latitude,b.coordinates.longitude))[0]??null;
}
export function parseMeasurements(station:AQStation,raw:unknown):MeasuredValue[]{
 if(!Array.isArray(raw))return [];const allowed=new Set(['pm25','pm2.5','pm10','no2','so2','co','o3']);const result:MeasuredValue[]=[];
 for(const r of raw){if(!r||typeof r!=='object'||typeof r.value!=='number'||!Number.isFinite(r.value)||r.value<0||typeof r.datetime?.utc!=='string'||!Number.isFinite(Date.parse(r.datetime.utc)))continue;
 const sensor=station.sensors?.find(s=>s.id===r.sensorsId);const parameter=sensor?.parameter?.name?.toLowerCase();const unit=sensor?.parameter?.units;
 if(!parameter||!allowed.has(parameter)||typeof unit!=='string'||!unit)continue;result.push({parameter,value:r.value,unit,observedAt:r.datetime.utc,sensorId:sensor!.id});}
 return result;
}
export function isStaleObservation(observedAt:string,now:number){const timestamp=Date.parse(observedAt);return !Number.isFinite(timestamp)||now-timestamp>2*3600000}
