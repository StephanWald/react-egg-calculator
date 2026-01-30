# Pitfalls Research

**Domain:** React refactoring + test infrastructure + mobile fixes
**Researched:** 2026-01-30
**Confidence:** HIGH (based on codebase analysis + React refactoring patterns)

## Critical Pitfalls

### Pitfall 1: Breaking useState Hook Dependency Chains

**What goes wrong:**
When extracting components from the monolithic structure, breaking the delicate useState dependency chain causes subtle calculation bugs. The app has 47+ useState hooks with complex interdependencies where changing one state triggers useEffect callbacks that update 5-10 other states. Example: changing `pressure` → triggers calculation → updates `boilingPoint`, `altitude`, `cookingTime`, `tempDrop`, `effectiveTemp`, `idealTime`, `totalEnergy`, `heatingTime`.

**Why it happens:**
Developers see 1,351 lines and extract components aggressively without mapping the complete state dependency graph first. They move state into child components, breaking the `useEffect` dependency arrays (lines 420-423) that trigger recalculations.

**How to avoid:**
1. **Map dependency graph FIRST**: Document which states trigger which useEffect hooks before ANY extraction
2. **Keep calculation logic together**: All thermodynamic calculations (lines 425-493) must remain in a single location with access to all dependent state
3. **Extract presentation, not logic**: Move rendering (JSX) into components, keep state and calculations in parent
4. **Test calculations**: Add unit tests for `calculateTime()`, `calculateBoilingPointFromPressure()`, etc. BEFORE refactoring

**Warning signs:**
- Cooking time calculations suddenly return `null` or incorrect values
- Changing altitude doesn't update boiling point
- Energy calculations missing intermediate temperature values
- Timer shows NaN or negative values

**Phase to address:**
**Phase 1: Analysis** - Map complete state dependency graph, identify calculation clusters
**Phase 2: Test Infrastructure** - Add calculation tests BEFORE refactoring (prevents regressions)

---

### Pitfall 2: Corrupting localStorage State Persistence

**What goes wrong:**
The app saves 20+ settings to localStorage (lines 104-128). Refactoring state structure changes the localStorage schema, causing app to load corrupted/partial state or crash on startup when users have old saved data.

**Why it happens:**
Developers rename state variables during refactoring without migration strategy. Example: renaming `stoveEfficiency` to `efficiency` breaks line 79 where localStorage tries to restore the old key.

**How to avoid:**
1. **Version the localStorage schema**: Add `{ version: 1, settings: {...} }` wrapper
2. **Write migration code FIRST**: Handle old format → new format before changing state structure
3. **Test with real localStorage**: Seed localStorage with old data format, verify migration works
4. **Never remove old keys immediately**: Deprecated fields should log warnings for 1-2 releases before removal

**Warning signs:**
- Settings reset to defaults on page load after deployment
- Console errors: `Cannot read property 'X' of undefined` from lines 70-96
- Notification permission resets unexpectedly
- GPS location name disappears

**Phase to address:**
**Phase 1: Analysis** - Document current localStorage schema completely
**Phase 2: Test Infrastructure** - Add tests for localStorage persistence/restoration
**Phase 3: Refactoring** - Implement versioned schema + migration before changing state structure

---

### Pitfall 3: Breaking Thermodynamic Calculation Correctness

**What goes wrong:**
Thermodynamic formulas (Williams formula line 462, temperature drop line 442, energy calculations lines 467-475) produce incorrect results after refactoring due to:
- Floating point precision loss when passing through multiple components
- Rounding at wrong stage (should round at display, not calculation)
- Unit conversion errors (6 languages with varying string lengths cause overflow)
- Missing intermediate values in extracted components

**Why it happens:**
Physics calculations require precise intermediate values. Extracting components introduces prop-passing that rounds/converts too early. Example: `tempDrop` (line 444) rounds to 1 decimal, but `effectiveTemp` calculation (line 456) needs full precision.

**How to avoid:**
1. **Never round in calculation functions**: Only round at display/formatting layer
2. **Test with known inputs**: Document expected outputs for standard cases (60g egg, 100°C boiling point, 4°C start = ~6.5 minutes)
3. **Keep physics together**: All thermodynamic calculations must stay in single module with full precision
4. **Validate against original**: After refactoring, verify outputs match original for 20+ test cases

**Warning signs:**
- Cooking time differs from original by more than 2 seconds
- Energy consumption shows unrealistic values (negative, > 10,000 kJ)
- Effective temperature > boiling point (violates physics)
- Temperature drop calculation produces NaN

