import { expect,it } from 'vitest';
import { filterStations,httpsUrl,uuid } from './radio';
const valid={stationuuid:'01234567-89ab-cdef-0123-456789abcdef',name:'Fixture',url_resolved:'https://example.com/live',codec:'MP3',lastcheckok:1,hls:0,votes:10,clickcount:2};
it('rejects HTTP, credentials, malformed and script URLs',()=>{for(const value of ['http://example.com','https://user:pass@example.com','javascript:alert(1)','invalid',null])expect(httpsUrl(value)).toBeNull()});
it('filters broken, unsupported and insecure streams',()=>{expect(filterStations([valid])).toHaveLength(1);for(const patch of [{lastcheckok:0},{codec:'OGG'},{hls:1},{url_resolved:'http://example.com'},{stationuuid:'invalid'}])expect(filterStations([{...valid,...patch}])).toHaveLength(0)});
it('deduplicates station IDs and ranks votes before clickcount',()=>{const other={...valid,stationuuid:'11234567-89ab-cdef-0123-456789abcdef',votes:11,clickcount:0};expect(filterStations([valid,valid,other]).map(s=>s.votes)).toEqual([11,10])});
it('rejects non-array payloads and validates UUIDs',()=>{expect(filterStations({})).toEqual([]);expect(uuid(valid.stationuuid)).toBe(true);expect(uuid('../url')).toBe(false)});
