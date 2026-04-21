# HERE & NOW — Decisions Log
Version 1.0 — April 2026

This file captures key decisions made during development — what was tried, what was
rejected, and why. Read this before making any architectural or visual changes.
It exists so Claude Code does not repeat approaches that were already evaluated and abandoned.

...

## Radar overlay — MapView abandoned

**Decision:** Replace react-native-maps MapView with raw Image tile components.

**What was tried:** react-native-maps with mapType="none", customMapStyle to hide all
labels, showsPointsOfInterest={false}, and every other suppression option available.

**Why it was rejected:** On iOS, react-native-maps always renders base map chrome
(road labels, place names, POI markers) regardless of mapType or style overrides.
The map SDK renders labels from its internal compositor, not from the tile layer, so
no combination of props suppresses them completely. The app was turning into a map app.

**What replaced it:** A custom Image tile component using standard Mercator XYZ math.
No MapView, no map SDK, no base map chrome possible. Radar tiles render as pure Image
components positioned via lat/lon to pixel conversion. Lives in RadarOverlay.tsx.

**Current radar source:** RainViewer free tier. Tile URL:
https://tilecache.rainviewer.com/v2/radar/{timestamp}/256/{z}/{x}/{y}/2/1_1.png
Frames fetched from: https://api.rainviewer.com/public/weather-maps.json
Zoom level: 6 (maximum supported by RainViewer free tier — Z=8 and above return
"Zoom Level Not Supported" error tiles with text baked in).

...

## Satellite base layer — sources evaluated

**Decision:** Currently using SceneState gradient palette as fallback while satellite
source is resolved. GeoColor is the target source.

### MODIS TrueColor (NASA GIBS) — REJECTED
**Why rejected:** 24 hours old. The product is called HERE AND NOW. Images from
yesterday are not acceptable regardless of visual quality.
URL pattern: .../MODIS_Terra_CorrectedReflectance_TrueColor/default/YYYY-MM-DD/...

### GOES-East infrared (IEM) — REJECTED
**Why rejected:** Grayscale only. Shows cloud temperature, not visible light.
Emotionally wrong for morning — looks like space or night regardless of time of day.
No color means no morning feel, no blue sky, no connection to what you see outside.

### GOES-East GeoColor (NASA GIBS) — CURRENT TARGET, not yet working correctly
**What it is:** True color during the day (blue sky, white clouds, green land),
city lights + infrared composite at night. Updates every 10 minutes. This is what
professional broadcast weather uses. Developed by CIRA/NOAA.
**Problem encountered:** Tiles were serving nighttime composite during morning hours.
Root cause: GIBS capabilities XML fetch returns HTTP 400 from mobile device (CORS).
Without the timestamp from capabilities XML, the URL falls back to stale cached tiles.
**Fix to try:** Use "default" twice in the URL path (style + date placeholder) which
tells GIBS to serve the most recent available tile automatically:
https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/GOES-East_ABI_GeoColor/default/default/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png
Note: GIBS uses {z}/{y}/{x} order (Y before X) — different from RainViewer's {z}/{x}/{y}.
**Status:** Not yet confirmed working. Tile loop render bug was also present (same 9
URLs repeating hundreds of times per render) — fixed by memoizing the tile grid and
running the probe only on mount + 15min interval.

### RainViewer satellite — FALLBACK OPTION
RainViewer serves infrared satellite tiles alongside radar from the same API.
Endpoint: https://api.rainviewer.com/public/weather-maps.json
The 'satellite' array contains recent timestamps.
Tile URL: https://tilecache.rainviewer.com/v2/satellite/{time}/256/{z}/{x}/{y}/0/0_0.png
Problem: Returns no satellite frames in some API responses. Unreliable as primary source.
Acceptable as fallback if GeoColor fails.

