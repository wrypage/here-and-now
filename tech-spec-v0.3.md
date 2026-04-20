HERE & NOW — Phase 1 Technical Spec
Version: 0.3
Scope: iPhone-first atmospheric prototype
Goal: prove the product feel before AI anchors, voice, premium, or advanced imaging

...

WHAT THIS APP IS

This is not a weather app. It is a channel.

The phone screen is a window into the atmosphere above the user's location. Weather data does not appear as a list of facts. It drives the look, mood, and behavior of the entire screen.

The four-layer screen stack:

  BroadcastHUD          ← on-air identity and data
  Tint overlay          ← dark scrim for readability and mood
  RadarOverlay          ← live precipitation motion
  AtmosphereCanvas      ← the living sky itself

sceneMapping.ts is the interpreter. It converts raw weather data into visual instructions.
AtmosphereCanvas is the painter. It draws what sceneMapping tells it to draw.
RadarOverlay is the proof. It confirms the atmosphere is live, not simulated.
BroadcastHUD is what makes it feel like a channel, not a screensaver.

Phase 1 proves that this screen works — that it feels distinct, cinematic, and alive — before any AI presenters, voice, or premium features are added.

...

1. Phase 1 product goal

Build a single-screen prototype that:
- requests user location
- fetches live weather data for that location
- renders a full-screen atmospheric scene that changes with real conditions and time of day
- overlays a subtle live radar layer
- shows a minimal broadcast HUD

Success condition:
When the app opens, it feels like a live atmospheric channel, not a normal weather app.

Explicitly out of scope for Phase 1:
- AI presenters (Lois, Clark, Elias)
- voice and audio
- premium tier
- multiple imaging menus
- push alerts
- Android optimization
- background location tracking
- overnight generative music
- gesture navigation beyond swipe-up to reveal detail

Phase 1 user interaction model:
One gesture only. Swipe up reveals additional data. Swipe down hides it.
Everything else — anchor switching, location search, settings — comes in a later phase.
The broadcast fills the screen by default. Controls are secondary.

...

2. Stack

Framework
- Expo + React Native + TypeScript

Core device capability
- expo-location

State / data fetching
- @tanstack/react-query
- zustand

Animation / visuals
- react-native-reanimated   (motion: clouds, rain, transitions, fades)
- react-native-svg          (shapes: cloud forms, fog, treeline, horizon elements)
- expo-linear-gradient      (sky: the primary mood driver — dawn, storm, night, city glow)
- lottie-react-native       (optional: a few accent animations only — lightning pulse, LIVE bug)

Map / radar surface
- react-native-maps         (radar tile host — map chrome hidden, precipitation data only)

Fonts
- BC Barell                 (channel identity, HERE & NOW wordmark, primary display)
- Address Sans Pro          (temperature, city label, location labels)
- DM Sans Light             (condition line, short narrative copy)
- DM Mono                   (technical readouts, timestamps, live indicators, data strip)
- expo-font                 (font loader)

Note on DM Sans: the installed package is @expo-google-fonts/dm-sans which includes multiple
weights. Use the Light weight (300) for all DM Sans roles. The typographic role is always
referred to as "DM Sans Light" throughout this spec.

Utilities / validation
- zod
- date-fns

Prototype weather data
- Open-Meteo Forecast API
- Open-Meteo Geocoding API

Radar tiles
- provider placeholder behind one service interface
- use a temporary provider in Phase 1
- do not leak provider details into UI code

Critical architectural rule:
Every external provider must be normalized into internal app types before reaching UI components.
Weather services give raw data. sceneMapping converts it. Components only see SceneState.
This protects the product and allows swapping providers without touching component code.

...

3. Project bootstrap

IMPORTANT: This project has already been created and dependencies installed.
Do not re-run create-expo-app. Do not re-run npm install for already-installed packages.

Project location:
~/Library/Mobile Documents/com~apple~CloudDocs/here-and-now

Already installed:
- expo-location
- expo-font
- expo-linear-gradient
- react-native-maps
- react-native-svg
- @tanstack/react-query
- zustand
- zod
- date-fns
- react-native-reanimated (SDK-compatible version)
- lottie-react-native
- @expo-google-fonts/dm-sans
- @expo-google-fonts/dm-mono

