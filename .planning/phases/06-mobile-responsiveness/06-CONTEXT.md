# Phase 6: Mobile Responsiveness - Context

**Gathered:** 2026-01-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix mobile layout so the app works without overflow or breaks on all viewports (320px+), with proper touch targets and i18n support across all 6 languages. No new features — this phase makes existing functionality work correctly on mobile and tablet.

</domain>

<decisions>
## Implementation Decisions

### Tile/button layout strategy
- Tile groups (stove type, consistency, temperature, egg size) stack vertically as full-width rows on mobile
- Same content as desktop (icon + label + detail text) — no simplification, just stretch to full width
- Secondary sections (energy consumption, formulas, notices) collapse into expandable/accordion sections on mobile
- Two breakpoints: mobile (<640px), tablet (640-1024px), desktop (>1024px)
- Tablet gets intermediate layout (tiles may wrap to 2-per-row), desktop stays as-is

### Settings dialog adaptation
- Mobile (<640px): Bottom drawer, 90% screen height, swipe-to-dismiss AND close button
- Tablet (640-1024px): Centered dialog (desktop-style modal)
- Desktop (>1024px): Current dialog behavior unchanged

### Touch interaction style
- Numeric inputs (weight, volume, temperature): Native HTML number inputs to trigger numeric keyboard
- Sliders: Larger thumb and track height on mobile breakpoint for easier finger control
- Timer overlay: Full-screen takeover on mobile — big countdown, big stop button, no distractions
- Touch feedback: Subtle scale-down on press + background highlight on all interactive elements
- All interactive elements must meet 44x44px minimum touch target

### i18n layout handling
- Shorten translations globally — make all labels concise enough for 320px across all 6 languages
- Single set of translation keys (no separate mobile keys)
- Language selector: Keep current style, just ensure it fits at 320px
- Test all 6 languages (EN, DE, FR, ES, IT, PT) at 320px viewport during implementation

### Claude's Discretion
- Exact breakpoint values (640/1024 suggested, adjust if layout breaks elsewhere)
- Accordion/collapse animation style for secondary sections
- Swipe gesture threshold for drawer dismissal
- Specific Tailwind responsive utility choices
- Which translations need shortening (identify by testing)

</decisions>

<specifics>
## Specific Ideas

- Timer should feel immersive on mobile — full screen, nothing else visible
- Bottom drawer for settings is the native mobile pattern (like iOS action sheets)
- Touch feedback should be subtle, not flashy — just enough to confirm the tap registered

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-mobile-responsiveness*
*Context gathered: 2026-01-31*
