# Forge Mobile App Plan (Codex-Executable)

This plan is written so a Codex-5.3 agent can implement the mobile app in small, verifiable steps.

## 1. Goal

Build a production-ready mobile app for Forge that supports the full generation workflow (`txt2img`, `img2img`, `inpaint`, queue/progress, history, presets, model/LoRA selection), with strong UX quality and maintainable architecture.

## 2. Current Baseline

- Existing frontend: React + TypeScript + Vite (`webui/forge-ui-redesign`).
- Existing API surface: Forge endpoints already wrapped in `webui/forge-ui-redesign/src/services/api.ts`.
- Existing domain types: generation/workflow types in `webui/forge-ui-redesign/src/types.ts`.

## 3. Target Mobile Architecture

- Framework: Expo + React Native + TypeScript.
- App location: `mobile/forge-mobile/`.
- State: Zustand (preferred) or Redux Toolkit.
- API client: dedicated mobile client mirroring Forge API contracts.
- Navigation: React Navigation (bottom tabs + stacked detail screens).
- Storage: AsyncStorage for settings/presets, secure storage for tokens.
- Image handling: cached image component + local export/share support.

## 4. Quality Bar

- Touch-first UX, not desktop UI squeezed into a phone.
- Consistent design tokens (color/spacing/type/radius/shadow/motion).
- Accessibility baseline: dynamic text support, proper hit targets, semantic labels.
- Performance baseline: no dropped frames on basic navigation, bounded memory for galleries.

## 5. Phases and Tasks

Use checkboxes as source of truth for progress.

## Phase 0 - Foundation and Repo Setup

- [ ] Create `mobile/forge-mobile` Expo app with TypeScript template.
- [ ] Add root-level docs pointer in `webui/forge-ui-redesign/README.md` to this plan.
- [ ] Configure lint, formatter, and TypeScript strict mode for mobile app.
- [ ] Add `.env.example` for mobile API URL and auth token variables.
- [ ] Add baseline CI command script for mobile lint + typecheck.

Acceptance criteria:

- `npm run lint` and `npm run typecheck` run successfully in `mobile/forge-mobile`.
- App boots with `npx expo start`.

## Phase 1 - Shared Contracts and API Layer

- [ ] Mirror key types from web UI into `mobile/forge-mobile/src/types/forge.ts`.
- [ ] Implement `src/services/forgeApi.ts` for `txt2img`, `img2img`, `progress`, `interrupt`, `skip`.
- [ ] Implement metadata endpoints: samplers/schedulers/models/loras/options/upscalers.
- [ ] Add connectivity probe and normalized error mapping.
- [ ] Add unit tests for API client serialization and error handling.

Acceptance criteria:

- API client compiles and tests pass.
- Connectivity check clearly distinguishes offline, no API, and auth/config errors.

## Phase 2 - App Shell and Design System

- [ ] Build token system in `src/theme/tokens.ts` (colors, spacing, type scale, radii, shadows).
- [ ] Build reusable primitives in `src/components/ui/` (Button, Input, Card, Toggle, Modal, Badge).
- [ ] Set up navigation structure: Generate, Queue, History, Settings tabs.
- [ ] Add global toasts/alerts and loading skeleton patterns.
- [ ] Add dark/light or single strong visual theme (consistent, intentional).

Acceptance criteria:

- All major screens use shared tokens/primitives.
- App has consistent visual style with no raw default controls on core screens.

## Phase 3 - Core Generation Workflows

- [ ] Generate screen: prompt, negative prompt, steps, CFG, seed, sampler, scheduler, resolution.
- [ ] Implement `txt2img` run flow with progress polling and cancel/skip controls.
- [ ] Add mode switch for `img2img` and `inpaint`.
- [ ] Add image input pipeline (camera roll/file picker + preprocessing to base64).
- [ ] Add inpaint mask editor or scoped v1 mask alternative with explicit limitations.

Acceptance criteria:

- User can complete `txt2img` and `img2img` generation from mobile.
- Progress and interruptions are reflected in UI without stale state.

## Phase 4 - Queue, History, and Media Handling

- [ ] Queue screen with pending/running/completed statuses and retry support.
- [ ] History screen with lazy loading, search/filter, and metadata drilldown.
- [ ] Fullscreen viewer with swipe navigation and pinch zoom.
- [ ] Save/share/export actions for generated images.
- [ ] Local cache strategy and configurable history retention limits.

Acceptance criteria:

- History remains responsive with large item counts.
- Images can be viewed, shared, and saved without crashes.

## Phase 5 - Model, LoRA, Presets, and Advanced Controls

- [ ] Model selector with search and refresh.
- [ ] LoRA browser/selector with weight controls.
- [ ] Preset manager (save/load/edit/delete/import/export JSON).
- [ ] Advanced options drawer (VAE, upscaler, denoise, hires-fix-related options if supported).
- [ ] Parameter diff view when loading a preset.

Acceptance criteria:

- User can switch model/LoRA and generate without app restart.
- Preset flows are round-trip reliable.

## Phase 6 - Polish, Reliability, and Security

- [ ] Offline/reconnect handling and request retry strategy.
- [ ] Add telemetry hooks for error logging and performance timings.
- [ ] Harden API configuration guidance (HTTPS proxy, token handling).
- [ ] Accessibility and ergonomics pass (labels, focus order, touch target sizes).
- [ ] Performance pass (list virtualization, image decode sizing, memoization hot paths).

Acceptance criteria:

- No P0/P1 crashers in smoke tests.
- Clear user-facing error states for network/API failures.

## Phase 7 - Release Readiness

- [ ] Create `docs/mobile-setup.md` for dev setup and API requirements.
- [ ] Create `docs/mobile-testing.md` with test matrix and smoke checklist.
- [ ] Configure beta distribution profile (internal Android + TestFlight path if iOS used).
- [ ] Add app icon/splash/store metadata placeholders.
- [ ] Final stabilization pass and known-issues list.

Acceptance criteria:

- Team member can set up and run app from docs alone.
- Beta build artifacts are reproducible.

## 6. Suggested Task Granularity for Codex

- Keep each delivery to 1-3 related tasks max.
- Include tests for any new service/state logic.
- Avoid broad refactors unless required by the current phase.
- Update this file checkboxes each turn when work is completed.

## 7. Risks and Mitigations

- API exposed outside localhost.
  - Mitigation: default to proxy/token flow and document secure network topology.
- Large image payloads cause memory pressure.
  - Mitigation: aggressive thumbnailing, virtualization, and cache limits.
- Inpaint UX complexity on small screens.
  - Mitigation: ship scoped v1 editor, then iterate with gesture optimization.

## 8. Out of Scope (Initial Release)

- On-device model inference.
- Cross-device account sync backend.
- Plugin ecosystem parity with full desktop Forge extensions.
