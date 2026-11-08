import { validCoordinates,type Place } from './air';
export type SearchPlace=Place&{id:number;countryCode?:string;region?:string};
export function normalizeSearch(value:string){return value.trim().replace(/\s+/g,' ')}
export function parsePlaces(raw:unknown):SearchPlace[]{
 if(!raw||typeof raw!=='object'||!('results' in raw))return [];
 const rows=(raw as {results:unknown}).results;if(!Array.isArray(rows))return [];
 const seen=new Set<number>();return rows.flatMap(r=>{if(!r||typeof r!=='object'||typeof r.name!=='string'||!r.name.trim()||typeof r.latitude!=='number'||typeof r.longitude!=='number'||!validCoordinates(r.latitude,r.longitude)||!Number.isInteger(r.id)||seen.has(r.id))return [];seen.add(r.id);
 const region=typeof r.admin1==='string'?r.admin1:undefined;const country=typeof r.country==='string'?r.country:undefined;const label=[...new Set([r.name,region,country].filter((x):x is string=>!!x))].join(', ');
 return [{id:r.id,name:label,lat:r.latitude,lon:r.longitude,region,countryCode:typeof r.country_code==='string'&&/^[A-Z]{2}$/.test(r.country_code)?r.country_code:undefined}];}).slice(0,10);
}
