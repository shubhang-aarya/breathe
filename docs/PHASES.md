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

### Welcome overflow correction — 2026-11-08

User screenshot showed an oversized Earth overlapping the feature strip. Replaced the absolute-positioned welcome hero with explicit copy/Earth/meta/features grid areas, capped Earth container width, reduced heading sizes, and added a compact-height desktop treatment. Mobile keeps the globe in its own normal-flow row. Initialized globe canvas dimensions from its host before rendering and moved the decorative camera farther away. Lint, typecheck, 41 tests, production webpack build and diff whitespace checks passed. Visual confirmation in the user's browser remains pending.

### City search correction — 2026-11-08

User reported Phagwara not found because search only filtered the built-in catalog. Replaced it with a worldwide Open-Meteo geocoding proxy, typed validated results, 30-minute cache, input debounce/cancellation, local fallback, explicit loading/error/empty states and keyboard selection. Tests cover arbitrary off-catalog results, selecting coordinates with Enter, rejecting outdated results, and distinguishing provider failure from no match. Lint, typecheck, 47 tests, production build and git diff --check passed. Live provider response and browser confirmation remain pending; the search service could not be reached by the available retrieval surface.

### Phase 6 solar and Open Graph checkpoint — 2026-11-08

Implemented selected-time solar day/night shader, layer/deep-link state, NOAA approximate subsolar calculation and tests, and a dynamic next/og image route advertised by page metadata. OG readings come from the server-side model client and carry source/type/times and stale labels. Missing data remains No data. Resource cleanup guards asynchronous texture loading after unmount. Shader adapter is isolated in JavaScript because third-party type definitions are unavailable offline; all domain functions and routes are TypeScript.

Final checks passed: lint, typecheck, 51 tests and production webpack build. Browser shader visual QA, social crawler verification and Vercel deployment remain pending. This is a source checkpoint, not a claim that the public deployment milestone passed. The next build phase is Diwali Effect, guided breathing and optional UI sounds.

## Phase 7 checkpoint — 2026-11-08

Plan: verify festival dates and model archive contract, add neutral ±72h comparisons with incomplete-window handling, Good-air-only guided breathing, independent synthesized UI audio; validate and commit.

Implemented verified 2024/2025/2026 festival dates, server-cached model window requests, three default cities plus search, explicit evening marker, AQI/PM2.5 charts and textual values, coverage/peak/percent summaries, no future data and IN PROGRESS status. Disabled pre-2022 coverage. No proven-cause claim is made.

Added 1/3/5-minute breathing sessions with 4/4/6 cues, reduced-motion static orb, fresh Good-air gating and nearest available Good-air alternative. Radio ducks while the overlay is open and restores on cleanup. Optional synthesized UI sounds remain off until enabled after interaction and have separate saved volume/settings.

Final verification passed: lint, typecheck, 56 tests across 18 files, production webpack build, git diff --check. Tests cover future-hour exclusion, missing/zero baseline, partial window coverage, dates/anchor, breathing radio-state restoration, and sound opt-in. Live historical window responses, browser/audio visuals, and deployment remain unverified. Dates/API sources and limitations are in README. Phase 8 (wind and PWA/offline) is next.

### Requested LiquidGlass wrapper — 2026-11-08

Read the supplied ybouane/liquidglass repository and its 1.0.3 package/API documentation. Added a lazy, pinned documented CDN loader because npm DNS remains blocked. Integrated a shared renderer per main button group with direct-child structure, button mode, restrained refraction and native semantic controls. Low power, reduced motion and initialization failure retain the frosted fallback. Added group teardown and functionality tests. Lint, typecheck, 59 tests, production build and git diff --check passed. Live shader appearance and CDN verification are pending; no browser-rendering success is claimed.

### LiquidGlass label visibility fix — 2026-11-08

User screenshots showed white-on-white CTA and control labels after shader initialization. Isolated the external renderer to empty aria-hidden decorative surfaces, kept all native buttons outside its capture root, and added explicit contrast styles for normal and disabled controls. Surface geometry follows the buttons via ResizeObserver; original click, focus and ARIA behavior remains native. Updated regression test asserts the library never receives native buttons. Lint, typecheck, 59 tests, production build and git diff --check passed. Browser confirmation remains pending.

## Phase 8 core checkpoint — 2026-11-08

Plan: official weather/Workbox documentation; coarse real-data wind particles with motion/performance guards; installable manifest/icons; explicit last-known offline model data; tests and commit.

Added 40-cell modeled wind proxy and capped particle layer, optional Now-only wind control, independent source timestamps and no missing-value substitution. Added Workbox-based production service worker for shell/assets, manifest/icons and browser install prompt. Model data uses bounded IndexedDB per-request storage and preserves original fetch/observation times; failures return explicit stale data. Offline transitions mark retained data stale, stop radio and prevent cached Good-air values from unlocking breathing/roulette. Station/festival data is not persisted yet and unavailable states stay explicit.

Final checks passed: lint, typecheck, 66 tests, production build and git diff --check. Tests cover meteorological FROM direction, null wind, dateline wrap, offline failure, zero AQI, original timestamps and storage failure. Actual particle rendering, install/service-worker/IndexedDB browser integration and offline reloads remain unverified; Vercel deployment remains pending. Bonus items are not complete.

## Phase 9 release preparation — 2026-11-08

Plan: audit the release state, improve keyboard navigation and timestamp wording, consolidate accurate documentation, run all automated checks and prepare deployment.

Added keyboard-selected search-option scrolling, clearer scrubbed valid-time wording, current credits copy, a single `npm run check` gate, explicit project tracing roots and service-worker no-cache response headers. Added a regression test confirming shader directive newline strings; the suspected escaped-newline problem was not reproduced and no shader fix is claimed. Replaced the stale README and demo script with current feature/omission inventories, architecture, setup, data methodology, source credits, Vercel instructions and a browser release checklist. Screenshot requirements are documented without fabricated images.

