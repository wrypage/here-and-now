/** Celsius to Fahrenheit */
export function cToF(c: number): number {
  return Math.round(c * 9 / 5 + 32);
}

/** kph to mph */
export function kphToMph(kph: number): number {
  return Math.round(kph * 0.621371);
}

/** hPa to inHg */
export function hpaToInHg(hpa: number): number {
  return parseFloat((hpa * 0.02953).toFixed(2));
}

/** Meters to miles */
export function metersToMiles(m: number): number {
  return parseFloat((m * 0.000621371).toFixed(1));
}

/** Format a temperature in °F with degree symbol */
export function formatTemp(c: number): string {
  return `${cToF(c)}°`;
}

/** Format wind speed in MPH */
export function formatWind(kph: number): string {
  return `${kphToMph(kph)} MPH`;
}

/** Format pressure in hPa */
export function formatPressure(hpa: number): string {
  return `${Math.round(hpa)} HPA`;
}

/** Format a Date to display time string, e.g. "4:10 PM" */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
