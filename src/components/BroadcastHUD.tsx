import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { HUD, BROADCAST } from '../utils/constants';
import { TemperatureReadout } from './TemperatureReadout';
import { DataStrip } from './DataStrip';
import { SceneState } from '../types/scene';
import { UserLocation } from '../types/location';
import { CurrentWeather } from '../types/weather';

const SCREEN_W = Dimensions.get('window').width;
const HUD_H_PAD = HUD.paddingHorizontal;
const HUD_WIDTH = SCREEN_W - HUD_H_PAD * 2;

const CONDITION_LABELS: Record<SceneState['skyMode'], string> = {
  clear:          'Clear',
  'partly-cloudy':'Partly cloudy',
  overcast:       'Overcast',
  rain:           'Rain',
  storm:          'Thunderstorm',
  snow:           'Snow',
  fog:            'Fog',
};

type BroadcastHUDProps = {
  scene: SceneState;
  location: UserLocation;
  weather: CurrentWeather;
  updatedAt: Date;
  onWordmarkLongPress?: () => void;
};

export function BroadcastHUD({
  scene,
  location,
  weather,
  updatedAt,
  onWordmarkLongPress,
}: BroadcastHUDProps): React.ReactElement {
  const isOrbital = scene.altitudeMode === 'orbital';
  const cityLabel = location.region
    ? `${location.city}, ${location.region}`
    : location.city;

  // LIVE dot pulse — slower cadence during evening / overnight modes
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slow = isOrbital || scene.altitudeMode === 'ground-night';
  const pulseInterval = slow
    ? BROADCAST.liveBugPulseIntervalSlowMs
    : BROADCAST.liveBugPulseIntervalMs;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.2,
          duration: pulseInterval / 2,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: pulseInterval / 2,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseInterval]);

  if (isOrbital) {
    return (
      <View style={styles.container} pointerEvents="box-none">
        <View style={{ width: HUD_WIDTH, marginHorizontal: HUD_H_PAD }}>
          <Pressable onLongPress={onWordmarkLongPress} delayLongPress={3000}>
            <Text style={styles.wordmarkOrbital}>HERE & NOW</Text>
          </Pressable>
        </View>
        <View style={styles.spacer} />
        <View style={styles.hpad}>
          <DataStrip weather={weather} altitudeMode={scene.altitudeMode} updatedAt={updatedAt} />
        </View>
      </View>
    );
  }

  // ── Live broadcast ──────────────────────────────────────────────────────────
  //
  // Top block structure (paddingHorizontal: 20 constrains wordmark and LIVE
  // row to identical horizontal bounds — space-between pushes LIVE flush right):
  //
  //   HERE & NOW
  //   ROCHESTER, NY          LIVE ●
  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={{ width: HUD_WIDTH, marginHorizontal: HUD_H_PAD }}>
        <Pressable onLongPress={onWordmarkLongPress} delayLongPress={3000}>
          <Text style={styles.wordmark}>HERE & NOW</Text>
        </Pressable>
        <View style={[styles.metaRow, { width: HUD_WIDTH }]}>
          <Text style={styles.cityLabel}>{cityLabel.toUpperCase()}</Text>
          <View style={styles.liveBug}>
            <Animated.View style={[styles.liveDot, { opacity: pulseAnim }]} />
            <Text style={styles.liveLabel}>LIVE</Text>
          </View>
        </View>
      </View>

      <View style={styles.spacer} />

      <View style={[styles.hpad, styles.lowerThird]}>
        <TemperatureReadout temperatureC={weather.temperatureC} />
        <Text style={styles.conditionLine}>{CONDITION_LABELS[scene.skyMode]}</Text>
      </View>

      <View style={styles.hpad}>
        <DataStrip weather={weather} altitudeMode={scene.altitudeMode} updatedAt={updatedAt} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject as object,
    paddingTop: HUD.paddingTop,
    paddingBottom: HUD.paddingBottom,
    flexDirection: 'column',
  },
  hpad: {
    paddingHorizontal: HUD.paddingHorizontal,
  },
  wordmark: {
    ...typography.displayXL,
    color: colors.white,
    letterSpacing: 2,
  },
  wordmarkOrbital: {
    fontFamily: 'BCBarellTEST-Regular',
    fontSize: 20,
    lineHeight: 24,
    color: colors.white,
    letterSpacing: 2,
    opacity: 0.45,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  cityLabel: {
    fontFamily: 'AddressSansPro-Regular',
    fontSize: 15,
    lineHeight: 20,
    color: colors.white,
    opacity: 0.72,
    letterSpacing: 0.5,
  },
  liveBug: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.fireRed,
  },
  liveLabel: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: colors.fireRed,
    letterSpacing: 1.5,
  },
  spacer: {
    flex: 1,
  },
  lowerThird: {
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  conditionLine: {
    ...typography.bodyM,
    color: colors.white,
    opacity: 0.85,
    fontStyle: 'italic',
    marginTop: 4,
  },
});
