# HERE & NOW — Decisions Log
Version 1.1 — April 2026
Last updated: 2026-04-20

This file does not replace the tech spec or storyboards.
- here-and-now-tech-spec-v0.3.md defines how the app should be built
- here-and-now-storyboards.md defines how the app should feel on screen
- here-and-now-design-review.md defines how builds should be judged
- here-and-now-decisions.md (this file) records what was tried, accepted, rejected, and why

Read this before making any changes to radar, satellite, map, HUD, palette, or
visual layer systems. It exists so Claude Code does not repeat approaches that were
already evaluated and abandoned.

...

## 1. Rendering and data-source decisions

### Radar overlay — MapView abandoned

**Decision:** Replace react-native-maps MapView with raw Image tile components.

**What was tried:** react-native-maps with mapType="none", customMapStyle to hide all
labels, showsPointsOfInterest={false}, and every other suppression option available.

**Why it was rejected:** On iOS, react-native-maps always renders base map chrome
regardless of mapType or style overrides. The map SDK renders labels from its internal
compositor, not from the tile layer, so no combination of props suppresses them.
The app was turning into a map app.

**What replaced it:** A custom Image tile component using standard Mercator XYZ math.
No MapView, no map SDK, no base map chrome possible. Lives in RadarOverlay.tsx.

**Current radar source:** RainViewer free tier.
Tile URL: https://tilecache.rainviewer.com/v2/radar/{timestamp}/256/{z}/{x}/{y}/2/1_1.png
Frames: https://api.rainviewer.com/public/weather-maps.json
Zoom level: 6 (maximum for RainViewer free tier — Z=8+ returns error tiles with text).

---

### Satellite base layer — sources evaluated

**Decision:** Currently using SceneState gradient palette as fallback.
GeoColor is the target source. Do not reintroduce any rejected source.

**MODIS TrueColor (NASA GIBS) — REJECTED**
Why: 24 hours old. Images from yesterday are not acceptable on a product called HERE AND NOW.

**GOES-East infrared (IEM) — REJECTED**
Why: Grayscale only. Emotionally wrong for morning — no color, no blue sky.

**GOES-East visible Channel 02 (IEM) — REJECTED**
Why: Also grayscale. Same problem as infrared.

**GOES-East GeoColor (NASA GIBS) — CONFIRMED WORKING — 2026-04-20**
What it is: True color daytime, city lights + IR at night. Updates every 10 minutes.
Fix applied: Use "default" twice in the URL — GIBS serves most recent tile automatically,
no capabilities XML fetch needed (which returned HTTP 400 from mobile/CORS):
https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/GOES-East_ABI_GeoColor/default/default/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png
Note: GIBS uses {z}/{y}/{x} order (Y before X). Confirmed working on device.

**RainViewer satellite — FALLBACK ONLY**
Tile URL: https://tilecache.rainviewer.com/v2/satellite/{time}/256/{z}/{x}/{y}/0/0_0.png
Problem: Returns no satellite frames in some API responses. Unreliable as primary.

**Black Marble (NASA VIIRS) — GOOD for orbital overnight**
City lights composite, no date needed. Shows Rochester cluster, Lake Ontario, Finger Lakes.
URL: https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_Black_Marble/default/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg

---

### Cityscape SVG — abandoned

**Decision:** Remove all SVG cityscape elements entirely.

**Why it was rejected:**
1. Does not scale — every city needs a custom SVG built by hand.
2. Rochester skyline looked like Manhattan regardless of tuning.
3. Violated the core concept — the screen is atmosphere, not a city illustration.

**What replaced it:** Satellite imagery. Real Earth, real clouds, automatically local.

---

### Map source alternatives evaluated

Google Earth and Apple Maps cannot be used — proprietary APIs, terms of service violation.

**Mapbox — RECOMMENDED for Phase 2**
50,000 free map loads/month. Photographic satellite, beautiful dark styles, XYZ tiles.
Requires API key and credit card. Sign up at mapbox.com.

**Stadia Maps — free, good dark styles**
Alidade Smooth Dark is excellent. Vector tiles, not satellite. No credit card needed.

**OpenTopoMap — free, no key**
URL: https://tile.opentopomap.org/{z}/{x}/{y}.png
Shows Genesee River valley, drumlins, Lake Ontario. Beautiful but reads as a topo map.

**Windy.com API — REJECTED, do not use**
Free version shows ads and "Download Windy App" inside the map. Kills immersion.

