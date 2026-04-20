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
