import { expect,it } from 'vitest';
import { normalizeSearch,parsePlaces } from './geocoding';
it('normalizes spacing and preserves Unicode names',()=>{expect(normalizeSearch('  New   Delhi  ')).toBe('New Delhi');expect(normalizeSearch('São Paulo')).toBe('São Paulo')});
it('maps arbitrary provider cities outside the starter catalog',()=>{expect(parsePlaces({results:[{id:1,name:'Phagwara',latitude:31.22,longitude:75.77,admin1:'Punjab',country:'India',country_code:'IN'}]})).toEqual([{id:1,name:'Phagwara, Punjab, India',lat:31.22,lon:75.77,region:'Punjab',countryCode:'IN'}])});
it('filters invalid coordinates, missing names and duplicate results',()=>{expect(parsePlaces({results:[{id:1,name:'Test',latitude:0,longitude:0},{id:1,name:'Test',latitude:0,longitude:0},{id:2,name:'',latitude:0,longitude:0},{id:3,name:'Test',latitude:91,longitude:0}]})).toHaveLength(1);expect(parsePlaces({})).toEqual([])});
