import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, G, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { SceneState } from '../types/scene';
import { PRECIP, LIGHTNING, SKY, SATELLITE, ORBITAL } from '../utils/constants';
import { STAR_CATALOG } from '../utils/starCatalog';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Satellite source probe ───────────────────────────────────────────────────
//
// Primary:  GOES-East ABI GeoColor via GIBS "best" endpoint.
//   "default" in the date slot serves the most recent available image
//   automatically — no capabilities XML fetch (which returns 400 on mobile).
//   GIBS REST WMTS URL order: {z}/{y}/{x}  (Y before X, per OGC spec).
//   Probes zoom levels 3–6 via HEAD and picks the first 200 response.
//
// Fallback: RainViewer satellite frames (weather-maps.json → satellite[]).
//   Tile URL order: {z}/{x}/{y}  (standard XYZ).

type SatState =
  | { source: 'geocolor'; zoom: number }
  | { source: 'rainviewer'; ts: number }
  | null;

// Module-level — shared across mounts so probing only happens once per TTL
let satState: SatState = null;
let satProbedAt = 0;

async function probeSatState(lat: number, lon: number): Promise<SatState> {
  // 1. Try GeoColor at zoom levels 3–6 (lower first = faster response)
  for (const z of [3, 4, 5, 6]) {
    const { x, y } = latLonToTile(lat, lon, z);
    const url =
      `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/GOES-East_ABI_GeoColor` +
      `/default/default/GoogleMapsCompatible_Level6/${z}/${y}/${x}.png`;
    try {
      const r = await fetch(url, { method: 'HEAD' });
      if (r.ok) return { source: 'geocolor', zoom: z };
    } catch {
      // network error for this zoom — move on silently
    }
  }

  // 2. Fall back to RainViewer satellite frames
  try {
    const r = await fetch('https://api.rainviewer.com/public/weather-maps.json');
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json() as Record<string, unknown>;
    const sat = data['satellite'];
    const frames: Array<{ time: number }> = Array.isArray(sat)
      ? (sat as Array<{ time: number }>)
      : Array.isArray((sat as { infrared?: unknown } | null)?.infrared)
        ? ((sat as { infrared: Array<{ time: number }> }).infrared)
        : [];
    if (!frames.length) throw new Error('no frames');
    const ts = frames[frames.length - 1].time;
    return { source: 'rainviewer', ts };
  } catch {
    // fall through to last resort
  }

  // 3. Last resort: GeoColor Z=6 anyway — gradient shows while tiles fail
  return { source: 'geocolor', zoom: 6 };
}

// ─── Tile math ───────────────────────────────────────────────────────────────