**Earth Nullschool — not directly usable as API**
No public tile API. Contact inquiries@nullschool.net for licensing.
Wind particle technique is open source. NOAA GFS data is free. Build in Phase 3.

---

### Overnight star field — Astrospheric API dead, replaced — 2026-04-20

**Decision:** Astrospheric API permanently dead (HTTP 404 confirmed). Replaced with two sources.

**What replaced it:**
1. Bundled Hipparcos catalog (`src/utils/starCatalog.ts`) — ~80 named naked-eye stars,
   RA/Dec/magnitude. On-device RA/Dec→Alt/Az computation using Julian date + GMST + LST.
   No network required. Renders immediately on mount.
2. `https://api.visibleplanets.dev/v3?latitude={lat}&longitude={lon}` — real-time planets
   and Moon positions. Returns altitude, azimuth, magnitude, aboveHorizon. 10-min cache.

**Star rendering:**
- Stereographic projection (az/alt → screen x/y), size by magnitude (5px down to 1.2px)
- Spectral color by name: Betelgeuse/Antares/Aldebaran = #ffaa44, Rigel/Vega/Sirius = #cce0ff,
  Capella/Arcturus/Pollux = #ffddaa; planets = amber #e8a020
- Per-star independent twinkle: random duration (2–7s by magnitude), random phase offset
- Moon: 28px radius SVG disc with correct phase shadow computed from Julian date
  Reference new moon JD 2451550.1, synodic period 29.53058867 days
- Fallback: 200 deterministic golden-angle dots if catalog yields < 5 stars above horizon
- Cache: 10 minutes module-level; survives re-mounts during mode switching

**Confirmed working:** 51 catalog stars + 3 planets above horizon. Moon phase confirmed
waxing crescent on April 20 2026 (phase ≈ 0.14). Logged to console as
`[starfield] moon phase: 0.XX (label)`.

---

### Milky Way band — tried and removed — 2026-04-20

**Decision:** Removed. Too distracting at any opacity that registers visually.

**What was tried:** Faint diagonal gradient band (0.06 max opacity) placed along projected
galactic plane using GC (RA 266.25°, Dec -29°) and GNP (RA 192.85°, Dec +27.13°) positions.

**Why removed:** Even at very low opacity, the diagonal band competes with the clean starfield.
The orbital view is stronger without it. May revisit in Phase 3 with a more subtle approach.

---

### Earth limb arc — atmospheric glow tried and removed — 2026-04-20

**Decision:** Clean thin stroke only. No gradient glow above the arc.

**What was tried:** Multi-stop SVG LinearGradient fading upward from the arc — teal primary
band 25px above, outer taper at 55px. Also tried a single-stop navy glow.

**Why removed:** Both approaches made the bottom of the frame feel foggy rather than spatial.
The thin #1a3a6e stroke at 0.6 opacity over the dark #0a1628 Earth fill reads correctly as
a planetary limb without any additional softening.

...

## 2. Visual direction decisions

### No conventional basemap as visual identity

**Decision:** HERE & NOW will not use a conventional basemap as its visual identity.

**Product rule:** atmosphere first / geography second / data third / interface last

**What we are borrowing:**
- From Nullschool: atmospheric motion, directional flow, weather as a living field
- From restrained dark map styles: low clutter, limited labels, premium restraint
- From terrain references: regional context and horizon character
- From satellite references: grandeur and planetary scale for orbital mode

**What we are avoiding:**
- road-grid identity
- visible political boundaries by default
- ordinary labeled basemap aesthetics
- bright consumer-app weather palettes
- radar becoming the whole screen

**Named visual directions:**
- atmosphericBroadcast — default visual DNA
- technicalStormDesk — secondary, more data-forward mode
- orbitalOvernight — midnight-to-5am planetary mode

**Status:** Accepted

---

### Palette — clear skies must always be blue

**Rule:** Clear skies must always read as BLUE regardless of time of day. Warmth only
appears at the horizon during dawn/dusk transitions, never as the dominant screen color.

**What failed:** The dusk+clear palette showed muddy amber-brown at 6:30pm clear
conditions — looked like an overcast stormy evening, not a clear evening sky.

