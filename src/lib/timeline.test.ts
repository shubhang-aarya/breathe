import { expect,it } from 'vitest';
import { frameAt,frameKind } from './timeline';
import type { Air } from './air';
const fixture:Air={place:{name:'Test fixture',lat:0,lon:0},aqi:22,pollutants:{pm2_5:null,pm10:null,nitrogen_dioxide:null,sulphur_dioxide:null,carbon_monoxide:null,ozone:null},observedAt:'2026-11-08T12:00:00Z',fetchedAt:'2026-11-08T12:00:00Z',source:'Open-Meteo · CAMS',kind:'MODELED',hours:[{time:'2026-11-08T13:00:00Z',aqi:0,pm25:null}]};
it('preserves the current reading and true zero future values',()=>{expect(frameAt(fixture,0)).toBe(fixture);expect(frameAt(fixture,1).aqi).toBe(0)});
it('does not interpolate or reuse current AQI for a missing hour',()=>{expect(frameAt(fixture,2).aqi).toBeNull();expect(frameAt(fixture,2).observedAt).toBe('2026-11-08T14:00:00.000Z')});
it('separates forecast, historical and current modeled frames',()=>{expect(frameKind(1)).toBe('FORECAST');expect(frameKind(-1)).toBe('HISTORICAL');expect(frameKind(0)).toBe('MODELED')});
