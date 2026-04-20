import { LightMode, SkyMode } from '../types/scene';

export type Palette = {
  top: string;
  mid: string;
  bottom: string;
  haze: string;
};

// ─── Reference palettes from spec section 13 ─────────────────────────────────

const PALETTES: Partial<Record<LightMode, Partial<Record<SkyMode, Palette>>>> = {
  'pre-dawn': {
    clear: {
      top:    '#04060e',
      mid:    '#0a1020',
      bottom: '#181e30',
      haze:   'rgba(20,30,60,0.15)',
    },
    overcast: {
      top:    '#080a14',
      mid:    '#141820',
      bottom: '#202830',
      haze:   'rgba(30,40,55,0.20)',
    },
  },

  dawn: {
    clear: {
      top:    '#1a2a4a',
      mid:    '#c87941',
      bottom: '#f4c98a',
      haze:   'rgba(244,180,100,0.20)',
    },
    'partly-cloudy': {
      top:    '#1e2e50',
      mid:    '#a06030',
      bottom: '#d4a870',
      haze:   'rgba(210,160,80,0.22)',
    },
    overcast: {
      top:    '#2a3040',
      mid:    '#606878',
      bottom: '#8890a0',
      haze:   'rgba(150,160,180,0.25)',
    },
    rain: {
      top:    '#1e2434',
      mid:    '#4a5060',
      bottom: '#6a7080',
      haze:   'rgba(80,100,120,0.30)',
    },
    fog: {
      top:    '#2e3040',
      mid:    '#8890a0',
      bottom: '#b0b8c8',
      haze:   'rgba(200,210,220,0.50)',
    },
    snow: {
      top:    '#2a3040',
      mid:    '#707880',
      bottom: '#a0aab0',
      haze:   'rgba(200,210,220,0.35)',
    },
  },

  day: {
    clear: {
      top:    '#4a90e2',
      mid:    '#8cc8ff',
      bottom: '#d9f0ff',
      haze:   'rgba(255,255,255,0.18)',
    },
    'partly-cloudy': {
      top:    '#5a9fd4',
      mid:    '#a8cce0',
      bottom: '#ddeeff',
      haze:   'rgba(200,220,240,0.20)',
    },
    overcast: {
      top:    '#7a8a96',
      mid:    '#a8b4bc',
      bottom: '#c8d0d8',
      haze:   'rgba(180,190,200,0.25)',
    },
    rain: {
      top:    '#4a5a6a',
      mid:    '#6a7a8a',
      bottom: '#8a9aaa',
      haze:   'rgba(100,120,140,0.30)',
    },
    storm: {
      top:    '#1e2a38',
      mid:    '#384858',
      bottom: '#505f6f',
      haze:   'rgba(60,80,110,0.35)',
    },
    snow: {
      top:    '#6a7a8a',
      mid:    '#9eaebb',
      bottom: '#c8d5df',
      haze:   'rgba(220,230,240,0.35)',
    },
    fog: {
      top:    '#8a9296',
      mid:    '#b0b8bc',
      bottom: '#d0d8dc',
      haze:   'rgba(220,225,230,0.55)',
    },
  },

  'golden-hour': {
    clear: {
      top:    '#1a2040',
      mid:    '#c06030',
      bottom: '#f0a050',
      haze:   'rgba(230,130,40,0.22)',
    },
    'partly-cloudy': {
      top:    '#202845',
      mid:    '#a85030',
      bottom: '#e09050',
      haze:   'rgba(210,120,40,0.22)',
    },
    overcast: {
      top:    '#303840',
      mid:    '#6a7080',
      bottom: '#909898',
      haze:   'rgba(160,165,175,0.25)',
    },
    rain: {
      top:    '#242c38',
      mid:    '#4a5460',
      bottom: '#6a7480',
      haze:   'rgba(90,110,130,0.32)',
    },
    storm: {
      top:    '#141820',
      mid:    '#283040',
      bottom: '#384050',
      haze:   'rgba(50,70,100,0.35)',
    },
  },

  dusk: {
    clear: {
      top:    '#1a1a3a',
      mid:    '#8a4a2a',
      bottom: '#e8a060',
      haze:   'rgba(220,140,60,0.20)',
    },
    'partly-cloudy': {
      top:    '#1e1e3c',
      mid:    '#703a20',
      bottom: '#c08048',
      haze:   'rgba(190,120,50,0.22)',
    },
    overcast: {
      top:    '#28283a',
      mid:    '#505060',
      bottom: '#707080',
      haze:   'rgba(140,140,160,0.28)',
    },
    rain: {
      top:    '#1e2030',
      mid:    '#3a4050',
      bottom: '#505868',
      haze:   'rgba(70,90,110,0.32)',
    },
    storm: {
      top:    '#10121e',
      mid:    '#20283a',
      bottom: '#303848',
      haze:   'rgba(50,70,100,0.35)',
    },
    fog: {
      top:    '#202430',
      mid:    '#4a5060',
      bottom: '#808898',
      haze:   'rgba(160,170,190,0.40)',
    },
  },

  night: {
    clear: {
      top:    '#06080f',
      mid:    '#0d1220',
      bottom: '#1a2235',
      haze:   'rgba(20,30,60,0.15)',
    },
    'partly-cloudy': {
      top:    '#080a12',
      mid:    '#10182a',
      bottom: '#1e2838',
      haze:   'rgba(25,35,65,0.18)',
    },
    overcast: {
      top:    '#0a0c14',
      mid:    '#141822',
      bottom: '#202630',
      haze:   'rgba(30,35,50,0.22)',
    },
    rain: {
      top:    '#080c14',
      mid:    '#121820',
      bottom: '#1e2430',
      haze:   'rgba(50,70,90,0.25)',
    },
    storm: {
      top:    '#06080f',
      mid:    '#111723',
      bottom: '#1f2835',
      haze:   'rgba(80,100,130,0.20)',
    },
    snow: {
      top:    '#0c1018',
      mid:    '#1c2230',
      bottom: '#2e3848',
      haze:   'rgba(180,200,220,0.12)',
    },
    fog: {
      top:    '#101418',
      mid:    '#1c2028',
      bottom: '#2e3240',
      haze:   'rgba(160,170,190,0.30)',
    },
  },

  'deep-night': {
    clear: {
      top:    '#000005',
      mid:    '#020210',
      bottom: '#0a1a0a',
      haze:   'rgba(50,150,80,0.08)',
    },
    'partly-cloudy': {
      top:    '#010108',
      mid:    '#04060e',
      bottom: '#0a1010',
      haze:   'rgba(30,40,60,0.10)',
    },
    overcast: {
      top:    '#020408',
      mid:    '#06080e',
      bottom: '#0e1018',
      haze:   'rgba(20,25,40,0.15)',
    },
    rain: {
      top:    '#020408',
      mid:    '#080c14',
      bottom: '#141c28',
      haze:   'rgba(40,60,85,0.18)',
    },
    storm: {
      top:    '#000204',
      mid:    '#04080e',
      bottom: '#0e1420',
      haze:   'rgba(40,60,90,0.18)',
    },
    snow: {
      top:    '#020408',
      mid:    '#081020',
      bottom: '#1a2030',
      haze:   'rgba(140,160,190,0.10)',
    },
    fog: {
      top:    '#040608',
      mid:    '#0a0e14',
      bottom: '#141a20',
      haze:   'rgba(120,130,150,0.20)',
    },
  },
};

const FALLBACK: Palette = {
  top:    '#08090b',
  mid:    '#101418',
  bottom: '#1a1e28',
  haze:   'rgba(20,25,40,0.15)',
};

/**
 * Look up the sky palette for the given light and sky modes.
 * Degrades gracefully when no exact match exists.
 */
export function getPalette(lightMode: LightMode, skyMode: SkyMode): Palette {
  const byLight = PALETTES[lightMode];
  if (!byLight) return FALLBACK;

  const direct = byLight[skyMode];
  if (direct) return direct;

  // Graceful degradation
  if (skyMode === 'storm' && byLight['rain']) return byLight['rain']!;
  if (skyMode === 'rain' && byLight['storm']) return byLight['storm']!;
  if (skyMode === 'snow' && byLight['overcast']) return byLight['overcast']!;
  if (skyMode === 'fog' && byLight['overcast']) return byLight['overcast']!;
  if (skyMode === 'partly-cloudy' && byLight['clear']) return byLight['clear']!;
  if (skyMode === 'clear' && byLight['partly-cloudy']) return byLight['partly-cloudy']!;

  // Last resort: first defined entry for this light mode
  const first = Object.values(byLight)[0];
  return first ?? FALLBACK;
}
