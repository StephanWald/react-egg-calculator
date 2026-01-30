# Egg Calculator — Hardening Milestone

## What This Is

A React-based egg cooking calculator that uses thermodynamic physics and atmospheric pressure to determine precise cooking times. It's a single-page PWA with GPS-based pressure detection, a cooking timer, energy consumption estimates, and multi-language support (6 languages). The app is fully client-side with localStorage persistence.

## Core Value

Accurate egg cooking times based on real physics — the thermodynamic calculations must remain correct through all refactoring.

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
- ✓ Unit preferences (°C/°F, L/oz, g/oz, hPa/inHg) — existing
- ✓ Configurable stove type, pot material, egg size presets — existing

### Active

- [ ] Refactor monolithic component into modular architecture (separate physics, hooks, UI)
- [ ] Add test coverage for physics calculations, custom hooks, and formatters
- [ ] Fix mobile overflow issues on tile/button groups and other UI elements
- [ ] Improve mobile responsiveness across all screen sizes

### Out of Scope

- New features or capabilities — this milestone is hardening only
- Backend or server-side changes — app remains fully static/client-side
- Migration to TypeScript — keep JavaScript, focus on structure
- New language additions — existing 6 languages are sufficient
- Performance optimization beyond what refactoring naturally improves

## Context

The entire application lives in a single 1,351-line React component (`egg-calculator.jsx`) with 47+ useState hooks, physics calculations, API integrations, timer logic, and all UI rendering co-located. There are zero tests. The translation system (`useTranslation.js` + `translations.js`) is the only code that's been extracted.

Key pain points from codebase analysis:
- Monolithic architecture makes isolated testing impossible
- Physics calculations are buried in component closures, not independently testable
- Mobile UI overflows especially on tile/button groups (stove type, consistency, temperature selectors) where translated text exceeds fixed button widths
- State management sprawl: 47+ useState hooks with large dependency arrays in useEffects
- Hardcoded physics constants scattered without documentation

## Constraints

- **Tech stack**: React 18 + Vite + Tailwind CSS — no framework changes
- **Behavior preservation**: App must work identically after refactoring (same physics, same UX flow)
- **No new dependencies**: Except for testing framework (Vitest recommended per codebase analysis)
- **Build must pass**: `npm run build` must succeed at every commit

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Refactor before tests | Tests on monolithic code would need rewriting after refactoring | — Pending |
| Vitest over Jest | Native ES modules, Vite integration, minimal config | — Pending |
| Extract physics first | Pure functions are easiest to test and most critical to verify | — Pending |
| Fix mobile via responsive Tailwind | Already using Tailwind, leverage responsive utilities | — Pending |

---
*Last updated: 2026-01-30 after initialization*