Custom fonts already in assets/fonts/:
- BCBarellTEST-Regular.otf       (primary — use this for all BC Barell display)
- BCBarellTEST-1973.otf          (alternate variant)
- BCBarellTEST-CondensedThin.otf (narrow variant)
- BCBarellTEST-ExtendedBlack.otf (heavy variant)
- BCBarellTEST-Inline.otf        (decorative variant)
- address-sans-pro.otf           (Address Sans Pro)

Load custom fonts via expo-font using exact filenames above.
Do not attempt to install BC Barell or Address Sans Pro via npm — they are not in Google Fonts.

Context files in project root:
- CLAUDE.md       (project identity and core rules)
- storyboards.md  (visual and emotional targets for each time slot)
- tech-spec-v0.3.md (this file)

...

4. Folder structure

here-and-now/
  app/
    _layout.tsx
    index.tsx

  src/
    components/
      AtmosphereCanvas.tsx
      RadarOverlay.tsx
      BroadcastHUD.tsx
      LiveBug.tsx
      TemperatureReadout.tsx
      LocationLabel.tsx
      DataStrip.tsx

    hooks/
      useBootstrapApp.ts
      useCurrentLocation.ts
      useWeatherData.ts
      useSceneState.ts
      useRadarOverlay.ts

    services/
      location.ts
      geocoding.ts
      weather.ts
      radar.ts

    state/
      appStore.ts

    types/
      location.ts
      weather.ts
      scene.ts
      radar.ts

    utils/
      weatherCode.ts
      sceneMapping.ts
      timeOfDay.ts
      units.ts
      color.ts
      constants.ts

    theme/
      colors.ts
      typography.ts
      spacing.ts

    config/
      env.ts

    fixtures/
      mockWeather.ts
      mockScene.ts

  assets/
    lottie/
    images/
    fonts/
      BCBarellTEST-Regular.otf
      BCBarellTEST-1973.otf
      BCBarellTEST-CondensedThin.otf
      BCBarellTEST-ExtendedBlack.otf
      BCBarellTEST-Inline.otf
      address-sans-pro.otf

  CLAUDE.md
  storyboards.md
  tech-spec-v0.3.md
  package.json
  tsconfig.json
  app.json

...

5. Screen architecture

Single screen: Home / Channel screen

Layer order from back to front:
1. AtmosphereCanvas      full-screen living sky
2. RadarOverlay          precipitation tiles at low opacity
3. Tint overlay          dark scrim for mood and readability
4. BroadcastHUD          on-air identity and data

The screen must always feel immersive and full-bleed.
No card UI. No tab bar. No normal dashboard widgets.
The broadcast fills the phone. Everything else is secondary.

...

6. Theme constants and visual tokens

Brand colors:
- nearBlack = #08090b
- fireRed   = #cf1f1f
- amber     = #e8a020
- white     = #ffffff

Typography roles:
- BC Barell        = channel identity, wordmark, primary display
- Address Sans Pro = temperature, city label, location labels
- DM Sans Light    = condition line, short narrative copy (Light weight from DM Sans package)
- DM Mono          = technical readouts, timestamps, live indicators, data strip

Typography tokens:
- displayXXL: BC Barell 72
- displayXL:  BC Barell 56
- displayL:   BC Barell 40
- displayM:   Address Sans Pro 28
- labelL:     Address Sans Pro 22
- labelM:     Address Sans Pro 18
- bodyM:      DM Sans Light 18
- bodyS:      DM Sans Light 14
- monoS:      DM Mono 12
- monoXS:     DM Mono 10

All major visual parameters in Phase 1 must be exposed as named design tokens or named
configuration values. They must not be buried as hardcoded values inside rendering components.

This requirement exists so the product can be tuned visually through iteration without
requiring structural rewrites.

At minimum, the following categories must be tokenized or exposed through named constants
or named configuration values:

- sky colors by time of day and weather condition
- haze and fog opacity
- cloud density
- cloud motion speed
- precipitation intensity
- lightning intensity or frequency if used
- radar opacity
- tint or darkening strength
- city light brightness
- horizon height
- HUD spacing
- typography scale
- LIVE bug pulse speed
- transition duration between visual states

The design system should make it easy to adjust the look of the app by changing named
values rather than modifying rendering logic in multiple places.

The visual identity of HERE & NOW depends on tunable atmosphere, motion, and restraint.
The architecture must support that from the beginning.

...

