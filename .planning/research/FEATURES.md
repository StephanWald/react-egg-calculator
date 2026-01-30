# Feature Research: React App Hardening

**Domain:** React Application Quality Assurance & Maintainability
**Researched:** 2026-01-30
**Confidence:** HIGH (based on established React ecosystem standards)

## Feature Landscape

### Table Stakes (Users Expect These)

Features that any production-ready React app should have. Missing these = app feels fragile/incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Unit tests for calculations** | Physics calculations are core value - must be correct | LOW | Williams formula, Clausius-Clapeyron, barometric formula can be pure functions |
| **Basic component rendering tests** | Ensures UI doesn't break on updates | LOW | React Testing Library smoke tests |
| **Mobile-responsive layout** | 60%+ mobile traffic on web apps | MEDIUM | Tailwind breakpoints, touch targets, horizontal scroll fixes |
| **Error boundaries** | Prevents white screen of death | LOW | Catch runtime errors gracefully |
| **Keyboard navigation** | Accessibility baseline (WCAG 2.1 AA) | LOW | Tab order, focus management |
| **Loading states** | GPS/API calls need feedback | LOW | Spinners, skeleton screens for async operations |
| **Input validation** | Prevents invalid physics calculations | LOW | Range checks, type validation |
| **localStorage error handling** | localStorage can fail/be disabled | LOW | Try-catch around all storage operations |

### Differentiators (Competitive Advantage)

Features that set well-engineered apps apart. Not required, but valuable for maintainability/UX.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **60-80% test coverage** | Industry standard for production apps | MEDIUM | Focus on critical paths: calculations, state updates, API calls |
| **Modular component architecture** | Easier to maintain, test, reuse | HIGH | Extract 1,351-line monolith into composable components |
| **Custom hooks for business logic** | Separates logic from UI, testable in isolation | MEDIUM | `usePhysicsCalculations`, `useLocationPressure`, `useSettings` |
| **Integration tests** | Validates end-to-end user flows | MEDIUM | Timer flow, unit conversion, GPS pressure fetch |
| **Responsive touch targets (44×44px min)** | Mobile UX best practice (Apple HIG, Material) | LOW | Button overflow fix for i18n strings |
| **Optimistic UI updates** | Perceived performance improvement | LOW | Update UI before localStorage saves |
| **Visual regression testing** | Catches unintended layout changes | HIGH | Playwright/Chromatic for screenshot comparison |
| **Performance budgets** | Prevents bundle bloat over time | LOW | Vite analyzer, <200KB initial bundle |
| **Accessibility audit** | WCAG 2.1 AA compliance | MEDIUM | Screen reader labels, ARIA attributes, color contrast |
| **E2E smoke tests** | Validates critical flows in real browser | MEDIUM | Playwright: calculate time, start timer, change units |
| **Internationalization edge cases** | German strings can be 30% longer than English | MEDIUM | Dynamic button sizing, text overflow handling |
| **Offline support** | App works without network (PWA) | HIGH | Service worker, cache API calls |

### Anti-Features (Commonly Requested, Often Problematic)

Features to explicitly NOT build during hardening. Scope creep disguised as "quality."

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **100% test coverage** | "More is better" mentality | Diminishing returns, maintenance burden | Focus on critical paths (60-80%), skip trivial UI |
| **Over-abstraction** | "Clean code" dogma | Premature optimization, harder to understand | Extract components when reused 3+ times |
| **Snapshot tests everywhere** | Easy to write | Brittle, fail on trivial changes, low value | Use for specific data structures, not full renders |
| **Complete rewrite** | "Start fresh" appeal | High risk, business continuity | Incremental refactoring with feature flags |
| **Micro-frontend architecture** | "Enterprise patterns" | Overkill for single-page app | Keep monorepo, extract components |
| **GraphQL/complex state mgmt** | "Modern stack" | No backend, localStorage is sufficient | Keep useState, add custom hooks |
| **Pixel-perfect responsive** | Designer perfectionism | Infinite device matrix | Mobile (< 640px), tablet (640-1024px), desktop (> 1024px) |
| **Comprehensive storybook** | "Component library" | Maintenance overhead for single app | Add stories for reusable components only |
| **Full TypeScript conversion** | "Type safety" | JSX → TSX is major refactor, marginal benefit here | Add JSDoc types, PropTypes for critical components |

## Feature Dependencies

