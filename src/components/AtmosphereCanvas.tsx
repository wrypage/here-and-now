import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SceneState } from '../types/scene';
import { PRECIP, LIGHTNING, SKY, SATELLITE } from '../utils/constants';

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

// ─── Star field (orbital mode) ────────────────────────────────────────────────
//
// Fetches real star positions from Astrospheric API.
// Falls back to 200 deterministic dots if the API is unavailable.
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
    mag < 1 ? 3.5 :
    mag < 2 ? 2.5 :
    mag < 3 ? 1.8 :
    mag < 4 ? 1.2 : 0.8;
  const color =
    name === 'Moon'          ? '#fffff0' :
    PLANET_NAMES.has(name)   ? '#e8a020' :
    mag < 1.5                ? '#fff8e8' : '#ffffff';
  const baseOpacity = 0.6 + (5 - Math.min(mag, 5)) * 0.08;
  return { x, y, r, color, baseOpacity, isMoon: name === 'Moon' };
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

function StarFieldLayer({ latitude, longitude }: StarFieldLayerProps) {
  const [stars, setStars] = useState<StarPoint[]>(() =>
    starCache.data.length > 0 ? starCache.data : FALLBACK_STARS,
  );

  // Pre-allocate MAX_STARS animated values — stable across re-renders
  const twinkleAnims = useRef(
    Array.from({ length: MAX_STARS }, (_, i) =>
      new Animated.Value(FALLBACK_STARS[i % FALLBACK_STARS.length].baseOpacity),
    ),
  ).current;

  // Fetch from Astrospheric; fall back silently on any error
  useEffect(() => {
    const now = Date.now();
    if (starCache.data.length > 0 && now - starCache.ts < STAR_CACHE_TTL_MS) return;

    const url =
      `https://www.astrospheric.com/api/GetSky_V1` +
      `?Latitude=${latitude}&Longitude=${longitude}&Time=${now}`;

    fetch(url)
      .then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
      .then((raw: unknown) => {
        if (!Array.isArray(raw)) throw new Error('unexpected format');
        const mapped: StarPoint[] = (raw as Record<string, unknown>[])
          .filter((s) => (s.Altitude as number) > 0 && (s.Magnitude as number) < 5)
          .map((s) => {
            const pos = projectStar(s.Azimuth as number, s.Altitude as number);
            return buildStar(pos.x, pos.y, s.Magnitude as number, (s.Name as string) ?? '');
          })
          .slice(0, MAX_STARS);
        const result = mapped.length > 10 ? mapped : FALLBACK_STARS;
        starCache.ts = Date.now();
        starCache.data = result;
        setStars(result);
      })
      .catch(() => {
        // Cache the fallback to prevent thrashing a known-down API
        starCache.ts = Date.now();
        starCache.data = FALLBACK_STARS;
      });
  }, [latitude, longitude]);

  // Twinkle: restart animations whenever star data changes
  useEffect(() => {
    const anims = stars.slice(0, MAX_STARS).map((star, i) => {
      twinkleAnims[i].setValue(star.baseOpacity);
      const dur = 3000 + (i % 11) * 270; // 3000–5970 ms per star, staggered
      return Animated.loop(
        Animated.sequence([
          Animated.timing(twinkleAnims[i], {
            toValue: star.baseOpacity * 0.7,
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
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, [stars]);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {stars.slice(0, MAX_STARS).map((star, i) => {
        if (star.isMoon) {
          return (
            <View
              key={`s${i}`}
              style={{ position: 'absolute', left: star.x - 14, top: star.y - 14 }}
            >
              {/* Soft glow halo */}
              <View style={moonStyles.glow} />
              {/* Moon body */}
              <Animated.View style={[moonStyles.body, { opacity: twinkleAnims[i] }]} />
            </View>
          );
        }
        return (
          <Animated.View
            key={`s${i}`}
            style={{
              position: 'absolute',
              left: star.x - star.r,
              top: star.y - star.r,
              width: star.r * 2,
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

const moonStyles = StyleSheet.create({
  glow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,240,0.12)',
  },
  body: {
    position: 'absolute',
    left: 4,
    top: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fffff0',
  },
});

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
    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: isOrbital ? '#000008' : '#08090b' }]}>

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
        <StarFieldLayer latitude={latitude} longitude={longitude} />
      )}

      {/* Layer 2 — fog / haze overlay */}
      <FogOverlay fogOpacity={fogOpacity} hazeColor={scene.palette.haze} />

      {/* Layer 3 — precipitation */}
      {showRain && <RainLayer precipIntensity={precipIntensity} windEnergy={windEnergy} />}
      {showSnow && <SnowLayer precipIntensity={precipIntensity} />}

      {/* Layer 4 — lightning flash */}
      <LightningLayer lightningChance={lightningChance} />
    </View>
  );
}
