import { describe, expect, it } from 'vitest';
import { formatReading } from './data';
describe('truthful reading display',()=>{
 it.each([null,undefined,NaN,Infinity,-Infinity])('never substitutes an absent reading: %s',value=>{expect(formatReading(value)).toBe('No data')});
 it('preserves a real zero',()=>{expect(formatReading(0)).toBe('0')});
});
