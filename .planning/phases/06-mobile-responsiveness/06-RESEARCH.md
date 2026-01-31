# Phase 6: Mobile Responsiveness - Research

**Researched:** 2026-01-31
**Domain:** Mobile-first responsive web design with Tailwind CSS
**Confidence:** HIGH

## Summary

Mobile responsiveness for React web applications in 2026 centers on Tailwind CSS's mobile-first breakpoint system, WCAG touch target standards, and modern viewport units. The standard approach uses unprefixed utilities for mobile (base styles), then progressively enhances with `sm:` (640px), `md:` (768px), and `lg:` (1024px+) variants.

Key challenges identified: iOS Safari auto-zoom on inputs <16px, 100vh viewport issues on mobile browsers with dynamic UI bars, preventing horizontal overflow at 320px width, and implementing proper scroll locking for full-screen overlays.

The ecosystem has mature solutions: Headless UI for accessible accordions/disclosures, react-swipeable for gesture detection, and modern CSS viewport units (dvh/svh) for mobile-safe full-height layouts.

**Primary recommendation:** Build mobile-first with Tailwind's default breakpoints, ensure all inputs use 16px minimum font size to prevent iOS zoom, use Headless UI Disclosure for collapsible sections, and implement touch targets at 44x44px minimum for AAA accessibility compliance.

## Standard Stack

The established libraries/tools for mobile-responsive React applications:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | 3.4+ | Responsive utilities | Mobile-first breakpoint system, utility-first prevents class name conflicts, 100% browser support |
| Headless UI | 2.x | Accessible UI primitives | Built by Tailwind team, provides behavior without styling, automatic ARIA attributes, data-* state attributes for Tailwind styling |
| react-swipeable | 7.x | Swipe gesture detection | Lightweight (no dependencies), works with touch and mouse, simple hook API, passive event listeners for performance |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Radix UI | Latest | Alternative UI primitives | If already using Radix ecosystem; use with tailwindcss-radix plugin for state utilities |
| body-scroll-lock | 4.x | Prevent body scroll | Full-screen overlays on iOS where overflow:hidden fails; handles edge cases like iOS Safari |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Headless UI | Radix UI | Radix has more components but requires tailwindcss-radix plugin for state styling; Headless UI has native Tailwind data-* support |
| react-swipeable | Custom touch handlers | Custom implementation is 50 lines but requires handling edge cases (velocity, direction thresholds, mouse/touch parity) |
| body-scroll-lock | CSS overflow only | overflow:hidden fails on iOS Safari; body-scroll-lock handles cross-browser issues |

**Installation:**
```bash
npm install @headlessui/react react-swipeable
# Optional: only if iOS scroll locking needed
npm install body-scroll-lock
```

## Architecture Patterns

### Recommended Mobile-First Component Structure
```
components/
├── ConsistencyPicker.jsx    # Tile group: 4-col desktop → vertical mobile
├── SettingsPanel.jsx        # Collapsible sections on mobile
├── ConfigDialog.jsx         # Modal desktop → bottom drawer mobile
├── TimerOverlay.jsx         # Overlay → full-screen mobile
└── EggInputs.jsx            # Forms: 16px inputs, larger touch targets
```

### Pattern 1: Mobile-First Tile Layout
**What:** Grid layouts that stack vertically on mobile, expand to multi-column on larger screens
**When to use:** Tile/button groups (stove types, egg consistency, temperature selectors)
**Example:**
```jsx
// Source: https://tailwindcss.com/docs/responsive-design
// Current: grid-cols-4 (4 columns always)
<div className="grid grid-cols-4 gap-2">

// Mobile-first: stack on mobile, 2-col tablet, 4-col desktop
<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
  <button className="p-2 rounded-xl border-2 min-h-[44px]">
    {/* Icon + label */}
  </button>
</div>
```

