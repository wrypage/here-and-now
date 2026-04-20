import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../state/appStore';
import { getWeather } from '../services/weather';
import { mapWeatherToScene } from '../utils/sceneMapping';
import { REFRESH } from '../utils/constants';

/**
 * Keeps weather fresh via react-query.
 * Enabled once location is resolved. Refreshes every 5 minutes.
 * Writes updated weather + scene into the store on each successful fetch.
 */
export function useWeatherData(): void {
  const location = useAppStore((s) => s.location);
  const setWeather = useAppStore((s) => s.setWeather);
  const setScene = useAppStore((s) => s.setScene);
  const setLastUpdatedAt = useAppStore((s) => s.setLastUpdatedAt);

  const { data } = useQuery({
    queryKey: ['weather', location?.latitude, location?.longitude],
    queryFn: () => getWeather(location!.latitude, location!.longitude),
    enabled: !!location,
    staleTime: REFRESH.weatherIntervalMs,
    refetchInterval: REFRESH.weatherIntervalMs,
  });

  useEffect(() => {
    if (!data) return;
    setWeather(data);
    const today = data.daily[0];
    const scene = mapWeatherToScene(data.current, today, new Date());
    setScene(scene);
    setLastUpdatedAt(new Date().toISOString());
  }, [data]);
}
