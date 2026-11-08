#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log('Usage: npm run release:doctor -- [--url http://localhost:3000 | https://your-domain] [--out artifacts/release/doctor.json]');
  console.log('Checks the local release prerequisites and, when a URL is supplied, public app/API contracts. Does not play radio, spend AI credits, deploy, or claim browser QA.'); process.exit(0);
}
function option(name) { const i = args.indexOf(name); return i < 0 ? null : args[i + 1]; }
const report = { generatedAt: new Date().toISOString(), commit: '', workingTreeDirty: null, checks: [], browserAcceptance: 'NOT RUN', lighthouse: 'NOT RUN', deployment: 'NOT VERIFIED' };
try { report.commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { /* An extracted source archive may not include Git. */ }
try { report.workingTreeDirty = !!execFileSync('git', ['status', '--porcelain'], {encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim(); } catch { /* Source archive. */ }
function check(name, status, detail) { report.checks.push({ name, status, detail }); console.log(`${status.toUpperCase()} ${name}: ${detail}`); }
const [major, minor] = process.versions.node.split('.').map(Number);
check('Node', major > 22 || major === 22 && minor >= 12 ? 'pass' : 'fail', process.version);
check('Dependencies', existsSync('node_modules/next/package.json') ? 'pass' : 'fail', existsSync('node_modules/next/package.json') ? 'Next.js installed' : 'Run npm ci');
check('Production build', existsSync('.next/BUILD_ID') ? 'pass' : 'blocked', existsSync('.next/BUILD_ID') ? 'A build exists; run npm run check to verify current source' : 'Run npm run check');
check('Vercel project', existsSync('.vercel/project.json') ? 'pass' : 'blocked', existsSync('.vercel/project.json') ? 'Project link exists' : 'Run npx vercel login, then npx vercel link');
for (const key of ['OPENAQ_API_KEY', 'OPENAI_API_KEY', 'BIGDATACLOUD_API_KEY']) check(key, process.env[key] ? 'pass' : 'optional', process.env[key] ? 'Configured locally (value hidden)' : 'Not configured locally');
const customRedis = !!(process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_TOKEN);
const shared = customRedis ? !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN : !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;
check('Shared request limiting', shared ? 'pass' : 'blocked', shared ? 'Credentials configured; deployed reservation must still be tested' : 'Configure Upstash server credentials or connect Marketplace KV_REST_API_URL/KV_REST_API_TOKEN for distributed quotas');
for (const hostname of ['registry.npmjs.org', 'air-quality-api.open-meteo.com', 'api.vercel.com']) {
  try { const response = await fetch(`https://${hostname}`, { method: 'HEAD', signal: AbortSignal.timeout(5000) }); check(`Network ${hostname}`, 'pass', `Reachable, HTTP ${response.status} (not an authenticated provider test)`); }
  catch (error) { check(`Network ${hostname}`, 'blocked', error.cause?.code || error.name); }
}
let base;
const raw = option('--url');
if (raw) {
  try { base = new URL(raw); if (base.username || base.password || base.search || base.hash || base.pathname !== '/' || !(base.protocol === 'https:' || base.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname))) throw new Error(); }
  catch { console.error('Use an HTTPS origin or a localhost HTTP origin, without credentials, paths or query parameters.'); process.exit(2); }
  const numeric = value => value === null || typeof value === 'number' && Number.isFinite(value) && value >= 0;
  const timestamp = value => typeof value === 'string' && Number.isFinite(Date.parse(value));
  const routes = [
    { name: 'App shell', route: '/', validate: async r => (await r.text()).includes('BREATHE') },
    { name: 'PWA manifest', route: '/manifest.webmanifest', validate: async r => { const body = await r.json(); return body.name?.includes('BREATHE') && body.icons?.length >= 2; } },
    { name: 'Service worker', route: '/sw.js', validate: async r => r.headers.get('cache-control')?.includes('no-cache') && (await r.text()).includes('BREATHE_CACHE') },
    { name: 'Modeled air contract', route: '/api/air?lat=28.61&lon=77.21', validate: async r => { const rows = await r.json(), air = rows?.[0]; return !!air && air.kind === 'MODELED' && air.source === 'Open-Meteo · CAMS' && numeric(air.aqi) && timestamp(air.fetchedAt) && (air.observedAt === null || timestamp(air.observedAt)) && ['pm2_5', 'pm10', 'nitrogen_dioxide', 'sulphur_dioxide', 'carbon_monoxide', 'ozone'].every(p => numeric(air.pollutants?.[p])) && Array.isArray(air.hours); } },
    { name: 'Worldwide city search', route: '/api/search?q=Phagwara', validate: async r => { const body = await r.json(); return timestamp(body.fetchedAt) && body.places?.some(p => /phagwara/i.test(p.name) && Number.isFinite(p.lat) && Number.isFinite(p.lon)); } },
    { name: 'Station route', route: '/api/station?lat=28.61&lon=77.21', validate: async r => { const body = await r.json(); if (body.status === 'unconfigured') return false; return body.status === 'ok' && (body.station === null || timestamp(body.station.fetchedAt) && body.station.source === 'OpenAQ v3' && body.station.values?.every(v => numeric(v.value) && typeof v.unit === 'string' && timestamp(v.observedAt))); } },
  ];
  for (const item of routes) {
    try {
      const response = await fetch(new URL(item.route, base), { signal: AbortSignal.timeout(35000), redirect: 'manual' });
      if (!response.ok) check(item.name, 'fail', `HTTP ${response.status}. Check deployment protection, credentials or provider status.`);
      else check(item.name, await item.validate(response) ? 'pass' : 'fail', 'Public response contract checked; missing station coverage is permitted, missing credentials are not station acceptance.');
    } catch (error) { check(item.name, 'blocked', error.cause?.code || error.name); }
  }
} else check('App/API smoke checks', 'blocked', 'Supply --url after starting the production server or deploying a preview.');
const destination = path.resolve(option('--out') || 'artifacts/release/doctor.json'); mkdirSync(path.dirname(destination), { recursive: true });
report.result = report.checks.some(c => c.status === 'fail' || c.status === 'blocked') ? 'INCOMPLETE' : 'PREREQUISITES_AND_API_CONTRACTS_PASSED';
writeFileSync(destination, JSON.stringify(report, null, 2) + '\n');
console.log(`Report: ${destination}`);
console.log('This report does not certify visuals, media playback, browser permissions, offline reload, deployment ownership or Lighthouse performance.');
if (report.result === 'INCOMPLETE') process.exitCode = 1;
