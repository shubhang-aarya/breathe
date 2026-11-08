import { describe, expect, it } from 'vitest';
import { category,finite,validCoordinates } from './air';
describe('provider data integrity',()=>{
 it('preserves zero and rejects numeric-looking strings',()=>{expect(finite(0)).toBe(0);expect(finite('32')).toBeNull();expect(finite(-1)).toBeNull()});
 it('requires finite coordinates in range',()=>{expect(validCoordinates(28.61,77.21)).toBe(true);expect(validCoordinates(NaN,0)).toBe(false);expect(validCoordinates(91,0)).toBe(false)});
 it('labels category boundaries and missing data',()=>{expect(category(50)).toBe('Good');expect(category(51)).toBe('Moderate');expect(category(301)).toBe('Hazardous');expect(category(null)).toBe('No data')});
});
