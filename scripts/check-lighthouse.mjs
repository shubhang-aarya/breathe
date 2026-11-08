#!/usr/bin/env node
// Validate an actual Lighthouse JSON report without inventing or running a score.
import { readFileSync } from 'node:fs';
const file = process.argv[2], expected = process.argv[3];
if (!file || !expected) { console.error('Usage: npm run release:lighthouse -- path/to/report.json https://tested-origin'); process.exit(2); }
let report;
try { report = JSON.parse(readFileSync(file, 'utf8')); } catch { console.error('No readable Lighthouse JSON report supplied.'); process.exit(2); }
const score = report.categories?.performance?.score, tested = report.finalDisplayedUrl ?? report.finalUrl;
let originMatches = false;
try { originMatches = new URL(tested).origin === new URL(expected).origin; } catch { /* Invalid report URL. */ }
const desktop = report.configSettings?.formFactor === 'desktop';
const genuine = typeof report.lighthouseVersion === 'string' && typeof report.fetchTime === 'string' && Number.isFinite(Date.parse(report.fetchTime)) && report.audits && !report.runtimeError;
if (!genuine || !originMatches || !desktop || typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > 1) { console.error('Report must be a successful desktop Lighthouse audit of the expected origin.'); process.exit(1); }
console.log(`Desktop performance: ${Math.round(score * 100)} / 100`); console.log(`Audit time: ${report.fetchTime}; Lighthouse ${report.lighthouseVersion}`);
console.log('A passing entry-page audit does not certify interactive globe performance or manual acceptance.');
if (score < .85) { console.error('Performance target 85 was not met.'); process.exitCode = 1; }