```
[Error Boundaries]
    └──requires──> [Component Extraction] (need boundaries between components)

[Integration Tests]
    └──requires──> [Unit Tests] (test pyramid: units first)
    └──requires──> [Component Extraction] (test component interactions)

[Custom Hooks]
    └──requires──> [Component Extraction] (extract logic from monolith)

[Visual Regression Tests]
    └──requires──> [Responsive Layout Fixes] (baseline must be correct)

[Accessibility Audit]
    └──requires──> [Keyboard Navigation] (baseline before audit)

[E2E Tests]
    └──requires──> [Integration Tests] (test pyramid: e2e at top)

[Performance Budgets]
    └──enhances──> [Component Extraction] (code splitting opportunities)

[Offline Support]
    ~~conflicts with~~> [Hardening Scope] (PWA is feature work, not hardening)
```

### Dependency Notes

- **Error Boundaries require Component Extraction:** Can't wrap a monolith effectively, need discrete boundaries
- **Integration Tests require Unit Tests:** Test pyramid - solid foundation before integration layer
- **Custom Hooks require Component Extraction:** Business logic lives in monolith, must extract to reuse
- **Visual Regression requires Responsive Fixes:** Baseline screenshots must be intentional, not broken
- **E2E Tests require Integration Tests:** Top of pyramid - expensive, need lower layers solid first
- **Offline Support conflicts with Hardening:** This is new feature development, not quality improvement

## MVP Definition

### Launch With (Hardening v1)

Minimum viable hardening - what's needed to call the app "production-ready."

- [x] **Unit tests for physics calculations** — Core value must be proven correct (Williams, Clausius-Clapeyron)
- [x] **Mobile-responsive fixes** — 60%+ mobile traffic, horizontal scroll is broken UX
- [x] **Error boundaries** — Prevents complete app crash, graceful degradation
- [x] **Input validation** — Invalid inputs break physics calculations
- [x] **localStorage error handling** — Prevents silent failures in private browsing
- [x] **Basic component rendering tests** — Smoke tests ensure UI doesn't regress
- [x] **Keyboard navigation** — WCAG baseline, form inputs must be accessible

### Add After Validation (Hardening v1.1)

Features to add once core hardening is stable.

- [ ] **Component extraction (phase 1)** — Extract 3-5 largest sections (Settings, Timer, Results)
- [ ] **Custom hooks** — `usePhysicsCalculations`, `useLocationPressure` for testability
- [ ] **Integration tests** — Timer flow, unit conversion, GPS pressure
- [ ] **60% test coverage** — Cover critical state transitions
- [ ] **Responsive touch targets** — Fix i18n button overflow, 44×44px minimum
- [ ] **Accessibility audit** — WCAG 2.1 AA scan + fixes

### Future Consideration (Post-Hardening)

Features to defer until hardening is complete and app is stable.

- [ ] **Complete component extraction** — Full modular architecture (20+ components)
- [ ] **Visual regression testing** — Chromatic/Playwright screenshots
- [ ] **E2E smoke tests** — Playwright critical flows
- [ ] **Performance budgets** — Bundle size monitoring
- [ ] **Storybook for reusable components** — If component library emerges
- [ ] **TypeScript/JSDoc migration** — Type safety layer

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Unit tests (calculations) | HIGH | LOW | P1 |
| Mobile-responsive fixes | HIGH | MEDIUM | P1 |
| Error boundaries | HIGH | LOW | P1 |
| Input validation | HIGH | LOW | P1 |
| localStorage error handling | HIGH | LOW | P1 |
| Basic rendering tests | MEDIUM | LOW | P1 |
| Keyboard navigation | MEDIUM | LOW | P1 |
| Component extraction (phase 1) | MEDIUM | MEDIUM | P2 |
| Custom hooks | MEDIUM | MEDIUM | P2 |
| Integration tests | MEDIUM | MEDIUM | P2 |
| 60% test coverage | MEDIUM | MEDIUM | P2 |
| Responsive touch targets | MEDIUM | LOW | P2 |
| Accessibility audit | MEDIUM | MEDIUM | P2 |
| Complete component extraction | LOW | HIGH | P3 |
| Visual regression tests | LOW | HIGH | P3 |
| E2E smoke tests | LOW | MEDIUM | P3 |
| Performance budgets | LOW | LOW | P3 |

**Priority key:**
- **P1: Must have for "production-ready"** — Baseline quality gate
- **P2: Should have, improves maintainability** — Professional standard
- **P3: Nice to have, future consideration** — Advanced maturity

## Testing Standards (Industry Benchmarks)

### Coverage Expectations