**Key principles:**
- Use unprefixed utilities for mobile (NOT `sm:`)
- `grid-cols-1` stacks vertically (prevents overflow)
- `sm:grid-cols-2` wraps to 2 columns at 640px+ (tablet)
- `lg:grid-cols-4` expands to 4 columns at 1024px+ (desktop)

### Pattern 2: Collapsible Sections with Headless UI
**What:** Secondary content collapses into accordion on mobile, expands on desktop
**When to use:** Energy consumption, formulas, notices sections
**Example:**
```jsx
// Source: https://headlessui.com/react/disclosure
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'

function CollapsibleSection({ title, children }) {
  return (
    // Show as disclosure on mobile, normal section on desktop
    <div className="lg:block">
      <Disclosure defaultOpen={false} as="div" className="lg:hidden">
        {({ open }) => (
          <>
            <DisclosureButton className="flex w-full justify-between rounded-lg bg-gray-100 px-4 py-2 text-left text-sm font-medium min-h-[44px]">
              <span>{title}</span>
              <ChevronIcon className={`${open ? 'rotate-180' : ''} transition-transform`} />
            </DisclosureButton>
            <DisclosurePanel className="px-4 pt-4 pb-2 text-sm text-gray-500">
              {children}
            </DisclosurePanel>
          </>
        )}
      </Disclosure>
      {/* Desktop: always visible */}
      <div className="hidden lg:block">
        <h3 className="font-medium mb-2">{title}</h3>
        {children}
      </div>
    </div>
  )
}
```

### Pattern 3: Bottom Drawer Dialog
**What:** Modal dialog on desktop becomes bottom drawer on mobile
**When to use:** Settings dialog, configuration panels
**Example:**
```jsx
// Mobile: bottom drawer with swipe-to-dismiss
<div className={`
  fixed inset-x-0 z-50
  ${isOpen ? 'bottom-0' : '-bottom-full'}
  transition-transform duration-300
  h-[90vh] rounded-t-2xl bg-white shadow-2xl
  md:inset-0 md:h-auto md:max-w-2xl md:mx-auto md:my-auto md:rounded-2xl
`}>
  {/* Swipe handle (mobile only) */}
  <div className="md:hidden w-12 h-1 bg-gray-300 rounded mx-auto mt-3" />

  {/* Content with scroll */}
  <div className="overflow-y-auto h-full p-6">
    {/* Dialog content */}
  </div>
</div>
```

**Swipe gesture integration:**
```jsx
import { useSwipeable } from 'react-swipeable'

const handlers = useSwipeable({
  onSwipedDown: (eventData) => {
    if (eventData.velocity > 0.5) { // Fast swipe
      closeDialog()
    }
  },
  preventScrollOnSwipe: true,
  trackMouse: false, // Touch only
})

<div {...handlers} className="drawer-content">
```

### Pattern 4: Prevent Horizontal Overflow
**What:** Ensure no elements overflow viewport at 320px width
**When to use:** Every component, especially grids, flexbox, fixed widths
**Example:**
```jsx
// Source: https://tailwindcss.com/docs/max-width
// Container: max-width prevents overflow
<div className="max-w-full px-4">
  {/* Content */}
</div>

// Images: prevent natural size overflow
<img src="..." className="max-w-full h-auto" />

// Text: truncate with ellipsis if needed
<p className="line-clamp-2 md:line-clamp-none">
  Long text that truncates on mobile...
</p>

// Grid: use minmax(0, 1fr) to prevent blowout
<div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
```

### Pattern 5: Touch-Friendly Inputs
**What:** Form inputs sized for mobile keyboards and touch interaction
**When to use:** All numeric inputs, sliders, interactive elements
**Example:**
```jsx
// Source: https://css-tricks.com/16px-or-larger-text-prevents-ios-form-zoom/
// Prevent iOS auto-zoom: 16px minimum
<input
  type="number"
  className="w-full px-3 py-2 text-base rounded-lg border min-h-[44px]"
  // text-base = 16px (prevents iOS zoom)
  // min-h-[44px] = WCAG AAA touch target
/>

// Slider: larger on mobile
<input
  type="range"
  className="w-full h-8 md:h-6"
  // Larger track height for easier finger control
/>

// Button: always meet 44x44px minimum
<button className="px-4 py-2 min-h-[44px] min-w-[44px]">
  {label}
</button>
```

