import { interpolate, formatHex } from 'culori';
const gradient=interpolate(['#a8d698','#dbcd8e','#d89e73','#d96d68'],'oklch');
export function airColor(aqi:number|null){return aqi===null?'#9aa6a2':formatHex(gradient(Math.max(0,Math.min(300,aqi))/300))??'#9aa6a2'}
