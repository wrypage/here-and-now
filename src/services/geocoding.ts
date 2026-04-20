import * as Location from 'expo-location';

export async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<{ city: string; region?: string; country?: string }> {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
    const place = results[0];

    return {
      city: place?.city ?? place?.district ?? place?.name ?? 'Your Location',
      region: place?.region ?? undefined,
      country: place?.country ?? undefined,
    };
  } catch {
    return { city: 'Your Location' };
  }
}