### Black Marble (NASA VIIRS) — GOOD for overnight
City lights composite. No date parameter needed. Shows Rochester's warm light cluster,
Lake Ontario as dark void to north, Finger Lakes as dark gaps to south, I-90 corridor
connecting Rochester/Buffalo/Syracuse. Use for orbital mode (midnight-5am).
URL: https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_Black_Marble/default/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg

### GOES-East visible Channel 02 (IEM) — REJECTED
**Why rejected:** Grayscale. Shows reflected sunlight (white clouds, dark land) but
no color. Rejected for same reason as infrared — emotionally wrong, no morning feel.

...

## Cityscape SVG — abandoned

**Decision:** Remove all SVG cityscape elements entirely.

**What was built:** An 18-element SVG skyline attempting to represent Rochester —
Xerox Tower, Chase Tower cluster, Midtown Tower. Also included a ground-day treeline.

**Why it was rejected:**
1. Doesn't scale — every city would need a custom SVG skyline built by hand.
2. The Rochester skyline looked like Manhattan regardless of tuning.
3. Violated the core concept — the screen is a window into the atmosphere, not an
   illustration of a city. The atmosphere IS the scene.

**What replaced it:** Pure satellite imagery as base layer. Real Earth, real clouds,
real geography. Automatically local to any location worldwide with no custom work.

...

## Satellite imagery — map alternatives evaluated

**Context:** Explored whether Google Earth or Apple Maps imagery could be used as
the base layer. They cannot — both lock their 3D/satellite imagery behind proprietary
APIs with no public tile access. Using their tiles would violate terms of service.

### Sources evaluated for future consideration:

**Mapbox** — RECOMMENDED for Phase 2
- Free tier: 50,000 map loads/month, requires credit card on file
- Satellite style: photographic quality, updates regularly, XYZ tiles
- Custom dark styles: can look nothing like a map — cinematic base possible
- Best looking satellite and styled tiles available after GeoColor
- Requires API key. Sign up at mapbox.com.

**Stadia Maps** — free, beautiful dark styles, no credit card required
- Alidade Smooth Dark is especially good
- Vector tiles, not satellite — styled geography not photos
- Good for a styled map base layer if satellite fails

**OpenTopoMap** — free, no key required
- Shows terrain elevation — Genesee River valley, drumlins, Lake Ontario
- Genuinely Rochester-specific geography visible
- URL: https://tile.opentopomap.org/{z}/{x}/{y}.png
- Beautiful but not atmospheric — looks like a topo map

**Windy.com API** — REJECTED
- Free version shows ads and "Download Windy App" prompts inside the map
- Kills immersive experience entirely. Do not use.

**Earth Nullschool** — not directly usable as API
- No public tile API. Contact inquiries@nullschool.net for licensing.
- The wind particle visualization technique IS open source (old version on GitHub)
- NOAA GFS wind data is free and could power a similar visualization
- Worth building in Phase 3 as animated wind stream overlay

**Wind particle visualization** — FUTURE PHASE
- Real wind vectors from NOAA GFS data for user's location
- Rendered as flowing animated particles (nullschool-style)
- Buildable in React Native using SVG + Animated API
- Would give the app genuine atmospheric motion from real data
- Not a satellite image — a data visualization of wind movement
- Target: Phase 3 or later

...

## Overnight star field — Astrospheric API

**Decision:** Use Astrospheric API for real star positions during orbital mode.

**What it provides:** Given latitude, longitude, and UTC timestamp, returns JSON array
of sky objects above the horizon with Name, Magnitude, Azimuth, and Altitude.
API endpoint: https://www.astrospheric.com/api/GetSky_V1?Latitude={lat}&Longitude={lon}&Time={unixTimeMs}
Star database: magnitude < 5 (naked eye visible).
Free, no API key required.