7. Internal types

src/types/location.ts

export type UserLocation = {
  latitude: number;
  longitude: number;
  city: string;
  region?: string;
  country?: string;
  timezone: string;
};

src/types/weather.ts

export type CurrentWeather = {
  time: string;
  isDay: boolean;
  temperatureC: number;
  apparentTemperatureC: number;
  humidityPct: number;
  pressureHpa: number;
  cloudCoverPct: number;
  visibilityM: number;
  windSpeedKph: number;
  windGustKph: number;
  precipitationMm: number;
  rainMm: number;
  showersMm: number;
  snowfallCm: number;
  weatherCode: number;
};

export type DailyForecastDay = {
  date: string;
  sunrise: string;
  sunset: string;
  tempMaxC: number;
  tempMinC: number;
  precipProbabilityMaxPct: number;
  weatherCode: number;
};

export type WeatherPayload = {
  current: CurrentWeather;
  daily: DailyForecastDay[];
};

src/types/scene.ts

export type SkyMode =
  | 'clear'
  | 'partly-cloudy'
  | 'overcast'
  | 'rain'
  | 'storm'
  | 'snow'
  | 'fog';

export type LightMode =
  | 'pre-dawn'
  | 'dawn'
  | 'day'
  | 'golden-hour'
  | 'dusk'
  | 'night'
  | 'deep-night';

export type AltitudeMode =
  | 'orbital'       // midnight–5am
  | 'sky'           // 5am–noon
  | 'ground-day'    // noon–6pm
  | 'ground-night'; // 6pm–midnight

export type SceneState = {
  skyMode: SkyMode;
  lightMode: LightMode;
  altitudeMode: AltitudeMode;
  intensity: number;        // 0..1 overall weather drama
  cloudDensity: number;     // 0..1
  windEnergy: number;       // 0..1
  precipType: 'none' | 'rain' | 'snow' | 'mixed';
  precipIntensity: number;  // 0..1
  fogOpacity: number;       // 0..1
  lightningChance: number;  // 0..1
  palette: {
    top: string;
    mid: string;
    bottom: string;
    haze: string;
  };
};

src/types/radar.ts

export type RadarFrame = {
  timestamp: string;
  tileUrlTemplate: string;
};

export type RadarOverlayState = {
  enabled: boolean;
  opacity: number;
  frames: RadarFrame[];
  activeFrameIndex: number;
};

...

8. Global app store

src/state/appStore.ts

import { create } from 'zustand';
import { UserLocation } from '../types/location';
import { WeatherPayload } from '../types/weather';
import { SceneState } from '../types/scene';
import { RadarOverlayState } from '../types/radar';

type AppStore = {
  location: UserLocation | null;
  weather: WeatherPayload | null;
  scene: SceneState | null;
  radar: RadarOverlayState | null;

  isBootstrapping: boolean;
  locationDenied: boolean;
  lastUpdatedAt: string | null;
  error: string | null;

  setLocation: (location: UserLocation | null) => void;
  setWeather: (weather: WeatherPayload | null) => void;
  setScene: (scene: SceneState | null) => void;
  setRadar: (radar: RadarOverlayState | null) => void;
  setBootstrapping: (value: boolean) => void;
  setLocationDenied: (value: boolean) => void;
  setLastUpdatedAt: (value: string | null) => void;
  setError: (value: string | null) => void;
};

export const useAppStore = create<AppStore>((set) => ({
  location: null,
  weather: null,
  scene: null,
  radar: null,

  isBootstrapping: true,
  locationDenied: false,
  lastUpdatedAt: null,
  error: null,

  setLocation: (location) => set({ location }),
  setWeather: (weather) => set({ weather }),
  setScene: (scene) => set({ scene }),
  setRadar: (radar) => set({ radar }),
  setBootstrapping: (isBootstrapping) => set({ isBootstrapping }),
  setLocationDenied: (locationDenied) => set({ locationDenied }),
  setLastUpdatedAt: (lastUpdatedAt) => set({ lastUpdatedAt }),
  setError: (error) => set({ error }),
}));

...

9. Service contracts

src/services/location.ts
- request foreground location permission
- get current coordinates once on app open
- do not subscribe continuously in Phase 1
- return normalized UserLocation
Public API: getUserLocation(): Promise<UserLocation>

