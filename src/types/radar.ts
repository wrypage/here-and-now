export type RadarFrame = {
  timestamp: string;
  tileUrlTemplate: string;
};

export type RadarOverlayState = {
  enabled: boolean;
  opacity: number;
  frames: RadarFrame[];
  activeFrameIndex: number;
};