function latLonToTile(lat: number, lon: number, z: number): { x: number; y: number } {
  const n = Math.pow(2, z);
  const x = Math.floor(((lon + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n,
  );
  return { x, y };
}

// ─── Satellite base layer ─────────────────────────────────────────────────────
//
// Wrapped in React.memo so radar frame advances (every 600ms) don't cause
// this component to re-render and spam tile requests.

const SatelliteLayer = React.memo(function SatelliteLayer({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const [state, setState] = useState<SatState>(satState);

  // Probe once on mount; re-probe every 15 min via interval
  useEffect(() => {
    const now = Date.now();
    if (satState && now - satProbedAt < SATELLITE.sourceProbeTtlMs) {
      if (state !== satState) setState(satState);
      return;
    }
    probeSatState(latitude, longitude).then((s) => {
      satState = s;
      satProbedAt = Date.now();
      setState(s);
    });
    const id = setInterval(() => {
      probeSatState(latitude, longitude).then((s) => {
        satState = s;
        satProbedAt = Date.now();
        setState(s);
      });
    }, SATELLITE.sourceProbeTtlMs);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // One log per refresh cycle — fires when probe produces a new state
  useEffect(() => {
    if (!state) return;
    const z = state.source === 'geocolor' ? state.zoom : SATELLITE.tileZoom;
    const source = state.source === 'geocolor' ? 'GeoColor' : 'RainViewer';
    const ts = state.source === 'geocolor' ? 'default' : state.ts;
    console.log(
      `[satellite] Loading ${source} tiles — zoom ${z}, timestamp: ${ts}, 9 tiles requested`,
    );
  }, [state]);

  // Compute tile grid — only recalculates when source or location changes
  const images = useMemo(() => {
    const z = state?.source === 'geocolor' ? state.zoom : SATELLITE.tileZoom;
    const pixPerDeg = SCREEN_W / SATELLITE.regionDeg;
    const tileDeg = 360 / Math.pow(2, z);
    const tilePx = tileDeg * pixPerDeg;
    const n = Math.pow(2, z);
    const userTileX = ((longitude + 180) / 360) * n;
    const latRad = (latitude * Math.PI) / 180;
    const userTileY =
      ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
    const center = latLonToTile(latitude, longitude, z);
    const result: React.ReactElement[] = [];

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const tx = center.x + dx;
        const ty = center.y + dy;
        const left = SCREEN_W / 2 - (userTileX - tx) * tilePx;
        const top  = SCREEN_H / 2 - (userTileY - ty) * tilePx;

        const uri = state?.source === 'rainviewer'
          // RainViewer: standard XYZ order
          ? `https://tilecache.rainviewer.com/v2/satellite/${state.ts}/256/${z}/${tx}/${ty}/0/0_0.png`
          // GeoColor: GIBS REST uses {z}/{y}/{x}; "default" date → latest image
          : `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/GOES-East_ABI_GeoColor/default/default/GoogleMapsCompatible_Level6/${z}/${ty}/${tx}.png`;

        result.push(
          <Image
            key={`${tx}_${ty}`}
            source={{ uri }}
            style={{ position: 'absolute', left, top, width: tilePx, height: tilePx }}
            resizeMode="stretch"
            fadeDuration={0}
          />,
        );
      }
    }
    return result;
  }, [state, latitude, longitude]);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {images}
    </View>
  );
});

// ─── Star field coordinate math ──────────────────────────────────────────────

function raDecToAltAz(
  raDeg: number,
  decDeg: number,
  latDeg: number,
  lonDeg: number,
  date: Date,
): { alt: number; az: number } {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const gmst = (280.46061837 + 360.98564736629 * (jd - 2451545.0)) % 360;
  const lst = ((gmst + lonDeg) % 360 + 360) % 360;
  const ha = ((lst - raDeg) % 360 + 360) % 360;
  const [haR, decR, latR] = [ha, decDeg, latDeg].map((v) => (v * Math.PI) / 180);
  const sinAlt =
    Math.sin(decR) * Math.sin(latR) + Math.cos(decR) * Math.cos(latR) * Math.cos(haR);
  const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt))) * (180 / Math.PI);
  const cosAz =
    (Math.sin(decR) - Math.sin(latR) * sinAlt) /
    (Math.cos(latR) * Math.cos((alt * Math.PI) / 180));
  let az = Math.acos(Math.max(-1, Math.min(1, cosAz))) * (180 / Math.PI);
  if (Math.sin(haR) > 0) az = 360 - az;
  return { alt, az };
}

function buildCatalogStars(latDeg: number, lonDeg: number, date: Date): StarPoint[] {
  return STAR_CATALOG
    .filter((s) => s.name !== '')
    .map((s) => {
      const { alt, az } = raDecToAltAz(s.ra, s.dec, latDeg, lonDeg, date);
      if (alt < 0) return null;
      const pos = projectStar(az, alt);
      return buildStar(pos.x, pos.y, s.mag, s.name);
    })
    .filter((s): s is StarPoint => s !== null);
}

// ─── Star field (orbital mode) ────────────────────────────────────────────────
//
// Stars: computed on-device from bundled Hipparcos catalog (no network needed).
// Planets + Moon: fetched from visibleplanets.dev/v3.
// 10-minute module-level cache avoids repeat fetches across re-mounts.