**Phase to address:**
**Phase 2: Test Infrastructure** - Create comprehensive calculation test suite with known-good values
**Phase 3: Refactoring** - Extract calculations into tested module, keep intermediate precision

---

### Pitfall 4: Timer State Corruption During Refactoring

**What goes wrong:**
Timer state machine (lines 48-52, 497-547, 782-847) has 6 interrelated boolean states (`timerActive`, `timerPaused`, `timerComplete`, `timerRemaining`, etc.). Refactoring causes invalid state combinations like:
- `timerActive=false` but `timerRemaining` still counting down
- `timerComplete=true` but timer still visible
- Pause/resume buttons in wrong state
- Multiple timer intervals running simultaneously (memory leak)

**Why it happens:**
State machine logic scattered across 4 locations (state declarations, useEffect countdown, notification effect, UI rendering). Extracting timer into separate component without understanding state machine invariants breaks transitions.

**How to avoid:**
1. **Document state machine first**: Draw state transition diagram before refactoring
2. **Use reducer pattern**: Convert 6 boolean states into single `timerState: 'idle' | 'running' | 'paused' | 'complete'`
3. **Test state transitions**: Unit test every valid transition, verify invalid transitions rejected
4. **Keep timer logic atomic**: Don't split state machine across multiple components

**Warning signs:**
- Timer continues after clicking stop
- Multiple timer notifications fire
- Pause button doesn't resume
- Timer shows negative time
- `useEffect` cleanup doesn't fire (memory leak)

**Phase to address:**
**Phase 1: Analysis** - Document timer state machine completely
**Phase 2: Test Infrastructure** - Add timer state transition tests
**Phase 3: Refactoring** - Convert to reducer pattern before extraction

---

### Pitfall 5: i18n String Overflow on Mobile (Different Language Lengths)

**What goes wrong:**
App supports 6 languages (line 5, `useTranslation`). German/French strings are 40-60% longer than English, causing mobile layout overflow:
- Button labels wrap/truncate
- Formula subscripts break across lines
- Settings dialog overflows viewport
- Unit toggle buttons become unreadable

**Why it happens:**
Developers test refactoring only in English on desktop. Tailwind responsive classes assume English string lengths. Example: `"Stove Type"` (English) vs `"Herdplattentyp"` (German) - 60% longer.

**How to avoid:**
1. **Test in longest language**: Always test German/French on mobile (320px width)
2. **Use responsive text classes**: `text-sm md:text-base` for labels, `text-xs` for hints
3. **Implement truncation**: `truncate` for variable-length strings, not fixed UI elements
4. **Flexible layouts**: Use `flex-wrap` for button grids, `min-w-0` to allow shrinking
5. **Test all 6 languages**: Automated visual regression tests across language/viewport combinations

**Warning signs:**
- Buttons overlap on mobile
- Text extends beyond container borders
- Formula display shows horizontal scrollbar
- Settings dialog requires horizontal scroll

**Phase to address:**
**Phase 4: Mobile Fixes** - Test every screen in German at 320px width, fix overflow issues
**Phase 5: Visual Testing** - Add visual regression tests for all languages × viewports

---

## Moderate Pitfalls

### Pitfall 6: Test Infrastructure Coupling to Implementation Details

**What goes wrong:**
Adding tests to untested app, developers test internal state/implementation instead of behavior:
- Testing `useState` hook count (breaks when refactoring to useReducer)
- Testing component internal functions (breaks when extracting helpers)
- Mocking too much (tests pass but app broken)
- Snapshot tests that fail on every change

**Why it happens:**
No existing test patterns to follow. Developers new to testing default to testing "what I can access" not "what users experience."

**How to avoid:**
1. **Test user behavior**: "When I select 'soft' consistency and click timer, countdown starts at calculated time"
2. **Avoid testing internals**: Don't test state values, test rendered output and callbacks
3. **Integration over unit**: Test component + hooks together, not in isolation
4. **Mock only external APIs**: Mock `fetch` for weather API, not internal calculation functions

**Warning signs:**
- Tests break when refactoring without behavior changes
- 100% coverage but bugs in production
- Tests take > 5 seconds to run (too many mocks)
- Snapshot tests updated without reviewing changes

**Prevention:**
Use React Testing Library's guiding principle: "The more your tests resemble the way your software is used, the more confidence they can give you."

---

### Pitfall 7: Race Conditions in GPS/API Calls

**What goes wrong:**
GPS location fetching (lines 333-400) has multiple async operations with race conditions:
- User clicks GPS button twice → 2 concurrent API calls
- Slow network → user navigates away → component unmounted → setState on unmounted component
- API calls return out-of-order → old pressure overwrites new pressure

