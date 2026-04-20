import { create } from 'zustand';
import { UserLocation } from '../types/location';
import { WeatherPayload } from '../types/weather';
import { SceneState, AltitudeMode } from '../types/scene';
import { RadarOverlayState } from '../types/radar';
import { DEV_FORCE_ALTITUDE, DEV_FORCE_HOUR } from '../config/env';

type AppStore = {
  location: UserLocation | null;
  weather: WeatherPayload | null;
  scene: SceneState | null;
  radar: RadarOverlayState | null;

  isBootstrapping: boolean;
  locationDenied: boolean;
  lastUpdatedAt: string | null;
  error: string | null;

  // Dev / tuning overrides — initialized from env.ts, updated by TuningPanel at runtime
  devForceAltitude: AltitudeMode | null;
  devForceHour: number | null;

  setLocation: (location: UserLocation | null) => void;
  setWeather: (weather: WeatherPayload | null) => void;
  setScene: (scene: SceneState | null) => void;
  setRadar: (radar: RadarOverlayState | null) => void;
  setBootstrapping: (value: boolean) => void;
  setLocationDenied: (value: boolean) => void;
  setLastUpdatedAt: (value: string | null) => void;
  setError: (value: string | null) => void;
  setDevForceAltitude: (value: AltitudeMode | null) => void;
  setDevForceHour: (value: number | null) => void;
};

export const useAppStore = create<AppStore>((set) => ({
  location: null,
  weather: null,
  scene: null,
  radar: null,

  isBootstrapping: true,
  locationDenied: false,
  lastUpdatedAt: null,
  error: null,

  devForceAltitude: DEV_FORCE_ALTITUDE,
  devForceHour: DEV_FORCE_HOUR,

  setLocation: (location) => set({ location }),
  setWeather: (weather) => set({ weather }),
  setScene: (scene) => set({ scene }),
  setRadar: (radar) => set({ radar }),
  setBootstrapping: (isBootstrapping) => set({ isBootstrapping }),
  setLocationDenied: (locationDenied) => set({ locationDenied }),
  setLastUpdatedAt: (lastUpdatedAt) => set({ lastUpdatedAt }),
  setError: (error) => set({ error }),
  setDevForceAltitude: (devForceAltitude) => set({ devForceAltitude }),
  setDevForceHour: (devForceHour) => set({ devForceHour }),
}));
