import { useAppStore } from '../state/appStore';
import { UserLocation } from '../types/location';

/** Returns the current resolved location from the store. */
export function useCurrentLocation(): UserLocation | null {
  return useAppStore((s) => s.location);
}