**Why it happens:**
Refactoring async logic without proper cancellation. Original code uses simple `setLocationLoading` flag but doesn't track/cancel in-flight requests.

**How to avoid:**
1. **Use AbortController**: Cancel in-flight requests in useEffect cleanup
2. **Debounce user actions**: Prevent double-clicks on GPS button
3. **Check mounted state**: Don't setState if component unmounted
4. **Test async edge cases**: Multiple rapid clicks, slow network, component unmount during fetch

**Warning signs:**
- Console warnings: "Can't perform a React state update on an unmounted component"
- Stale location data overwrites fresh data
- Multiple API calls visible in network tab for single button click

**Prevention:**
Add `useEffect(() => { return () => controller.abort(); }, [])` cleanup for all async operations.

---

### Pitfall 8: Breaking localStorage Quota with Test Data

**What goes wrong:**
During test infrastructure setup, seeding large amounts of test data (or localStorage mocks) exceed browser's 5-10MB quota, causing:
- `QuotaExceededError` in tests
- Settings fail to persist in production (silent failure)
- Test cleanup doesn't run → localStorage pollution between tests

**Why it happens:**
Developers mock localStorage without quota limits in tests, then real browser enforces quota.

**How to avoid:**
1. **Use real localStorage in tests**: jsdom provides it
2. **Clear between tests**: `beforeEach(() => localStorage.clear())`
3. **Test quota exceeded**: Verify app handles `QuotaExceededError` gracefully
4. **Measure actual size**: Current settings ~2KB, safe margin exists

**Warning signs:**
- Intermittent test failures with quota errors
- Settings don't persist in incognito mode
- Error: `QuotaExceededError` in browser console

**Prevention:**
Test localStorage error handling: `try { localStorage.setItem(...) } catch { /* fallback */ }`

---

### Pitfall 9: Timer Audio/Notification Permissions During Testing

**What goes wrong:**
Timer completion (lines 186-219) uses browser notifications, vibration API, audio playback. Tests fail or hang because:
- Tests request notification permission (blocks CI)
- Audio playback requires user interaction (fails in headless)
- Vibration API throws in Node.js environment

**Why it happens:**
Browser APIs unavailable in jsdom/test environment. Original code checks `'Notification' in window` but tests still call the API.

**How to avoid:**
1. **Mock browser APIs**: Mock Notification, Audio, navigator.vibrate in test setup
2. **Test permission states**: Verify UI handles 'granted', 'denied', 'default' correctly
3. **Separate playback from logic**: Extract `playTimerSound()` into mockable function
4. **Skip in CI**: `if (process.env.CI) return;` for browser-only features

**Warning signs:**
- Tests hang waiting for notification permission
- `ReferenceError: Audio is not defined`
- Timer tests fail in CI but pass locally

**Prevention:**
Create `__mocks__/browser-apis.js` with Notification, Audio, vibrate mocks for tests.

---

### Pitfall 10: Mobile Touch Event Handling (Timer Controls)

**What goes wrong:**
Timer overlay (lines 782-847) uses click handlers that work on desktop but fail on mobile:
- Double-tap zoom interferes with pause button
- Swipe gestures accidentally trigger stop
- Touch delay makes UI feel sluggish
- Backdrop click closes overlay accidentally (user holding phone)

**Why it happens:**
Original design used `onClick` without considering touch events. Refactoring doesn't add `onTouchStart` or prevent double-tap zoom.

**How to avoid:**
1. **Use touch-action CSS**: `touch-action: manipulation` on buttons (prevents zoom delay)
2. **Larger touch targets**: 44×44px minimum for mobile buttons (current: ~40px)
3. **Prevent accidental backdrop clicks**: Require deliberate close action, not backdrop click
4. **Test on real devices**: iOS/Android have different touch behaviors

**Warning signs:**
- Users report timer "doesn't respond" on mobile
- Accidental timer cancellations
- UI feels laggy/unresponsive on mobile