src/services/geocoding.ts
- reverse geocode lat/lon into city/region/country
- keep provider-specific logic isolated
Public API: reverseGeocode(lat: number, lon: number): Promise<{ city: string; region?: string; country?: string }>

src/services/weather.ts
- call Open-Meteo
- request only fields Phase 1 uses
- convert raw JSON into WeatherPayload
- never expose raw provider response to components
Public API: getWeather(lat: number, lon: number, timezone: string): Promise<WeatherPayload>

src/services/radar.ts
- fetch radar frame metadata from chosen provider
- expose provider-independent RadarOverlayState
- keep tile URL logic isolated
Public API: getRadarOverlay(lat: number, lon: number): Promise<RadarOverlayState>

...

10. Sample API calls

10.1 Open-Meteo forecast

GET https://api.open-meteo.com/v1/forecast
  ?latitude=43.1566
  &longitude=-77.6088
  &current=temperature_2m,apparent_temperature,relative_humidity_2m,surface_pressure,cloud_cover,visibility,wind_speed_10m,wind_gusts_10m,precipitation,rain,showers,snowfall,weather_code,is_day
  &daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max
  &timezone=auto
  &forecast_days=7

10.2 Open-Meteo geocoding

GET https://geocoding-api.open-meteo.com/v1/reverse
  ?latitude=43.1566
  &longitude=-77.6088
  &language=en
  &format=json

10.3 Radar provider

Create one internal config field only:

RADAR_TILE_URL_TEMPLATE=https://example.com/tiles/{z}/{x}/{y}.png
RADAR_FRAMES_URL=https://example.com/frames

Do not hardcode a radar vendor inside UI components.

...

11. Weather normalization

src/utils/weatherCode.ts

Create helper functions:

- isStormCode(code: number): boolean
- isSnowCode(code: number): boolean
- isRainCode(code: number): boolean
- isFogCode(code: number): boolean
- isOvercast(cloudCoverPct: number): boolean

Rough classification rules:
- clear:         weatherCode 0 and cloudCover < 20
- partly-cloudy: weatherCode 1 or cloudCover 20..60
- overcast:      weatherCode 3 or cloudCover > 60
- fog:           weatherCode 45/48 or visibility < threshold
- rain:          drizzle/rain/showers codes or precipitation > threshold
- snow:          snowfall > threshold or snow codes
- storm:         thunderstorm codes or high precip + gusts + heavy cloud cover

Output must be internal weather semantics, not raw provider codes.

...

12. Scene mapping

src/utils/sceneMapping.ts

This is the most important file in the project.

It converts raw weather data (codes, millimetres, percentages) into visual instructions
(skyMode, palette, cloudDensity, precipIntensity) that AtmosphereCanvas can draw.
Components never see raw weather data. They only see SceneState.

Purpose:
Convert WeatherPayload.current + current local time into SceneState.

Altitude time blocks (from design doc):
- 12am–5am:  altitudeMode = orbital
- 5am–12pm:  altitudeMode = sky
- 12pm–6pm:  altitudeMode = ground-day
- 6pm–12am:  altitudeMode = ground-night

Rules:
- Determine lightMode from current time vs sunrise/sunset
- Determine altitudeMode from time blocks above
- Determine skyMode from normalized weather logic (section 11)
- Determine intensity from weighted blend of precipitation, wind, cloud cover
- Determine precipType from snowfall vs rain
- Determine fogOpacity from visibility
- Determine lightningChance from storm classification
- Determine palette from lightMode + skyMode (section 13)

Function signature:
export function mapWeatherToScene(
  current: CurrentWeather,
  dailyToday: DailyForecastDay,
  localTime: Date
): SceneState

---

Worked examples — use these to verify correct output:

EXAMPLE 1: Clear morning in Rochester
Inputs:
  time: 8:15 AM
  weatherCode: 0 (clear)
  cloudCoverPct: 12
  visibilityM: 18000
  windSpeedKph: 8
  precipitationMm: 0

Expected SceneState:
  altitudeMode: sky
  lightMode: day
  skyMode: clear
  cloudDensity: 0.1
  precipType: none
  precipIntensity: 0.0
  fogOpacity: 0.0
  intensity: 0.1
  palette: pale blue top, warm white mid, soft horizon bottom

