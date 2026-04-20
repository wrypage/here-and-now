/**
 * sceneMapping.ts — THE interpreter.
 *
 * Converts WeatherPayload.current + today's forecast + local time into SceneState.
 * This is the only place in the app that reads raw weather values.
 * Every component downstream only sees SceneState.
 */

import { CurrentWeather, DailyForecastDay } from '../types/weather';
import { SceneState, SkyMode } from '../types/scene';
import { classifySky } from './weatherCode';
import { getLightMode, getAltitudeMode } from './timeOfDay';
import { getPalette } from './color';

const clamp = (v: number, min = 0, max = 1): number =>
  Math.max(min, Math.min(max, v));

export function mapWeatherToScene(
  current: CurrentWeather,
  dailyToday: DailyForecastDay,
  localTime: Date,
): SceneState {
  const hour = localTime.getHours();

  // ─── Mode derivation ──────────────────────────────────────────────────────
  const altitudeMode = getAltitudeMode(hour);
  const lightMode = getLightMode(localTime, dailyToday.sunrise, dailyToday.sunset);
  const skyMode = classifySky(
    current.weatherCode,
    current.cloudCoverPct,
    current.visibilityM,
    current.precipitationMm,
    current.snowfallCm,
    current.windGustKph,
  );

  // ─── Cloud density (0..1) ─────────────────────────────────────────────────
  const cloudDensity = clamp(current.cloudCoverPct / 100);

  // ─── Wind energy (0..1) — 80 kph = 1.0 ──────────────────────────────────
  const windEnergy = clamp(current.windSpeedKph / 80);

  // ─── Precipitation type ───────────────────────────────────────────────────
  let precipType: SceneState['precipType'] = 'none';
  if (current.snowfallCm > 0.1) {
    precipType = current.rainMm > 0.1 ? 'mixed' : 'snow';
  } else if (current.rainMm > 0.1 || current.showersMm > 0.1 || current.precipitationMm > 0.1) {
    precipType = 'rain';
  }

  // ─── Precipitation intensity (0..1) — log scale, ~10mm = 1.0 ────────────
  // Linear scale (/ 20) underestimates moderate rain. Log scale matches spec:
  //   2.4mm → 0.51 ≈ 0.5  |  8.1mm → 0.92 ≈ 0.9
  const precipIntensity = clamp(
    current.precipitationMm > 0
      ? Math.log10(current.precipitationMm + 1) / Math.log10(11)
      : 0,
  );

  // ─── Fog opacity (0..1) — derived from visibility ────────────────────────
  // Fog starts at 8000m, reaches 0.5 max at 0m.
  // Storm / heavy rain already renders low visibility via precip overlay;
  // cap the fog layer so the two effects don't stack visually.
  let fogOpacity = 0;
  if (current.visibilityM < 8000) {
    fogOpacity = clamp((1 - current.visibilityM / 8000) * 0.5);
  }
  if (skyMode === 'storm') {
    fogOpacity = Math.min(fogOpacity, 0.10);
  } else if (skyMode === 'rain' && current.precipitationMm > 1) {
    fogOpacity = Math.min(fogOpacity, 0.20);
  }

  // ─── Lightning chance (0..1) ──────────────────────────────────────────────
  // Storm codes 95–99 + high wind + heavy precip
  let lightningChance = 0;
  if (current.weatherCode >= 95) {
    lightningChance = clamp(
      0.5 +
      (current.weatherCode - 95) * 0.1 +
      windEnergy * 0.2 +
      precipIntensity * 0.2,
    );
  }

  // ─── Overall intensity (0..1) — weighted blend ───────────────────────────
  const intensity = clamp(
    cloudDensity * 0.25 +
    windEnergy * 0.25 +
    precipIntensity * 0.35 +
    lightningChance * 0.15,
  );

  // ─── Palette ──────────────────────────────────────────────────────────────
  const palette = getPalette(lightMode, skyMode);

  return {
    skyMode,
    lightMode,
    altitudeMode,
    intensity,
    cloudDensity,
    windEnergy,
    precipType,
    precipIntensity,
    fogOpacity,
    lightningChance,
    palette,
  };
}
