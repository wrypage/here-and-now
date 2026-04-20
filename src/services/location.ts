import * as Location from 'expo-location';
import { UserLocation } from '../types/location';
import { reverseGeocode } from './geocoding';

export async function getUserLocation(): Promise<UserLocation> {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    throw new Error('Location permission denied');
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const { latitude, longitude } = position.coords;
  const place = await reverseGeocode(latitude, longitude);

  return {
    latitude,
    longitude,
    city: place.city,
    region: place.region,
    country: place.country,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}
