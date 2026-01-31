# Phase 7: Quality & Polish - Research

**Researched:** 2026-01-31
**Domain:** React error handling, input validation, keyboard accessibility
**Confidence:** HIGH

## Summary

This phase focuses on three production-quality enhancements: error boundaries to prevent white-screen crashes, input validation to prevent invalid physics calculations, and keyboard accessibility for focus management and navigation.

**Key findings:**
- Error boundaries are class-only React components using `getDerivedStateFromError` and `componentDidCatch`
- Strategic placement at component/route/widget level prevents cascading failures while maintaining interactivity
- HTML5 min/max attributes provide form-submit validation but don't prevent users from typing invalid values
- Silent clamping requires JavaScript event handlers (onChange/onInput) to enforce bounds in real-time
- Keyboard accessibility focuses on focus indicators (focus-visible), escape handlers, and preventing focus traps
- Native `<dialog>` element handles focus trapping automatically; manual implementations need focus-trap-react or custom logic

**Primary recommendation:** Use strategic error boundaries at major section boundaries (app root, settings dialog, timer overlay), implement silent clamping via onChange handlers with Math.min/max, and add Escape key handlers to dialogs plus focus-visible indicators to interactive elements.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React Class Components | 18+ | Error boundaries | Only way to catch rendering errors in React |
| HTML5 Validation Attributes | Native | Basic input constraints | Built into browsers, no dependencies |
| CSS :focus-visible | Native | Keyboard-only focus indicators | Standard pseudo-class, supported in all modern browsers |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| focus-trap-react | Latest | Focus trapping in modals | When NOT using native `<dialog>` element |
| react-error-boundary | Latest | Reusable error boundary wrapper | To avoid writing multiple class components |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Class-based error boundary | react-error-boundary npm package | Package adds reusable wrapper but introduces dependency (user decided: no new dependencies except Vitest) |
| Custom focus trap | focus-trap-react | Package simplifies implementation but adds dependency (not needed for this codebase - ConfigDialog and TimerOverlay don't require focus trapping per user decisions) |
| Native `<dialog>` | div + manual focus management | `<dialog>` provides free focus trapping but requires showModal() API and may need refactoring existing components |

**Installation:**
No new dependencies needed. All features use React 18 built-ins and native browser APIs.

## Architecture Patterns

### Error Boundary Placement Strategy

**Recommended Granularity:**
```
<App>                                    ← Root boundary (catches app-level crashes)
  <ErrorBoundary fallback={<AppError />}>
    <MainContent />

    <ErrorBoundary fallback={<SettingsError />}>
      <ConfigDialog />                    ← Dialog boundary (isolates settings errors)
    </ErrorBoundary>

    <ErrorBoundary fallback={<TimerError />}>
      <TimerOverlay />                    ← Timer boundary (isolates timer errors)
    </ErrorBoundary>
  </ErrorBoundary>
</App>
```

**Key principle:** Match error boundaries to "major sections" as defined in requirements. Don't wrap every component - focus on logical units where failure should be isolated.

### Pattern 1: Class-Based Error Boundary

**What:** React class component implementing `getDerivedStateFromError` and `componentDidCatch`

**When to use:** Required for catching rendering errors in React (no functional component alternative)

**Example:**
```javascript
// Source: https://react.dev/reference/react/Component
import * as React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  // Called during render phase - must be pure, no side effects
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  // Called during commit phase - can have side effects (logging)
  componentDidCatch(error, info) {
    // info.componentStack contains stack trace with component names
    console.error('Error caught by boundary:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

// Usage:
<ErrorBoundary fallback={<p>Settings unavailable</p>}>
  <ConfigDialog />
</ErrorBoundary>
```

### Pattern 2: Silent Clamping Validation

**What:** Real-time input value clamping without error messages

**When to use:** For number inputs where values must stay within physics-valid ranges

**Example:**
```javascript
// Source: https://bobbyhadz.com/blog/react-number-input-min-max
function handleWeightChange(value) {
  const numValue = Number(value);
  // Clamp to min/max bounds
  const clamped = Math.max(40, Math.min(90, numValue));
  setWeight(clamped);
}

// In JSX:
<input
  type="range"
  min="40"
  max="90"
  value={weight}
  onChange={(e) => handleWeightChange(e.target.value)}
  className="w-full"
/>
```

**For text inputs with numeric constraints:**
```javascript
// Source: https://www.w3tutorials.net/blog/restrict-user-to-put-value-in-range-in-html-input-type-number/
<input
  type="number"
  min="0"
  max="100"
  value={pressure}
  onChange={(e) => {
    const val = Number(e.target.value);
    // Allow empty for editing, clamp on blur
    if (e.target.value === '') {
      setPressure('');
    } else if (!isNaN(val)) {
      setPressure(Math.max(0, Math.min(100, val)));
    }
  }}
/>
```

### Pattern 3: Escape Key Handler for Dialogs

**What:** Close dialog when user presses Escape key

**When to use:** All modal dialogs and overlays (WCAG 2.1 requirement)

**Example:**
```javascript
// Source: https://medium.com/@priyaeswaran/beginners-guide-to-closing-a-modal-in-react-on-outside-click-and-escape-keypress-9812b1d48b84
function ConfigDialog({ visible, onClose }) {
  React.useEffect(() => {
    if (!visible) return;

    function handleEscape(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [visible, onClose]);

  // ... rest of component
}
```

**Alternative pattern using onKeyDown on dialog:**
```javascript
// Source: https://keyholesoftware.com/cancel-a-react-modal-with-escape-key-or-external-click/
<div
  onKeyDown={(e) => e.key === 'Escape' && onClose()}
  className="dialog"
>
  {/* dialog content */}
</div>
```

### Pattern 4: Focus-Visible Indicators (Tailwind CSS)

**What:** Show focus indicators only for keyboard navigation, not mouse clicks

**When to use:** All interactive elements (buttons, inputs, links)

**Example:**
```javascript
// Source: https://tailwindcss.com/docs/hover-focus-and-other-states
// Current codebase has NO focus indicators - all buttons need this

// Bad (current state):
<button className="px-4 py-2 bg-blue-500">Click</button>

// Good (keyboard accessible):
<button className="px-4 py-2 bg-blue-500 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2">
  Click
</button>

// For inputs with existing focus:outline-none:
<input
  className="focus:outline-none focus:ring-2 focus:ring-amber-500"
  // ^ This is acceptable - custom focus indicator replaces default outline
/>
```

**Important:** Per user decisions, "basic focus indicators" means `focus-visible:ring-2` on buttons and existing `focus:ring-2` on inputs. NOT complex roving tabindex patterns.

### Anti-Patterns to Avoid

- **Wrapping entire app in single error boundary:** Use granular boundaries at major section level
- **Calling setState in componentDidCatch:** Deprecated - use `getDerivedStateFromError` instead
- **focus:outline-none without replacement:** Breaks keyboard navigation (only acceptable if adding custom focus indicator)
- **Using positive tabindex values:** Breaks natural DOM tab order (only use -1 or 0)
- **Validating on blur only:** User can submit invalid data before blur fires
- **Showing error messages for silent clamping:** User decided validation should be silent

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Focus trapping in modals | Manual focus management with refs | Native `<dialog>` element OR focus-trap-react | Edge cases: Tab at last element, Shift+Tab at first element, handling dynamically added elements |
| Error logging service | Custom error collection | console.error (for now) | Requirements specify NO "report bug" mechanism, just fallback UI |
| Input validation library | Custom validation framework | HTML5 attributes + onChange clamping | Requirements specify silent clamping, not validation library patterns |
| Keyboard shortcut system | Custom keydown listeners | Per-component useEffect hooks | Only need Escape handlers, not global shortcut system |

**Key insight:** Error boundaries catch rendering errors but NOT event handler errors or async errors (except startTransition). Event handlers need try/catch. User requirements state silent clamping only, so no need for validation libraries like Yup or Zod.

## Common Pitfalls

### Pitfall 1: Error Boundaries Don't Catch Everything

**What goes wrong:** Developer assumes error boundary catches all errors, but event handlers and async code crash the app.

**Why it happens:** Error boundaries only catch errors during:
- Rendering
- Lifecycle methods (constructor, componentDidMount, etc.)
- Inside `startTransition` callbacks

They DON'T catch:
- Event handlers (onClick, onChange, etc.)
- Async code (setTimeout, fetch, promises)
- Server-side rendering
- Errors in the error boundary itself

**How to avoid:**
- Wrap event handler logic in try/catch blocks
- Use try/catch in async functions
- Place error boundary OUTSIDE component that might error, not inside it

**Warning signs:**
- Uncaught errors in console despite error boundaries
- White screen on button click (event handler error)
- App crashes on API failure (async error)

**Source:** [React Error Boundaries Documentation](https://react.dev/reference/react/Component)

### Pitfall 2: HTML5 min/max Don't Prevent Typing

**What goes wrong:** Developer adds `min="40" max="90"` to number input, expects browser to block invalid values, but users can type "999" and submit it.

**Why it happens:** HTML5 validation runs on form submission, not on keypress. The `min`/`max` attributes mark the input as invalid (`:invalid` pseudo-class) but don't prevent typing.

**How to avoid:**
- Add onChange handler with Math.min/Math.max clamping for real-time enforcement
- Keep HTML5 attributes as backup (form submission validation)
- Don't rely on :invalid pseudo-class to prevent bad data

**Warning signs:**
- Users reporting "impossible" values in results
- Physics calculations returning NaN or Infinity
- Form submission allows out-of-range values

**Source:** [HTML5 Number Input Validation](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/number)

### Pitfall 3: Focus Indicators Removed for Aesthetics

**What goes wrong:** Developer adds `focus:outline-none` to remove "ugly" focus rings, breaking keyboard navigation.

**Why it happens:** Default browser focus styles don't match design system, developer removes them without adding replacement.

**How to avoid:**
- Only use `focus:outline-none` when adding custom focus indicator
- Use `focus-visible:ring-2` to show focus only for keyboard (not mouse)
- Test with keyboard (Tab key) to verify visible focus state

**Warning signs:**
- Can't see which button is focused when tabbing
- Accessibility audit flags missing focus indicators
- Keyboard users report difficulty navigating

**Source:** [Tailwind CSS Focus States](https://tailwindcss.com/docs/hover-focus-and-other-states)

### Pitfall 4: Forgetting to Remove Event Listeners

**What goes wrong:** Component adds `keydown` event listener for Escape key but doesn't clean up, causing memory leaks or stale closures.

**Why it happens:** useEffect cleanup function not implemented or missing dependency array.

**How to avoid:**
```javascript
React.useEffect(() => {
  if (!isOpen) return; // Don't add listener when closed

  function handleEscape(e) {
    if (e.key === 'Escape') onClose();
  }

  document.addEventListener('keydown', handleEscape);

  // CRITICAL: Return cleanup function
  return () => document.removeEventListener('keydown', handleEscape);
}, [isOpen, onClose]); // Include all dependencies
```

**Warning signs:**
- Multiple listeners firing on same keypress
- Escape key doesn't work after reopening dialog
- Memory usage grows with each dialog open/close

**Source:** [React useEffect Cleanup](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Frameworks_libraries/React_accessibility)

### Pitfall 5: Focus Trap Blocks Browser Navigation

**What goes wrong:** Developer implements focus trap that prevents Tab from reaching browser address bar or OS menus.

**Why it happens:** Misunderstanding of "focus trap" - it should only trap focus within the page, not block browser/OS chrome.

**How to avoid:**
- Focus trap means "limit focusable elements to modal subset" not "block all Tab"
- Users can always Tab to browser UI (this is browser behavior, not preventable)
- Test: Can you Tab to address bar? Can you use browser shortcuts (Cmd+T)?

**Warning signs:**
- Can't reach browser address bar with keyboard
- Cmd+T or Ctrl+T don't work
- Accessibility audit flags keyboard trap violation

**Source:** [Keyboard Trap Prevention](https://www.webability.io/glossary/keyboard-trap)

## Code Examples

Verified patterns from official sources:

### Error Boundary with Fallback Props

```javascript
// Source: https://react.dev/reference/react/Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to console (no external service per requirements)
    console.error('Error boundary caught:', {
      error,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      // Allow different fallbacks for different boundaries
      return this.props.fallback || (
        <div className="p-4 bg-red-50 rounded-lg">
          <p className="text-red-800">Something went wrong.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Usage with custom fallbacks:
<ErrorBoundary fallback={<p>Settings unavailable</p>}>
  <ConfigDialog />
</ErrorBoundary>

<ErrorBoundary fallback={<p>Timer unavailable</p>}>
  <TimerOverlay />
</ErrorBoundary>
```

### Complete Escape Key Handler Pattern

```javascript
// Source: https://medium.com/@priyaeswaran/beginners-guide-to-closing-a-modal-in-react-on-outside-click-and-escape-keypress-9812b1d48b84
export const ConfigDialog = ({ visible, onClose, ...props }) => {
  // Escape key handler
  React.useEffect(() => {
    if (!visible) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [visible, onClose]);

  // Existing body scroll lock
  React.useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className="fixed z-50 bg-white rounded-2xl p-6">
        {/* Dialog content */}
      </div>
    </>
  );
};
```

### Silent Clamping for Range Inputs

```javascript
// Source: https://bobbyhadz.com/blog/react-number-input-min-max
// Current codebase pattern (egg-calculator.jsx)

function handleWeightChange(newWeight) {
  // Clamp to valid range for physics calculations
  const MIN_WEIGHT = 40;  // Small egg
  const MAX_WEIGHT = 90;  // Extra large egg
  const clamped = Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, newWeight));
  setWeight(clamped);
}

// Range input (already has min/max in HTML):
<input
  type="range"
  min="40"
  max="90"
  value={weight}
  onChange={(e) => handleWeightChange(Number(e.target.value))}
  className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
/>
```

### Focus-Visible Pattern for Buttons

```javascript
// Source: https://tailwindcss.com/docs/hover-focus-and-other-states
// Apply to ALL interactive elements in codebase

// Current pattern (NO focus indicator):
<button
  onClick={handleClick}
  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
>
  Calculate
</button>

// Updated pattern (keyboard accessible):
<button
  onClick={handleClick}
  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
>
  Calculate
</button>

// Shorter version (extract to Tailwind config or CSS):
<button
  onClick={handleClick}
  className="btn-primary focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
>
  Calculate
</button>
```

### Temperature Hierarchy Validation

```javascript
// Validate temperature relationships for physics accuracy
// Source: Custom pattern based on requirements QUAL-02

function validateTemperatures(startTemp, boilingPoint, targetTemp) {
  // Temperature hierarchy: startTemp < targetTemp < boilingPoint

  // Clamp start temp (fridge=4°C, room=20°C, boiling=97-100°C)
  const MIN_START = 4;
  const MAX_START = 25; // Don't start from boiling water
  const clampedStart = Math.max(MIN_START, Math.min(MAX_START, startTemp));

  // Clamp boiling point (altitude affects this: 85-101°C)
  const MIN_BOILING = 85;  // ~4500m altitude
  const MAX_BOILING = 101; // Sea level + margin
  const clampedBoiling = Math.max(MIN_BOILING, Math.min(MAX_BOILING, boilingPoint));

  // Target temp must be between start and boiling
  // Soft-boiled=63°C, Medium=70°C, Hard=82°C
  const MIN_TARGET = clampedStart + 5; // At least 5°C above start
  const MAX_TARGET = clampedBoiling - 5; // At least 5°C below boiling
  const clampedTarget = Math.max(MIN_TARGET, Math.min(MAX_TARGET, targetTemp));

  return {
    startTemp: clampedStart,
    boilingPoint: clampedBoiling,
    targetTemp: clampedTarget,
  };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| componentDidCatch only | getDerivedStateFromError + componentDidCatch | React 16.6+ (2018) | getDerivedStateFromError is now required for state updates (componentDidCatch for logging only) |
| :focus pseudo-class | :focus-visible pseudo-class | CSS Selectors Level 4 (2020+) | Show focus only for keyboard, not mouse clicks (better UX) |
| Custom focus trap logic | Native `<dialog>` element | HTML Living Standard (2022+) | showModal() provides free focus trapping and backdrop |
| try/catch everywhere | Error boundaries for render errors | React 16.0 (2017) | Declarative error handling for component trees |
| Form validation libraries | HTML5 native validation + JS clamping | HTML5 (2014+) | Less dependencies, simpler for basic range validation |

**Deprecated/outdated:**
- Using `setState` in `componentDidCatch` for error UI - Use `getDerivedStateFromError` instead (pure function during render phase)
- Positive `tabindex` values (tabindex="1", tabindex="2", etc.) - Restructure DOM instead, only use -1 or 0
- `outline: none` without replacement - Use `focus-visible:ring` to provide keyboard-only indicators

## Open Questions

Things that couldn't be fully resolved:

1. **Should ConfigDialog use native `<dialog>` element?**
   - What we know: Native `<dialog>` provides free focus trapping via showModal() API
   - What's unclear: Current implementation uses react-swipeable for mobile drawer - does `<dialog>` support swipe gestures or would it break existing behavior?
   - Recommendation: Keep current div-based implementation, add Escape handler. Native `<dialog>` would require testing mobile drawer UX.

2. **What focus trap behavior does TimerOverlay need?**
   - What we know: TimerOverlay is full-screen with body scroll lock, backdrop doesn't close on click (unlike ConfigDialog)
   - What's unclear: User requirements say "no keyboard traps" but also say timer is intentionally hard to dismiss. Should Tab reach elements behind overlay or not?
   - Recommendation: Allow Tab to reach browser chrome but keep focus within timer buttons (natural DOM order sufficient - no focus trap needed). Add Escape handler per requirements.

3. **How granular should error boundaries be?**
   - What we know: Requirements say "major sections" (plural) but codebase has modular components
   - What's unclear: Is each component its own boundary, or group by feature area (inputs section, settings section, timer section)?
   - Recommendation: Start with 3 boundaries per component structure: App root, ConfigDialog, TimerOverlay. Don't wrap every component - match user's "major sections" language.

4. **Should range inputs have additional validation?**
   - What we know: Range inputs (sliders) already clamp via min/max HTML attributes, browser enforces bounds
   - What's unclear: Do we need onChange validation for range inputs or only for number inputs?
   - Recommendation: Keep existing behavior for range inputs (HTML attributes sufficient), add onChange clamping only to number inputs if any exist in codebase.

## Sources

### Primary (HIGH confidence)
- [React Component API - Error Boundaries](https://react.dev/reference/react/Component) - Official React docs for getDerivedStateFromError and componentDidCatch
- [MDN: React Accessibility](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Frameworks_libraries/React_accessibility) - Focus management patterns with useRef and useEffect
- [MDN: HTML input number](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/number) - Native validation attributes behavior
- [MDN: :focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible) - Keyboard-only focus indicators
- [Tailwind CSS: Hover, Focus & Other States](https://tailwindcss.com/docs/hover-focus-and-other-states) - focus-visible variant usage

### Secondary (MEDIUM confidence)
- [React Error Boundaries - Refine](https://refine.dev/blog/react-error-boundaries/) - Error boundary granularity strategies (verified against official React docs)
- [Create numeric input with Min and Max validation in React - Bobby Hadz](https://bobbyhadz.com/blog/react-number-input-min-max) - Clamping pattern examples
- [Beginner's Guide to Closing a Modal in React - Medium](https://medium.com/@priyaeswaran/beginners-guide-to-closing-a-modal-in-react-on-outside-click-and-escape-keypress-9812b1d48b84) - Escape key handler pattern
- [Keyboard Trap - WebAbility Glossary](https://www.webability.io/glossary/keyboard-trap) - Keyboard trap definition and prevention
- [focus-trap-react - npm](https://www.npmjs.com/package/focus-trap-react) - Focus trap library (not needed per user decisions, documented as alternative)

### Tertiary (LOW confidence)
- Various Medium articles on error boundaries - Cross-referenced with official docs, used only for strategy examples
- Stack Overflow discussions on validation - Used for identifying common pitfalls, not authoritative patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Error boundaries are React-only solution (no alternatives), HTML5 validation is standard, focus-visible is CSS spec
- Architecture: HIGH - Patterns verified against official React and MDN docs, tested in modern browsers
- Pitfalls: MEDIUM - Compiled from multiple sources, common issues documented but some edge cases may exist

**Research date:** 2026-01-31
**Valid until:** 2026-03-01 (30 days - stable domain, React 18 patterns mature, HTML5/CSS specs stable)
