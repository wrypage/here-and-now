export type SkyMode =
  | 'clear'
  | 'partly-cloudy'
  | 'overcast'
  | 'rain'
  | 'storm'
  | 'snow'
  | 'fog';

export type LightMode =
  | 'pre-dawn'
  | 'dawn'
  | 'day'
  | 'golden-hour'
  | 'dusk'
  | 'night'
  | 'deep-night';

export type AltitudeMode =
  | 'orbital'       // midnight–5am
  | 'sky'           // 5am–noon
  | 'ground-day'    // noon–6pm
  | 'ground-night'; // 6pm–midnight

export type SceneState = {
  skyMode: SkyMode;
  lightMode: LightMode;
  altitudeMode: AltitudeMode;
  intensity: number;        // 0..1 overall weather drama
  cloudDensity: number;     // 0..1
  windEnergy: number;       // 0..1
  precipType: 'none' | 'rain' | 'snow' | 'mixed';
  precipIntensity: number;  // 0..1
  fogOpacity: number;       // 0..1
  lightningChance: number;  // 0..1
  palette: {
    top: string;
    mid: string;
    bottom: string;
    haze: string;
  };
};
