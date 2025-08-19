export const VideoSource = {
  color: "color",
  testsrc: "testsrc",
  smptebars: "smptebars",
  testsrc2: "testsrc2",
} as const;
export type VideoSource = keyof typeof VideoSource;

export const VideoFormat = {
  mp4: "mp4",
  webm: "webm",
  ogg: "ogg",
} as const;
export type VideoFormat = keyof typeof VideoFormat;
