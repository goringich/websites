# Kyokushin NN — AI context

## Mission

Maintain a fast, trustworthy recruitment site for the Nizhny Novgorod Shinkyokushinkai federation. A parent or student should understand the offer, find a suitable hall, see the relevant instructor/schedule and contact that instructor directly without another intermediary.

This is project-local context. Do not infer central AI-OS ownership, commercial ownership, customer data or portfolio status from this file.

## Read order

For routine work, read only what is needed, starting with:

1. `docs/state/current.json` — current release/runtime/work-slice truth.
2. `docs/state/problem-registry.json` — active vs resolved problems.
3. `docs/state/project-model.json` — product model, tradeoffs and next increment.
4. `docs/delivery-increments.json` — readiness/history when progress or release status matters.
5. `docs/design/art-direction-v3.json` and `docs/design/audit-2026-08-24.md` for visual work.
6. The directly affected source/test files.

For trainer-photo work also read:

- `docs/trainer-photo-research.json`;
- `docs/trainer-photo-browser-handoff.json` when working on active PR #51.

Do not rediscover closed V3.6/Vercel incidents as current problems. `VERCEL_TOKEN` is operational, issue #26 is closed, and exact GitHub -> Vercel deployment is proven.

## Current architecture

### Canonical content

`content/site.json` is the canonical editable content/data authority for:

- site/recruitment labels;
- Kerzhenets / Krasny Plyos camp context;
- hero media;
- gallery/media stories;
- photo reports;
- all 11 instructors;
- all 18 venue/section records, schedules, addresses and phones;
- source-bound trainer photo metadata.

Do not reintroduce a second hand-maintained instructor/media registry in `script.js`, `media.js` or `trainer-photos.js`.

`/admin/` is the GitHub-backed operator surface for the canonical content. It does not turn arbitrary external media into trusted content: the same provenance rules must pass before publication.

### Runtime/content delivery

- `scripts/build-static.mjs` builds the CMS-backed self-contained release and emits `dist/index.html`, `health.json`, `robots.txt`, `sitemap.xml`, admin assets and the canonical content snapshot.
- `server.mjs` / runtime content sync may refresh canonical `project/kyokushin-nn` content without changing the product data model.
- `script.js`, `media.js`, `trainer-photos.js`, `team.js`, `finder.js`, `photo.js` are runtime/enhancement/rendering surfaces. They consume/transform canonical content; they are not alternate factual authorities.
- `admin/media-policy.js` and `scripts/verify-media-policy.mjs` are the fail-closed media trust boundary.
- `vercel.json` defines the production output/routing/header contract.

### Visual authority

The active public direction is `Dojo Editorial / Competition Poster` on a pure-V3 stack:

- `art-direction-v3.css`;
- `experience-v3.css` / `experience-v3.js`;
- `motion-v3.js`;
- `docs/design/art-direction-v3.json`;
- `docs/design/audit-2026-08-24.md`.

The owner-rejected visual family remains a negative reference. Do not regress to:

`dark two-column hero -> metrics strip -> repeated rounded cards -> trainer card grid -> SaaS-like filter panel -> generic fade-up reveal`.

The rejected `art-direction-v2.css`, `experience.css` and `experience.js` files are not active production dependencies and must not return.

A source/CSS/CI pass is not visual acceptance. Keep the states separate:

`ART_DIRECTION_CONTRACT -> IMPLEMENTED_CANDIDATE -> PERCEPTUAL_REVIEW_PASS -> OWNER_REVIEW_CANDIDATE -> OWNER_ACCEPTED`.

Current deterministic/live production checks are green; representative current desktop/mobile perceptual review and owner acceptance are still pending.

## Production truth

Current release-producing source:

`967a8157f32834ce5ba748d4ad22b9627299a6ca`

Current package:

`4.0.1`

Current production deployment:

`dpl_72rU2CYTGV1GnDxD1n61nZbqS5Ee`

Canonical production:

`https://kyokushin-nn.vercel.app/`

GitHub Actions run `32796544756` completed both verification and production deployment. Exact public smoke passed for the same release with:

- direct self-contained HTML;
- `dojo-editorial-v3` / pure-v3;
- 11 instructors / 18 venues before JavaScript;
- 17 unique structured places;
- runtime security/referrer/permissions headers;
- no-store health;
- brand/hero failure resilience;
- CMS enabled at `/admin/` with `/content/site.json`.

State/docs-only pushes are intentionally non-release-producing. Changes limited to `kyokushin-nn/docs/**` and/or `kyokushin-nn/AI_CONTEXT.md` may advance the branch without making production stale. Runtime/source/workflow changes still use verify -> exact Vercel deploy -> public smoke.