type StarPoint = {
  x: number;
  y: number;
  r: number;
  color: string;
  baseOpacity: number;
  isMoon: boolean;
};

const PLANET_NAMES = new Set([
  'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune',
]);
const MAX_STARS = 200;
const STAR_CACHE_TTL_MS = 10 * 60 * 1000;

// Spectral color lookup for named stars
const STAR_COLOR_MAP: Record<string, string> = {
  Betelgeuse: '#ffaa44', Aldebaran: '#ffaa44', Antares: '#ffaa44',
  Rigel: '#cce0ff', Vega: '#cce0ff', Sirius: '#cce0ff', Deneb: '#cce0ff',
  Capella: '#ffddaa', Arcturus: '#ffddaa', Pollux: '#ffddaa',
};

function getStarColor(name: string, mag: number): string {
  if (name === 'Moon')           return '#fffde8';
  if (PLANET_NAMES.has(name))    return '#e8a020';
  if (STAR_COLOR_MAP[name])      return STAR_COLOR_MAP[name];
  if (mag < 1.5)                 return '#fff8f0';
  if (mag < 3)                   return '#ffffff';
  return 'rgba(255,255,255,0.85)';
}

// Moon phase — Julian date method, no API needed
// Reference new moon: 2451550.1 (Jan 6 2000 18:14 UTC)
const SYNODIC_PERIOD = 29.53058867;
const NEW_MOON_JD    = 2451550.1;

function computeMoonPhase(date: Date): number {
  const jd = date.getTime() / 86400000 + 2440587.5;
  return (((jd - NEW_MOON_JD) % SYNODIC_PERIOD) + SYNODIC_PERIOD) % SYNODIC_PERIOD / SYNODIC_PERIOD;
}

// SVG path for the shadow region on a moon disc of radius R
// phase 0=new, 0.5=full; shadow covers the unlit side
function moonShadowPath(phase: number, R: number): string {
  const tx    = R * Math.cos(2 * Math.PI * phase);
  const absT  = Math.max(0.5, Math.abs(tx));
  if (phase < 0.5) {
    // Waxing — right side lit, shadow on left
    const sw = tx > 0 ? 1 : 0;
    return `M 0 ${-R} A ${R} ${R} 0 0 0 0 ${R} A ${absT} ${R} 0 0 ${sw} 0 ${-R} Z`;
  } else {
    // Waning — left side lit, shadow on right
    const sw = tx < 0 ? 0 : 1;
    return `M 0 ${-R} A ${R} ${R} 0 0 1 0 ${R} A ${absT} ${R} 0 0 ${sw} 0 ${-R} Z`;
  }
}

// Module-level cache so re-mounts (mode switching) don't re-fetch
const starCache: { ts: number; data: StarPoint[] } = { ts: 0, data: [] };

function projectStar(azDeg: number, altDeg: number): { x: number; y: number } {
  const az = (azDeg * Math.PI) / 180;
  const r = (90 - altDeg) / 90;
  return {
    x: SCREEN_W / 2 + r * (SCREEN_W / 2) * Math.sin(az),
    y: SCREEN_H / 2 - r * (SCREEN_H / 2) * Math.cos(az),
  };
}

function buildStar(
  x: number,
  y: number,
  mag: number,
  name: string,
): StarPoint {
  const r =
    mag < 1 ? 5.0 :
    mag < 2 ? 3.5 :
    mag < 3 ? 2.5 :
    mag < 4 ? 1.8 : 1.2;
  const baseOpacity =
    mag < 1 ? 1.00 :
    mag < 2 ? 0.85 :
    mag < 3 ? 0.75 :
    mag < 4 ? 0.65 : 0.60;
  return { x, y, r, color: getStarColor(name, mag), baseOpacity, isMoon: name === 'Moon' };
}

