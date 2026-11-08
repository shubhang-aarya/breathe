/** Non-air response cache: preserve provider payload and retrieval times verbatim. */
function db(): Promise<IDBDatabase> { return new Promise((resolve, reject) => { const req = indexedDB.open('breathe-extra-data', 1); req.onupgradeneeded = () => req.result.createObjectStore('responses', { keyPath: 'url' }); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); }); }
async function read<T>(url: string): Promise<T | null> {
  if (typeof indexedDB === 'undefined') return null; const store = await db();
  try { return await new Promise((resolve, reject) => { const req = store.transaction('responses').objectStore('responses').get(url); req.onsuccess = () => resolve(req.result?.data ?? null); req.onerror = () => reject(req.error); }); } finally { store.close(); }
}
async function write<T>(url: string, data: T) {
  if (typeof indexedDB === 'undefined') return; const database = await db();
  try { await new Promise<void>((resolve, reject) => { const tx = database.transaction('responses', 'readwrite'), store = tx.objectStore('responses'); store.put({ url, data, savedAt: Date.now() }); const all = store.getAll(); all.onsuccess = () => { const rows = all.result.sort((a, b) => b.savedAt - a.savedAt); rows.slice(100).forEach(row => store.delete(row.url)); }; tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); }); } finally { database.close(); }
}
export async function fetchSnapshot<T extends object>(url: string, dependencies: { fetcher?: typeof fetch; read?: (url: string) => Promise<T | null>; write?: (url: string, data: T) => Promise<void> } = {}): Promise<T & { offlineCached?: boolean }> {
  try {
    if (typeof navigator !== 'undefined' && !navigator.onLine) throw new Error('Offline');
    const response = await (dependencies.fetcher ?? fetch)(url, { signal: AbortSignal.timeout(25000) }); if (!response.ok) throw new Error();
    const data: T = await response.json(); if (!data || typeof data !== 'object') throw new Error();
    try { await (dependencies.write ?? write)(url, data); } catch { /* Storage is optional. */ } return data;
  } catch {
    let previous: T | null = null; try { previous = await (dependencies.read ?? read<T>)(url); } catch { /* No stored result. */ }
    if (previous) return { ...previous, offlineCached: true };
    throw new Error('No saved data available. Reconnect and try again.');
  }
}