**Reference:** Google Earth aerial of Rochester shows pale ice blue (~#c8dff0) sky.
That specific pale blue-gray is the target for day+clear and dusk+clear.

**Still needs fixing:** Palette for dusk+clear and ground-night+clear.

...

## 3. Active unresolved issues

### BC Barell font — may not be loading

Wordmark appears in system font in some sessions. PostScript name for
BCBarellTEST-Regular.otf is 'BCBarellTEST-Regular'. Both the useFonts() registration
key and the fontFamily string in the wordmark Text style must use this exact string.

---

### Orbital HUD opacity — 2026-04-20

Currently set at 0.85 container-level opacity for orbital mode vs 1.0 for other modes.
LIVE pulse uses slower overnight cadence (2000ms vs 1200ms). Full HUD elements present —
not stripped down. May need further tuning on device once the full channel feel is evaluated.

---

### Palette for clear evening — 2026-04-20

dusk+clear and ground-night+clear palettes show muddy amber-brown rather than blue sky.
Rule: clear skies must always read as blue. Warmth only at the horizon. Not yet fixed.

...

## 4. Environment and workflow

**Project:** ~/Library/Mobile Documents/com~apple~CloudDocs/here-and-now
**GitHub:** https://github.com/wrypage/here-and-now
**Workflow:** git pull before starting. git push after finishing.

**Two machines:**
- MacBook laptop — primary, confirmed working
- Mac Studio — secondary, had Expo connection issues

**node_modules and iCloud:** Run once on each machine to prevent sync corruption:
  xattr -w com.apple.fileprovider.ignore#P 1 node_modules
  rm -rf node_modules && mkdir node_modules && xattr -w com.apple.fileprovider.ignore#P 1 node_modules && npm install

**Critical:** Only run Expo on ONE machine at a time.

**Claude Code:** claude --dangerously-skip-permissions
~/.claude/settings.json: { "permissions": { "allow": ["Bash(*)", "Write(*)", "Edit(*)", "MultiEdit(*)", "Read(*)"] } }

### Claude permissions — skipDangerousModePermissionPrompt — CONFIRMED 2026-04-22

~/.claude/settings.json already contains skipDangerousModePermissionPrompt: true.
Just type "claude" to start. The --dangerously-skip-permissions flag is not needed.

**Debugging:** Press j in Expo terminal → Chrome DevTools → Console tab.
Look for [satellite], [HERE & NOW], and [VERIFY] prefixed messages.

...

## 5. Roadmap and future phase ideas

**Phase 1 — The Screen (current)**
Atmospheric window, satellite base, radar overlay, broadcast HUD. No AI characters.

**Phase 2 — The Team**
Lois, Clark, Elias. AI broadcast copy via Anthropic Claude API. Tomorrow.io data.

**Phase 3 — The Data**
Wind particle visualization (nullschool-style, NOAA GFS data).
Mapbox satellite integration. Full imaging palette.

**Phase 4 — The Overnight**
Generative music scored to live atmospheric conditions.

**Phase 5 — Premium**
HERE AND NOW+ tier. No ads at either tier ever.

**Phase 6 — Ship**
App Store submission. Public launch.

...

## 6. Session orientation

Paste these URLs into Claude.ai at the start of any session to orient Claude
without uploading files:

https://raw.githubusercontent.com/wrypage/here-and-now/main/here-and-now-state-of-the-project.md
https://raw.githubusercontent.com/wrypage/here-and-now/main/here-and-now-decisions.md

## 7. Current known costs

Last updated: 2026-04-22
Ignorance of cost is a design flaw, not a detail to handle later.

### Cost per run (Phase 1 — no AI yet)

| Component | Service | Unit | Cost |
|-----------|---------|------|------|
| Weather data | Open-Meteo | free | $0 |
| Radar tiles | RainViewer free tier | free | $0 |
| Satellite tiles | NASA GIBS | free | $0 |
| Star/planet data | visibleplanets.dev/v3 | free | $0 |
| Storage/hosting | GitHub | free | $0 |

**Phase 1 total running cost: $0**
All data sources are free APIs with no authentication required.

### Phase 2 cost drivers (when AI team moves in)

| Component | Service | Estimated cost |
|-----------|---------|---------------|
| AI broadcast copy | Claude API (Sonnet) | per weather fetch — TBD |
| Weather data | Tomorrow.io | paid tier — TBD |
| App Store | Apple | $99/year developer account |

### What we don't yet know

- [ ] Tomorrow.io pricing at expected call volume
- [ ] Claude API cost per broadcast copy generation (depends on prompt length + frequency)
- [ ] Whether Phase 2 AI copy runs on every weather refresh or on demand
