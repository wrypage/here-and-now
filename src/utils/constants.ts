// HERE & NOW — Design Tokens
// All major visual parameters exposed as named constants.
// Tune these values rather than editing rendering logic in components.
// To make changes permanent: adjust here, or use Tuning Mode → "Copy as JSON"
// and paste the resulting values back into this file.

// ─── Sky & Atmosphere ────────────────────────────────────────────────────────

export const SKY = {
  // Haze and fog
  hazeOpacityLight: 0.12,
  hazeOpacityMedium: 0.25,
  hazeOpacityHeavy: 0.45,
  fogOpacityMax: 0.75,

  // Cloud density multipliers (applied to cloudDensity from SceneState)
  cloudLayerCount: 3,
  cloudDriftSpeedBase: 18000,   // ms for a full screen width pass (slowest layer)
  cloudDriftSpeedFast: 9000,    // ms for fast layer

  // Horizon height as fraction of screen height (0 = bottom, 1 = top)
  horizonHeightSky: 0.72,        // morning altitude: horizon sits low
  horizonHeightGround: 0.30,     // ground level: horizon in lower third
  horizonHeightOrbital: 0.12,    // orbital: Earth curve just above bottom
} as const;

// ─── Precipitation ───────────────────────────────────────────────────────────

export const PRECIP = {
  rainDropCount: 60,
  rainDropHeight: 20,
  rainDropWidth: 1.5,
  rainDropOpacity: 0.55,
  rainFallDuration: 800,         // ms per drop (base)
  rainAngleDeg: -12,             // diagonal tilt (wind implied)

  snowFlakeCount: 45,
  snowFlakeSize: 4,
  snowFallDuration: 3500,        // ms per flake (slower)
  snowDriftAmplitude: 12,        // horizontal sway in px
} as const;

// ─── Lightning ───────────────────────────────────────────────────────────────

export const LIGHTNING = {
  flashOpacity: 0.35,
  flashDuration: 80,             // ms
  minIntervalMs: 3000,
  maxIntervalMs: 12000,
} as const;

// ─── Satellite base layer ────────────────────────────────────────────────────
//
// Source priority:
//   1. GOES-East ABI GeoColor via NASA GIBS — full color, auto day/night, ~10 min lag.
//      Uses "default" in the date slot to serve the latest available tile —
//      no capabilities XML fetch required (which 400s on mobile).
//   2. RainViewer satellite frames — fallback if GIBS probe fails.

export const SATELLITE = {
  tileZoom: 6,
  regionDeg: 2.0,
  sourceProbeTtlMs: 15 * 60 * 1000,
} as const;

// ─── Radar ────────────────────────────────────────────────────────────────────

export const RADAR = {
  defaultOpacity: 0.20,
  frameIntervalMs: 600,          // ms between radar frame advances
  tileZoom: 6,                   // map zoom level for radar tiles
} as const;

// ─── Tint / Scrim ────────────────────────────────────────────────────────────

export const TINT = {
  minOpacity: 0.10,              // light conditions
  defaultOpacity: 0.28,          // standard
  stormOpacity: 0.52,            // storm / high drama
  nightOpacity: 0.40,            // nighttime base
} as const;

// ─── City Lights (ground-night mode) ─────────────────────────────────────────

export const CITY_LIGHTS = {
  glowBrightness: 0.65,          // 0..1 relative to amber glow intensity
  lightPointCount: 120,
  glowHeight: 0.22,              // fraction of screen height from bottom
} as const;

// ─── Broadcast ────────────────────────────────────────────────────────────────

export const BROADCAST = {
  liveBugPulseIntervalMs: 1200,      // normal cadence
  liveBugPulseIntervalSlowMs: 2000,  // evening/overnight — slower late broadcast feel
} as const;

// ─── HUD ──────────────────────────────────────────────────────────────────────

export const HUD = {
  wordmarkOpacityDefault: 1.0,
  wordmarkOpacityOrbital: 0.45,
  dataStripOpacity: 0.85,
  dataStripOpacityOrbital: 0.55,
  paddingTop: 56,
  paddingBottom: 40,
  paddingHorizontal: 20,
} as const;

// ─── Transitions ─────────────────────────────────────────────────────────────

export const TRANSITIONS = {
  sceneChangeDuration: 1200,     // ms — cross-fade when scene state changes
  altitudeModeChangeDuration: 2000,
} as const;

// ─── Refresh ──────────────────────────────────────────────────────────────────

export const REFRESH = {
  weatherIntervalMs: 5 * 60 * 1000,
  radarMetadataIntervalMs: 5 * 60 * 1000,
  radarFrameIntervalMs: 600,
} as const;
