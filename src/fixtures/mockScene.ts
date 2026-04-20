import { SceneState } from '../types/scene';

/** Clear morning — spec example 1 expected output */
export const mockSceneClearMorning: SceneState = {
  skyMode: 'clear',
  lightMode: 'day',
  altitudeMode: 'sky',
  intensity: 0.1,
  cloudDensity: 0.12,
  windEnergy: 0.1,
  precipType: 'none',
  precipIntensity: 0.0,
  fogOpacity: 0.0,
  lightningChance: 0.0,
  palette: {
    top:    '#4a90e2',
    mid:    '#8cc8ff',
    bottom: '#d9f0ff',
    haze:   'rgba(255,255,255,0.18)',
  },
};

/** Evening storm — spec example 4 expected output */
export const mockSceneEveningStorm: SceneState = {
  skyMode: 'storm',
  lightMode: 'night',
  altitudeMode: 'ground-night',
  intensity: 0.95,
  cloudDensity: 1.0,
  windEnergy: 0.73,
  precipType: 'rain',
  precipIntensity: 0.4,
  fogOpacity: 0.1,
  lightningChance: 0.85,
  palette: {
    top:    '#06080f',
    mid:    '#111723',
    bottom: '#1f2835',
    haze:   'rgba(80,100,130,0.20)',
  },
};
