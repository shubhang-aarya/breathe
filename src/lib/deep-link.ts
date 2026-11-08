export type Layers={aqi:boolean;hotspots:boolean;pins:boolean;dayNight:boolean;wind?:boolean};
export const defaultLayers:Layers={aqi:true,hotspots:true,pins:true,dayNight:true,wind:false};
export function parseDeepLink(params:URLSearchParams,now=Date.now()){
 const rawLat=params.get('lat'),rawLon=params.get('lon');const lat=Number(rawLat),lon=Number(rawLon);
 const place=rawLat?.trim()&&rawLon?.trim()&&Number.isFinite(lat)&&Number.isFinite(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180?{lat,lon,name:`${lat.toFixed(2)}°, ${lon.toFixed(2)}°`}:null;
 const t=params.get('t');let offset=0;
 if(t&&/^[+-]?\d{1,3}h$/.test(t))offset=Number(t.slice(0,-1));
 else if(t&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?Z$/.test(t)&&Number.isFinite(Date.parse(t))&&new Date(t).toISOString().slice(0,19)===(t.length===17?t.slice(0,16)+':00':t.slice(0,19)))offset=Math.round((Date.parse(t)-now)/3600000);
 if(offset< -24||offset>96)offset=0;
 const layers={...defaultLayers};const list=params.get('layers');if(list!==null){const keys=list===''?[]:list.split(',');if(keys.every(k=>['aqi','hotspots','pins','dayNight','wind'].includes(k))){for(const key of Object.keys(layers) as (keyof Layers)[])layers[key]=keys.includes(key)}}
 return {place,offset,layers};
}
export function buildDeepLink(base:string,lat:number,lon:number,offset:number,layers:Layers){const url=new URL(base);url.search='';url.hash='';url.searchParams.set('lat',lat.toFixed(4));url.searchParams.set('lon',lon.toFixed(4));url.searchParams.set('t',`${offset>=0?'+':''}${offset}h`);url.searchParams.set('layers',(Object.keys(layers) as (keyof Layers)[]).filter(k=>layers[k]).join(','));return url.toString()}
