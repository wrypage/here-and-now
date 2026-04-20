import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useBootstrapApp } from '../src/hooks/useBootstrapApp';
import { useWeatherData } from '../src/hooks/useWeatherData';
import { useRadarOverlay } from '../src/hooks/useRadarOverlay';
import { useAppStore } from '../src/state/appStore';
import { AtmosphereCanvas } from '../src/components/AtmosphereCanvas';
import { RadarOverlay } from '../src/components/RadarOverlay';
import { BroadcastHUD } from '../src/components/BroadcastHUD';
import { TuningPanel } from '../src/components/TuningPanel';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { spacing } from '../src/theme/spacing';
import { TINT } from '../src/utils/constants';
import { SceneState, AltitudeMode } from '../src/types/scene';
import { WeatherPayload } from '../src/types/weather';
import { getLightMode, getAltitudeMode } from '../src/utils/timeOfDay';
import { getPalette } from '../src/utils/color';
import { DEV_TUNING_MODE } from '../src/config/env';

// ─── Dev override application ─────────────────────────────────────────────────

function applyDevOverrides(
  scene: SceneState,
  forceAltitude: AltitudeMode | null,
  forceHour: number | null,
  weather: WeatherPayload | null,
): SceneState {
  if (!forceAltitude && forceHour === null) return scene;

  let s = { ...scene };

  if (forceHour !== null) {
    const fakeTime = new Date();
    fakeTime.setHours(forceHour, 0, 0, 0);
    const today = weather?.daily?.[0];
    const newLightMode = today
      ? getLightMode(fakeTime, today.sunrise, today.sunset)
      : scene.lightMode;
    const newAltitudeMode = forceAltitude ?? getAltitudeMode(forceHour);
    s = {
      ...s,
      lightMode: newLightMode,
      altitudeMode: newAltitudeMode,
      palette: getPalette(newLightMode, s.skyMode),
    };
  } else if (forceAltitude) {
    s = { ...s, altitudeMode: forceAltitude };
  }

  return s;
}

// ─── Channel screen ───────────────────────────────────────────────────────────

export function ChannelScreen(): React.ReactElement {
  useBootstrapApp();
  useWeatherData();
  useRadarOverlay();

  const [tuningOpen, setTuningOpen] = useState(DEV_TUNING_MODE);

  const {
    isBootstrapping,
    locationDenied,
    error,
    scene,
    location,
    weather,
    radar,
    lastUpdatedAt,
    devForceAltitude,
    devForceHour,
  } = useAppStore();

  // Apply dev overrides to produce the scene that components actually render
  const effectiveScene = useMemo(
    () =>
      scene ? applyDevOverrides(scene, devForceAltitude, devForceHour, weather) : null,
    [scene, devForceAltitude, devForceHour, weather],
  );

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isBootstrapping) {
    return (
      <View style={styles.fill}>
        <LinearGradient
          colors={['#000005', '#020210', '#0c0e1a']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <Text style={styles.loadingWordmark}>HERE & NOW</Text>
        <StatusBar style="light" />
      </View>
    );
  }

  // ── Location denied ────────────────────────────────────────────────────────
  if (locationDenied) {
    return (
      <View style={[styles.fill, styles.center]}>
        <LinearGradient
          colors={['#08090b', '#101418']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <Text style={styles.wordmarkSmall}>HERE & NOW</Text>
        <Text style={styles.statusText}>Location access required.</Text>
        <Text style={styles.statusTextSub}>
          Enable location in Settings to view your atmosphere.
        </Text>
        <StatusBar style="light" />
      </View>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error && !scene) {
    return (
      <View style={[styles.fill, styles.center]}>
        <LinearGradient
          colors={['#08090b', '#101418']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <Text style={styles.wordmarkSmall}>HERE & NOW</Text>
        <Text style={styles.statusText}>Unable to reach the atmosphere.</Text>
        <Text style={styles.statusTextSub}>{error}</Text>
        <StatusBar style="light" />
      </View>
    );
  }

  // ── Live broadcast ─────────────────────────────────────────────────────────
  if (!effectiveScene || !location || !weather) {
    return <View style={[styles.fill, { backgroundColor: colors.nearBlack }]} />;
  }

  const tintOpacity =
    effectiveScene.altitudeMode === 'orbital'          ? 0.15 :
    effectiveScene.skyMode === 'storm'                 ? TINT.stormOpacity :
    effectiveScene.lightMode === 'night' ||
    effectiveScene.lightMode === 'deep-night'          ? TINT.nightOpacity :
    TINT.defaultOpacity;

  const updatedAt = lastUpdatedAt ? new Date(lastUpdatedAt) : new Date();

  return (
    <View style={styles.fill}>
      <StatusBar style="light" />

      {/* Layer 1 — atmosphere (satellite or star field) */}
      <AtmosphereCanvas
        scene={effectiveScene}
        latitude={location.latitude}
        longitude={location.longitude}
      />

      {/* Layer 2 — radar */}
      {radar && (
        <RadarOverlay
          latitude={location.latitude}
          longitude={location.longitude}
          radar={radar}
        />
      )}

      {/* Layer 3 — tint scrim */}
      <View
        style={[StyleSheet.absoluteFillObject, { backgroundColor: `rgba(8,9,11,${tintOpacity})` }]}
        pointerEvents="none"
      />

      {/* Layer 3b — bottom gradient for data strip readability */}
      <LinearGradient
        colors={['transparent', 'rgba(8,9,11,0.72)']}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '24%' }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
      />

      {/* Layer 4 — broadcast HUD */}
      <BroadcastHUD
        scene={effectiveScene}
        location={location}
        weather={weather.current}
        updatedAt={updatedAt}
        onWordmarkLongPress={() => setTuningOpen(true)}
      />

      {/* Layer 5 — tuning panel (dev only, long press wordmark) */}
      {tuningOpen && <TuningPanel onClose={() => setTuningOpen(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: colors.nearBlack,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingWordmark: {
    ...typography.displayXL,
    color: colors.white,
    letterSpacing: 3,
    textAlign: 'center',
    opacity: 0.9,
  },
  wordmarkSmall: {
    ...typography.displayL,
    color: colors.white,
    letterSpacing: 3,
    marginBottom: spacing.lg,
    opacity: 0.8,
  },
  statusText: {
    ...typography.bodyM,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: spacing.sm,
  },
  statusTextSub: {
    ...typography.bodyS,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.45,
  },
});
