/** Never silently rank an incomplete paginated station directory. */
export async function collectOpenAQPages(path: string, get: (path: string) => Promise<unknown>, maximumPages = 20) {
  const rows: unknown[] = [];
  for (let page = 1; page <= maximumPages; page++) {
    const raw = await get(`${path}${path.includes('?') ? '&' : '?'}limit=1000&page=${page}`);
    if (!raw || typeof raw !== 'object' || !('results' in raw) || !Array.isArray(raw.results)) throw new Error('Invalid paginated station response');
    rows.push(...raw.results);
    const meta = 'meta' in raw ? raw.meta : null;
    const found = meta && typeof meta === 'object' && 'found' in meta && typeof meta.found === 'number' ? meta.found : null;
    if (raw.results.length < 1000 || found !== null && rows.length >= found) return rows;
  }
  throw new Error('Station directory exceeded the request budget; no partial nearest-station claim is made');
}
