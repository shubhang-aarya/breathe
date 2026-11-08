import { expect, it } from 'vitest';
import { parseReversePlace } from './reverse-geocoding';
it('retains actual administrative metadata without inventing labels', () => {
  expect(parseReversePlace({}, 0, 0)).toBeNull();
  expect(parseReversePlace({ city: 'Phagwara', principalSubdivision: 'Punjab', countryName: 'India', countryCode: 'IN' }, 31.22, 75.77)).toEqual({ name: 'Phagwara, Punjab, India', lat: 31.22, lon: 75.77, region: 'Punjab', country: 'India', countryCode: 'IN' });
});
