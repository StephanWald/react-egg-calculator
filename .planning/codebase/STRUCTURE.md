# Codebase Structure

**Analysis Date:** 2026-01-30

## Directory Layout

```
/Users/beff/_workspace/egg/
├── index.html              # HTML entry point with PWA manifest links
├── main.jsx                # React entry point
├── egg-calculator.jsx      # Main component (1,351 lines)
├── useTranslation.js       # Translation hook
├── translations.js         # i18n strings for 6 languages
├── index.css               # Tailwind CSS directives
├── vite.config.js          # Vite bundler configuration
├── tailwind.config.js      # Tailwind CSS theme configuration
├── postcss.config.js       # PostCSS configuration
├── package.json            # Dependencies and build scripts
├── package-lock.json       # Locked dependency versions
│
├── public/                 # Static assets served to web
│   ├── icons/              # PWA app icons
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   ├── manifest.json       # PWA manifest
│   ├── CNAME               # GitHub Pages domain config
│   └── sw.js               # Service worker for offline support
│
├── dist/                   # Production build output (generated)
│   ├── index.html
│   ├── assets/             # Bundled JS and CSS
│   ├── icons/              # Copy of public icons
│   ├── manifest.json
│   ├── CNAME
│   └── sw.js
│
├── .github/                # GitHub specific files
│   └── workflows/          # CI/CD workflows (if any)
│
├── .planning/              # GSD planning directory
│   └── codebase/           # Codebase analysis documents
│
├── .auto-claude/           # auto-claude task history
│   └── specs/              # Task specifications and progress
│
└── CLAUDE.md               # Project instructions for Claude
```

## Directory Purposes

**Project Root:**
- Purpose: Source code and configuration
- Contains: Main application files, configuration, and documentation
- Key files: `egg-calculator.jsx` (main logic), `translations.js` (i18n), `package.json` (dependencies)

**`public/`:**
- Purpose: Static assets delivered as-is to web
- Contains: PWA manifest, app icons, service worker
- Key files:
  - `manifest.json`: PWA metadata (app name, icons, theme color)
  - `sw.js`: Service worker for caching and offline mode
  - `icons/`: 192x192 and 512x512 PNG icons for PWA installation

**`dist/`:**
- Purpose: Production build output
- Generated: By `npm run build` (Vite builds entire app here)
- Contains: Minified/bundled JS and CSS
- Committed: No (in .gitignore)
- Deployed: Contents of this directory uploaded to web server

**`.planning/codebase/`:**
- Purpose: GSD mapping and planning documents
- Contains: `ARCHITECTURE.md`, `STRUCTURE.md`, `CONVENTIONS.md`, `TESTING.md`, `STACK.md`, `INTEGRATIONS.md`, `CONCERNS.md`
- Committed: Yes (informational)

**`.auto-claude/`:**
- Purpose: Task automation and history tracking
- Contains: Completed task specs, implementation plans, QA reports, session logs
- Committed: Yes (meta information)

## Key File Locations

**Entry Points:**
- `index.html`: HTML skeleton, loads React app
- `main.jsx`: React bootstrap, mounts EggCalculator to DOM
- `public/sw.js`: Service worker for offline PWA support

**Configuration:**
- `vite.config.js`: Vite bundler settings (output dir, React plugin, source maps)
- `tailwind.config.js`: Tailwind CSS content paths and theme
- `postcss.config.js`: PostCSS plugins (Tailwind autoprefixer)
- `package.json`: Node.js dependencies and scripts
- `CLAUDE.md`: Development instructions and physics model documentation

**Core Logic:**
- `egg-calculator.jsx`: Entire application (state, calculations, rendering)
- `useTranslation.js`: Language selection and translation lookup hook
- `translations.js`: Translation strings for English, German, French, Spanish, Italian, Portuguese

**Styling:**
- `index.css`: Tailwind directives (base, components, utilities)
- Tailwind configuration via `tailwind.config.js`
- No component-scoped CSS (all classes are utility-based)

**Testing:**
- Not found in codebase

**Build & Deploy:**
- `vite.config.js`: Configures build output to `dist/`
- `public/manifest.json`: PWA manifest, copied to `dist/` during build
- `public/sw.js`: Service worker, copied to `dist/` during build

## Naming Conventions

**Files:**
- `[name].jsx`: React components (e.g., `egg-calculator.jsx`, `main.jsx`)
- `use[Name].js`: Custom hooks (e.g., `useTranslation.js`)
- `[name].js`: Utility modules (e.g., `translations.js`)
- Config files: `[tool].config.js` (e.g., `vite.config.js`, `tailwind.config.js`)
- Documentation: `[TOPIC].md` (e.g., `CLAUDE.md`, `README.md`)

**Directories:**
- `public/`: Static assets for web serving
- `dist/`: Production build output
- `.github/`: GitHub-specific configuration
- `.planning/`: Planning and analysis documents
- `.auto-claude/`: Automation task tracking

**JavaScript Variables:**
- **State**: camelCase with `set` prefix for setters (e.g., `weight`, `setWeight`)
- **Booleans**: prefix with `is`, `has`, `show` (e.g., `timerActive`, `showSettings`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `STORAGE_KEY`)
- **Functions**: camelCase with descriptive verb (e.g., `handleResetToDefaults`, `formatTime`)
- **Helper functions**: verb-first (e.g., `calculateTime`, `getLocationAndPressure`, `getPotHeatCapacity`)
- **Arrays/Lists**: plural nouns (e.g., `stoveTypes`, `consistencyOptions`, `languages`)