**Prevention:**
Add `className="touch-manipulation"` and increase button padding to 48px height.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip calculation tests, "it's just math" | Faster refactoring | Can't verify correctness after changes, regression bugs | Never - physics is critical |
| Extract components without state map | Cleaner file structure | Broken useEffect chains, subtle bugs | Never - map dependencies first |
| Only test in English at 1920px | Faster test runs | i18n overflow, mobile breaks | Never - mobile is primary use case |
| Mock entire calculation engine | Isolated component tests | Integration bugs, false confidence | Only for pure presentation components |
| localStorage v1 forever, no migration | No migration complexity | Can never change state structure | Never - plan for schema evolution |
| Copy-paste useEffect cleanup | Avoid abstracting cleanup logic | Memory leaks when pattern changes | Only if documented pattern shared |
| Inline temperature conversions | Simple, no helper functions | Inconsistent rounding, conversion bugs | Never - centralize in format functions |
| Test only happy path | Fast test development | Edge cases break in production | Only in MVP, never for calculations |
| Use snapshots for complex UI | Easy to write initial tests | Brittle, meaningless updates | Only for static content (footer) |
| Skip visual regression tests | No tooling setup required | i18n/responsive bugs slip through | Only if manual QA covers all cases |

---

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Open-Meteo weather API | No retry logic, assumes always available | Add retry with exponential backoff, graceful degradation to manual input |
| Nominatim geocoding | Assumes instant response, blocks on slow network | Set 5s timeout, make location name optional/non-blocking |
| Browser Geolocation API | No error handling for permission denied | Check permission state first, show helpful error messages |
| localStorage | Assume infinite storage, no quota handling | Try/catch `QuotaExceededError`, limit stored data size |
| Web Audio API | Assume available, crash in Safari private mode | Feature detection, silent fallback when unavailable |
| Notification API | Request permission eagerly (annoying) | Request only when user starts timer (context) |
| Browser vibration | Assume mobile, crash on desktop | Check `'vibrate' in navigator` before calling |

---

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Re-rendering entire 1,351-line component on every state change | Sluggish UI, input lag | Extract pure presentation components with React.memo | Already sluggish on low-end mobile |
| Running useEffect calculation on every render | Unnecessary recalculations | Proper dependency arrays, useMemo for expensive calculations | 8+ eggs with rapid slider changes |
| localStorage writes on every state change (line 104) | Blocking main thread | Debounce writes, batch updates | Rapid slider adjustments |
| Timer interval running at 1000ms without cleanup | Memory leak after multiple uses | Clear interval in useEffect cleanup | After 10+ timer sessions |
| Unoptimized SVG animation (line 654) | Choppy animation on low-end devices | Use CSS animations instead of SVG animate | Budget Android devices |
| No code splitting, entire app in one bundle | Long initial load time | Lazy load settings panel, advanced sections | Not yet critical (small app) |

---

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storing API keys in localStorage | Exposed in client code (not applicable here, using public APIs) | N/A - no API keys needed |
| XSS via unsanitized location name (line 380) | Malicious Nominatim response injects script | Sanitize/escape location name before rendering |
| GPS coordinates exposure | Privacy leak in localStorage backup/sharing | Don't persist GPS coords, only derived values (pressure, altitude) |
| Notification permission fingerprinting | Browser fingerprinting via permission state | Acceptable tradeoff for timer functionality |
| Unvalidated numeric inputs | NaN/Infinity in calculations crashes app | Add min/max validation, clamp ranges in input handlers |