// Deterministic fallback: 200 stars scattered via golden-angle distribution
const FALLBACK_STARS: StarPoint[] = Array.from({ length: 200 }, (_, i) => {
  const phi = i * 2.39996; // golden angle in radians
  const rho = Math.sqrt((i + 1) / 200);
  const cx = SCREEN_W / 2 + rho * SCREEN_W * 0.46 * Math.cos(phi);
  const cy = SCREEN_H * 0.08 + rho * SCREEN_H * 0.72 * Math.abs(Math.sin(phi + 0.3));
  const mag = 0.5 + (i % 45) * 0.1;
  return buildStar(cx, cy, mag, '');
});

type StarFieldLayerProps = {
  latitude: number;
  longitude: number;
};

// Per-star twinkle durations — seeded deterministically so they survive re-renders
// Bright stars (mag < 2): 4000–7000ms slow; faint (mag >= 3): 2000–3500ms fast
function twinkleDuration(mag: number, seed: number): number {
  const rng = ((seed * 1664525 + 1013904223) & 0x7fffffff) / 0x7fffffff;
  if (mag < 2)  return 4000 + rng * 3000;
  if (mag < 3)  return 3000 + rng * 2000;
  return 2000 + rng * 1500;
}

// Starting phase offset so stars don't all pulse in sync
function twinklePhaseOffset(seed: number): number {
  return ((seed * 22695477 + 1) & 0x7fffffff) / 0x7fffffff;
}

const MOON_R     = 28;  // moon body radius px
const MOON_GLOW  = 48;  // glow halo radius px

