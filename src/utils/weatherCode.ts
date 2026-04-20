// WMO Weather Interpretation Code classification helpers.
// These convert raw weatherCode + sensor values into internal semantics.
// Components never call these directly — sceneMapping.ts is the only consumer.

import { SkyMode } from '../types/scene';

export function isStormCode(code: number): boolean {
  return code >= 95 && code <= 99;
}

export function isSnowCode(code: number): boolean {
  // 71-77: snow fall, 85-86: snow showers
  return (code >= 71 && code <= 77) || code === 85 || code === 86;
}

export function isRainCode(code: number): boolean {
  // 51-67: drizzle/rain/freezing rain, 80-82: rain showers
  return (code >= 51 && code <= 67) || (code >= 80 && code <= 82);
}

export function isFogCode(code: number): boolean {
  return code === 45 || code === 48;
}

export function isOvercast(cloudCoverPct: number): boolean {
  return cloudCoverPct > 60;
}

/**
 * Classify current conditions into a SkyMode.
 * Priority order: storm > snow > fog > rain > overcast > partly-cloudy > clear
 */
export function classifySky(
  weatherCode: number,
  cloudCoverPct: number,
  visibilityM: number,
  precipitationMm: number,
  snowfallCm: number,
  windGustKph: number,
): SkyMode {
  if (isStormCode(weatherCode)) return 'storm';
  if (isSnowCode(weatherCode) || snowfallCm > 0.1) return 'snow';
  if (isFogCode(weatherCode) || visibilityM < 1000) return 'fog';
  if (isRainCode(weatherCode) || precipitationMm > 0.2) return 'rain';
  if (weatherCode === 3 || cloudCoverPct > 60) return 'overcast';
  if (weatherCode === 1 || weatherCode === 2 || (cloudCoverPct >= 20 && cloudCoverPct <= 60)) {
    return 'partly-cloudy';
  }
  return 'clear';
}
