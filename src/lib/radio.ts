export type Station={id:string;name:string;url:string;country:string;state:string;tags:string;logo:string|null;votes:number;clicks:number};
export function httpsUrl(value:unknown):string|null{if(typeof value!=='string')return null;try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password?url.href:null}catch{return null}}
export function filterStations(raw:unknown):Station[]{if(!Array.isArray(raw))return [];const seen=new Set<string>();return raw.flatMap(row=>{
 if(!row||typeof row!=='object')return [];const r=row as Record<string,unknown>;const url=httpsUrl(r.url_resolved);
 if(!url||r.lastcheckok!==1||!['MP3','AAC','AAC+'].includes(String(r.codec).toUpperCase())||r.hls===1||typeof r.stationuuid!=='string'||!uuid(r.stationuuid)||seen.has(r.stationuuid))return [];
 seen.add(r.stationuuid);return [{id:r.stationuuid,name:String(r.name??'Unnamed station').slice(0,160),url,country:String(r.countrycode??''),state:String(r.state??''),tags:String(r.tags??'').slice(0,200),logo:httpsUrl(r.favicon),votes:typeof r.votes==='number'?r.votes:0,clicks:typeof r.clickcount==='number'?r.clickcount:0}];
 }).sort((a,b)=>b.votes-a.votes||b.clicks-a.clicks)}
export function uuid(value:string){return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)}
export type RadioResult={stations:Station[];scope:'nearby'|'state'|'country'|'regional';fetchedAt:string;source:'Radio Browser'};
