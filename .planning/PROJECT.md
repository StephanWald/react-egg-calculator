# Egg Calculator

## What This Is

A React-based egg cooking calculator that uses thermodynamic physics and atmospheric pressure to determine precise cooking times. It's a single-page PWA with GPS-based pressure detection, a cooking timer, energy consumption estimates, and multi-language support (6 languages). The app is fully client-side with localStorage persistence. The codebase is modular with 17 focused modules, 218 tests, and mobile-responsive UI.

## Core Value

Accurate egg cooking times based on real physics — the thermodynamic calculations must remain correct through all development.

## Requirements

### Validated

- ✓ Thermodynamic cooking time calculation (Williams formula with pressure/altitude compensation) — existing
- ✓ GPS-based atmospheric pressure detection via Open-Meteo API — existing
- ✓ Reverse geocoding via Nominatim for location display — existing
- ✓ Cooking timer with audio alerts, browser notifications, and vibration — existing
- ✓ Energy consumption estimates (water heating, pot heating, egg heating, ambient losses) — existing
- ✓ Multi-language support (EN, DE, FR, ES, IT, PT) with browser detection — existing
- ✓ Persistent household settings via localStorage — existing
- ✓ PWA with service worker and offline capability — existing
- ✓ Unit preferences (C/F, L/oz, g/oz, hPa/inHg) — existing
- ✓ Configurable stove type, pot material, egg size presets — existing
- ✓ Modular architecture with physics, hooks, services, and UI components — v1
- ✓ Test coverage for physics (100%), formatters (100%), constants (100%), converters (100%), hooks (95-100%) — v1
- ✓ Mobile responsive UI without overflow at 320px across all 6 languages — v1
- ✓ Error boundaries and input validation for production resilience — v1
- ✓ Keyboard navigation with focus indicators and no keyboard traps — v1

### Active

(No active requirements — next milestone not yet planned)

### Out of Scope

- Backend or server-side changes — app remains fully static/client-side
- Migration to TypeScript — keep JavaScript, focus on structure
- New language additions — existing 6 languages are sufficient

## Context

Shipped v1 Hardening milestone with 7,271 LOC JavaScript across 17 modules.

**Architecture:**
- Main orchestrator: egg-calculator.jsx (372 lines)
- 7 UI components in components/ (42-201 lines each)
- 4 custom hooks in hooks/ (23-194 lines each)
- 2 API services in services/ (22-23 lines each)
- 4 utility modules: physics.js, constants.js, formatters.js, converters.js
- Translation system: useTranslation.js + translations.js

**Test coverage:** 218 tests across 11 test files. Core logic at 100% coverage.

**Tech stack:** React 18 + Vite + Tailwind CSS + Vitest + React Testing Library

**Key pain points resolved in v1:**
- Monolithic 1,351-line component decomposed into 17 focused modules
- Zero tests expanded to 218 tests
- Mobile overflow fixed with responsive grids and shortened translations
- Error boundaries prevent white-screen crashes

## Constraints

- **Tech stack**: React 18 + Vite + Tailwind CSS — no framework changes
- **Behavior preservation**: App must work identically through all changes (same physics, same UX)
- **Build must pass**: `npm run build` must succeed at every commit

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Refactor before tests | Tests on monolithic code would need rewriting after refactoring | ✓ Good — clean extraction path |
| Vitest over Jest | Native ES modules, Vite integration, minimal config | ✓ Good — zero config issues |
| Extract physics first | Pure functions easiest to test and most critical to verify | ✓ Good — 100% coverage immediately |
| Fix mobile via responsive Tailwind | Already using Tailwind, leverage responsive utilities | ✓ Good — consistent patterns |
| Object.freeze at two levels for constants | Complete immutability for constant arrays | ✓ Good — prevents mutation bugs |
| Thin API wrappers (no retries/caching) | Always fetch fresh data, keep services simple | ✓ Good — simple and correct |
| Presentational component pattern | All state via props, no internal state in UI components | ✓ Good — easy testing |
| Bottom drawer for mobile ConfigDialog | Native mobile UX pattern with swipe-to-dismiss | ✓ Good — natural mobile feel |
| Strategic error boundaries (3 only) | App root + ConfigDialog + TimerOverlay, not every component | ✓ Good — appropriate granularity |
| Silent input clamping | Pressure clamped without error messages | ✓ Good — smooth UX |

---
*Last updated: 2026-01-31 after v1 milestone*
