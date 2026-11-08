import 'server-only';
type Name = 'assistant' | 'openaq';
type Budget = { allowed: boolean; retryAfter: number; shared: boolean };
type Limit = { seconds: number; count: number };
export class QuotaUnavailable extends Error { constructor() { super('Request limiting is temporarily unavailable'); } }
const limits: Record<Name, Limit[]> = {
  assistant: [{ seconds: 60, count: 12 }, { seconds: 3600, count: 120 }],
  // Deliberately below OpenAQ's documented default quota; upstream headers still win.
  openaq: [{ seconds: 60, count: 30 }, { seconds: 3600, count: 1000 }],
};
const reserve = `
local wait = redis.call('TTL', KEYS[3])
if wait > 0 then return {0, wait} end
for i=1,2 do
 local count = tonumber(redis.call('GET', KEYS[i]) or '0')
 if count >= tonumber(ARGV[(i-1)*2+1]) then
  wait = math.max(wait, 1, redis.call('TTL', KEYS[i]))
 end
end
if wait > 0 then return {0, wait} end
for i=1,2 do
 local count = redis.call('INCR', KEYS[i])
 if count == 1 then redis.call('EXPIRE', KEYS[i], tonumber(ARGV[(i-1)*2+2])) end
end
return {1, 0}`;
const cooldownScript = `local ttl=redis.call('TTL',KEYS[1]); if ttl < tonumber(ARGV[1]) then redis.call('SET',KEYS[1],'1','EX',ARGV[1]) end; return 1`;
const local = new Map<string, { start: number; count: number }>(), cooldowns = new Map<Name, number>();
function config() {
  const url = process.env.UPSTASH_REDIS_REST_URL, token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url && !token) return null;
  if (!url || !token) throw new QuotaUnavailable();
  try { const parsed = new URL(url); if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new Error(); } catch { throw new QuotaUnavailable(); }
  return { url, token };
}
async function command(args: (string | number)[], fetcher: typeof fetch) {
  const connection = config(); if (!connection) throw new QuotaUnavailable();
  try {
    const response = await fetcher(connection.url, { method: 'POST', headers: { Authorization: `Bearer ${connection.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(args), signal: AbortSignal.timeout(4000), cache: 'no-store' });
    if (!response.ok) throw new Error();
    const raw = await response.json(); if (raw.error || !('result' in raw)) throw new Error(); return raw.result;
  } catch { throw new QuotaUnavailable(); }
}
function keys(name: Name) { return [`breathe:{${name}}:minute:v1`, `breathe:{${name}}:hour:v1`, `breathe:{${name}}:cooldown:v1`]; }
export async function takeBudget(name: Name, fetcher: typeof fetch = fetch, now = Date.now()): Promise<Budget> {
  if (config()) {
    const value = await command(['EVAL', reserve, 3, ...keys(name), ...limits[name].flatMap(limit => [limit.count, limit.seconds])], fetcher);
    if (!Array.isArray(value) || value.length !== 2 || ![0, 1].includes(value[0]) || typeof value[1] !== 'number' || !Number.isFinite(value[1]) || value[1] < 0) throw new QuotaUnavailable();
    return { allowed: value[0] === 1, retryAfter: Math.max(value[0] === 0 ? 1 : 0, Math.ceil(value[1])), shared: true };
  }
  let retryAfter = Math.max(0, Math.ceil(((cooldowns.get(name) ?? 0) - now) / 1000));
  for (const limit of limits[name]) {
    const key = `${name}:${limit.seconds}`; let row = local.get(key);
    if (!row || now - row.start >= limit.seconds * 1000 || now < row.start) { row = { start: now, count: 0 }; local.set(key, row); }
    if (row.count >= limit.count) retryAfter = Math.max(retryAfter, Math.ceil((row.start + limit.seconds * 1000 - now) / 1000));
  }
  if (retryAfter) return { allowed: false, retryAfter, shared: false };
  for (const limit of limits[name]) local.get(`${name}:${limit.seconds}`)!.count++;
  return { allowed: true, retryAfter: 0, shared: false };
}
export async function recordProviderCooldown(name: Name, seconds: number, fetcher: typeof fetch = fetch, now = Date.now()) {
  if (!Number.isFinite(seconds) || seconds <= 0) return;
  cooldowns.set(name, Math.max(cooldowns.get(name) ?? 0, now + seconds * 1000));
  if (config()) await command(['EVAL', cooldownScript, 1, keys(name)[2], Math.ceil(seconds)], fetcher);
}