## Trainer identity and real-media rules

Federation social authority:

`https://vk.com/club227311328`

`https://shin-nnov.orgs.biz/` is secondary discovery evidence only. It may help locate original federation material but is not generic identity authority for a named portrait.

Never:

- infer identity from face resemblance;
- use AI face recognition to select a trainer photo;
- assign a generic group/event image to a named trainer;
- treat a search-result thumbnail as provenance;
- accept a common-name profile without professional/federation/venue/contact anchors;
- bypass private-account/access controls;
- generate synthetic trainer/customer/athlete documentary photography;
- infer patronymics or identity from scraped people-search data.

A new named trainer portrait needs an explicit public source-page -> exact asset chain tied to the professional identity. For supported new social portraits, preserve `sourcePlatform`, `identityStatus=verified` and meaningful `identityEvidence` where the current media policy requires them.

If provenance is incomplete, keep the intentional typography/initial fallback. An incomplete roster visually is preferable to a wrong identity claim.

## Active work: PR #51

Active branch:

`feat/kyokushin-all-trainer-photos`

Active PR:

`#51 feat(kyokushin): complete verified trainer portraits`

Current verified work head recorded by state:

`84f13fad5c1ea1d367486442d7371c6805a1baa4`

Current work-branch progress:

- 2/11 source-bound portraits;
- 10/11 professional identities source-backed;
- Сергей Захаров is the only remaining identity-ambiguous trainer;
- production still has 1/11 portraits because PR #51 is intentionally draft.

PR #51 separates incremental quality verification from final completion:

- normal draft `npm run check` can be green with identity-safe pending trainer cards;
- the work branch adds `npm run verify:portrait-completion` for the explicit 11/11 gate;
- draft PR CI skips only that final completion step;
- `ready_for_review`, project-branch release and production deployment must enforce 11/11 fail-closed.

Do not mark PR #51 ready or merge it before the completion gate is actually satisfied.

## Non-negotiable invariants

- Keep exactly 11 instructors and 18 venue/section records unless a new explicit source changes them.
- Never invent a schedule, rank, title, identity, address, phone, map target, personal photo or event claim.
- Preserve direct `tel:` and map access for every applicable hall.
- Production must serve the self-contained build directly; no browser-side binary/bootstrap reconstruction.
- Every release-producing source change must expose one exact release identity in HTML and matching `/health.json`.
- Production HTML must contain the complete 11/18 recruitment directory before JavaScript enhancement.
- The 18 venue records currently deduplicate to 17 physical `Place` identities; derive this from canonical content, never hard-code a changed count by hand.
- `robots.txt` and `sitemap.xml` remain canonical to `https://kyokushin-nn.vercel.app/` unless the production authority changes explicitly.
- `/health.json` must remain no-store and production must retain the verified response-security baseline.
- Critical external first-screen media must fail into intentional design states, not broken-image UI or invented substitutes.
- Honor `prefers-reduced-motion`.
- Mobile is a separate composition, not merely desktop stacked vertically.

## Working loop

Bug/regression:

`reproduce/fingerprint -> root cause -> smallest causal fix -> focused regression check -> npm run check -> verify affected real surface`

Visual work:

`owner intent/rejection -> exact artifact audit -> active dependency/media audit -> implement -> build -> rendered desktop/mobile review -> visible-fix loop -> owner review candidate`

Release work:

`npm run check -> release/prebuilt contract -> deploy exact verified source -> exact public production smoke -> update state evidence`

Do not add another preparatory implementation pass without new runtime, user or visual evidence.

## Verification

Current base branch:

```bash
npm run check
npm run verify:art-direction
npm run verify:runtime
npm run verify:brand
npm run verify:media
npm run verify:discovery
KYOKUSHIN_RELEASE_ID=<release> npm run verify:release
KYOKUSHIN_EXPECTED_RELEASE=<release> npm run smoke:production
```

On active PR #51, additionally:

```bash
npm run verify:portrait-completion
```

`verify:art-direction`, source checks and CI cannot prove that the page looks good. Visual acceptance still requires the exact rendered desktop/mobile artifact.

## Definition of done

A source change is not automatically production-complete or design-complete.

For production work, the exact verified release must reach the canonical domain and pass the public smoke contract.

For trainer portrait work, all 11 portraits must have auditable identity/source provenance and the explicit completion gate must pass; unresolved identities must never be hidden behind generic/synthetic imagery.

For visual work, representative current desktop/mobile renders must be reviewed, visible defects fixed, and owner review/acceptance recorded separately.
