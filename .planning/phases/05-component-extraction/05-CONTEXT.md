# Phase 5: Component Extraction - Context

**Gathered:** 2026-01-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Extract UI sections from the 939-line egg-calculator.jsx into focused child components (target ~7 components), each under 400 lines. The main EggCalculator component must also be under 400 lines. This is a structural refactoring — the application must render and behave identically after extraction. Additionally, fill any gaps in formatter unit test coverage.

</domain>

<decisions>
## Implementation Decisions

### Component boundaries
- Claude's Discretion: Whether components are presentational (props only) or smart (call hooks directly) — pick the right pattern per component
- Claude's Discretion: The 7 components listed in the roadmap (SettingsPanel, TimerOverlay, ConsistencyPicker, ResultDisplay, EggInputs, LocationPressure, ConfigDialog) are a target, not a hard constraint — merge or split if the code structure suggests different boundaries
- Claude's Discretion: Whether ConfigDialog and SettingsPanel remain separate or unify — decide based on shared JSX
- Claude's Discretion: Whether the main EggCalculator keeps the calculation useEffect or becomes a pure layout shell — pick what keeps it clean and under 400 lines

### Data flow pattern
- Claude's Discretion: Props drilling vs React Context — decide based on actual prop depth after analyzing the component tree
- Claude's Discretion: How useTranslation reaches children (pass t as prop vs each child calls useTranslation) — pick based on existing hook design
- Claude's Discretion: Granular callbacks vs single update function — decide per component based on callback count
- Claude's Discretion: Whether formatters are imported directly by children or passed as props — decide based on formatter module design

### File organization
- Claude's Discretion: Flat components/ vs feature-grouped directories — decide based on component count
- Claude's Discretion: Test file structure (mirror component structure vs flat) — stay consistent with existing test organization
- Claude's Discretion: Naming convention (PascalCase vs kebab-case) — follow existing project conventions
- Claude's Discretion: Direct imports vs barrel exports — decide based on import complexity

### Extraction strategy
- Claude's Discretion: Extraction order and batching (one at a time vs batch) — pick what balances safety and efficiency
- Claude's Discretion: Component testing depth (render + interaction vs smoke tests) — pick based on component complexity
- Visual parity verification required: Run dev server and build after extraction to confirm UI unchanged
- Formatter test gaps: Review existing formatter tests from Phase 3 and fill any missing coverage for all format types (temp, volume, weight, pressure, time)

### Claude's Discretion
All component boundaries, data flow patterns, file organization, and extraction ordering are at Claude's discretion. The user trusts Claude to make implementation decisions based on the actual code structure. The two firm requirements are:
1. Visual parity must be verified (dev server + build)
2. Formatter tests must cover all format types (fill gaps from Phase 3)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. The user defers all implementation choices to Claude based on codebase analysis.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 05-component-extraction*
*Context gathered: 2026-01-31*
