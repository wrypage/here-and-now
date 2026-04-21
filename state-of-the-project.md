# HERE & NOW — State of the Project
Version 1.0 — April 2026
Last updated: 2026-04-20

This document explains what HERE & NOW is, where the project stands now, and what comes next.
Read this first before diving into the tech spec, storyboards, design review, or decisions log.

For implementation rules: tech-spec-v0.3.md
For screen feeling targets: storyboards.md
For judging builds: design-review.md
For rejected approaches and project memory: decisions.md

...

## What HERE & NOW is

HERE & NOW is not a weather app. It is an AI-native weather channel that lives on the phone.

The core idea: the phone screen becomes a live window into the atmosphere above the user's
location. Weather data drives the mood, motion, and visual behavior of the entire screen
instead of being presented as lists and widgets.

The visual philosophy is now settled:
**atmosphere first, geography second, data third, interface last.**

The app is not supposed to look like a map with weather pasted on top. It is supposed to
look like a live atmospheric film frame with truth-data woven into it.

The core screen architecture is four layers stacked back to front:
- AtmosphereCanvas — the living sky itself
- RadarOverlay — live precipitation motion
- Tint overlay — dark scrim for mood and readability
- BroadcastHUD — on-air identity and data

sceneMapping.ts is the interpreter between weather truth and screen beauty. It translates
raw weather data into visual instructions — sky mode, palette, cloud density, precipitation
intensity, fog opacity, altitude mode — so the UI never thinks in weather codes directly.

...

## What the intended experience is

The screen changes with both time of day and real weather. There are four programmed modes:

**Morning (5am–noon):** Elevated, 2,000-foot view. Open, beginning-the-day feeling.
The day is starting. Composed. Quietly energetic.

**Afternoon (noon–6pm):** Ground level. Embodied, physical weather. The user is in it,
not above it. Clark's domain.

**Evening (6pm–midnight):** Ground level with city lights. More intimate and dramatic.
Impressionistic city glow. Lois at the late desk.

**Overnight (midnight–5am):** Orbital. Sparse, planetary, almost meditative. Real star
positions from astronomical data. Elias watching the planet breathe.

These are not just visual themes. They are broadcast dayparts with their own tone and
pacing. Weather can override the default mood when conditions are dominant, but the day
still has a programmed rhythm.

...

## Where the project is right now

The documentation is mature enough to support real development. Four working documents
define the product clearly. The screen concept is working in principle — the app boots,
gets location, fetches weather, and renders an atmospheric screen driven by live SceneState.
The system includes cloud movement, precipitation, lightning, and a layered HUD.

**What is working:**
- Location, weather fetch, scene mapping
- Atmospheric gradient sky driven by SceneState
- Cloud layer with slow drift animation
- Rain and snow particles
- Lightning layer
- Radar overlay via custom Image tile math (no MapView)
- BroadcastHUD with temperature, wind, humidity, pressure, update time
- Tuning mode with debug overrides for altitude and hour
- All four sceneMapping worked examples passing verification
- GeoColor satellite base layer (GIBS default/default URL, no capabilities fetch)
- LIVE badge alignment confirmed fixed on device
- **Orbital star field — fully working:**
  - Astrospheric API replaced with bundled Hipparcos catalog (~80 stars, on-device RA/Dec→Alt/Az)
  - Real-time planets + Moon from visibleplanets.dev/v3
  - Confirmed 51 catalog stars + 3 planets above horizon in testing
  - Star colors by spectral type (Betelgeuse orange-red, Rigel blue-white, etc.)
  - Per-star independent twinkle — random duration and phase offset, no synchronised pulsing
  - Moon phase calculated from Julian date (no API) — confirmed waxing crescent on April 20
  - Moon rendered at 28px radius with correct phase shadow (SVG terminator)
  - Deep space background #00040f with subtle radial depth gradient
  - Earth limb arc at bottom 12% of screen — dark navy fill + thin #1a3a6e stroke
  - All weather layers (fog, rain, snow, lightning) correctly suppressed in orbital mode

**What is not yet resolved:**
- BC Barell font — may not be loading consistently. Wordmark sometimes falls back to
  system font. PostScript name matching issue documented in decisions.md.
