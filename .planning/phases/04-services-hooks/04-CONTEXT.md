# Phase 4: Services & Hooks - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Extract API services (Open-Meteo, Nominatim) and custom React hooks (timer, location/pressure, settings, unit conversion) from the monolithic EggCalculator component into independently testable modules. The component must behave identically after extraction. No new features — pure structural refactoring.

</domain>

<decisions>
## Implementation Decisions

### API Service Boundaries
- No caching — always fetch fresh data from APIs
- Return last-known values when offline instead of failing (store last successful response)
- Claude's Discretion: whether to use smart services (retries, error normalization) or thin wrappers
- Claude's Discretion: whether to split into two services (meteoApi.js, geocodingApi.js) or combine into one location service, based on actual usage patterns

### Hook Granularity
- Claude's Discretion: stick to the 4 ROADMAP hooks or extract additional hooks if state groups naturally together
- Claude's Discretion: whether useTimerLogic owns browser side effects (notifications, vibration, audio) or just manages state
- Claude's Discretion: whether useUnitConversion takes unit preference as parameter or reads from useSettings internally — follow the pattern established with formatters in Phase 3
- Claude's Discretion: whether useLocationPressure handles GPS permission flow or just receives coordinates

### Settings Persistence
- Auto-persist on every state change — no explicit save function needed
- Merge with defaults on load: missing keys get defaults, extra keys ignored (no version-based migration)
- Persist all household settings (stove, pot, temperatures, units, efficiency). Per-session inputs (egg weight, count) are not persisted
- Include a resetSettings() function that clears localStorage and returns to defaults

### Claude's Discretion
- Service architecture (smart vs thin, split vs combined)
- Hook boundary decisions (what state lives where)
- Timer side effect ownership
- Hook coupling strategy (parameter-based vs internal reads)
- GPS permission flow ownership
- Testing approach (mock strategy, renderHook vs component tests)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. Follow patterns established in Phase 3 (parameter-based pure functions, zero-dependency leaf modules where possible).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-services-hooks*
*Context gathered: 2026-01-30*
