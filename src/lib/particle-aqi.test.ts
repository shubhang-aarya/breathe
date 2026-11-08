import { expect,it } from 'vitest';
import { particleSubindex,particleNowCast,parseMeasuredHours,measuredParticleIndex,freshParticleIndex } from './particle-aqi';
const now=Date.parse('2026-11-08T14:20:00Z'),hour=3600000;
const row=(age:number,value:number)=>({time:new Date(Math.floor(now/hour)*hour-age*hour).toISOString(),value});
it('uses the EPA 2024 particle breakpoints and truncates before interpolation',()=>{
 expect(particleSubindex(9.09,'pm25')?.aqi).toBe(50);expect(particleSubindex(9.1,'pm25')?.aqi).toBe(51);expect(particleSubindex(35.49,'pm25')?.aqi).toBe(100);expect(particleSubindex(35.5,'pm25')?.aqi).toBe(101);expect(particleSubindex(225.5,'pm25')?.aqi).toBe(301);expect(particleSubindex(325.4,'pm25')?.aqi).toBe(500);expect(particleSubindex(325.5,'pm25')).toEqual({aqi:null,aboveScale:true});
 expect(particleSubindex(54.9,'pm10')?.aqi).toBe(50);expect(particleSubindex(55,'pm10')?.aqi).toBe(51);expect(particleSubindex(604,'pm10')?.aqi).toBe(500);expect(particleSubindex(-1,'pm25')).toBeNull();
});
it('requires two actual hours in the latest three, never using an instantaneous reading as AQI',()=>{
 expect(particleNowCast([row(0,90)],now)).toBeNull();expect(particleNowCast([row(3,90),row(4,90)],now)).toBeNull();expect(particleNowCast([row(-1,90),row(-2,90)],now)).toBeNull();
 expect(particleNowCast([row(0,0),row(1,0)],now)?.concentration).toBe(0);
});
it('uses true hour gaps in weights and normalizes missing hours without filling them',()=>{
 const result=particleNowCast([row(0,100),row(2,0)],now)!;expect(result.concentration).toBeCloseTo(80);expect(result.hoursUsed).toBe(2);
});
it('rejects old observations, incomplete hourly coverage, flags and wrong units',()=>{
 const sample={value:12,parameter:{name:'pm25',units:'µg/m³'},period:{datetimeFrom:{utc:'2026-11-08T12:00:00Z'},datetimeTo:{utc:'2026-11-08T13:00:00Z'}},coverage:{percentCoverage:100}};
 expect(parseMeasuredHours([sample],'pm25')).toEqual([{time:'2026-11-08T13:00:00.000Z',value:12}]);
 for(const invalid of [{...sample,coverage:{percentCoverage:50}},{...sample,coverage:null},{...sample,flagInfo:{hasFlags:true}},{...sample,parameter:{name:'pm25',units:'ppb'}}])expect(parseMeasuredHours([invalid],'pm25')).toEqual([]);
 const index=measuredParticleIndex({pm25:[row(0,0),row(1,0)]},now)!;expect(index.aqi).toBe(0);expect(freshParticleIndex(index,now)).toBe(true);expect(freshParticleIndex(index,now+3*hour)).toBe(false);expect(measuredParticleIndex({pm25:[{time:'2021-08-25T18:00:00Z',value:41}]},now)).toBeNull();
});
it('selects the worse measured particle index and clearly identifies its limited basis',()=>{
 const index=measuredParticleIndex({pm25:[row(0,9),row(1,9)],pm10:[row(0,154),row(1,154)]},now)!;expect(index.aqi).toBe(100);expect(index.basis).toEqual(['pm25','pm10']);expect(index.method).toContain('NowCast');
});

it("respects local-hour offsets used by real OpenAQ stations in India",()=>{
 const rows=[{time:"2026-11-08T13:30:00Z",value:9},{time:"2026-11-08T12:30:00Z",value:9}];
 expect(particleNowCast(rows,now)?.concentration).toBe(9);expect(measuredParticleIndex({pm25:rows},now)?.aqi).toBe(50);
 expect(particleNowCast(rows,now+3*hour)).toBeNull();
});