### Anti-Patterns to Avoid

- **Using `sm:` for mobile styling**: `sm:` targets 640px+, not mobile. Use unprefixed utilities for mobile base styles.
- **Fixed pixel widths without max-width**: `w-96` (384px) will overflow 320px viewport. Use `w-full max-w-96` or responsive classes.
- **100vh for full-height**: iOS Safari's dynamic UI makes 100vh unreliable. Use `min-h-dvh` (dynamic viewport height) or `min-h-svh` (small viewport height).
- **Disabling zoom via viewport meta**: Accessibility violation. Use 16px font size instead to prevent auto-zoom.
- **overflow-x: hidden on body only**: Won't work on all browsers. Apply to both `html` and `body`, or use containment on specific elements.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accordion/disclosure | Custom toggle state + CSS transitions | Headless UI Disclosure | Automatic ARIA attributes (aria-expanded, aria-controls), keyboard support (Enter/Space), focus management, data-* states for Tailwind styling |
| Swipe gesture detection | Touch event handlers | react-swipeable | Handles velocity calculation, direction detection, mouse/touch parity, passive listeners, 50+ edge cases tested |
| Body scroll lock (iOS) | CSS overflow:hidden | body-scroll-lock library | iOS Safari ignores overflow on body, library handles -webkit-overflow-scrolling, touch-action, position:fixed width reflow |
| Responsive breakpoints | Custom media queries | Tailwind breakpoint variants | Consistent system, mobile-first by default, works with all utilities, reduces CSS bundle size |
| Text truncation | Manual CSS with -webkit-line-clamp | Tailwind line-clamp-{n} | Cross-browser tested, works with responsive variants, handles RTL text, proper ellipsis rendering |

**Key insight:** Mobile interactions have subtle browser differences (iOS vs Android, Safari vs Chrome). Battle-tested libraries handle edge cases like iOS momentum scrolling, safe area insets, and viewport unit bugs that custom code will miss.

## Common Pitfalls

