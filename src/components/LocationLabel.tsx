import React from 'react';
import { Text } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { UserLocation } from '../types/location';

type LocationLabelProps = {
  location: UserLocation;
  style?: object;
};

export function LocationLabel({ location, style }: LocationLabelProps): React.ReactElement {
  const label = location.region
    ? `${location.city}, ${location.region}`
    : location.city;

  return (
    <Text style={[typography.labelM, { color: colors.white, opacity: 0.9 }, style]}>
      {label.toUpperCase()}
    </Text>
  );
}
