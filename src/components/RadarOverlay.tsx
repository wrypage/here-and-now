/**
 * RadarOverlay — pure Image tile implementation.
 *
 * Replaces the react-native-maps approach entirely. Maps SDKs on iOS always
 * render base-map chrome regardless of mapType or style overrides. This
 * implementation fetches radar tiles directly as Image components, positioned
 * via tile coordinate math. No MapView, no base map, no labels possible.
 *
 * Tile math uses the standard Web Mercator / Slippy Map scheme (XYZ).
 */

import React from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import { RadarOverlayState } from '../types/radar';
import { RADAR } from '../utils/constants';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

type RadarOverlayProps = {
  latitude: number;
  longitude: number;
  radar: RadarOverlayState;
};

// Z=6 is the maximum supported zoom for RainViewer free-tier radar tiles.
const TILE_ZOOM = 6;
// Degrees of longitude the screen represents (must match the atmospheric scene scale)
const REGION_DEG = 0.5;

// ── Tile coordinate math ──────────────────────────────────────────────────────

function latLonToTile(lat: number, lon: number, z: number): { x: number; y: number } {
  const n = Math.pow(2, z);
  const x = Math.floor(((lon + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n,
  );
  return { x, y };
}

// ── Component ─────────────────────────────────────────────────────────────────

export function RadarOverlay({
  latitude,
  longitude,
  radar,
}: RadarOverlayProps): React.ReactElement | null {
  if (!radar.enabled || radar.frames.length === 0) return null;

  const frame = radar.frames[radar.activeFrameIndex];
  if (!frame) return null;

  // Pixels per degree of longitude at this screen scale
  const pixPerDeg = SCREEN_W / REGION_DEG;

  // Geographic width of one tile in degrees of longitude
  const tileDeg = 360 / Math.pow(2, TILE_ZOOM);

  // Tile pixel size on screen (Web Mercator tiles are square in pixel space)
  const tilePx = tileDeg * pixPerDeg;

  // User's fractional position in tile space.
  // Longitude is linear so simple division works.
  // Latitude uses the full Mercator formula — linear-degree math introduces
  // significant vertical error (tiles appear shifted off the bottom edge).
  const n = Math.pow(2, TILE_ZOOM);
  const userTileX = ((longitude + 180) / 360) * n;
  const userLatRad = (latitude * Math.PI) / 180;
  const userTileY =
    ((1 - Math.log(Math.tan(userLatRad) + 1 / Math.cos(userLatRad)) / Math.PI) / 2) * n;

  // Center tile for the user's location
  const center = latLonToTile(latitude, longitude, TILE_ZOOM);

  // 3×3 grid — at Z=6 each tile is ~4400px on screen, so 3×3 covers fully.
  const images: React.ReactElement[] = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const tx = center.x + dx;
      const ty = center.y + dy;

      // Position the tile so the user's Mercator point maps exactly to screen centre.
      const left = SCREEN_W / 2 - (userTileX - tx) * tilePx;
      const top  = SCREEN_H / 2 - (userTileY - ty) * tilePx;

      const url = frame.tileUrlTemplate
        .replace('{z}', String(TILE_ZOOM))
        .replace('{x}', String(tx))
        .replace('{y}', String(ty));

      images.push(
        <Image
          key={`${tx}_${ty}`}
          source={{ uri: url }}
          style={{ position: 'absolute', left, top, width: tilePx, height: tilePx }}
          resizeMode="stretch"
          fadeDuration={0}
        />,
      );
    }
  }

  return (
    <View
      style={[styles.fill, { opacity: radar.opacity }]}
      pointerEvents="none"
    >
      {images}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
});
