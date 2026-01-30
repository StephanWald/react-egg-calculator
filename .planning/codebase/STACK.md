# Technology Stack

**Analysis Date:** 2026-01-30

## Languages

**Primary:**
- JavaScript ES6+ (JSX) - React components and thermodynamic calculations

## Runtime

**Environment:**
- Node.js (version not pinned, recommend LTS)
- Browser: Modern browsers with ES2020+ support

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 18.3.1 - UI framework and state management

**Styling:**
- Tailwind CSS 3.4.17 - Utility-first CSS framework
- PostCSS 8.4.49 - CSS transformation
- Autoprefixer 10.4.20 - CSS vendor prefixing

**Build/Dev:**
- Vite 6.0.5 - Bundler and dev server
- @vitejs/plugin-react 4.3.4 - React plugin for Vite

## Key Dependencies

**Critical:**
- react 18.3.1 - Core rendering and hooks (useState, useEffect)
- react-dom 18.3.1 - DOM rendering
- No external physics or math libraries - calculations implemented inline

**Infrastructure:**
- tailwindcss 3.4.17 - Responsive UI styling
- vite 6.0.5 - Fast dev server with hot module replacement

## Configuration

**Environment:**
- No `.env` files required - app is fully static
- Settings persisted to browser localStorage (`egg-calculator-settings`, `egg-calculator-lang`)
- Language preference stored in localStorage (`egg-calculator-lang`)

**Build:**
- `vite.config.js` - Configured with React plugin, base path `/react-egg-calculator/`, sourcemaps enabled
- `tailwind.config.js` - Content paths for `index.html` and `*.{js,jsx}` files
- `postcss.config.js` - Tailwind and Autoprefixer plugins

**Entry Points:**
- `index.html` - HTML template with root div and service worker registration
- `main.jsx` - React entry point, mounts `EggCalculator` component

## Platform Requirements

**Development:**
- Node.js (recommend 18+ LTS)
- npm 9+
- Modern code editor (VSCode recommended)

**Production:**
- Static hosting (Vercel, Netlify, GitHub Pages, or any CDN)
- Browser with ES2020+ support
- Geolocation API support (for GPS pressure detection)
- Notification API support (optional, for timer alerts)
- Service Worker support (PWA capabilities)

## Build Output

**Bundled to:**
- `dist/` directory
- Contains minified JavaScript, CSS, and assets
- Includes source maps for debugging

---

*Stack analysis: 2026-01-30*
