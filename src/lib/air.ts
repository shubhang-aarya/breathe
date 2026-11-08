export type Place = { name:string; lat:number; lon:number };
export const cities:Place[] = [
 {name:'Delhi, India',lat:28.61,lon:77.21},{name:'Mumbai, India',lat:19.08,lon:72.88},{name:'Kolkata, India',lat:22.57,lon:88.36},{name:'Bengaluru, India',lat:12.97,lon:77.59},{name:'Gangtok, India',lat:27.33,lon:88.61},{name:'London, United Kingdom',lat:51.51,lon:-.13},{name:'Paris, France',lat:48.86,lon:2.35},{name:'New York, United States',lat:40.71,lon:-74.01},{name:'Tokyo, Japan',lat:35.68,lon:139.69},{name:'Sydney, Australia',lat:-33.87,lon:151.21},{name:'Cape Town, South Africa',lat:-33.92,lon:18.42},{name:'São Paulo, Brazil',lat:-23.55,lon:-46.63},{name:'Singapore',lat:1.35,lon:103.82},{name:'Beijing, China',lat:39.9,lon:116.4},{name:'Helsinki, Finland',lat:60.17,lon:24.94},{name:'Reykjavík, Iceland',lat:64.15,lon:-21.94},
];
export const pollutants = ['pm2_5','pm10','nitrogen_dioxide','sulphur_dioxide','carbon_monoxide','ozone'] as const;
export type Pollutant = typeof pollutants[number];
export type Air = {place:Place;aqi:number|null;pollutants:Record<Pollutant,number|null>;observedAt:string|null;fetchedAt:string;source:'Open-Meteo · CAMS';kind:'MODELED';hours:{time:string;aqi:number|null;pm25:number|null}[]};
export function coordinateKey(p:Place){return `${p.lat.toFixed(3)},${p.lon.toFixed(3)}`}
export function validCoordinates(lat:number,lon:number){return Number.isFinite(lat)&&Number.isFinite(lon)&&lat>=-90&&lat<=90&&lon>=-180&&lon<=180}
export function category(aqi:number|null){if(aqi===null||!Number.isFinite(aqi))return 'No data';if(aqi<=50)return 'Good';if(aqi<=100)return 'Moderate';if(aqi<=150)return 'Unhealthy for sensitive groups';if(aqi<=200)return 'Unhealthy';if(aqi<=300)return 'Very unhealthy';return 'Hazardous'}
export function finite(value:unknown):number|null{return typeof value==='number'&&Number.isFinite(value)&&value>=0?value:null}