| App Type | Unit | Integration | E2E | Total |
|----------|------|-------------|-----|-------|
| **Utility app (this project)** | 60-70% | 40-50% | 10-20% | 60-80% |
| **SaaS dashboard** | 70-80% | 50-60% | 20-30% | 70-85% |
| **E-commerce** | 80-90% | 60-70% | 30-40% | 80-90% |
| **Banking/finance** | 90%+ | 70%+ | 40%+ | 90%+ |

**Recommendation for this project:** 60-70% total coverage
- Unit tests: Physics calculations (100%), utility functions (80%), hooks (60%)
- Integration tests: Settings persistence, timer flow, unit conversions
- E2E: Critical path smoke test (calculate time → start timer → notification)

### Test Pyramid (Industry Standard)

```
        /\
       /E2E\        10% - Critical flows only (slow, brittle, expensive)
      /------\
     /  Intg  \     30% - Component interactions, API mocking
    /----------\
   /    Unit    \   60% - Pure functions, hooks, calculations
  /--------------\
```

**For monolithic component:** Start with unit tests for extracted logic, then add integration tests post-refactoring.

## Refactoring Standards

### Component Size Guidelines

| Lines | Status | Action |
|-------|--------|--------|
| < 200 | Good | Maintain |
| 200-400 | Warning | Monitor complexity |
| 400-800 | Poor | Plan extraction |
| 800+ | **Critical** | **Refactor required** |

**Current status:** 1,351 lines = Critical, 3× over threshold

### Extraction Strategy (Recommended)

**Phase 1: Settings Panel (300 lines)**
- `<SettingsPanel />` - Household settings UI
- `<LocationSettings />` - GPS, altitude, pressure
- `<UnitPreferences />` - Temperature, volume, weight, pressure units

**Phase 2: Results Display (200 lines)**
- `<ResultsPanel />` - Cooking time, temp drop, energy
- `<TimerDisplay />` - Active timer with controls
- `<NotificationPrompt />` - Notification permission

**Phase 3: Main Calculator (400 lines)**
- `<EggInputs />` - Weight, temp, consistency, count
- `<WaterSettings />` - Volume, start temp
- `<ConsistencyPicker />` - Soft/medium/hard preset buttons

**Phase 4: Custom Hooks (200 lines)**
- `usePhysicsCalculations(inputs)` - Williams formula, temp drop
- `useLocationPressure(coords)` - GPS → pressure API
- `useSettings(storageKey)` - localStorage persistence
- `useTimer(duration)` - Timer state machine

**Phase 5: Utilities (150 lines)**
- `physics.js` - Pure calculation functions
- `conversions.js` - Unit conversion utilities
- `constants.js` - Material properties, consistency presets

**Result:** 1 monolith → 15+ focused components, 3+ custom hooks, 3+ utility modules

### Hook Complexity Limits

| Hooks in Component | Status | Action |
|--------------------|--------|--------|
| 0-5 | Good | Standard component |
| 6-10 | Warning | Consider extraction |
| 11-20 | Poor | Extract to custom hooks |
| 20+ | **Critical** | **Major refactor needed** |

**Current status:** 47+ useState hooks = Critical, 4× over threshold

## Mobile Responsiveness Standards

### Breakpoint Strategy (Tailwind)

```css
/* Mobile-first approach */
.container {
  @apply p-4;           /* Base (< 640px mobile) */
  @apply sm:p-6;        /* 640px+ (tablet portrait) */
  @apply md:p-8;        /* 768px+ (tablet landscape) */
  @apply lg:p-10;       /* 1024px+ (desktop) */
  @apply xl:p-12;       /* 1280px+ (large desktop) */
}
```

**Recommendation:** Focus on 3 tiers
- Mobile: < 640px (vertical layout, full-width inputs)
- Tablet: 640-1024px (2-column grid, larger touch targets)
- Desktop: > 1024px (3-column grid, compact controls)

### Touch Target Minimums

| Platform | Minimum | Recommended | Current Issues |
|----------|---------|-------------|----------------|
| **Apple HIG** | 44×44 px | 48×48 px | i18n button overflow |
| **Material Design** | 48×48 px | 48×48 px | Tile groups wrap poorly |
| **WCAG 2.1 AA** | 24×24 px | 44×44 px | Language buttons too small |

**Fixes needed:**
- Language switcher: 6 buttons × 60px = 360px overflows on 320px screens
- Consistency tiles: German "Weichgekocht" wraps, breaks grid
- Settings panel: Checkbox labels wrap, misalign with inputs

### Overflow Strategies