Screen result:
  Bright blue morning sky from 2,000 feet.
  A few drifting cloud wisps, slow left-to-right motion.
  Warm, optimistic feel.
  City visible below, soft.
  Radar overlay nearly invisible.
  HUD light and restrained.

---

EXAMPLE 2: Overcast rainy afternoon
Inputs:
  time: 3:20 PM
  weatherCode: 61 (rain)
  cloudCoverPct: 95
  visibilityM: 4000
  windSpeedKph: 22
  precipitationMm: 2.4
  rainMm: 2.4

Expected SceneState:
  altitudeMode: ground-day
  lightMode: day
  skyMode: rain
  cloudDensity: 0.9
  precipType: rain
  precipIntensity: 0.5
  fogOpacity: 0.2
  intensity: 0.65
  palette: slate gray top, cool mid, compressed horizon

Screen result:
  Ground level. Low heavy cloud deck pressing toward treeline.
  Visible rain streaks, diagonal, implying wind direction.
  Radar motion faintly visible, cells moving across scene.
  Tint layer deepens.
  HUD temperature visible but the mood is subdued.

---

EXAMPLE 3: Clear night after midnight
Inputs:
  time: 1:10 AM
  weatherCode: 0 (clear)
  cloudCoverPct: 5
  visibilityM: 24000
  windSpeedKph: 4
  precipitationMm: 0

Expected SceneState:
  altitudeMode: orbital
  lightMode: deep-night
  skyMode: clear
  cloudDensity: 0.05
  precipType: none
  precipIntensity: 0.0
  fogOpacity: 0.0
  intensity: 0.05
  palette: deep black-blue top, faint earth glow at curve

Screen result:
  Orbital view. Earth's curve at the bottom of the frame.
  Stars above. No precipitation. No radar.
  Very quiet HUD: HERE & NOW tiny top left, temp/pressure/time in DM Mono at bottom.
  The planet breathing. Nothing else.

---

EXAMPLE 4: Evening storm
Inputs:
  time: 9:45 PM
  weatherCode: 95 (thunderstorm)
  cloudCoverPct: 100
  visibilityM: 1200
  windSpeedKph: 58
  precipitationMm: 8.1
  rainMm: 8.1

Expected SceneState:
  altitudeMode: ground-night
  lightMode: night
  skyMode: storm
  cloudDensity: 1.0
  precipType: rain
  precipIntensity: 0.9
  lightningChance: 0.85
  fogOpacity: 0.1
  intensity: 0.95
  palette: near-black top, dark blue-gray mid, city glow fighting through at bottom

Screen result:
  Ground level at night. City lights partially obscured by storm.
  Heavy rain. Lightning in atmosphere layer.
  Radar cells prominent and moving fast.
  High contrast. Noir feel.
  Tint layer at maximum.
  HUD still readable but the storm is the story.

...

13. Palette system

src/utils/color.ts

Create a palette lookup by lightMode + skyMode.

Each palette returns: top, mid, bottom, haze

Reference values:

dawn + clear:
  top:   #1a2a4a
  mid:   #c87941
  bottom: #f4c98a
  haze:  rgba(244,180,100,0.20)

day + clear:
  top:   #4a90e2
  mid:   #8cc8ff
  bottom: #d9f0ff
  haze:  rgba(255,255,255,0.18)

day + partly-cloudy:
  top:   #5a9fd4
  mid:   #a8cce0
  bottom: #ddeeff
  haze:  rgba(200,220,240,0.20)

day + overcast:
  top:   #7a8a96
  mid:   #a8b4bc
  bottom: #c8d0d8
  haze:  rgba(180,190,200,0.25)

day + rain:
  top:   #4a5a6a
  mid:   #6a7a8a
  bottom: #8a9aaa
  haze:  rgba(100,120,140,0.30)

dusk + clear:
  top:   #1a1a3a
  mid:   #8a4a2a
  bottom: #e8a060
  haze:  rgba(220,140,60,0.20)

night + clear:
  top:   #06080f
  mid:   #0d1220
  bottom: #1a2235
  haze:  rgba(20,30,60,0.15)

night + storm:
  top:   #06080f
  mid:   #111723
  bottom: #1f2835
  haze:  rgba(80,100,130,0.20)

ground-night + city:
  top:   #08090b
  mid:   #0f1018
  bottom: #2a1f0a
  haze:  rgba(232,160,32,0.12)

