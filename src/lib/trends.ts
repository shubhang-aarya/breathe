import type { Air } from './air';
export function pastDay(air:Air){
 const end=Date.parse(air.observedAt??'');
 if(!Number.isFinite(end))return [];
 return air.hours.filter(h=>{const t=Date.parse(h.time);return t<=end&&t>end-24*3600000});
}
