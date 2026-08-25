# Kyokushin NN agent contract

Scope: `kyokushin-nn/**`.

## Read order

1. `AI_CONTEXT.md`
2. `docs/state/current.json`
3. `docs/state/problem-registry.json`
4. `docs/state/project-model.json`
5. `docs/media-direction.json` for any photo/video/caption/media task
6. `docs/trainer-photo-research.json` when finding or changing a named trainer portrait
7. `content/site.json` for current CMS content truth
8. only the task-relevant implementation, tests and logs

Do not rediscover the whole repository when these surfaces already answer the routing question.

## Authorities

- Recruitment/content data: `content/site.json` in the CMS architecture.
- Real-media search, provenance, slot assignment, identity and factual caption policy: `docs/media-direction.json`.
- Named-person/social search evidence and trainer-photo research state: `docs/trainer-photo-research.json`, routed through the system `public-person-research` skill before `real-media-direction` selection.
- Media runtime registry and identity allowlist: `media.js`, `trainer-photos.js`.
- UI behavior: `script.js`, `team.js`, `finder.js`, `photo.js`, `experience-v3.js`.
- Visual system: the project CSS files.
- Production artifact: `scripts/build-static.mjs` output under `dist/`.
- Release acceptance: `scripts/release-contract.mjs`.
- Public runtime acceptance: `scripts/production-smoke.mjs` plus Vercel deployment evidence.
- Durable status/problem understanding: `docs/state/*.json`; update it only from verified evidence.

## Engineering rules

- Fix the causal layer, not the visible symptom.
- Keep source, CI, deployment and browser/runtime evidence separate.
- `merged`, `CI green` and `Vercel READY` are intermediate states, not synonyms for Done.
- Never change 18 halls / 11 instructors, schedules, phone numbers, ranks, titles or photo identity from inference.
- Never reintroduce browser-side archive reconstruction, `p*.bin`, `DecompressionStream`, GitHub-Raw fallback loaders or similar delivery indirection.
- Keep production static and self-contained unless a concrete product requirement justifies a server/runtime dependency.
- Prefer deterministic checks over prose-only status claims.
- Do not add a framework or dependency when the existing zero-runtime-dependency architecture can solve the task cleanly.
- Preserve mobile, keyboard, reduced-motion and accessible-name behavior.
- External/production writes require an explicit task that calls for them; this repository does not grant generic central mutation authority.

## Named-person research rules

- Any task to find a trainer, public profile or trainer photograph must use the system `public-person-research` route before media selection.
- Resolve textual/professional identity first: exact name, federation/club, city, role, venue/event and other already-public professional anchors. Do not start from a face.
- Search official federation/club pages and VK first for Russian local sports identities; public Telegram, competition/event archives, photographer albums and other public social profiles are supporting sources.
- Existing LOCAL AI OS Telegram research/intake is the Telegram authority. Do not create a second Telegram scraper stack for this project.
- Optional Agent Reach/OpenCLI backends may improve social discovery when available, but neither tool is identity authority and neither is required for correctness.
- Search-result thumbnails, people-search sites, generic CDN URLs and face resemblance are never identity proof.
- Common-name candidates with conflicting city/role/organization are rejected, not silently merged.
- Do not bypass private accounts, automate login, extract credentials, use leaked data or collect unrelated sensitive personal details to resolve a trainer.
- Keep every trainer in an explicit research state. A plausible candidate is not `found`.

## Real-media rules

- Photography/video are documentary product content, not filler.
- Define the job of a media slot before searching for the asset.
- Search from the exact person/event/place/date and prefer project originals, official federation sources, official Красный Плёс sources and directly connected event/photographer archives.
- Search engines may discover an original page but are never the source of record.
- Do not generate trainer, athlete, child, crowd, camp, venue, competition or product photography and present it as real.
- Do not use unrelated stock or another event/year/place as a substitute for a specific real subject.
- A named-person portrait requires source-bound identity; face resemblance, surname matching, filename, image-search text or AI vision inference are not identity proof.
- A verified social portrait must retain both the source profile/post/album and the binary asset. The runtime/CMS policy validates the source-platform/asset pairing plus `identityStatus=verified` and non-empty `identityEvidence` for newly promoted portraits.
- `shin-nnov.orgs.biz` is a secondary discovery mirror, not the official federation authority. New portraits must not use it as a generic identity source; the current Georgiy legacy record remains a narrow documented compatibility exception until the exact original VK post is resolved.
- When a portrait is not verified, keep the typography/initials state. Never silently substitute another person.
- Keep source page provenance for critical media even when the binary is mirrored or cached elsewhere.
- Use different assets for different evidence jobs; do not repeat one generic poster across several videos/cards merely because it is technically available.
- Factual captions, biographies, achievements, event names/dates, participant claims, photo credits, quotes and testimonials must be grounded in project/source truth.
- Do not invent promotional prose to make weak or missing evidence feel richer. Normal navigation/button/interface microcopy is allowed.
- Crop direction is part of media selection: preserve the subject/evidence on both desktop and mobile instead of relying blindly on `object-fit: cover`.
- Critical remote media must fail into intentional UI, never a broken-image state.
- If a real media source is weak or identity is uncertain, use less media rather than false media.

## Required verification

For source changes, run the smallest relevant focused check and then `npm run check`.

For trainer-photo/media changes additionally verify:

- `docs/trainer-photo-research.json` records the research decision and rejected false positives when relevant;
- the slot still has a clear semantic job;
- provenance is represented in `content/site.json` and/or `docs/media-direction.json`;
- named-person identity is source-bound;
- source profile/post/album and binary asset belong to a supported verified source class;
- new named portraits use `identityStatus=verified` with source-bound `identityEvidence`;
- no synthetic documentary media or unrelated stock was introduced;
- factual captions remain source-grounded;
- desktop/mobile crop behavior is intentional for critical imagery;
- remote failure behavior is non-broken.

For release changes, additionally prove:

```bash
KYOKUSHIN_RELEASE_ID=<release> npm run verify:release
KYOKUSHIN_EXPECTED_RELEASE=<release> npm run smoke:production
```

A production task is complete only when the public domain exposes the expected exact release, `/health.json` agrees with the HTML release marker, required UI markers exist, and forbidden loader markers are absent.

## Runtime incident loop

`fingerprint -> root cause -> causal fix -> regression guard -> verified release -> production deploy -> exact-release live smoke -> state registry update`

If visual Chromium QA is blocked by the execution environment itself, record that as a QA-environment gap. Do not reinterpret it as a product defect without browser evidence.
