/**
 * Radar service — provider-isolated.
 * Phase 1 uses RainViewer (free, no API key).
 * To swap providers: update only this file.
 */

import { z } from 'zod';
import { RadarOverlayState } from '../types/radar';
import { RADAR_FRAMES_URL, RADAR_TILE_BASE } from '../config/env';
import { RADAR } from '../utils/constants';

const rainViewerSchema = z.object({
  host: z.string(),
  radar: z.object({
    past: z.array(z.object({
      time: z.number(),
      path: z.string(),
    })),
    nowcast: z.array(z.object({
      time: z.number(),
      path: z.string(),
    })).optional().default([]),
  }),
});

export async function getRadarOverlay(
  _lat: number,
  _lon: number,
): Promise<RadarOverlayState> {
  try {
    const response = await fetch(RADAR_FRAMES_URL);
    if (!response.ok) {
      throw new Error(`Radar fetch failed: ${response.status}`);
    }

    const json = await response.json();
    const parsed = rainViewerSchema.parse(json);

    // Use the last 6 past frames for animation
    const pastFrames = parsed.radar.past.slice(-6);

    const frames = pastFrames.map((frame) => ({
      timestamp: String(frame.time),
      // 256px tiles, color scheme 2 (standard precip), options 0_0 = no labels, no smoothing overlay
      tileUrlTemplate: `${parsed.host}${frame.path}/256/{z}/{x}/{y}/2/0_0.png`,
    }));

    return {
      enabled: frames.length > 0,
      opacity: RADAR.defaultOpacity,
      frames,
      activeFrameIndex: frames.length > 0 ? frames.length - 1 : 0,
    };
  } catch {
    // Fail silently — RadarOverlay renders nothing when frames is empty
    return {
      enabled: false,
      opacity: RADAR.defaultOpacity,
      frames: [],
      activeFrameIndex: 0,
    };
  }
}
