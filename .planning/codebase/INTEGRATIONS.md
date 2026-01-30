# External Integrations

**Analysis Date:** 2026-01-30

## APIs & External Services

**Geolocation & Weather:**
- Open-Meteo API - Fetches real-time atmospheric pressure at GPS coordinates
  - SDK/Client: Browser native `fetch()`
  - Endpoint: `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=surface_pressure`
  - Used in: `egg-calculator.jsx` lines 347-354
  - No authentication required

**Location Reverse Geocoding:**
- Nominatim (OpenStreetMap) - Converts GPS coordinates to city names
  - SDK/Client: Browser native `fetch()`
  - Endpoint: `https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json&zoom=10`
  - Used in: `egg-calculator.jsx` lines 374-381
  - No authentication required
  - Failures are gracefully ignored (informational only)

## Data Storage

**Databases:**
- None - application is fully static/client-side

**File Storage:**
- Local filesystem only - no remote file storage
- Static assets served from `dist/` directory

**Client-Side Persistence:**
- Browser localStorage
  - `egg-calculator-settings` - Stores household settings, pressure data, unit preferences, coordinates
  - `egg-calculator-lang` - Stores selected language preference
  - No sensitive data stored

**Caching:**
- Browser HTTP caching via Vite build output
- Service Worker caching for PWA capability (`public/sw.js`)

## Authentication & Identity

**Auth Provider:**
- None - application requires no authentication
- Fully public, no user accounts

## Monitoring & Observability

**Error Tracking:**
- None - errors logged to browser console only
- Error messages displayed to user in German or English

**Logs:**
- Console only (`console.error()` calls for debugging)
- No remote logging or analytics

## CI/CD & Deployment

**Hosting:**
- Static file hosting only (Vercel, Netlify, GitHub Pages, or standard CDN)
- Output: `dist/` directory from Vite build

**CI Pipeline:**
- Not configured - manual deployment

## Environment Configuration

**Required env vars:**
- None - application is fully static and requires no environment variables

**Secrets location:**
- No secrets used - application has no API keys or credentials
- All external APIs are public (no authentication required)

## Browser APIs Used

**Geolocation API:**
- Used to get user's GPS coordinates (latitude, longitude, altitude)
- Prompts user for permission
- Used in: `egg-calculator.jsx` lines 336-342
- Error codes handled: 1 (permission denied), 2 (position unavailable)

**Notification API:**
- Optional - used for timer completion alerts
- Requires user permission
- Used in: `egg-calculator.jsx` timer logic (lines 47-52)

**Web Audio API:**
- Optional - used for timer completion beep sound
- Graceful fallback if unavailable
- Used in: `egg-calculator.jsx` line 581

**Local Storage API:**
- Persistent storage of settings and language preference
- Used in: `useTranslation.js`, `egg-calculator.jsx`

**Service Worker API:**
- Registered in `index.html` (lines 28-32)
- Implementation in: `public/sw.js`
- Enables PWA capabilities (offline support)

## Webhooks & Callbacks

**Incoming:**
- None - application receives no webhooks

**Outgoing:**
- None - application makes no outgoing webhook calls

## Data Flow

**User Location to Pressure Calculation:**

1. User clicks "Detect with GPS" button
2. Browser requests Geolocation permission
3. Browser returns GPS coordinates (lat, lon, altitude)
4. Application fetches current pressure from Open-Meteo API
5. Application fetches location name from Nominatim
6. Pressure and altitude stored in localStorage
7. Boiling point recalculated based on atmospheric pressure

**No network requests made except during:**
- Explicit GPS detection button click
- Manual pressure/altitude input by user

---

*Integration audit: 2026-01-30*