**React Props/State:**
- Named after the concept they represent (e.g., `weight`, `cookingTime`, `timerRemaining`)
- Unit-agnostic names; unit conversion handled at display time via `format*` helpers

**CSS Classes:**
- Tailwind utility classes only (no custom class definitions)
- Responsive prefixes: `md:` for medium breakup and above
- Color scheme: Amber/orange for primary, blue for location/pressure, emerald for energy, gray for neutral

## Where to Add New Code

**New Feature (calculation, timer, pressure):**
- Primary code: Add to `egg-calculator.jsx`
  - Constants: Near top after language import (lines 4-300)
  - State: Add useState after existing state groups (lines 3-59)
  - useEffect hooks: Add after existing effects (lines 64+)
  - Calculation functions: Add in business logic section (lines 302-493)
  - Handler functions: Add with matching handlers (lines 495+)
  - Helper functions: Add in helpers section (lines 585-659)
  - Render: Add JSX in return block (lines 661-1349)
- Tests: Create `egg-calculator.test.jsx` (no existing test infrastructure; would need to set up Jest or Vitest)

**New Component/Module:**
- If truly separate concern: Create new `.jsx` or `.js` file in root
- Import in `egg-calculator.jsx` with relative path (e.g., `import MyModule from './my-module.js'`)
- Update `tailwind.config.js` content array if adding new JSX file

**New Language Support:**
- Add language code and translations object to `translations.js` (follows existing 6-language pattern)
- Add to `languages` array export in `translations.js`
- Include `code`, `name`, `flag` emoji properties

**Utility Functions:**
- Shared helpers: Add directly to `egg-calculator.jsx` if simple (`format*`, `calculate*`, `handle*`)
- If reusable across multiple files: Extract to new `utils.js` and import in both places
- Format helpers follow pattern: `format[UnitType](value) → string`

**Configuration Changes:**
- Environment variables: Not used; all config is hardcoded or in localStorage
- Feature flags: Not implemented; use boolean state if needed
- API endpoints: Currently hardcoded in `getLocationAndPressure()` (lines 348, 365); externalize to constants if adding more APIs

## Special Directories

**`dist/`:**
- Purpose: Production build output
- Generated: Yes (by `vite build`)
- Committed: No (in .gitignore)
- When added: Deployed to web server

**`node_modules/`:**
- Purpose: Installed npm dependencies
- Generated: Yes (by `npm install`)
- Committed: No (symbolic link in this repo)
- Contains: React, React DOM, Vite, Tailwind CSS, PostCSS, Autoprefixer

**`.auto-claude/specs/`:**
- Purpose: Task automation metadata
- Generated: Yes (by auto-claude automation)
- Committed: Yes (for history/audit)
- Examples: `006-add-pressure-unit-toggle-hpa-inhg`, `032-timer-improvements`

**`.planning/codebase/`:**
- Purpose: GSD mapping documents (this project)
- Generated: Yes (by `/gsd:map-codebase`)
- Committed: Yes (reference documents)
- Contains: Architecture, structure, conventions, testing, tech stack, integrations, concerns

## File Size & Organization

**Large Files:**
- `egg-calculator.jsx`: 1,351 lines
  - State declarations: lines 1-59
  - Initialization/persistence: lines 64-128
  - Keyboard/escape handlers: lines 138-163
  - Timer logic: lines 166-219
  - Reset handler: lines 222-262
  - Constants (stove, pot, consistency presets): lines 266-301
  - Physics formulas: lines 304-318
  - Handlers: lines 322-416
  - Main calculation: lines 420-493
  - Timer controls: lines 522-547
  - Audio generation: lines 551-583
  - Helpers: lines 585-659
  - Render/JSX: lines 661-1349

- `translations.js`: ~800 lines
  - English translations: ~200 keys
  - German, French, Spanish, Italian, Portuguese translations
  - Language list with flags

- `package-lock.json`: 90,430 bytes (dependency tree)

**Medium Files:**
- `public/sw.js`: ~2,028 bytes (service worker cache strategy)
- `public/manifest.json`: 661 bytes (PWA metadata)

**Small Files:**
- `main.jsx`: 10 lines (React entry point)
- `useTranslation.js`: 43 lines (custom hook)
- `index.css`: 4 lines (Tailwind directives)
- `vite.config.js`: 11 lines
- `tailwind.config.js`: 11 lines
- `postcss.config.js`: 1 line

## Code Organization Philosophy

**Single Component Design:**
- All state and logic in one component for simplicity
- No component hierarchy or prop drilling
- Direct access to all state within EggCalculator

**Functional Organization Within File:**
- Clear section headers with `// ============` separators
- State declarations grouped by concern (working inputs, household settings, location, results, UI, timer, units)
- useEffect hooks logically ordered: initialization, calculations, side effects
- Functions grouped by type: calculations, handlers, helpers, formatters, getters
- Render section organized top-to-bottom: header, dialogs, main content, footer

**Immutability Pattern:**
- React state updates via setter functions (e.g., `setWeight(60)`)
- No direct state mutation
- Dependencies arrays in useEffect hooks declare reactivity

---

*Structure analysis: 2026-01-30*
