import { LightMode, AltitudeMode } from '../types/scene';

/**
 * Derive LightMode from current time relative to today's sunrise/sunset.
 * sunrise and sunset are ISO strings (from Open-Meteo daily forecast).
 */
export function getLightMode(now: Date, sunrise: string, sunset: string): LightMode {
  const hour = now.getHours();
  const minute = now.getMinutes();
  const totalMinutes = hour * 60 + minute;

  // Parse sunrise/sunset — Open-Meteo returns "YYYY-MM-DDTHH:MM"
  const srDate = new Date(sunrise);
  const ssDate = new Date(sunset);
  const srMinutes = srDate.getHours() * 60 + srDate.getMinutes();
  const ssMinutes = ssDate.getHours() * 60 + ssDate.getMinutes();

  if (totalMinutes < srMinutes - 60) return 'deep-night';
  if (totalMinutes < srMinutes - 15) return 'pre-dawn';
  if (totalMinutes < srMinutes + 45) return 'dawn';
  if (totalMinutes < ssMinutes - 90) return 'day';
  if (totalMinutes < ssMinutes) return 'golden-hour';
  if (totalMinutes < ssMinutes + 45) return 'dusk';
  if (totalMinutes < ssMinutes + 180) return 'night';
  return 'deep-night';
}

/**
 * Derive AltitudeMode from hour of day.
 * orbital:      midnight–5am
 * sky:          5am–noon
 * ground-day:   noon–6pm
 * ground-night: 6pm–midnight
 */
export function getAltitudeMode(hour: number): AltitudeMode {
  if (hour >= 0 && hour < 5) return 'orbital';
  if (hour >= 5 && hour < 12) return 'sky';
  if (hour >= 12 && hour < 18) return 'ground-day';
  return 'ground-night';
}
