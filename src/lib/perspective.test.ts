import { expect,it } from 'vitest';
import { cities,validCoordinates,type Air } from './air';
import { cigaretteEquivalent,rankLocations } from './perspective';
it('contains 150 unique valid city coordinates',()=>{expect(cities).toHaveLength(150);expect(new Set(cities.map(c=>c.name)).size).toBe(150);expect(cities.every(c=>validCoordinates(c.lat,c.lon))).toBe(true)});
const end=Date.parse('2026-11-08T12:00:00Z');
const fixture={place:cities[0],observedAt:new Date(end).toISOString(),aqi:0,hours:Array.from({length:24},(_,i)=>({time:new Date(end-i*3600000).toISOString(),pm25:22,aqi:0}))} as Air;
it('requires a complete unique 24-hour PM2.5 window',()=>{expect(cigaretteEquivalent(fixture)).toBe(1);expect(cigaretteEquivalent({...fixture,hours:fixture.hours.slice(1)})).toBeNull();expect(cigaretteEquivalent({...fixture,hours:fixture.hours.map(h=>({...h,pm25:null}))})).toBeNull()});
it('ranks only present values and preserves actual zero',()=>{expect(rankLocations([fixture,{...fixture,aqi:null}]).best).toHaveLength(1);expect(rankLocations([fixture,{...fixture,aqi:150}]).worst[0].aqi).toBe(150)});
