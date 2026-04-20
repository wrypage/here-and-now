import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { BROADCAST } from '../utils/constants';
import { AltitudeMode } from '../types/scene';

type LiveBugProps = {
  altitudeMode?: AltitudeMode;
};

export function LiveBug({ altitudeMode }: LiveBugProps): React.ReactElement {
  const opacity = useRef(new Animated.Value(1)).current;

  const slow = altitudeMode === 'ground-night' || altitudeMode === 'orbital';
  const interval = slow
    ? BROADCAST.liveBugPulseIntervalSlowMs
    : BROADCAST.liveBugPulseIntervalMs;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.2,
          duration: interval / 2,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1.0,
          duration: interval / 2,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [interval]);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.dot} />
      <Text style={styles.label}>LIVE</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.fireRed,
  },
  label: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: colors.fireRed,
    letterSpacing: 1.5,
  },
});
