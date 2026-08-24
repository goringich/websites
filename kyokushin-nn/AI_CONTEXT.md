# Kyokushin NN — AI context

## Mission

Maintain a fast, trustworthy recruitment microsite for the Nizhny Novgorod Shinkyokushinkai federation. The owner-visible outcome is simple: a parent or student can understand the offer, feel the federation as a real living martial-arts organization, find a suitable hall, see the relevant instructor and schedule, and contact the instructor directly.

## Project scope

This is project-local AI context. Product/runtime/release truth remains in this repository. Do not infer central AI-OS ownership, commercial ownership, customer data, or portfolio status from this file.

Read these first for routine project work:

1. `docs/state/current.json`
2. `docs/state/problem-registry.json`
3. `docs/state/project-model.json`
4. `docs/delivery-increments.json` when the task concerns progress, readiness or release state
5. `docs/design/art-direction-v3.json` and `docs/design/audit-2026-08-24.md` for visual/design work
6. the directly affected source/test files

Expand to the rest of the project only when the evidence requires it.

## Canonical source surfaces

- `script.js` — instructors, halls, addresses, schedules and filtering data.
- `media.js` — gallery and photo-report registry.
- `trainer-photos.js` — source-bound trainer portraits and identity-safe fallbacks.
- `team.js` — trainer roster rendering.
- `finder.js` — shareable search/filter state.
- `photo.js` — gallery, albums and lightbox behavior.
- `styles.css`, `cards.css`, `media-viewer.css` — retained functional/base component layers used by the current build.
- `experience-v3.css`, `experience-v3.js` — current navigation/progress/focus experience state for V3 without the rejected generic reveal system.
- `art-direction-v3.css` — current owner-requested visual skeleton: Dojo Editorial / Competition Poster.
- `motion-v3.js` — current motion grammar for entry, scroll, interaction and state-change behavior.
- `docs/design/art-direction-v3.json` — current art-direction contract and explicit negative references.
- `docs/design/audit-2026-08-24.md` — current design audit and rejected visual patterns.
- `scripts/verify-art-direction-v3.mjs` — structural V3 regression gate; it is not perceptual proof.
- `scripts/verify-editorial-refinement.mjs` — current typography/hierarchy/cascade regression gate.
- `scripts/verify-static-directory.mjs` — verifies the prerendered 11-instructor / 18-venue fallback against canonical recruitment data.
- `scripts/verify-runtime-headers.mjs` — verifies the Vercel response-security and health-cache contract without weakening current media/font dependencies.
- `scripts/verify-discovery.mjs` — verifies source-derived structured locations, `robots.txt`, `sitemap.xml` and discovery state against canonical recruitment data.
- `scripts/build-static.mjs` — canonical pure-V3 self-contained production build. It emits `dist/index.html`, `dist/health.json`, `dist/robots.txt` and `dist/sitemap.xml`; the HTML also carries the prerendered recruitment directory and source-derived federation/location JSON-LD.
- `scripts/release-contract.mjs` — artifact-level release/runtime/discovery gate, including rejection of leaked V2 visual bundles.
- `scripts/production-smoke.mjs` — public exact-release/art-direction/pure-V3/static-directory/runtime-header/discovery gate.
- `scripts/verify.mjs` — broad current-V3 product/data/media/trust regression gate.
- `vercel.json` — production build/output plus response-header/cache contract.
- `.github/workflows/kyokushin-nn-ci.yml` — release verification and exact-SHA deployment pipeline.

The rejected `art-direction-v2.css`, `experience.css` and `experience.js` source files have been physically removed after the broad verifier migrated to V3. Their names remain only in negative-reference/build/release guards where useful so accidental reintroduction fails closed.

## Current visual authority

The owner explicitly rejected the previous visual family as weak on 2026-08-24. Treat that rejection as a first-class negative reference.

The current direction is `Dojo Editorial / Competition Poster`. Do not regress to the rejected v2 skeleton merely because it is technically clean:

`dark two-column hero -> metrics strip -> repeated rounded/component cards -> trainer card grid -> SaaS-like filter panel -> generic fade-up reveal`.

A major redesign after explicit rejection must also retire the rejected visual family from active production dependencies. A new art-direction stylesheet layered over rejected V2 CSS/JS is not sufficient. The current project physically removes the rejected V2 visual source files, and build/release/live gates must fail if those legacy dependencies return.

For major public-web design work, use the system-level `visual-outcome-convergence` result authority plus the public-web `web-art-direction-expert` specialist when that skill is operationally available. If the system skill is only source-prepared/not runtime-adopted, follow the project-local v3 contract directly rather than pretending the central skill is active.

