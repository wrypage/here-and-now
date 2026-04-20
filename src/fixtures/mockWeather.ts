import { WeatherPayload } from '../types/weather';

/** Clear morning — spec example 1 */
export const mockClearMorning: WeatherPayload = {
  current: {
    time: '2026-04-19T08:15',
    isDay: true,
    temperatureC: 12,
    apparentTemperatureC: 10,
    humidityPct: 55,
    pressureHpa: 1015,
    cloudCoverPct: 12,
    visibilityM: 18000,
    windSpeedKph: 8,
    windGustKph: 14,
    precipitationMm: 0,
    rainMm: 0,
    showersMm: 0,
    snowfallCm: 0,
    weatherCode: 0,
  },
  daily: [{
    date: '2026-04-19',
    sunrise: '2026-04-19T06:10',
    sunset: '2026-04-19T19:48',
    tempMaxC: 17,
    tempMinC: 7,
    precipProbabilityMaxPct: 5,
    weatherCode: 0,
  }],
};

/** Overcast rainy afternoon — spec example 2 */
export const mockRainyAfternoon: WeatherPayload = {
  current: {
    time: '2026-04-19T15:20',
    isDay: true,
    temperatureC: 9,
    apparentTemperatureC: 5,
    humidityPct: 82,
    pressureHpa: 1002,
    cloudCoverPct: 95,
    visibilityM: 4000,
    windSpeedKph: 22,
    windGustKph: 38,
    precipitationMm: 2.4,
    rainMm: 2.4,
    showersMm: 0,
    snowfallCm: 0,
    weatherCode: 61,
  },
  daily: [{
    date: '2026-04-19',
    sunrise: '2026-04-19T06:10',
    sunset: '2026-04-19T19:48',
    tempMaxC: 11,
    tempMinC: 6,
    precipProbabilityMaxPct: 85,
    weatherCode: 61,
  }],
};

/** Clear night after midnight — spec example 3 */
export const mockClearNight: WeatherPayload = {
  current: {
    time: '2026-04-20T01:10',
    isDay: false,
    temperatureC: 4,
    apparentTemperatureC: 1,
    humidityPct: 48,
    pressureHpa: 1018,
    cloudCoverPct: 5,
    visibilityM: 24000,
    windSpeedKph: 4,
    windGustKph: 8,
    precipitationMm: 0,
    rainMm: 0,
    showersMm: 0,
    snowfallCm: 0,
    weatherCode: 0,
  },
  daily: [{
    date: '2026-04-19',
    sunrise: '2026-04-19T06:10',
    sunset: '2026-04-19T19:48',
    tempMaxC: 14,
    tempMinC: 3,
    precipProbabilityMaxPct: 0,
    weatherCode: 0,
  }],
};

/** Evening storm — spec example 4 */
export const mockEveningStorm: WeatherPayload = {
  current: {
    time: '2026-04-19T21:45',
    isDay: false,
    temperatureC: 14,
    apparentTemperatureC: 8,
    humidityPct: 91,
    pressureHpa: 996,
    cloudCoverPct: 100,
    visibilityM: 1200,
    windSpeedKph: 58,
    windGustKph: 82,
    precipitationMm: 8.1,
    rainMm: 8.1,
    showersMm: 0,
    snowfallCm: 0,
    weatherCode: 95,
  },
  daily: [{
    date: '2026-04-19',
    sunrise: '2026-04-19T06:10',
    sunset: '2026-04-19T19:48',
    tempMaxC: 18,
    tempMinC: 12,
    precipProbabilityMaxPct: 95,
    weatherCode: 95,
  }],
};
