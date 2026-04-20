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
  longitude: number,
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

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
  );

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