function StarFieldLayer({ latitude, longitude }: StarFieldLayerProps) {
  const [stars, setStars] = useState<StarPoint[]>(() =>
    starCache.data.length > 0 ? starCache.data : FALLBACK_STARS,
  );

  // Moon phase — computed once, stable for the 10-min cache lifetime
  const moonPhase = useMemo(() => {
    const p = computeMoonPhase(new Date());
    const label =
      p < 0.03 || p > 0.97 ? 'new moon'      :
      p < 0.22             ? 'waxing crescent':
      p < 0.28             ? 'first quarter'  :
      p < 0.47             ? 'waxing gibbous' :
      p < 0.53             ? 'full moon'      :
      p < 0.72             ? 'waning gibbous' :
      p < 0.78             ? 'last quarter'   : 'waning crescent';
    console.log(`[starfield] moon phase: ${p.toFixed(2)} (${label})`);
    return p;
  }, []);

  // Pre-allocate MAX_STARS animated values — stable across re-renders
  const twinkleAnims = useRef(
    Array.from({ length: MAX_STARS }, (_, i) =>
      new Animated.Value(FALLBACK_STARS[i % FALLBACK_STARS.length].baseOpacity),
    ),
  ).current;

  // Build from catalog immediately, then overlay real planets from visibleplanets.dev
  useEffect(() => {
    const now = Date.now();
    if (starCache.data.length > 0 && now - starCache.ts < STAR_CACHE_TTL_MS) return;

    const catalogStars = buildCatalogStars(latitude, longitude, new Date());
    console.log('[starfield] catalog stars above horizon:', catalogStars.length);

    const preliminary = catalogStars.length > 5 ? catalogStars : FALLBACK_STARS;
    setStars(preliminary.slice(0, MAX_STARS));

    const url = `https://api.visibleplanets.dev/v3?latitude=${latitude}&longitude=${longitude}`;
    console.log('[starfield] fetching planets:', url);
    fetch(url)
      .then((r) => {
        console.log('[starfield] planets HTTP status:', r.status);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<{ data: Array<{ name: string; altitude: number; azimuth: number; magnitude: number; aboveHorizon: boolean }> }>;
      })
      .then(({ data }) => {
        const planetStars: StarPoint[] = data
          .filter((p) => p.aboveHorizon && p.magnitude < 5)
          .map((p) => {
            const pos = projectStar(p.azimuth, p.altitude);
            return buildStar(pos.x, pos.y, p.magnitude, p.name);
          });
        console.log('[starfield] planets/Moon above horizon:', planetStars.length);
        const combined = [...planetStars, ...catalogStars].slice(0, MAX_STARS);
        starCache.ts = Date.now();
        starCache.data = combined;
        setStars(combined);
      })
      .catch((err) => {
        console.warn('[starfield] planet fetch failed:', String(err), '— using catalog only');
        starCache.ts = Date.now();
        starCache.data = preliminary;
      });
  }, [latitude, longitude]);

  // Per-star independent twinkle — random duration, random phase offset
  useEffect(() => {
    const anims = stars.slice(0, MAX_STARS).map((star, i) => {
      if (star.isMoon) {
        twinkleAnims[i].setValue(1);
        return null;
      }
      const dur    = twinkleDuration(star.r, i * 31 + 7);   // r as proxy for mag
      const offset = twinklePhaseOffset(i * 17 + 3);
      // Start at a random point in the cycle via initial value
      const startOpacity = star.baseOpacity * (0.6 + offset * 0.4);
      twinkleAnims[i].setValue(startOpacity);
      return Animated.loop(
        Animated.sequence([
          Animated.timing(twinkleAnims[i], {
            toValue: star.baseOpacity * 0.6,
            duration: dur * (1 - offset),
            useNativeDriver: true,
          }),
          Animated.timing(twinkleAnims[i], {
            toValue: star.baseOpacity,
            duration: dur * offset,
            useNativeDriver: true,
          }),
          Animated.timing(twinkleAnims[i], {
            toValue: star.baseOpacity * 0.6,
            duration: dur,
            useNativeDriver: true,
          }),
          Animated.timing(twinkleAnims[i], {
            toValue: star.baseOpacity,
            duration: dur,
            useNativeDriver: true,
          }),
        ]),
      );
    });
    anims.forEach((a) => a?.start());
    return () => anims.forEach((a) => a?.stop());
  }, [stars]);

  const shadowD = moonShadowPath(moonPhase, MOON_R);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {stars.slice(0, MAX_STARS).map((star, i) => {
        if (star.isMoon) {
          return (
            <View
              key={`s${i}`}
              style={{ position: 'absolute', left: star.x - MOON_GLOW, top: star.y - MOON_GLOW }}
            >
              <Svg width={MOON_GLOW * 2} height={MOON_GLOW * 2}>
                <Path
                  d={`M ${MOON_GLOW} ${MOON_GLOW} m 0 ${-MOON_R} a ${MOON_R} ${MOON_R} 0 1 0 0 ${MOON_R * 2} a ${MOON_R} ${MOON_R} 0 1 0 0 ${-MOON_R * 2} Z`}
                  fill="#fffde8"
                />
                <G transform={`translate(${MOON_GLOW}, ${MOON_GLOW})`}>
                  <Path d={shadowD} fill="#00040f" opacity={0.92} />
                </G>
              </Svg>
            </View>
          );
        }
        return (
          <Animated.View
            key={`s${i}`}
            style={{
              position: 'absolute',
              left: star.x - star.r,
              top:  star.y - star.r,
              width:  star.r * 2,
              height: star.r * 2,
              borderRadius: star.r,
              backgroundColor: star.color,
              opacity: twinkleAnims[i],
            }}
          />
        );
      })}
    </View>
  );
}


// ─── Earth limb arc (orbital mode) ───────────────────────────────────────────
//
// Three-layer construct: filled Earth body below the arc, atmospheric glow
// LinearGradient fading upward from the limb, and a thin arc stroke on top.
// Renders order: glow → Earth body → arc line (so Earth body covers glow overflow).

