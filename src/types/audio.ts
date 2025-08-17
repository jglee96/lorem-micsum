export const AudioKind = {
  silence: "Silence",
  sine: "Sine (Beep)",
  noise: "Noise",
} as const;
export type AudioKind = keyof typeof AudioKind;

export const AudioFormatWithBitrate = {
  mp3: "mp3",
  m4a: "m4a (aac)",
  ogg: "ogg (vorbis)",
  opus: "opus",
  webm: "webm (opus)",
} as const;
export type AudioFormatWithBitrate = keyof typeof AudioFormatWithBitrate;

export const AudioFormat = {
  wav: "wav",
  ...AudioFormatWithBitrate,
} as const;
export type AudioFormat = keyof typeof AudioFormat;

export const AudioChannel = {
  1: "mono",
  2: "stereo",
} as const;
export type AudioChannel = keyof typeof AudioChannel;

export const AudioNoiseColor = {
  white: "white",
  pink: "pink",
  brown: "brown",
  blue: "blue",
  violet: "violet",
} as const;
export type AudioNoiseColor = keyof typeof AudioNoiseColor;
