import { useEffect } from 'react';
import { useAppStore } from '../state/appStore';
import { getUserLocation } from '../services/location';
import { getWeather } from '../services/weather';
import { getRadarOverlay } from '../services/radar';
import { mapWeatherToScene } from '../utils/sceneMapping';
import { verifySceneMapping } from '../utils/verifySceneMapping';

/**
 * Runs once on app open:
 * 1. Request location
 * 2. Fetch initial weather
 * 3. Fetch radar
 * 4. Map weather → SceneState
 * 5. Write everything into store
 */
export function useBootstrapApp(): void {
  const store = useAppStore();

  useEffect(() => {
    let cancelled = false;

    if (__DEV__) {
      verifySceneMapping();
    }

    async function bootstrap() {
      try {
        store.setBootstrapping(true);
        store.setError(null);

        // 1. Location
        console.log('[HERE & NOW] Step 1: requesting location...');
        const location = await getUserLocation();
        if (cancelled) return;
        store.setLocation(location);
        console.log('[HERE & NOW] Step 1 OK — location:', location.city, location.region, `(${location.latitude}, ${location.longitude})`);

        // 2. Weather
        console.log('[HERE & NOW] Step 2: fetching weather...');
        const weather = await getWeather(location.latitude, location.longitude);
        if (cancelled) return;
        store.setWeather(weather);
        console.log('[HERE & NOW] Step 2 OK — weather code:', weather.current.weatherCode, weather.current.temperatureC + '°C');

        // 3. Radar
        console.log('[HERE & NOW] Step 3: fetching radar...');
        const radar = await getRadarOverlay(location.latitude, location.longitude);
        if (cancelled) return;
        store.setRadar(radar);
        console.log('[HERE & NOW] Step 3 OK — radar frames:', radar.frames.length);

        // 4. Scene
        console.log('[HERE & NOW] Step 4: mapping scene...');
        const today = weather.daily[0];
        const scene = mapWeatherToScene(weather.current, today, new Date());
        if (cancelled) return;
        store.setScene(scene);
        console.log('[HERE & NOW] Step 4 OK — scene:', scene.lightMode, scene.skyMode, scene.altitudeMode);

        store.setLastUpdatedAt(new Date().toISOString());
      } catch (e) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : String(e);
        if (message === 'Location permission denied') {
          store.setLocationDenied(true);
        } else {
          store.setError(message);
          console.warn('[HERE & NOW] Bootstrap error:', message, e);
        }
      } finally {
        if (!cancelled) {
          store.setBootstrapping(false);
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);
}