- Palette for clear evening — dusk+clear was showing muddy amber-brown instead of blue.
  Needs correction per the "clear skies must always be blue" rule.
- Orbital HUD opacity — currently set to 0.85 container-level; may need further tuning
  once the full channel feel is evaluated on device.

...

## What has been learned

**A conventional basemap cannot be the visual identity.** Roads, political boundaries,
and ordinary labeled map aesthetics are all wrong for the main screen. react-native-maps
was tried and abandoned — iOS renders base map chrome regardless of configuration. Raw
Image tile rendering replaced it entirely.

**The palette system matters enormously.** Clear skies must always read as blue. Warmth
only appears at the horizon during dawn and dusk transitions, never as the dominant color.

**Custom cityscape SVG was rejected.** It did not scale (every city needs hand-built SVG),
the Rochester skyline looked like Manhattan, and it violated the core concept. The screen
is the atmosphere, not an illustration of a skyline. Satellite imagery replaced it.

**The app should borrow from reference sources, not imitate them:**
- From Nullschool: atmospheric motion, flow, weather as a living field
- From restrained dark map styles: low clutter, limited labels, premium restraint
- From terrain references: regional context and horizon character
- From satellite references: grandeur and planetary scale for orbital mode

**GeoColor is the right satellite source.** True color daytime, city lights at night,
updates every 10 minutes. The same product professional broadcast weather uses.
GIBS `default/default` URL pattern confirmed working on device — no capabilities XML fetch needed.
— 2026-04-20

**The overnight needs real astronomical data.** The Astrospheric API is permanently dead
(HTTP 404). Replaced with bundled Hipparcos catalog for stars (on-device, no network)
plus visibleplanets.dev/v3 for planets and Moon (one fetch, 10-min cache).
The specificity of real star positions for the user's location and time is what separates
the overnight from a generic space screensaver — that specificity is now working.
— 2026-04-20

**Orbital mode is space — no weather layers.** FogOverlay, RainLayer, SnowLayer, and
LightningLayer must all check `altitudeMode !== 'orbital'` before rendering. This was a
bug in the initial build and is now fixed with `!isOrbital` guards in AtmosphereCanvas.
— 2026-04-20

...

## Where the project is going

**Phase 1 — The Screen (current)**
Prove the single atmospheric channel screen. Get atmosphere, radar, satellite base layer,
HUD, motion, and tuning right. No AI characters yet. Phase 1 is done when the screen
genuinely feels like a live atmospheric channel at any time of day under any conditions.

**Phase 2 — The Team**
Lois, Clark, and Elias move in. The product stops being a beautiful atmospheric surface
and becomes a staffed weather channel with AI-generated broadcast copy and character roles.
Tomorrow.io replaces Open-Meteo as the primary weather source.
- Lois: anchor, composed, holds the broadcast together
- Clark: field reporter, beautiful hair, somehow always already in impossible locations
- Elias: meteorologist, reads the atmosphere as language, owns the overnight

**Phase 3 — The Data**
Richer imaging and wind visualization. Nullschool-style wind particle animation using
NOAA GFS data. Mapbox satellite integration for photographic base layer. Full imaging
palette unlocked.

**Phase 4 — The Overnight**
Generative music scored to live atmospheric conditions. Pressure, wind speed, and cloud
cover translated into sound. The planet breathing.

**Phase 5 — Premium**
HERE AND NOW+ tier. Extended segments, deep reads, full imaging palette. No ads at
either tier, ever.

**Phase 6 — Ship**
App Store submission. Tuning mode locked. Public launch.

...

## The shortest possible summary

HERE & NOW has moved from a loose idea into a serious product concept with a defined
screen architecture, a distinct visual philosophy, a clear Phase 1 target, and a working
documentation system.

Right now the project is in the middle of proving the screen — solving the last hard
visual and technical issues around satellite base imagery, font loading, HUD polish, and
palette accuracy. Once that one-screen experience truly feels like a live atmospheric
channel, the next move is to add the AI weather team and turn the atmospheric surface
into a full broadcast product.

The big picture:
**You are building a weather channel disguised as a phone app. Phase 1 is about making
the sky believable enough that the rest of the network has somewhere real to live.**
