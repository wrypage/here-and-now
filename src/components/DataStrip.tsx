import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { HUD } from '../utils/constants';
import { formatWind, formatPressure, formatTime } from '../utils/units';
import { CurrentWeather } from '../types/weather';
import { AltitudeMode } from '../types/scene';
import { cToF } from '../utils/units';

type DataStripProps = {
  weather: CurrentWeather;
  altitudeMode: AltitudeMode;
  updatedAt: Date;
};

export function DataStrip({ weather, altitudeMode, updatedAt }: DataStripProps): React.ReactElement {
  const isOrbital = altitudeMode === 'orbital';
  const opacity = isOrbital ? HUD.dataStripOpacityOrbital : HUD.dataStripOpacity;

  if (isOrbital) {
    // Overnight minimal strip: temp | pressure | time
    return (
      <View style={[styles.strip, { opacity }]}>
        <Text style={styles.item}>{cToF(weather.temperatureC)}°F</Text>
        <Text style={styles.separator}>|</Text>
        <Text style={styles.item}>{formatPressure(weather.pressureHpa)}</Text>
        <Text style={styles.separator}>|</Text>
        <Text style={styles.item}>{formatTime(updatedAt)}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.strip, { opacity }]}>
      <Text style={styles.item}>WIND {formatWind(weather.windSpeedKph)}</Text>
      <Text style={styles.separator}>·</Text>
      <Text style={styles.item}>HUMIDITY {Math.round(weather.humidityPct)}%</Text>
      <Text style={styles.separator}>·</Text>
      <Text style={styles.item}>{formatPressure(weather.pressureHpa)}</Text>
      <Text style={styles.separator}>·</Text>
      <Text style={styles.item}>UPDATED {formatTime(updatedAt)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  item: {
    ...typography.monoS,
    color: colors.white,
    letterSpacing: 0.8,
  },
  separator: {
    ...typography.monoS,
    color: colors.white,
    opacity: 0.4,
  },
});