Automated validation: ESLint, TypeScript, 67 tests across 22 files and production webpack build passed; git diff --check passed. Browser/GPU/audio/offline/Lighthouse acceptance and actual screenshots remain pending. Vercel deployment could not run: no linked project or installed CLI is available, and the offline CLI lookup fails because the package is not cached. No public URL or performance score is claimed. Phase 9 is a release-preparation checkpoint, not final submission acceptance.

## Remaining Phase 8 bonus implementation — 2026-11-08

Continued without a phase approval pause as requested. Added the lazy air toolkit: locally persisted threshold crossings, opt-in browser notifications, current-pin/open-app scope disclosure; a server-grounded assistant with optional OpenAI Responses API and deterministic no-key/provider-failure summary; numerical generated prose rejection; PNG Web Share/download with pinned html-to-image and native-canvas fallback; sourced printable/PDF report; opt-in browser speech recognition and spoken sourced summaries; and a small weather/history ridge regression with chronological holdout MAE, previous-day baseline and explicit ML ESTIMATE / FORECAST labels.

Closed regional radio discovery gaps with geo → state → country → distant geographic fallbacks and preservation of search metadata. Added optional keyed BigDataCloud server reverse geocoding for arbitrary pins, because current free client-endpoint policy forbids using arbitrary/stored coordinates from a server. No public Nominatim endpoint was added. Without the optional key, coordinates remain functional and search metadata still enables state/country fallback. Added age-sensitive clock, active-location refresh and in-app source credits.

Verification checkpoint: lint, TypeScript, 80 tests across 27 files and production build passed before final documentation updates. Live optional AI/reverse-geocoding calls, permission dialogs, browser export and speech still require browser/provider acceptance. No actual AQI is synthesized; the experimental model output remains explicitly an estimate trained on provider model data.

## Phase 9 final hardening and requested Frosted Panel — 2026-11-08

Continued through the remaining implementation without approval pauses. Hardened radio gesture warming and rapid station-switch races; lazy-loaded the explorer; corrected empty-layer deep-link round trips and invalid-calendar timestamp validation; preserved original station and festival payloads in bounded offline storage; warmed the initial shell and existing hashed assets for first-visit offline access, with a native fallback if Workbox's CDN cannot load. Added a locally served Geist font, brighter reading surfaces under light-scheme preference, a recoverable error page and GitHub Actions checks. OpenAQ now paginates before nearest selection, refuses partial-directory claims when its request budget is exceeded, and surfaces available owner/license attribution.

User supplied the LiquidGlass demo and explicitly selected Frosted Panel. Verified the current demo configuration and applied blurAmount 0.25 / cornerRadius 30 with documented defaults and button mode. Native controls remain above independent decorative shader surfaces, keeping white-on-white label regressions out of the renderer. Added translucent frosted CSS surfaces, readable disabled controls and clipped the neutral capture background to button silhouettes. The compact capture scene does not refract the entire live globe; CSS backdrop blur samples the actual page as the fallback.

Updated README, feature checklist, environment table, architecture/methodology, third-party notices, release checklist and the 2–3 minute demo to reflect implemented bonus features. Optional OpenAI and BigDataCloud keys are not required for the rest of the app. Browser APIs retain explicit unavailable states.

External acceptance remains blocked: localhost production startup returns listen EPERM, a direct weather API request returns ENOTFOUND, no browser-control tool is exposed, and no Vercel CLI/project/remote is available. No screenshot, live-provider acceptance, public deployment or Lighthouse score is claimed. Original build/audit history remains above for traceability.

Final automated verification for this continuation: ESLint and TypeScript passed; 91 tests across 30 files passed; production webpack build and git diff --check passed. Coverage added for no-key server grounding, untrusted client AQI rejection, unsupported generated quantities, cross-origin request rejection, rapid radio deck reuse, pagination completeness, safe attribution links, cached original timestamps and invalid calendar/layer deep links. Credential-pattern scan found no key patterns in tracked text. These results do not certify browser rendering, permissions, playback, offline reload, deployment or Lighthouse targets.

## Navigation and radio shortcut — 2026-11-08

Added Home in the main header and made the brand return to the welcome screen with heading focus. Added Radio in the header (also available before entering) and a common Back to globe / Radio navigation strip in Diwali, insights, toolkit and breathing panels. Panel exits remain visible while scrolling. Radio requests close overlays, then scroll and focus the player after modal focus restoration; reduced-motion preferences use immediate scrolling. The radio destination is a labeled, focusable region.

Verification: lint, TypeScript, 95 tests across 31 files, production webpack build and git diff --check passed. New tests cover welcome return/focus, entry via the Radio shortcut, explicit panel back behavior, and radio focus/scroll after closing a panel. Browser visual acceptance remains pending in this restricted environment.

## Panel/header collision fix — 2026-11-08

User screenshot exposed that a modal inside the isolated/transformed explorer could remain below the application header regardless of its local z-index. Moved Diwali, insights and breathing overlays into a shared body portal. The backdrop covers application navigation and locks background scrolling; Diwali/insights use a bounded flex panel with a separate header and independently scrolling body. Back/Radio controls wrap on mobile and no longer share the application's header area. Low-power and reduced-motion behavior remain available.

Verification passed: lint, TypeScript, 97 tests across 32 files, production webpack build and git diff --check. New regressions assert portal placement outside a transformed ancestor, background-scroll restoration and backdrop-only dismissal. These structural tests do not replace the still-pending visual browser check.
