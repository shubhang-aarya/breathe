import type { Air } from './air';
export function rankLocations(data:Air[]){const available=data.filter(d=>d.aqi!==null&&Number.isFinite(d.aqi));const ordered=[...available].sort((a,b)=>a.aqi!-b.aqi!||a.place.name.localeCompare(b.place.name));return {best:ordered.slice(0,10),worst:[...ordered].reverse().slice(0,10)}}
/** Require all 24 unique hourly model values: no partial-day extrapolation. */
export function cigaretteEquivalent(air:Air):number|null{
 const end=Date.parse(air.observedAt??'');if(!Number.isFinite(end))return null;
 const endHour=Math.floor(end/3600000)*3600000;const values:number[]=[];
 for(let i=0;i<24;i++){const h=air.hours.find(x=>Date.parse(x.time)===endHour-i*3600000);if(h?.pm25==null||!Number.isFinite(h.pm25)||h.pm25<0)return null;values.push(h.pm25)}
 return values.reduce((a,b)=>a+b,0)/24/22;
}
export function guidance(aqi:number|null){if(aqi===null)return 'Air quality is unavailable. Check your local air quality authority before planning outdoor exercise.';if(aqi<=50)return 'Air quality is generally suitable for outdoor activity.';if(aqi<=100)return 'Most people can be active outdoors. If unusually sensitive, consider shorter or gentler activity.';if(aqi<=150)return 'Sensitive groups should reduce prolonged or strenuous outdoor activity.';if(aqi<=200)return 'Reduce prolonged or strenuous outdoor activity; sensitive groups should take extra care.';if(aqi<=300)return 'Significantly reduce outdoor physical activity; sensitive groups should avoid outdoor exertion.';return 'Avoid outdoor physical activity and follow local health authority advice.'}