### Pitfall 1: iOS Safari Input Auto-Zoom
**What goes wrong:** When input font size is <16px, iOS Safari auto-zooms on focus, forcing users to manually zoom out.
**Why it happens:** iOS accessibility feature to ensure text is readable. Triggers when rendered font size is below 16px.
**How to avoid:**
- Use Tailwind `text-base` (16px) or larger on all inputs
- Never use `text-sm` (14px) or `text-xs` (12px) on form fields
- Applies to input, textarea, select elements
**Warning signs:** Testing on desktop browser won't show this; must test on actual iOS device or simulator.
**Source:** [CSS-Tricks: 16px or Larger Text Prevents iOS Form Zoom](https://css-tricks.com/16px-or-larger-text-prevents-ios-form-zoom/)

### Pitfall 2: 100vh on Mobile Browsers
**What goes wrong:** Elements sized to `h-screen` (100vh) extend below viewport when mobile browser UI (address bar, navigation) is visible.
**Why it happens:** Traditional `vh` units measure viewport when browser UI is hidden (maximum height), not current visible height.
**How to avoid:**
- Use `min-h-dvh` (dynamic viewport height) for layouts that should fill screen
- Use `min-h-svh` (small viewport height) for content that must always fit
- Fallback: `min-h-screen` then override with `min-h-dvh`
**Warning signs:** Bottom content cut off or requires scrolling on mobile, especially when address bar is visible.
**Browser support:** Chrome 108+, Safari 15.4+, Firefox 101+ (all current browsers in 2026)
**Source:** [web.dev: Large, Small, and Dynamic Viewport Units](https://web.dev/blog/viewport-units)

### Pitfall 3: Grid Overflow with Default `auto` Minimum
**What goes wrong:** CSS Grid items overflow container at narrow widths, causing horizontal scroll.
**Why it happens:** Grid tracks default to `min-width: auto`, which prevents items from shrinking below their content size.
**How to avoid:**
- Use `minmax(0, 1fr)` instead of just `1fr` in grid-template-columns
- In Tailwind: apply `min-w-0` to grid children when using custom grid
- For standard grids, use responsive column counts: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
**Warning signs:** Horizontal scrollbar appears only on mobile, grid items don't shrink.
**Source:** [CSS-Tricks: Preventing a Grid Blowout](https://css-tricks.com/preventing-a-grid-blowout/)

### Pitfall 4: Horizontal Overflow from Fixed Widths
**What goes wrong:** Container with padding + child with width:100% exceeds viewport width (e.g., 320px + 16px padding on each side = 352px total).
**Why it happens:** Default box-sizing: content-box makes width exclude padding. Or fixed px widths larger than 320px.
**How to avoid:**
- Tailwind sets `box-border` globally by default (safe)
- Always use `max-w-full` on images and iframes
- Use responsive width utilities: `w-full md:w-96` instead of fixed `w-96`
- Test at 320px width (smallest standard viewport)
**Warning signs:** Horizontal scrollbar at mobile sizes, content extends beyond screen edge.
**Source:** [Tailwind CSS: box-sizing](https://tailwindcss.com/docs/box-sizing)

### Pitfall 5: Insufficient Touch Targets
**What goes wrong:** Buttons and interactive elements too small for finger taps, causing mis-taps and frustration.
**Why it happens:** Desktop-sized buttons (e.g., 32px) feel fine with mouse cursor but are hard to tap accurately with finger.
**How to avoid:**
- Minimum 44x44px for all interactive elements (WCAG AAA)
- 24x24px absolute minimum (WCAG AA as of WCAG 2.2)
- Use `min-h-[44px] min-w-[44px]` on buttons
- Increase padding on mobile: `p-2 md:p-1.5` for smaller desktop buttons
- Increase slider track height on mobile: `h-8 md:h-6`
**Warning signs:** Users complain about difficulty tapping, analytics show high tap retry rates.
**Source:** [W3C WCAG 2.5.5: Target Size (Enhanced)](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)

### Pitfall 6: Missing Viewport Meta Tag
**What goes wrong:** Page renders at desktop width (typically 980px) on mobile, appearing zoomed out with tiny text.
**Why it happens:** Mobile browsers default to desktop viewport width for non-responsive sites.
**How to avoid:**
- Always include in HTML `<head>`: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- Vite/React projects: ensure index.html has this tag
- Never use `maximum-scale=1` (prevents accessibility zooming)
**Warning signs:** Page looks zoomed out on mobile, requires pinch-to-zoom to read.
**Source:** [Tailwind CSS: Responsive Design](https://tailwindcss.com/docs/responsive-design)

### Pitfall 7: Translation Text Overflow
**What goes wrong:** UI works in English but German/Spanish translations overflow containers or buttons at mobile width.
**Why it happens:** German words are longer (e.g., "Consistency" = "Konsistenz"), Romance languages are more verbose than English.
**How to avoid:**
- Use `line-clamp-1` or `line-clamp-2` on labels that might overflow
- Test all 6 languages (EN, DE, FR, ES, IT, PT) at 320px width
- Shorten translations where needed (don't add mobile-specific keys, just make all concise)
- Use `truncate` (single-line ellipsis) for edge case overflow protection
**Warning signs:** Layout breaks only in certain languages, buttons too wide in German.
**Source:** Research finding from i18n responsive patterns

## Code Examples

Verified patterns from official sources:

### Mobile-First Responsive Grid
```jsx
// Source: https://tailwindcss.com/docs/responsive-design
// Stacks vertically on mobile, 2-col tablet, 4-col desktop
<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
  {STOVE_TYPES.map((type) => (
    <button
      key={type.id}
      className={`
        p-3 rounded-xl border-2 transition-all
        min-h-[44px] text-left
        ${selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}
      `}
    >
      <div className="text-2xl mb-1">{type.icon}</div>
      <div className="font-medium text-sm">{t(type.nameKey)}</div>
    </button>
  ))}
</div>
```

### Collapsible Section (Mobile Only)
```jsx
// Source: https://headlessui.com/react/disclosure
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'

// Hide on mobile (accordion), show on desktop (always expanded)
<div>
  {/* Mobile: Disclosure */}
  <Disclosure as="div" className="lg:hidden" defaultOpen={false}>
    <DisclosureButton className="group flex w-full items-center justify-between rounded-lg bg-gray-100 px-4 py-3 text-left min-h-[44px]">
      <span className="text-sm font-medium">⚡ {t('energyTitle')}</span>
      <ChevronDownIcon className="size-5 group-data-open:rotate-180 transition-transform" />
    </DisclosureButton>
    <DisclosurePanel
      transition
      className="overflow-hidden data-closed:opacity-0 data-open:opacity-100 transition duration-200"
    >
      <div className="px-4 py-3 text-sm">
        {/* Energy consumption content */}
      </div>
    </DisclosurePanel>
  </Disclosure>

  {/* Desktop: Always visible */}
  <div className="hidden lg:block">
    <h3 className="text-sm font-medium mb-2">⚡ {t('energyTitle')}</h3>
    {/* Energy consumption content */}
  </div>
</div>
```

### Bottom Drawer with Swipe Gesture
```jsx
// Source: https://www.npmjs.com/package/react-swipeable
import { useSwipeable } from 'react-swipeable'

function SettingsDrawer({ isOpen, onClose }) {
  const swipeHandlers = useSwipeable({
    onSwipedDown: (eventData) => {
      if (eventData.velocity > 0.5) onClose()
    },
    preventScrollOnSwipe: true,
    trackTouch: true,
    trackMouse: false,
  })

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity z-40 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        {...swipeHandlers}
        className={`
          fixed inset-x-0 z-50 bg-white
          transition-transform duration-300 ease-out
          ${isOpen ? 'bottom-0 translate-y-0' : '-bottom-full translate-y-full'}

          h-[90vh] rounded-t-2xl shadow-2xl
          md:inset-0 md:h-auto md:max-w-2xl md:mx-auto md:my-auto md:rounded-2xl md:translate-y-0
        `}
      >
        {/* Swipe handle (mobile only) */}
        <div className="md:hidden flex justify-center pt-3">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Close button (always visible) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 min-h-[44px] min-w-[44px]"
        >
          <XIcon className="size-5" />
        </button>

        {/* Content */}
        <div className="overflow-y-auto h-full px-6 py-8">
          {/* Settings content */}
        </div>
      </div>
    </>
  )
}
```

### Full-Screen Timer Overlay
```jsx
// Source: https://usehooks.com/uselockbodyscroll
import { useEffect } from 'react'

function TimerOverlay({ isActive, remaining, onStop }) {
  // Lock body scroll when overlay active
  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = 'unset' }
    }
  }, [isActive])

  return (
    <div className={`
      fixed inset-0 z-50 bg-gradient-to-br from-amber-400 to-orange-500
      flex flex-col items-center justify-center p-6
      ${isActive ? 'block' : 'hidden'}
    `}>
      {/* Countdown: larger on mobile */}
      <div className="text-8xl md:text-9xl font-bold text-white mb-8 tabular-nums">
        {formatTime(remaining)}
      </div>

      {/* Stop button: larger on mobile for easy tapping */}
      <button
        onClick={onStop}
        className="
          px-8 py-4 md:px-6 md:py-3
          bg-white text-orange-600 rounded-full
          font-bold text-xl md:text-lg
          shadow-2xl hover:shadow-xl transition-shadow
          min-h-[56px] min-w-[56px]
          active:scale-95 transition-transform
        "
      >
        {t('stopTimer')}
      </button>
    </div>
  )
}
```

### Responsive Text Truncation
```jsx
// Source: https://tailwindcss.com/docs/line-clamp
// Truncate on mobile, show full text on desktop
<p className="line-clamp-3 lg:line-clamp-none text-sm text-gray-600">
  {t('longDescription')}
</p>

// Single line with ellipsis (button labels)
<div className="truncate max-w-full text-sm">
  {t('buttonLabel')}
</div>
```

### Safe Full-Height Layout
```jsx
// Source: https://web.dev/blog/viewport-units
// Old: h-screen (100vh) - breaks on mobile with browser UI
// New: min-h-dvh (dynamic viewport height)
<div className="min-h-dvh bg-gray-50 flex flex-col">
  <header className="flex-none">...</header>
  <main className="flex-1 overflow-y-auto">...</main>
  <footer className="flex-none">...</footer>
</div>

// Fallback for older browsers (pre-2023)
<div className="min-h-screen min-h-dvh">
  {/* min-h-screen as fallback, min-h-dvh overrides if supported */}
</div>
```

### Touch-Friendly Form Input
```jsx
// Source: https://css-tricks.com/16px-or-larger-text-prevents-ios-form-zoom/
<div className="space-y-4">
  <label className="block">
    <span className="text-sm font-medium text-gray-700">{t('label')}</span>
    <input
      type="number"
      className="
        mt-1 block w-full px-3 py-2
        text-base rounded-lg border border-gray-300
        min-h-[44px]
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      "
      // text-base = 16px (prevents iOS zoom)
      // min-h-[44px] = touch target size
    />
  </label>

  <label className="block">
    <span className="text-sm font-medium text-gray-700">{t('slider')}</span>
    <input
      type="range"
      className="w-full h-8 md:h-6"
      // Larger track on mobile for easier control
    />
  </label>
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 100vh for full-height | dvh/svh/lvh viewport units | Safari 15.4 (2022), Chrome 108 (2022) | Fixes mobile browser UI bar issue; dvh adjusts dynamically, svh always fits |
| maximum-scale=1 to prevent zoom | 16px minimum font size on inputs | iOS accessibility guidelines (2019) | Maintains user zoom capability (accessibility), prevents auto-zoom on focus |
| Custom media queries | Tailwind responsive variants | Tailwind 2.0 (2020), mainstream 2023+ | Consistent breakpoint system, mobile-first by default, reduced CSS bundle size |
| -webkit-line-clamp with vendor prefix | Standard line-clamp property | Chrome 108 (2022), Firefox 68 (2019) | No vendor prefix needed, standard CSS property with cross-browser support |
| WCAG 2.1 target size (44x44px AAA) | WCAG 2.2 target size (24x24px AA) | WCAG 2.2 release (October 2023) | AA compliance easier (24px), but 44px still recommended for optimal UX |

**Deprecated/outdated:**
- `-webkit-line-clamp` prefix: Standard `line-clamp` now supported (still need display:-webkit-box for implementation)
- `vh` for mobile full-height: Use `dvh` (dynamic) or `svh` (small) instead
- `box-sizing: content-box`: Tailwind sets `border-box` globally; never revert to content-box
- Disabling zoom via viewport meta: Accessibility violation; use 16px fonts instead

## Open Questions

Things that couldn't be fully resolved:

1. **Swipe gesture threshold for drawer dismissal**
   - What we know: react-swipeable supports velocity detection; typical threshold is 0.5 velocity units
   - What's unclear: Optimal threshold for this app (slow vs fast swipe preference)
   - Recommendation: Start with 0.5 velocity, adjust based on user testing; allow both swipe-down gesture AND close button for accessibility

2. **Exact breakpoint adjustments**
   - What we know: Tailwind defaults are 640px (sm), 768px (md), 1024px (lg)
   - What's unclear: Whether any components break between these standard breakpoints
   - Recommendation: Use standard breakpoints initially; add custom breakpoint only if specific component breaks (e.g., 896px if needed between md and lg)

3. **Which translations need shortening**
   - What we know: German tends to be 30% longer than English; must test at 320px
   - What's unclear: Specific translation keys that will overflow at mobile width
   - Recommendation: Test all 6 languages at 320px during implementation; shorten translations iteratively where overflow occurs; focus on button labels and tile text first

4. **Animation duration for accordion collapse**
   - What we know: Headless UI supports transition prop; typical durations are 150-300ms
   - What's unclear: User preference for this specific app context
   - Recommendation: Use duration-200 (200ms) for accordions per Headless UI examples; fast enough to feel responsive, slow enough to see what's happening

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS: Responsive Design](https://tailwindcss.com/docs/responsive-design) - Breakpoints, mobile-first approach, best practices
- [Tailwind CSS: line-clamp](https://tailwindcss.com/docs/line-clamp) - Text truncation utilities
- [Tailwind CSS: box-sizing](https://tailwindcss.com/docs/box-sizing) - Overflow prevention
- [Headless UI: Disclosure](https://headlessui.com/react/disclosure) - Collapsible sections implementation
- [W3C WCAG 2.5.5: Target Size (Enhanced)](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html) - 44x44px touch target standard
- [web.dev: Viewport Units](https://web.dev/blog/viewport-units) - dvh/svh/lvh for mobile browsers
- [CSS-Tricks: 16px or Larger Text Prevents iOS Form Zoom](https://css-tricks.com/16px-or-larger-text-prevents-ios-form-zoom/) - Input font size requirements

### Secondary (MEDIUM confidence)
- [react-swipeable npm](https://www.npmjs.com/package/react-swipeable) - Official library documentation
- [CSS-Tricks: Preventing a Grid Blowout](https://css-tricks.com/preventing-a-grid-blowout/) - Grid overflow solutions
- [useHooks: useLockBodyScroll](https://usehooks.com/uselockbodyscroll) - Scroll lock pattern
- [Chrome DevTools: Device Mode](https://developer.chrome.com/docs/devtools/device-mode) - Testing methodology
- [Medium: Understanding Mobile Viewport Units](https://medium.com/@tharunbalaji110/understanding-mobile-viewport-units-a-complete-guide-to-svh-lvh-and-dvh-0c905d96e21a) - Viewport unit explanation
- [Paradigma Digital: Target Size Accessibility](https://paradigma-digital.medium.com/target-size-the-great-overlooked-aspect-of-accessibility-fbc0c3a65e8d) - Touch target best practices

### Tertiary (LOW confidence)
- WebSearch results for bottom drawer patterns, accordion libraries, swipe gestures - Cross-referenced with official docs
- Community articles on mobile responsive patterns - Used for identifying common pitfalls, verified against official sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Tailwind 3.4, Headless UI 2.x, react-swipeable 7.x all verified via official docs and package.json
- Architecture: HIGH - Patterns verified with official Tailwind/Headless UI documentation examples
- Pitfalls: HIGH - iOS zoom, 100vh, grid overflow, touch targets all verified with official W3C/CSS-Tricks/web.dev sources
- Implementation details: MEDIUM - Swipe thresholds, exact breakpoints, animation durations are recommendations based on ecosystem standards rather than app-specific requirements

**Research date:** 2026-01-31
**Valid until:** 2026-03-02 (30 days - Tailwind/React ecosystem is stable)