function EarthLimbLayer() {
  const arcY = SCREEN_H * ORBITAL.limbArcFraction;
  const dip  = ORBITAL.limbArcDipPx;
  const oh   = ORBITAL.limbArcOverhangPx;

  const arcD  = `M ${-oh} ${arcY + dip} Q ${SCREEN_W / 2} ${arcY} ${SCREEN_W + oh} ${arcY + dip}`;
  const bodyD = `${arcD} L ${SCREEN_W + oh} ${SCREEN_H + 20} L ${-oh} ${SCREEN_H + 20} Z`;

  return (
    <Svg style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Path d={bodyD} fill={ORBITAL.limbFillColor} />
      <Path
        d={arcD}
        stroke={ORBITAL.limbLineColor}
        strokeWidth={ORBITAL.limbLineWidth}
        strokeOpacity={ORBITAL.limbLineOpacity}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ─── Deep space radial depth (orbital mode) ───────────────────────────────────
//
// A very subtle radial gradient from screen centre giving a sense of depth —
// the cosmos is slightly brighter in the middle, fading to near-black at edges.

function SpaceDepthLayer() {
  return (
    <Svg style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Defs>
        <RadialGradient
          id="spaceDepth"
          cx="50%"
          cy="50%"
          r="55%"
          gradientUnits="objectBoundingBox"
        >
          <Stop offset="0"   stopColor="rgb(10,20,60)" stopOpacity="0.4" />
          <Stop offset="1"   stopColor="rgb(0,4,15)"   stopOpacity="0"   />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width={SCREEN_W} height={SCREEN_H} fill="url(#spaceDepth)" />
    </Svg>
  );
}

// ─── Rain ──────────────────────────────────────────────────────────────────────

type RainLayerProps = {
  precipIntensity: number;
  windEnergy: number;
};

function RainLayer({ precipIntensity, windEnergy }: RainLayerProps) {
  const dropAngle = PRECIP.rainAngleDeg - windEnergy * 8;

  const dropAnims = useRef(
    Array.from({ length: PRECIP.rainDropCount }, () =>
      new Animated.Value(Math.random()),
    ),
  ).current;

  useEffect(() => {
    const animations = dropAnims.map((anim, i) => {
      const duration = PRECIP.rainFallDuration + (i % 7) * 55;
      return Animated.loop(
        Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
      );
    });
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, []);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {dropAnims.map((anim, i) => {
        const x = (i * 37 + 11) % SCREEN_W;
        const translateY = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [-PRECIP.rainDropHeight * 2, SCREEN_H + PRECIP.rainDropHeight],
        });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: 0,
              width: PRECIP.rainDropWidth,
              height: PRECIP.rainDropHeight,
              backgroundColor: 'rgba(190,215,240,0.70)',
              transform: [{ translateY }, { rotate: `${dropAngle}deg` }],
              opacity: PRECIP.rainDropOpacity * precipIntensity,
            }}
          />
        );
      })}
    </View>
  );
}

// ─── Snow ──────────────────────────────────────────────────────────────────────

type SnowLayerProps = {
  precipIntensity: number;
};

function SnowLayer({ precipIntensity }: SnowLayerProps) {
  const fallAnims = useRef(
    Array.from({ length: PRECIP.snowFlakeCount }, () => new Animated.Value(Math.random())),
  ).current;
  const swayAnims = useRef(
    Array.from({ length: PRECIP.snowFlakeCount }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    const fallA = fallAnims.map((anim, i) =>
      Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration: PRECIP.snowFallDuration + (i % 9) * 200,
          useNativeDriver: true,
        }),
      ),
    );
    const swayA = swayAnims.map((anim, i) => {
      const d = 1800 + (i % 5) * 300;
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: d, useNativeDriver: true }),
          Animated.timing(anim, { toValue: -1, duration: d, useNativeDriver: true }),
        ]),
      );
    });
    [...fallA, ...swayA].forEach((a) => a.start());
    return () => [...fallA, ...swayA].forEach((a) => a.stop());
  }, []);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {fallAnims.map((fallAnim, i) => {
        const baseX = (i * 19 + 7) % SCREEN_W;
        const translateY = fallAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-PRECIP.snowFlakeSize, SCREEN_H + PRECIP.snowFlakeSize],
        });
        const translateX = swayAnims[i].interpolate({
          inputRange: [-1, 1],
          outputRange: [-PRECIP.snowDriftAmplitude, PRECIP.snowDriftAmplitude],
        });
        const size = PRECIP.snowFlakeSize * (0.6 + (i % 5) * 0.15);
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: baseX,
              top: 0,
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: 'rgba(238,246,255,0.88)',
              opacity: 0.65 * precipIntensity,
              transform: [{ translateY }, { translateX }],
            }}
          />
        );
      })}
    </View>
  );
}