orbital + clear:
  top:   #000005
  mid:   #020210
  bottom: #0a1a0a
  haze:  rgba(50,150,80,0.08)

...

14. Hooks

src/hooks/useBootstrapApp.ts
- request location
- fetch weather
- fetch radar
- map weather to scene
- write everything into store
- expose loading/error/retry

src/hooks/useCurrentLocation.ts
- wraps location service

src/hooks/useWeatherData.ts
- wraps weather fetch via react-query
- refresh every 5 minutes while screen is active

src/hooks/useSceneState.ts
- derives SceneState from WeatherPayload
- memoized

src/hooks/useRadarOverlay.ts
- fetches radar frames
- rotates active frame every N milliseconds

...

15. Refresh policy

Phase 1 refresh rules:
- location:                 on app open only
- weather:                  every 5 minutes
- radar frames metadata:    every 5 minutes
- radar animation frame:    every 500–800 ms
- scene recalculation:      whenever weather updates

Do not poll aggressively.
The prototype should feel alive without being wasteful.

...

16. UI components

16.1 AtmosphereCanvas.tsx

Responsibilities:
- render full-screen sky gradient based on palette from SceneState
- render cloud layers with subtle horizontal drift
- render precipitation particles if precipIntensity > 0
- render haze/fog overlays if fogOpacity > 0
- render lightning flash if lightningChance > 0.5
- switch all visuals based on SceneState only — never read weather data directly

Props:
type AtmosphereCanvasProps = {
  scene: SceneState;
}

Implementation notes:
- use LinearGradient for sky using palette.top / palette.mid / palette.bottom
- use Reanimated for cloud drift — slow, atmospheric, not flashy
- use SVG for cloud shapes and treeline silhouettes
- use simple particles for rain/snow — no full physics simulation
- for orbital mode: render Earth curve at bottom, star field above
- for ground-night mode: render city light glow along horizon
- optimize for beauty and stillness over meteorological exactness
- slow motion is almost always more correct than fast motion

16.2 RadarOverlay.tsx

Responsibilities:
- display weather radar tiles
- keep map chrome hidden
- center on user location
- maintain low opacity so the app still feels atmospheric, not like a map

Props:
type RadarOverlayProps = {
  latitude: number;
  longitude: number;
  radar: RadarOverlayState;
}

Implementation notes:
- use react-native-maps
- disable roads, labels, and all map chrome where possible
- disable user interaction in Phase 1
- use dark tint or alpha blend to fit brand palette
- radar should support the scene, not dominate it
- if no radar data is available, RadarOverlay renders nothing silently

16.3 BroadcastHUD.tsx

Responsibilities:
- minimal on-air identity and data
- feels like broadcast graphics, not a weather dashboard

HUD elements:
- HERE & NOW wordmark (BC Barell)
- LIVE badge (fireRed, pulsing)
- city / region label (Address Sans Pro)
- current temperature (Address Sans Pro, large)
- one-line condition description (DM Sans Light)
- data strip: WIND / HUMIDITY / PRESSURE / UPDATED (DM Mono)

No cards. No forecast list. No menus. No buttons.

Overnight HUD (altitudeMode = orbital):
- HERE & NOW wordmark very small, top left, reduced opacity
- No large temperature display
- Minimal data strip at very bottom: temperature, pressure, time only
- DM Mono, low opacity
- Nothing competes with the planet

...

17. HUD layout

Top left:
- HERE & NOW (BC Barell)
- city / region (Address Sans Pro, small)

Top right:
- LIVE ● (DM Mono, fireRed, pulsing)

Center / lower-third:
- temperature (Address Sans Pro, displayXXL)
- one-line condition (DM Sans Light, bodyM)

Bottom strip (DM Mono, monoS):
- WIND 12 MPH
- HUMIDITY 68%
- PRESSURE 1008 HPA
- UPDATED 4:10 PM

Overnight variant — bottom strip only:
- 34°F  |  1012 HPA  |  1:10 AM

...

18. app/index.tsx skeleton

Responsibilities:
- run bootstrap hook
- read store
- branch into loading / denied / error / live states

Render logic:
- if bootstrapping:    full-screen branded loading sky (dark gradient, HERE & NOW centered)
- if locationDenied:   fallback screen with manual location entry
- if error:            retry state
- else render:
    AtmosphereCanvas (full screen, back)
    RadarOverlay (full screen, middle)
    Tint overlay (full screen, conditional)
    BroadcastHUD (full screen, front)

