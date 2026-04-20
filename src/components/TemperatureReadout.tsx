import React from 'react';
import { Text } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { formatTemp } from '../utils/units';

type TemperatureReadoutProps = {
  temperatureC: number;
  style?: object;
};

export function TemperatureReadout({ temperatureC, style }: TemperatureReadoutProps): React.ReactElement {
  return (
    <Text style={[typography.tempDisplay, { color: colors.white }, style]}>
      {formatTemp(temperatureC)}
    </Text>
  );
}