```jsx
// Anti-pattern (current)
<div className="flex gap-2">
  {languages.map(lang => <Button>{lang.label}</Button>)}
</div>
// Result: Horizontal scroll on mobile

// Pattern: Wrap + responsive sizing
<div className="flex flex-wrap gap-2">
  {languages.map(lang => (
    <Button className="min-w-[60px] flex-1 sm:flex-none">
      {lang.label}
    </Button>
  ))}
</div>
// Result: Buttons wrap gracefully, share space on mobile
```

### i18n Responsive Patterns

| Language | "Soft Boiled" Length | Impact |
|----------|----------------------|--------|
| English | 11 chars | Baseline |
| German | 13 chars | +18% width |
| French | 10 chars | -9% width |
| Italian | 15 chars | +36% width |
| Spanish | 14 chars | +27% width |
| Portuguese | 16 chars | +45% width |

**Strategy:** Dynamic button sizing with `min-w-*` and `flex-1` for space sharing

## Implementation Phases (Recommended Order)

### Phase 1: Testing Foundation (1 week)
1. Extract physics calculations to pure functions
2. Write unit tests for all calculations (100% coverage)
3. Add basic component rendering tests (smoke tests)
4. Set up error boundaries

**Deliverable:** Test suite runs, calculations proven correct

### Phase 2: Critical Fixes (1 week)
1. Fix mobile horizontal scroll (button overflow)
2. Add input validation with error messages
3. Wrap localStorage in try-catch
4. Fix keyboard navigation (tab order)

**Deliverable:** App works on mobile, no crashes, accessible

### Phase 3: Component Extraction (2 weeks)
1. Extract Settings Panel + Location Settings
2. Extract Results Panel + Timer Display
3. Create custom hooks (physics, location, settings)
4. Move calculations to utility modules

**Deliverable:** Modular architecture, 15+ components

### Phase 4: Test Coverage (1 week)
1. Add integration tests (timer flow, conversions)
2. Test custom hooks in isolation
3. Mock API calls (GPS, pressure)
4. Reach 60% overall coverage

**Deliverable:** 60% coverage, critical paths tested

### Phase 5: Polish (1 week)
1. Accessibility audit (WCAG 2.1 AA)
2. Responsive touch targets (44×44px)
3. i18n overflow fixes (wrap, dynamic sizing)
4. Performance audit (bundle size)

**Deliverable:** Production-ready app

## Quality Gates (Definition of Done)

### Testing
- [ ] 100% coverage for physics calculations
- [ ] 60%+ overall test coverage
- [ ] Integration tests for timer, settings, conversions
- [ ] Error boundaries prevent white screen of death
- [ ] localStorage failures handled gracefully

### Refactoring
- [ ] No component > 400 lines
- [ ] No component > 10 useState hooks
- [ ] Business logic in custom hooks
- [ ] Physics calculations in pure utility functions
- [ ] Settings, Timer, Results extracted to components

### Mobile Responsiveness
- [ ] No horizontal scroll on 320px width
- [ ] All touch targets ≥ 44×44px
- [ ] i18n strings don't break layout
- [ ] Works on Chrome Android, Safari iOS
- [ ] Keyboard navigation functional

### Accessibility
- [ ] WCAG 2.1 AA compliance (axe-core scan)
- [ ] Screen reader labels on inputs
- [ ] Focus visible on all interactive elements
- [ ] Color contrast ≥ 4.5:1

### Performance
- [ ] Initial bundle < 200KB gzipped
- [ ] Time to Interactive < 3s on 3G
- [ ] No layout shift on load
- [ ] Lighthouse score ≥ 90

## Sources

**React Testing Best Practices:**
- React Testing Library documentation (testing-library.com/react)
- Kent C. Dodds: "Testing Trophy" model vs test pyramid
- Martin Fowler: "Test Pyramid" (martinfowler.com/testing)

**Component Architecture:**
- React docs: "Thinking in React" (react.dev/learn/thinking-in-react)
- Dan Abramov: "Presentational vs Container Components"
- Compound Components pattern for complex UIs

**Mobile Responsiveness:**
- Apple Human Interface Guidelines (developer.apple.com/design/hig)
- Material Design: Touch targets (material.io/design)
- WCAG 2.1 AA: Target Size (w3.org/WAI/WCAG21)

**Coverage Standards:**
- Google Testing Blog: Coverage thresholds by project type
- ThoughtWorks Technology Radar: Testing strategies
- State of JS 2025: React ecosystem testing tools

---
*Feature research for: React App Hardening (Egg Calculator)*
*Researched: 2026-01-30*
*Confidence: HIGH (established ecosystem standards)*