...

19. Sample TypeScript service code

src/services/weather.ts

import { z } from 'zod';
import { WeatherPayload } from '../types/weather';

const openMeteoSchema = z.object({
  current: z.object({
    time: z.string(),
    is_day: z.number(),
    temperature_2m: z.number(),
    apparent_temperature: z.number(),
    relative_humidity_2m: z.number(),
    surface_pressure: z.number(),
    cloud_cover: z.number(),
    visibility: z.number(),
    wind_speed_10m: z.number(),
    wind_gusts_10m: z.number(),
    precipitation: z.number(),
    rain: z.number().optional().default(0),
    showers: z.number().optional().default(0),
    snowfall: z.number().optional().default(0),
    weather_code: z.number(),
  }),
  daily: z.object({
    time: z.array(z.string()),
    sunrise: z.array(z.string()),
    sunset: z.array(z.string()),
    weather_code: z.array(z.number()),
    temperature_2m_max: z.array(z.number()),
    temperature_2m_min: z.array(z.number()),
    precipitation_probability_max: z.array(z.number()),
  }),
});

export async function getWeather(
  latitude: number,
  longitude: number
): Promise<WeatherPayload> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'surface_pressure',
      'cloud_cover',
      'visibility',
      'wind_speed_10m',
      'wind_gusts_10m',
      'precipitation',
      'rain',
      'showers',
      'snowfall',
      'weather_code',
      'is_day',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'sunrise',
      'sunset',
      'precipitation_probability_max',
    ].join(','),
    timezone: 'auto',
    forecast_days: '7',
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Weather fetch failed: ${response.status}`);
  }

  const json = await response.json();
  const parsed = openMeteoSchema.parse(json);

  return {
    current: {
      time: parsed.current.time,
      isDay: parsed.current.is_day === 1,
      temperatureC: parsed.current.temperature_2m,
      apparentTemperatureC: parsed.current.apparent_temperature,
      humidityPct: parsed.current.relative_humidity_2m,
      pressureHpa: parsed.current.surface_pressure,
      cloudCoverPct: parsed.current.cloud_cover,
      visibilityM: parsed.current.visibility,
      windSpeedKph: parsed.current.wind_speed_10m,
      windGustKph: parsed.current.wind_gusts_10m,
      precipitationMm: parsed.current.precipitation,
      rainMm: parsed.current.rain ?? 0,
      showersMm: parsed.current.showers ?? 0,
      snowfallCm: parsed.current.snowfall ?? 0,
      weatherCode: parsed.current.weather_code,
    },
    daily: parsed.daily.time.map((date, i) => ({
      date,
      sunrise: parsed.daily.sunrise[i],
      sunset: parsed.daily.sunset[i],
      tempMaxC: parsed.daily.temperature_2m_max[i],
      tempMinC: parsed.daily.temperature_2m_min[i],
      precipProbabilityMaxPct: parsed.daily.precipitation_probability_max[i],
      weatherCode: parsed.daily.weather_code[i],
    })),
  };
}

...

20. Sample location service

src/services/location.ts

import * as Location from 'expo-location';
import { UserLocation } from '../types/location';
import { reverseGeocode } from './geocoding';

export async function getUserLocation(): Promise<UserLocation> {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    throw new Error('Location permission denied');
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  const place = await reverseGeocode(latitude, longitude);

  return {
    latitude,
    longitude,
    city: place.city,
    region: place.region,
    country: place.country,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

...

21. Performance guardrails

Phase 1 guardrails:
- keep main screen under 3 network calls on bootstrap:
    1. location / geocode
    2. weather
    3. radar metadata
- avoid expensive particle systems
- do not animate everything at once
- prefer slow atmospheric motion over fast or flashy motion
- slow motion is almost always the right instinct for this product
- cache last successful weather payload
- provide mock fixtures so scene and visual work continues even if APIs fail

...

22. Testing checklist

Manual test scenarios:
- permission granted
- permission denied
- airplane mode / no network
- clear daytime (see example 1 in section 12)
- overcast daytime (see example 2 in section 12)
- rain event
- snow event
- fog / low visibility
- dusk transition
- night transition
- evening storm (see example 4 in section 12)
- overnight clear (see example 3 in section 12)
- Rochester lake-effect scenario
- simulator and real iPhone comparison

Subjective pass/fail:
- does opening the app feel like entering a channel?
- does the radar support the scene instead of overwhelming it?
- is the UI quiet enough?
- does it feel premium before premium features exist?
- does slow atmospheric motion feel right rather than sluggish?

...

23. Milestones

Stop at the end of each milestone. Review on a real iPhone before proceeding.

Milestone 1 — Foundation
- app boots on iPhone via Expo Go
- BC Barell and Address Sans Pro load correctly
- location permission requested
- weather payload fetched and logged

Milestone 2 — Atmosphere
- sceneMapping.ts converts live weather into SceneState
- AtmosphereCanvas renders a sky that responds to real conditions
- all four worked examples in section 12 produce visually correct output
- slow cloud motion running

Milestone 3 — Radar
- RadarOverlay displays precipitation tiles at low opacity
- map chrome is hidden
- radar animates through frames
- radar supports the scene and does not turn the app into a map

Milestone 4 — Broadcast
- BroadcastHUD feels like on-air graphics
- BC Barell wordmark correct
- LIVE bug pulsing in fireRed
- temperature and data strip readable against all sky conditions

Milestone 5 — The feeling
- one-screen prototype feels genuinely distinct from ordinary weather apps
- the altitude shift between time slots is visible and correct
- the overnight orbital view is quiet, spare, and planetary
- a person who picks up the phone at any time of day sees the right scene

...

24. Phase 1 acceptance criteria

Phase 1 is complete when:
- location acquisition is reliable
- weather fetch is reliable
- sceneMapping produces correct SceneState for all four worked examples
- the four time-of-day altitude modes render distinctly and correctly
- live radar can be overlaid without turning the screen into a map app
- the main screen is visually arresting on a real iPhone
- the architecture allows swapping Open-Meteo for Tomorrow.io later without touching component code
- the overnight orbital view is in place and feels distinct

...

25. What comes after Phase 1

Phase 1 proves the screen.
Phase 2 brings the team.

When Phase 1 acceptance criteria are met, Phase 2 adds:
- Lois — AI anchor, realistic presentation, delivers current conditions
- Clark — AI features reporter, impossible locations, beautiful hair
- Elias — AI meteorologist, reads the atmosphere as language, owns the overnight
- AI-generated broadcast copy via Anthropic Claude API
- Character-specific prompts injected with live SceneState and weather data
- Swipe-up gesture for forecast and extended content
- Tomorrow.io as primary data source (replaces Open-Meteo)

The architecture built in Phase 1 is designed for this transition.
Providers swap behind the service layer. Components read SceneState, not weather data.
The channel is already built. The talent moves in next.

...

26. Tuning mode (required Phase 1 deliverable)

Phase 1 must include a hidden internal tuning mode for design and development review.

This mode is not part of the public product experience. It exists so the team can fine-tune
the visual system in real time without rewriting code for every adjustment.

The purpose of tuning mode is to let the creative and product team evaluate and adjust the
atmospheric presentation directly on device.

Access:
- Long press on the HERE & NOW wordmark for 3 seconds
- Or set DEV_TUNING_MODE=true in config/env.ts

At minimum, tuning mode should allow the team to:

- scrub between morning, afternoon, evening, and overnight
- toggle core weather states: clear, partly cloudy, overcast, rain, storm, snow, fog
- preview different altitude modes
- turn radar overlay on and off
- adjust radar opacity
- adjust tint or darkening strength
- adjust cloud density
- adjust motion speed
- adjust precipitation intensity
- adjust city light brightness
- adjust horizon height where relevant
- inspect typography scale and HUD positioning

Tuning mode should update the visual scene immediately so that adjustments can be judged
live on screen.

The goal is not to expose every possible system variable. The goal is to expose the main
visual controls that determine whether the product feels like a channel rather than a
standard weather app.

Implementation notes:
- Render as a semi-transparent bottom sheet or side drawer over the live scene
- The scene behind must remain visible during tuning
- Changes are not persisted unless explicitly saved
- Include a "copy current values as JSON" export so permanent adjustments can be made
  by pasting values into src/utils/constants.ts
- Keep the UI functional, not polished — this is an internal tool

Tuning mode is a Phase 1 deliverable because the visual identity of HERE & NOW depends
on iterative aesthetic judgment, not just technical correctness.

...
