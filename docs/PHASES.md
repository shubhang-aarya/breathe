# Phase record

## Phase 1 — 2026-11-08

Plan: establish the Next.js foundation, visual tokens, glass primitives and accessible entry flow. Keep data absent until official APIs are integrated.

Implemented: responsive splash, exploration empty state, credits dialog, silent audio-context unlock on gesture, low-power control, reduced-motion handling, provenance types, tests and setup docs.

Verification attempted: npm installation, lint, typecheck, tests and build. Registry lookup failed (ENOTFOUND); tools are not installed, so checks are blocked. No successful check or deployed URL is claimed.

Next: restore dependency installation; run all checks and browser QA before accepting Phase 1. Then verify Open-Meteo documentation and implement Phase 2. Do not advance live integrations on unverified assumptions.

## Phase 2 partial checkpoint — 2026-11-08

Plan: verify official Open-Meteo and globe.gl contracts, then connect the globe and model-backed location details. Registry installation was retried with a writable cache; DNS remains unavailable.

Source added: server-only Open-Meteo proxy, 15-minute framework cache, bounded retries and coordinate validation; lazy globe, reduced-motion and low-power settings, selection and four-pin lifecycle; city list and browser geolocation; modeled provenance, timestamps and pollutant detail; OKLCH colour; data-integrity tests.

Checks attempted: lint, typecheck, tests and build all blocked (executables unavailable because npm installation failed). No API or browser runtime verification claimed. This checkpoint is not Phase 2 acceptance. See README for the remaining global grid, map fallback, scrubber and polish requirements. Resume dependency installation and checks before advancing to Phase 3.

### Phase 2 continuation — 2026-11-08

Added MapLibre 2D view and globe failure switching, exact-hour AQI timeline and forecast distinction. Kept missing frame AQI empty and withheld current pollutant values outside Now. Nine direct Node domain assertions passed. Added timeline Vitest coverage. Retried npm installation: ENOTFOUND persists. Ran required commands: lint, typecheck, tests and build cannot find their executables. git diff --check passed. Browser QA remains blocked. This is a partial phase checkpoint, not a deployable verification claim.

### Global coverage continuation — 2026-11-08

Implemented 84-point coarse global grid in six batches, sampled hex-bin colors, lazy 24-hour chart with textual values, and preserved server retrieval timestamps by caching normalized responses. Added sampling/trend tests and preserved base data type alongside STALE. Ten direct Node assertions passed; git diff --check passed. Lint, typecheck, Vitest and build were attempted but executables are unavailable. Remaining Phase 2 work includes city coverage expansion, ranking/hotspots, pin polish, recommendations and all browser/runtime checks. Do not describe this phase as completed.

### Phase 2 final source checkpoint — 2026-11-08

Expanded catalog to 150 cities and bounded city requests. Added loaded-city best/worst lists, model-data hotspot rings, marker pins, spring card entry, sourced health recommendation and complete-day cigarette approximation. Eight direct Node assertions passed. Required lint/typecheck/Vitest/build all attempted and blocked by dependency installation ENOTFOUND. git diff --check passed. Acceptance remains blocked; do not mark the phase verified or proceed to deployment on these results.

### Dependency verification unblocked — 2026-11-08

User installed dependencies in Terminal. Fixed Next Link linting, MapLibre GeoJSONSource typing, globe ring callback typing and PostCSS export warning. ESLint/typecheck/19 tests passed. Production webpack build passed; Turbopack failed on a sandbox-denied port binding during CSS processing. Set production build to webpack. Recorded lockfile for reproducibility. Security triage remains pending detailed audit output; browser/runtime acceptance is not claimed.

### Security migration verified — 2026-11-08

User installed the prepared upgrades and supplied a zero-vulnerability audit. Verified the resolved MapLibre 6.17.0, Vitest 5.1.0 and scoped minimatch 11.0.5 versions. Lint, typecheck, all 19 tests and production build passed. Commit manifest, lockfile and verification record together. Live API / browser and remaining animation QA still pending before full Phase 2 acceptance.

## Phase 3 core radio — 2026-11-08

Plan: official API verification; DNS mirror discovery and server proxy; HTTPS station filtering; native-element player with crossfade and persistent controls; tests and production build.

Implemented core radio. Initial validation passed lint, TypeScript, 24 tests and production build. Country/state geocoding fallback, media gesture unlock and live browser checks remain pending. This is a working source checkpoint, not a claim of validated live playback. Final logo fallback added and all checks rerun before commit.

Final Phase 3 checkpoint checks: lint, typecheck, 24 tests and production build passed. Local preview attempt failed with listen EPERM on port 3000 in the restricted environment; browser playback QA could not run.

## Phase 4 source integration — 2026-11-08

Plan: check official OpenAQ v3 contracts, integrate nearest fixed-station concentrations with exact sensor units/timestamps, add cache and provider-cooldown handling, preserve model/measurement separation, test and commit.

Implemented /api/station and station panel. Reads server-only OPENAQ_API_KEY; absent-key state is explicit and never fabricates measurements. Searches 25 km / 1,000 candidates, excludes mobile stations, joins latest records by sensor ID, and shows source/provider/observation and retrieval times. Raw concentrations are not converted from instantaneous values to AQI. Cached client results remain visible as STALE / Not live after refresh failure. Shared OpenAQ/Open-Meteo backoff honors provider cooldown headers. Tests cover native units, real zero, invalid/missing observations, nearest selection, stale age, retry headers, non-retryable authentication and 429 handling.

Final checks passed: lint, typecheck, 32 tests across 10 files, production webpack build, git diff --check. Live OpenAQ verification is blocked by the missing server API key. Cross-instance quota budgeting, comprehensive license metadata and browser review remain outstanding. Phase 3 country/state fallback and Phase 2 animation QA also remain tracked; the build results do not certify those requirements.

## Requested visual refinement — 2026-11-08

Replaced the procedural welcome planet with lazy-loaded globe.gl Earth, shared local Blue Marble texture and elevation bump map in both experiences, with a textured CSS fallback. Added a dedicated responsive layout stylesheet to replace panel pixel offsets with grid/flex flow, clearer translucent glass, calmer shadows, smooth native scrolling and reduced-motion-aware screen transitions. Separated camera fly-to from data updates so background requests no longer restart the camera flight. Bundled upstream three-globe example images with its MIT license and in-app attribution; no air readings are embedded in imagery.

Checks passed: lint, typecheck, 32 tests and production webpack build. Live visual browser QA remains pending because the sandbox cannot bind the preview port. Phase 5 interrupted source remains separately uncommitted at this checkpoint.

## Phase 5 recovered and validated — 2026-11-08

Recovered interrupted history/compare/forecast/health source, added keyboard dialog handling and analytics tests. Lint, typecheck, unit tests and production build were rerun; results recorded by the commit checkpoint. Vercel deployment is blocked by absent CLI/account and restricted network. No deployment claim is made. Remaining measured-history comparison, screenshot/browser QA and earlier radio country/state fallback are documented limitations. User requested proceeding to the next phase after UI refinement; continue Phase 6 source without implying the deployment milestone passed.

## Phase 6 first checkpoint — 2026-11-08

Plan: after visual refinement and Phase 5 recovery, start deep links, layers and clean-air roulette. Implemented coordinate/relative-hour/ISO parsing, share-link generation, layer toggles and fresh Good-air random selection with five-pick memory. Lint, typecheck, 41 tests and production build passed. Vercel deployment remains blocked by absent project linkage/CLI; user requested proceeding to the next phase. Solar terminator, Open Graph image and remaining signature work are still pending. This is a checkpoint, not Phase 6 completion.
