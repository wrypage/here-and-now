import { useMemo } from 'react';
import { useAppStore } from '../state/appStore';
import { SceneState } from '../types/scene';
import { mapWeatherToScene } from '../utils/sceneMapping';

/**
 * Derives the current SceneState from whatever WeatherPayload is in the store.
 * Memoized — only recalculates when weather changes.
 * Falls back to the store's persisted scene if weather is not yet loaded.
 */
export function useSceneState(): SceneState | null {
  const weather = useAppStore((s) => s.weather);
  const storedScene = useAppStore((s) => s.scene);

  const derivedScene = useMemo(() => {
    if (!weather) return null;
    const today = weather.daily[0];
    return mapWeatherToScene(weather.current, today, new Date());
  }, [weather]);

  return derivedScene ?? storedScene;
}
