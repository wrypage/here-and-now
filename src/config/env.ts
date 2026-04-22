// ─── Environment Configuration ───────────────────────────────────────────────
// Set DEV_TUNING_MODE = true to open tuning mode on app launch.
// In production this is false. The alternative access is long-pressing the
// HERE & NOW wordmark for 3 seconds.

export const DEV_TUNING_MODE = false;

// Force a specific altitude mode regardless of time of day.
// Set to 'orbital' | 'sky' | 'ground-day' | 'ground-night' to lock the view.
// null = automatic (real time of day).
export const DEV_FORCE_ALTITUDE = null as
  | 'orbital'
  | 'sky'
  | 'ground-day'
  | 'ground-night'
  | null;

// Force a specific hour (0–23) for time-of-day calculations.
// Useful for testing orbital/star field during the day: set to 2.
// null = use real current time.
export const DEV_FORCE_HOUR = null as number | null;

// Radar provider — isolated here so swapping providers never touches UI code.
// Phase 1 uses RainViewer (free, no API key required).
export const RADAR_FRAMES_URL =
  'https://api.rainviewer.com/public/weather-maps.json';

// Tile URL template uses {timestamp} and standard {z}/{x}/{y} placeholders.
// tileUrlTemplate is constructed per-frame in src/services/radar.ts.
export const RADAR_TILE_BASE =
  'https://tilecache.rainviewer.com/v2/radar';
