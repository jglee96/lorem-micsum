import { bindFFmpegEvents, getFFmpeg } from "./ffmpeg";
import { VideoFormat, VideoSource } from "@/types/video";

export type VideoOptions = {
  kind: VideoSource;
  durationSec: number;
  format: VideoFormat;
  resolution?: string; // "1280x720" 형식
  framerate?: number; // 기본 30fps
  color?: string; // kind=color 일 때 색상 (예: red, blue, #RRGGBB)
  withAudio?: boolean; // 더미 오디오 포함 여부
};

type NormalizedVideoOptions = Required<
  Pick<VideoOptions, "kind" | "durationSec" | "format" | "resolution" | "framerate" | "withAudio">
> &
  Pick<VideoOptions, "color">;

type VideoCommandPlan = {
  outputName: string;
  tempFiles: string[];
  commands: string[][];
};

type ValidationOptions = {
  checkAudioAvailability?: boolean;
};

type VideoGenerationErrorCode =
  | "INVALID_OPTIONS"
  | "FFMPEG_EXIT"
  | "OUTPUT_READ";

export class VideoGenerationError extends Error {
  code: VideoGenerationErrorCode;
  details?: string;

  constructor(code: VideoGenerationErrorCode, message: string, details?: string) {
    super(message);
    this.name = "VideoGenerationError";
    this.code = code;
    this.details = details;
  }
}

const RESOLUTION_RE = /^\d+x\d+$/;
const AUDIO_SAMPLE_RATE = 48000;
const AUDIO_CHANNELS = 2;
const AUDIO_FREQUENCY = 440;
const VIDEO_TIMEOUT_PADDING_MS = 15000;
const VIDEO_TIMEOUT_PER_SECOND_MS = 4000;

const VIDEO_CODEC_ARGS: Record<VideoFormat, string[]> = {
  mp4: ["-c:v", "libx264", "-pix_fmt", "yuv420p", "-b:v", "500k"],
  webm: ["-c:v", "libvpx", "-b:v", "1M"],
  ogg: ["-c:v", "libtheora"],
};

const OUTPUT_CONTAINER_ARGS: Partial<Record<VideoFormat, string[]>> = {
  mp4: ["-movflags", "+faststart"],
};

const AUDIO_PREPASS: Record<
  VideoFormat,
  { extension: string; codecArgs: string[] }
> = {
  mp4: {
    extension: "m4a",
    codecArgs: [
      "-c:a",
      "aac",
      "-b:a",
      "64k",
      "-ar",
      String(AUDIO_SAMPLE_RATE),
      "-ac",
      String(AUDIO_CHANNELS),
      "-movflags",
      "+faststart",
    ],
  },
  webm: {
    extension: "webm",
    codecArgs: [
      "-c:a",
      "libopus",
      "-b:a",
      "96k",
      "-ar",
      String(AUDIO_SAMPLE_RATE),
      "-ac",
      String(AUDIO_CHANNELS),
      "-f",
      "webm",
    ],
  },
  ogg: {
    extension: "ogg",
    codecArgs: [
      "-c:a",
      "libvorbis",
      "-b:a",
      "96k",
      "-ar",
      String(AUDIO_SAMPLE_RATE),
      "-ac",
      String(AUDIO_CHANNELS),
    ],
  },
};

const AUDIO_MUX_SUPPORT: Record<VideoFormat, boolean> = {
  mp4: false,
  webm: false,
  ogg: false,
};

function getVideoInput(opts: NormalizedVideoOptions): string {
  if (opts.kind === "color") {
    return `color=c=${opts.color ?? "blue"}:s=${opts.resolution}:r=${opts.framerate}`;
  }

  return `${opts.kind}=s=${opts.resolution}:r=${opts.framerate}`;
}

export function isVideoAudioMuxSupported(format: VideoFormat): boolean {
  return AUDIO_MUX_SUPPORT[format];
}

export function validateVideoOptions(
  opts: VideoOptions,
  validationOptions: ValidationOptions = {}
): NormalizedVideoOptions {
  const { checkAudioAvailability = true } = validationOptions;
  const normalized: NormalizedVideoOptions = {
    ...opts,
    resolution: opts.resolution ?? "1280x720",
    framerate: opts.framerate ?? 30,
    withAudio: opts.withAudio ?? false,
  };

  if (!Number.isFinite(normalized.durationSec) || normalized.durationSec < 1) {
    throw new VideoGenerationError(
      "INVALID_OPTIONS",
      "Duration must be at least 1 second."
    );
  }

  if (!Number.isFinite(normalized.framerate) || normalized.framerate < 1) {
    throw new VideoGenerationError(
      "INVALID_OPTIONS",
      "Framerate must be a positive number."
    );
  }

  if (!RESOLUTION_RE.test(normalized.resolution)) {
    throw new VideoGenerationError(
      "INVALID_OPTIONS",
      "Resolution must use the WIDTHxHEIGHT format.",
      `Received: ${normalized.resolution}`
    );
  }

  const [width, height] = normalized.resolution.split("x").map(Number);
  if (!width || !height) {
    throw new VideoGenerationError(
      "INVALID_OPTIONS",
      "Resolution width and height must both be greater than zero."
    );
  }

  if (normalized.withAudio && !(normalized.format in AUDIO_PREPASS)) {
    throw new VideoGenerationError(
      "INVALID_OPTIONS",
      `Audio is not supported for the ${normalized.format} format.`
    );
  }

  if (
    checkAudioAvailability &&
    normalized.withAudio &&
    !isVideoAudioMuxSupported(normalized.format)
  ) {
    throw new VideoGenerationError(
      "INVALID_OPTIONS",
      "Audio-in-video export is temporarily unavailable while we validate a stable browser FFmpeg path."
    );
  }

  return normalized;
}

