import { useEffect, useRef } from 'react';
import { useAppStore } from '../state/appStore';
import { REFRESH } from '../utils/constants';

/**
 * Advances the radar frame index on an interval,
 * creating the animation effect of precipitation moving across the scene.
 */
export function useRadarOverlay(): void {
  const radar = useAppStore((s) => s.radar);
  const setRadar = useAppStore((s) => s.setRadar);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!radar || radar.frames.length < 2) return;

    intervalRef.current = setInterval(() => {
      const current = useAppStore.getState().radar;
      if (!current || current.frames.length === 0) return;
      setRadar({
        ...current,
        activeFrameIndex: (current.activeFrameIndex + 1) % current.frames.length,
      });
    }, REFRESH.radarFrameIntervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [radar?.frames.length]);
}