---

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Asking for notification permission on page load | Annoying, high denial rate | Request when user starts timer (contextual) |
| No visual feedback during GPS loading | Users click repeatedly | Show spinner, disable button during fetch |
| Timer stops when switching browser tabs | Cooking ruined, app appears broken | Use Web Workers or background sync for timer |
| No "are you sure?" when stopping timer | Accidental stop ruins cooking | Require long-press or confirmation for stop button |
| Settings hidden in collapsed panel | Users don't discover customization | Show settings preview in collapsed state |
| Formula section overwhelming | Casual users intimidated | Keep collapsed by default, label "For nerds 🤓" |
| No offline support | App breaks in basement/poor signal | Add service worker, cache calculations |
| Language auto-detection wrong | German user sees English | Respect browser locale, prominent language switcher |
| Unit conversion not immediate | Changing °C to °F doesn't update display | Convert all displayed values immediately |
| Mobile landscape mode broken | Timer overlay off-screen | Test and optimize for landscape orientation |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Calculation tests:** Often missing edge cases (altitude < 0, boiling point < target temp) — verify physics constraints enforced
- [ ] **i18n testing:** Often missing German/French/Spanish on mobile — verify all 6 languages at 320px width
- [ ] **Timer cleanup:** Often missing interval cleanup — verify `clearInterval` in useEffect return
- [ ] **localStorage migration:** Often missing version handling — verify old format loads correctly
- [ ] **Error boundaries:** Often missing error recovery — verify app doesn't crash on calculation errors
- [ ] **Accessibility:** Often missing keyboard navigation — verify timer controllable without mouse
- [ ] **Responsive breakpoints:** Often missing tablet sizing — verify layout works at 768px, 1024px, 1440px
- [ ] **Audio fallback:** Often missing silent mode handling — verify timer alerts work when audio blocked
- [ ] **GPS permission denied:** Often missing helpful error — verify clear message + manual input option
- [ ] **API timeout handling:** Often missing slow network case — verify 10s timeout, retry logic
- [ ] **Mobile touch optimization:** Often missing touch-action CSS — verify no zoom delay on buttons
- [ ] **State serialization:** Often missing NaN/Infinity handling — verify invalid states don't persist to localStorage

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Broken useState dependencies | HIGH | 1. Revert refactoring 2. Map full dependency graph 3. Add calculation tests 4. Re-attempt extraction carefully |
| Corrupted localStorage | MEDIUM | 1. Detect schema mismatch 2. Clear localStorage 3. Log to Sentry 4. Deploy migration code 5. Add version field |
| Wrong calculation results | HIGH | 1. Revert to last known-good 2. Compare outputs side-by-side 3. Bisect changes to find regression 4. Add test for case |
| Timer state corruption | MEDIUM | 1. Add state machine diagram 2. Convert to useReducer 3. Add transition tests 4. Verify all paths |
| i18n mobile overflow | LOW | 1. Identify overflowing elements 2. Add responsive classes 3. Test in German/French 4. Add visual regression test |
| Lost calculation precision | HIGH | 1. Remove intermediate rounding 2. Add precision tests 3. Compare outputs to 4 decimal places 4. Keep physics together |
| Memory leak (timer intervals) | MEDIUM | 1. Find missing cleanup 2. Add useEffect return 3. Test component unmount 4. Verify with Chrome DevTools Performance |
| Race condition in API calls | LOW | 1. Add AbortController 2. Track in-flight requests 3. Test rapid clicks 4. Add loading state |
| Test suite too slow | LOW | 1. Remove unnecessary mocks 2. Parallelize tests 3. Use React Testing Library 4. Avoid snapshots |
| Mobile touch not working | LOW | 1. Add touch-action CSS 2. Increase button size 3. Test on real device 4. Remove click delay |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| useState dependency breaks | Phase 1: Analysis | Document complete dependency graph showing all useEffect triggers |
| localStorage corruption | Phase 1: Analysis, Phase 2: Tests | Schema documented, migration tests pass with old data |
| Calculation incorrectness | Phase 2: Test Infrastructure | 20+ calculation tests with known-good outputs |
| Timer state corruption | Phase 1: Analysis, Phase 2: Tests | State machine diagram, transition tests pass |
| i18n mobile overflow | Phase 4: Mobile Fixes | Visual regression tests pass in German at 320px |
| Test implementation coupling | Phase 2: Test Infrastructure | Tests use React Testing Library queries, no internal state access |
| GPS race conditions | Phase 2: Test Infrastructure | AbortController added, rapid click tests pass |
| localStorage quota exceeded | Phase 2: Test Infrastructure | Error handling tested, graceful degradation verified |
| Audio/notification in tests | Phase 2: Test Infrastructure | Browser API mocks working, tests pass in CI |
| Mobile touch events | Phase 4: Mobile Fixes | Real device testing completed, touch-action CSS added |
| Memory leaks | Phase 3: Refactoring | Chrome DevTools Performance profile shows no leaks after 20 timer cycles |
| Calculation precision loss | Phase 3: Refactoring | Output matches original to 4 decimal places for all test cases |

---

## Sources

**Codebase analysis:**
- `/Users/beff/_workspace/egg/egg-calculator.jsx` - Complete component analysis (1,351 lines)
- Lines 420-423: useEffect dependency array showing calculation coupling
- Lines 64-128: localStorage persistence implementation
- Lines 425-493: Thermodynamic calculation logic
- Lines 48-52, 497-547: Timer state machine
- Line 5: i18n integration via useTranslation hook

**React patterns (training data):**
- React hooks dependency management best practices
- Component extraction strategies for monolithic components
- useReducer vs useState for complex state machines
- Testing Library principles for behavior-driven testing

**Mobile/responsive patterns (training data):**
- Tailwind responsive design patterns
- Touch event handling for mobile web
- i18n text overflow prevention
- Mobile viewport optimization

**Confidence assessment:**
- HIGH confidence: Based on direct codebase analysis + established React patterns
- Specific to this project: 47 useState hooks, 6-language i18n, thermodynamic formulas, timer state machine
- Actionable: Each pitfall includes detection, prevention, and phase mapping

---
*Pitfalls research for: Egg Calculator React refactoring*
*Researched: 2026-01-30*