export function buildVideoCommandPlan(opts: VideoOptions): VideoCommandPlan {
  const normalized = validateVideoOptions(opts, {
    checkAudioAvailability: false,
  });
  const outputName = `lorem-micsum.${normalized.format}`;
  const videoInput = getVideoInput(normalized);

  if (!normalized.withAudio) {
    return {
      outputName,
      tempFiles: [],
      commands: [
        [
          "-f",
          "lavfi",
          "-t",
          String(normalized.durationSec),
          "-i",
          videoInput,
          ...VIDEO_CODEC_ARGS[normalized.format],
          "-loglevel",
          "info",
          ...OUTPUT_CONTAINER_ARGS[normalized.format] ?? [],
          outputName,
        ],
      ],
    };
  }

  const audioConfig = AUDIO_PREPASS[normalized.format];
  const tempAudioName = `lorem-micsum-audio.${audioConfig.extension}`;
  const audioSource = `sine=frequency=${AUDIO_FREQUENCY}:sample_rate=${AUDIO_SAMPLE_RATE}`;

  return {
    outputName,
    tempFiles: [tempAudioName],
    commands: [
      [
        "-f",
        "lavfi",
        "-t",
        String(normalized.durationSec),
        "-i",
        audioSource,
        ...audioConfig.codecArgs,
        tempAudioName,
      ],
      [
        "-f",
        "lavfi",
        "-t",
        String(normalized.durationSec),
        "-i",
        videoInput,
        "-i",
        tempAudioName,
        "-map",
        "0:v:0",
        "-map",
        "1:a:0",
        ...VIDEO_CODEC_ARGS[normalized.format],
        "-c:a",
        "copy",
        "-shortest",
        "-loglevel",
        "info",
        ...OUTPUT_CONTAINER_ARGS[normalized.format] ?? [],
        outputName,
      ],
    ],
  };
}

function getTimeoutMs(durationSec: number): number {
  return durationSec * VIDEO_TIMEOUT_PER_SECOND_MS + VIDEO_TIMEOUT_PADDING_MS;
}

async function execOrThrow(
  ffmpeg: Awaited<ReturnType<typeof getFFmpeg>>,
  args: string[],
  durationSec: number,
  logs: string[]
) {
  const exitCode = await ffmpeg.exec(args, getTimeoutMs(durationSec));
  if (exitCode !== 0) {
    throw new VideoGenerationError(
      "FFMPEG_EXIT",
      "FFmpeg could not complete the render command.",
      logs.slice(-12).join("\n")
    );
  }
}

export async function generateVideo(
  opts: VideoOptions,
  onProgress?: (p: number) => void
): Promise<{ blob: Blob; filename: string }> {
  const ffmpeg = await getFFmpeg();
  const normalized = validateVideoOptions(opts);
  const plan = buildVideoCommandPlan(normalized);
  const logs: string[] = [];
  const unbind = bindFFmpegEvents(ffmpeg, {
    onLog: (event) => {
      logs.push(event.message);
      console.log("FFmpeg log:", event);
    },
    onProgress: (event) => {
      if (onProgress) {
        onProgress(Math.max(0, Math.min(event.progress, 1)));
      }
      console.log("FFmpeg progress:", event);
    },
  });

  try {
    for (const args of plan.commands) {
      console.log("FFmpeg args:", args);
      await execOrThrow(ffmpeg, args, normalized.durationSec, logs);
    }

    const data = await ffmpeg.readFile(plan.outputName);
    const blob = new Blob([data as any], { type: mimeOf(normalized.format) });
    await ffmpeg.deleteFile(plan.outputName);
    for (const tempFile of plan.tempFiles) {
      try {
        await ffmpeg.deleteFile(tempFile);
      } catch {
        // no-op: temp file may already be gone after a failed command
      }
    }

    return { blob, filename: plan.outputName };
  } catch (error) {
    if (error instanceof VideoGenerationError) {
      throw error;
    }

    throw new VideoGenerationError(
      "OUTPUT_READ",
      "The rendered video could not be read from FFmpeg.",
      error instanceof Error ? error.message : String(error)
    );
  } finally {
    unbind();
  }
}

function mimeOf(fmt: VideoFormat): string {
  switch (fmt) {
    case "mp4":
      return "video/mp4";
    case "webm":
      return "video/webm";
    case "ogg":
      return "video/ogg";
    default:
      return "application/octet-stream";
  }
}