// ─── Fog overlay ──────────────────────────────────────────────────────────────

type FogOverlayProps = {
  fogOpacity: number;
  hazeColor: string;
};

function FogOverlay({ fogOpacity, hazeColor }: FogOverlayProps) {
  if (fogOpacity <= 0) return null;
  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,
        { backgroundColor: hazeColor, opacity: fogOpacity * SKY.fogOpacityMax },
      ]}
    />
  );
}

// ─── Lightning flash ──────────────────────────────────────────────────────────

type LightningLayerProps = {
  lightningChance: number;
};

function LightningLayer({ lightningChance }: LightningLayerProps) {
  const flashOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (lightningChance <= 0.5) return;
    let timeout: ReturnType<typeof setTimeout>;

    function scheduleFlash() {
      const interval =
        LIGHTNING.minIntervalMs +
        Math.random() * (LIGHTNING.maxIntervalMs - LIGHTNING.minIntervalMs);
      timeout = setTimeout(() => {
        Animated.sequence([
          Animated.timing(flashOpacity, {
            toValue: LIGHTNING.flashOpacity * lightningChance,
            duration: LIGHTNING.flashDuration,
            useNativeDriver: true,
          }),
          Animated.timing(flashOpacity, {
            toValue: 0,
            duration: LIGHTNING.flashDuration,
            useNativeDriver: true,
          }),
        ]).start(() => scheduleFlash());
      }, interval);
    }

    scheduleFlash();
    return () => {
      clearTimeout(timeout);
      flashOpacity.setValue(0);
    };
  }, [lightningChance]);

  if (lightningChance <= 0.5) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,
        { backgroundColor: 'rgba(195,210,255,1)', opacity: flashOpacity },
      ]}
    />
  );
}

// ─── AtmosphereCanvas ─────────────────────────────────────────────────────────

type AtmosphereCanvasProps = {
  scene: SceneState;
  latitude: number;
  longitude: number;
};

export function AtmosphereCanvas({
  scene,
  latitude,
  longitude,
}: AtmosphereCanvasProps): React.ReactElement {
  const { altitudeMode, precipType, precipIntensity, fogOpacity, lightningChance, windEnergy } =
    scene;

  const isOrbital = altitudeMode === 'orbital';
  const showRain = (precipType === 'rain' || precipType === 'mixed') && precipIntensity > 0;
  const showSnow = (precipType === 'snow' || precipType === 'mixed') && precipIntensity > 0;

  return (
    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: isOrbital ? '#00040f' : '#08090b' }]}>

      {/* Layer 1 — base imagery */}
      {!isOrbital && (
        <>
          {/* Gradient sky — visible immediately while tiles load; also the
              emergency fallback if all satellite sources fail */}
          <LinearGradient
            colors={[scene.palette.top, scene.palette.mid, scene.palette.bottom]}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            pointerEvents="none"
          />
          {/* GeoColor satellite tiles render on top of the gradient */}
          <SatelliteLayer latitude={latitude} longitude={longitude} />
          {/* Brightness lift — GeoColor over heavily overcast regions renders near-black */}
          <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
          />
        </>
      )}
      {isOrbital && (
        <>
          <SpaceDepthLayer />
          <StarFieldLayer latitude={latitude} longitude={longitude} />
          <EarthLimbLayer />
        </>
      )}

      {/* Layers 2–4: weather effects — never shown in orbital (space has no weather) */}
      {!isOrbital && <FogOverlay fogOpacity={fogOpacity} hazeColor={scene.palette.haze} />}
      {!isOrbital && showRain && <RainLayer precipIntensity={precipIntensity} windEnergy={windEnergy} />}
      {!isOrbital && showSnow && <SnowLayer precipIntensity={precipIntensity} />}

      {!isOrbital && <LightningLayer lightningChance={lightningChance} />}
    </View>
  );
}