**Rendering approach:** Stereographic projection converts azimuth/altitude to screen
x/y. Star size scales with magnitude. Twinkle animation per star using React Native
Animated. Moon rendered as larger circle. Planets in amber (#e8a020).

**Fallback:** 200 random dots if API fails.

**Cache:** 10 minutes — stars move slowly.

**Status:** Built but not yet tested at midnight. Use tuning mode debug override
(DEV_FORCE_ALTITUDE = 'orbital') to test during daytime.

...

## Palette system — design decisions

**Rule established:** Clear skies must always read as BLUE regardless of time of day.
Warmth only appears at the horizon during dawn/dusk transitions, never as the dominant
screen color. The previous dusk+clear palette was too warm and muddy — looked like an
overcast stormy evening rather than a clear one.

**Reference image for morning palette:** Google Earth aerial view of Rochester showing
pale ice blue sky (#c8dff0 approximately) over green tree canopy. That specific pale
blue-gray is the target for day+clear morning.

**Current problem:** The gradient fallback at ~6:30pm clear conditions showed muddy
amber-brown instead of clear blue. Palette for dusk+clear and ground-night+clear
needs updating to match actual sky conditions.

...

## HUD layout — LIVE badge alignment

**Problem:** LIVE badge persistently renders outside the right edge of the HERE & NOW
wordmark despite multiple fix attempts.

**Root cause identified:** alignSelf:'flex-start' on the wordmark Pressable shrinks the
container to text width, so space-between pushes LIVE beyond the wordmark boundary.

**Correct fix:** Explicitly constrain the HUD container to HUD_WIDTH = screenWidth - 40,
using marginHorizontal: 20 (not paddingHorizontal). Both the wordmark row and the
ROCHESTER/LIVE row must be capped at this exact same width. Do not use position absolute.
Do not use alignSelf:'flex-start' on the Pressable.

**Status:** Not yet confirmed fixed on device.

...

## Development environment

**Project location:** ~/Library/Mobile Documents/com~apple~CloudDocs/here-and-now
**GitHub:** https://github.com/wrypage/here-and-now
**Git workflow:** git pull before starting, git push after finishing each session.

**Two machines in use:**
- MacBook laptop (primary development machine — confirmed working)
- Mac Studio (secondary — had connection issues, node version differences)

**node_modules and iCloud:** node_modules must NOT sync via iCloud. Run this on each
machine once to prevent sync corruption:
xattr -w com.apple.fileprovider.ignore#P 1 node_modules
Then rm -rf node_modules && mkdir node_modules && xattr ... && npm install

**Only run Expo on ONE machine at a time.** Running simultaneously causes phone
connection failures and potential file conflicts.

**Permissions:** Claude Code sessions should be started with:
claude --dangerously-skip-permissions
Settings file at ~/.claude/settings.json should contain:
{
  "permissions": {
    "allow": ["Bash(*)", "Write(*)", "Edit(*)", "MultiEdit(*)", "Read(*)"]
  }
}

**Debugging:** Press j in the Expo terminal to open Chrome DevTools. Console tab shows
all app logs including [satellite], [HERE & NOW], and [VERIFY] prefixed messages.

...

## Phase roadmap

Phase 1 — The Screen (current)
Atmospheric window, satellite base, radar overlay, broadcast HUD. No AI characters.

Phase 2 — The Team
Lois (anchor), Clark (field reporter, beautiful hair, impossible locations), Elias
(meteorologist, devotional register). AI-generated broadcast copy via Anthropic Claude
API. Character-specific prompts injected with live SceneState and weather data.
Switch Open-Meteo to Tomorrow.io as primary data source.

Phase 3 — The Data
Full imaging palette. Wind particle visualization (nullschool-style, NOAA GFS data).
Mapbox satellite integration. Premium tier content wall.

Phase 4 — The Overnight
Generative music scored to live atmospheric conditions. Pressure/wind/cloud cover
translated into sound. The planet breathing.

Phase 5 — Premium
HERE AND NOW+ tier. Extended segments, deep reads, full imaging palette.
No ads at either tier ever.

Phase 6 — Ship
App Store submission. Tuning mode locked. Public launch.