A source/CSS/CI pass is not visual acceptance. Design status must distinguish:

`ART_DIRECTION_CONTRACT -> IMPLEMENTED_CANDIDATE -> PERCEPTUAL_REVIEW_PASS -> OWNER_REVIEW_CANDIDATE -> OWNER_ACCEPTED`.

## Non-negotiable invariants

- Keep exactly the verified recruitment data unless a new source explicitly changes it: 18 section records and 11 instructors.
- Never invent a schedule, rank, title, identity, address, phone, map target or personal photo.
- Personal trainer images require an explicit source-bound identity match; otherwise use the intentional identity-safe typographic/initial fallback.
- Preserve direct `tel:` contact and map access for every applicable hall.
- Never use synthetic trainer/customer/athlete imagery in a way that implies a real identity or event.
- Never use decorative Japanese/Asian symbols or calligraphy with unverified meaning merely to manufacture atmosphere.
- Production must serve the self-contained HTML generated by `npm run build` directly.
- Every production release must expose a concrete `x-kyokushin-release` identity, `x-kyokushin-art-direction` identity and matching `/health.json` values.
- The current V3 release must be a pure V3 visual stack: rejected V2 art-direction/experience bundles are forbidden in the production artifact.
- Production HTML must carry the complete 11-instructor / 18-section recruitment directory before JavaScript enhancement; JavaScript may enhance/filter it but must not be the only path to phones, addresses, schedules and maps.
- Structured discovery data must be derived from canonical recruitment data. The 18 section records currently deduplicate to 17 physical `Place` identities by exact city/name/address; do not change that count manually.
- `robots.txt` and `sitemap.xml` must point only to the canonical `https://kyokushin-nn.vercel.app/` surface unless the canonical production URL explicitly changes.
- Production must apply the verified nosniff/anti-framing/referrer/permissions baseline, and `/health.json` must be `no-store` so stale cache cannot prove a new release.
- Never deploy a browser-side binary/bootstrap loader, `p*.bin` payload reconstruction, runtime gzip assembly or similar client-side packaging.
- Do not make GitHub Raw/CDN fallback loaders part of the production success path.
- A Vercel deployment being `READY` is not sufficient evidence. The public production URL must pass the production smoke contract for the expected release.
- Do not hide production or visual-review failures behind a fallback that reports success.
- Honor `prefers-reduced-motion`; content and navigation may not depend on animation completion.
- Mobile is a separate composition, not merely the desktop grid stacked vertically.

## Working loop

For a bug or regression:

`reproduce/fingerprint -> establish root cause -> smallest causal fix -> focused regression check -> npm run check -> verify affected real surface`

For visual redesign work:

`owner intent/rejection -> exact artifact audit -> active visual dependency audit -> art-direction contract -> implemented candidate -> built-artifact dependency check -> rendered desktop/mobile review -> visible-fix loop -> owner review candidate -> owner acceptance`

For release/deployment work:

`npm run check -> release contract -> deploy exact verified source -> exact-release public production smoke -> update state evidence`

Do not add a third preparatory implementation pass without new decisive runtime/visual evidence.

## Verification commands

```bash
npm run check
npm run verify:art-direction
npm run verify:runtime
npm run verify:discovery
KYOKUSHIN_RELEASE_ID=<release> npm run verify:release
KYOKUSHIN_EXPECTED_RELEASE=<release> npm run smoke:production
```

`verify:art-direction` proves only structural design/motion/dependency invariants. It cannot prove that the page looks good.

`verify:discovery` rebuilds the artifact and proves that structured locations, robots, sitemap and health discovery state remain source-derived.

`smoke:production` is a live check against `https://kyokushin-nn.vercel.app/` and fails closed when production is stale, on the wrong art direction, contains rejected V2 visual bundles, lacks the static recruitment directory, lacks the response-security/no-store contract, loses JSON-LD/robots/sitemap discovery surfaces, is bootstrapped through binary chunks, has a missing/mismatching `/health.json`, or is unavailable.

## Definition of done

A source change is not automatically a design-complete or production-complete change.

For visual work, `done` requires the exact rendered artifact to pass representative desktop/mobile perceptual review and reach the requested owner-review/acceptance state. When rendering is blocked, report `perceptual_qa_blocked` rather than claiming visual completion.

For production work, the public domain must return the real pure-V3 self-contained site directly; HTML and `/health.json` must agree on the exact expected release and art direction; the static 11/18 directory, runtime headers/no-store health and discovery surfaces must be present; rejected V2 visual bundles must be absent; and the live smoke must pass. CI success alone is not a substitute.
