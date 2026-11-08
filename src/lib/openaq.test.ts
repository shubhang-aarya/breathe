import { expect,it } from 'vitest';
import { distanceKm,nearestStation,nearestRecentStation,parseMeasurements,isStaleObservation } from './openaq';
const station={id:1,coordinates:{latitude:0,longitude:0},sensors:[{id:11,parameter:{name:'pm25',units:'µg/m³'}},{id:12,parameter:{name:'o3',units:'ppb'}}]};
it('selects nearest fixed station using actual coordinates',()=>{expect(nearestStation([{...station,id:2,coordinates:{latitude:1,longitude:1}},station,{...station,id:3,isMobile:true}],0,0)?.id).toBe(1);expect(distanceKm(0,0,0,0)).toBe(0);expect(nearestStation([],0,0)).toBeNull()});
it('joins latest rows by sensor ID and preserves native units and zero',()=>{expect(parseMeasurements(station,[{sensorsId:12,value:0,datetime:{utc:'2026-11-08T12:00:00Z'}}])).toEqual([{sensorId:12,parameter:'o3',value:0,unit:'ppb',observedAt:'2026-11-08T12:00:00Z'}])});
it('rejects absent values, invalid dates and unknown sensors',()=>{for(const row of [{sensorsId:11,value:null,datetime:{utc:'2026-11-08T12:00:00Z'}},{sensorsId:11,value:-1,datetime:{utc:'2026-11-08T12:00:00Z'}},{sensorsId:11,value:10,datetime:{utc:'invalid'}},{sensorsId:99,value:10,datetime:{utc:'2026-11-08T12:00:00Z'}}])expect(parseMeasurements(station,[row])).toEqual([])});
it('flags old or invalid observation timestamps',()=>{expect(isStaleObservation('2026-11-08T12:00:00Z',Date.parse('2026-11-08T15:00:00Z'))).toBe(true);expect(isStaleObservation('2026-11-08T12:00:00Z',Date.parse('2026-11-08T13:00:00Z'))).toBe(false);expect(isStaleObservation('invalid',0)).toBe(true)});

it('prefers a nearby reporting station over a closer inactive station',()=>{
 const now=Date.parse('2026-11-08T14:20:00Z');const old={...station,datetimeLast:{utc:'2021-08-25T18:00:00Z'}};const recent={...station,id:2,coordinates:{latitude:.01,longitude:.01},datetimeLast:{utc:'2026-11-08T14:00:00Z'}};
 expect(nearestRecentStation([old,recent],0,0,now)?.id).toBe(2);expect(nearestRecentStation([old],0,0,now)?.id).toBe(1);
});
