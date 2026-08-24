# Kyokushin NN agent contract

Scope: `kyokushin-nn/**`.

## Read order

1. `AI_CONTEXT.md`
2. `docs/state/current.json`
3. `docs/state/problem-registry.json`
4. `docs/state/project-model.json`
5. only the task-relevant implementation, tests and logs

Do not rediscover the whole repository when these surfaces already answer the routing question.

## Authorities

- Recruitment data: `script.js`.
- Media provenance and identity allowlist: `media.js`, `trainer-photos.js`.
- UI behavior: `team.js`, `finder.js`, `photo.js`, `experience.js`.
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
- Never reintroduce browser-side archive reconstruction, `p*.bin`, `DecompressionStream`, GitHub-Raw runtime loaders or similar delivery indirection.
- Keep production static and self-contained unless a concrete product requirement justifies a server/runtime dependency.
- Prefer deterministic checks over prose-only status claims.
- Do not add a framework or dependency when the existing zero-runtime-dependency architecture can solve the task cleanly.
- Preserve mobile, keyboard, reduced-motion and accessible-name behavior.
- External/production writes require an explicit task that calls for them; this repository does not grant generic central mutation authority.

## Required verification

For source changes, run the smallest relevant focused check and then `npm run check`.

For release changes, additionally prove:

```bash
KYOKUSHIN_RELEASE_ID=<release> npm run verify:release
KYOKUSHIN_EXPECTED_RELEASE=<release> npm run smoke:production
```

A production task is complete only when the public domain exposes the expected exact release, `/health.json` agrees with the HTML release marker, required UI markers exist, and forbidden loader markers are absent.

## Runtime incident loop

`fingerprint -> root cause -> causal fix -> regression guard -> verified release -> production deploy -> exact-release live smoke -> state registry update`

If visual Chromium QA is blocked by the execution environment itself, record that as a QA-environment gap. Do not reinterpret it as a product defect without browser evidence.
