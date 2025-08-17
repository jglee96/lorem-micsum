import { AudioFormat, AudioKind, AudioNoiseColor } from "@/types/audio";
import { z } from "zod";

// 공통 필드들을 정의 (discriminatedUnion에서는 모든 필드가 필수여야 함)
const baseSchema = z.object({
  format: z.enum(Object.keys(AudioFormat), {
    message: "Format must be wav, mp3, opus, m4a, ogg, or webm",
  }),
  durationSec: z
    .number()
    .min(1, { message: "Duration must be at least 1 second" }),
  sampleRate: z.union([z.literal(44100), z.literal(48000)], {
    message: "Sample rate must be 44100 or 48000",
  }),
  channels: z.union([z.literal(1), z.literal(2)], {
    message: "Channels must be mono or stereo",
  }),
  title: z.string().min(1, { message: "Title is required" }),
  artist: z.string().min(1, { message: "Artist is required" }),
});

const silenceSchema = baseSchema.extend({
  kind: z.literal("silence"),
});

const sineSchema = baseSchema.extend({
  kind: z.literal("sine"),
  frequency: z.number().min(100).max(10000),
});

const noiseSchema = baseSchema.extend({
  kind: z.literal("noise"),
  noiseColor: z.enum(Object.keys(AudioNoiseColor)),
});

// discriminatedUnion 스키마
export const audioSchema = () =>
  z.discriminatedUnion("kind", [silenceSchema, sineSchema, noiseSchema]);

// 타입 정의
export type AudioSchemaType = z.infer<ReturnType<typeof audioSchema>>;

// 기본값들을 정의하는 함수
export const getDefaultFormState = (kind: AudioKind): AudioSchemaType => {
  const baseDefaults = {
    format: "wav" as const,
    durationSec: 5,
    sampleRate: 48000 as const,
    channels: 2 as const,
    title: "lorem-micsum audio",
    artist: "lorem-micsum",
  };

  switch (kind) {
    case "silence":
      return {
        ...baseDefaults,
        kind: "silence",
      };
    case "sine":
      return {
        ...baseDefaults,
        kind: "sine",
        frequency: 440,
      };
    case "noise":
      return {
        ...baseDefaults,
        kind: "noise",
        noiseColor: "white",
      };
    default:
      throw new Error(`Unknown kind: ${kind}`);
  }
};
