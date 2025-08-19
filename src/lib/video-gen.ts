import { getFFmpeg } from "./ffmpeg";
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

export async function generateVideo(
  opts: VideoOptions,
  onProgress?: (p: number) => void
): Promise<{ blob: Blob; filename: string }> {
  const ffmpeg = await getFFmpeg(onProgress);
  ffmpeg.on("log", (p) => {
    console.log("FFmpeg log:", p);
  });

  // 더 자세한 로그를 위해
  ffmpeg.on("progress", (p) => {
    console.log("FFmpeg progress:", p);
  });

  const resolution = opts.resolution ?? "1280x720";
  const framerate = opts.framerate ?? 30;
  const outName = `lorem-micsum.${opts.format}`;

  // 🎬 비디오 인풋 필터
  let videoInput = "";
  if (opts.kind === "color") {
    videoInput = `color=c=${
      opts.color ?? "blue"
    }:s=${resolution}:r=${framerate}`;
  } else {
    videoInput = `${opts.kind}=s=${resolution}:r=${framerate}`;
  }

  // 🛠️ args 배열 구성
  const args: string[] = [];

  if (opts.withAudio) {
    // 오디오가 포함된 경우: 두 개의 입력 스트림 사용
    args.push(
      "-f",
      "lavfi",
      "-t",
      String(opts.durationSec),
      "-i",
      videoInput,
      "-f",
      "lavfi",
      "-t",
      String(opts.durationSec),
      "-i",
      "sine=frequency=440:sample_rate=48000"
    );
  } else {
    // 비디오만 있는 경우
    args.push("-f", "lavfi", "-t", String(opts.durationSec), "-i", videoInput);
  }

  // 출력 코덱/컨테이너
  switch (opts.format) {
    case "mp4":
      args.push("-c:v", "libx264", "-pix_fmt", "yuv420p", "-b:v", "500k");
      if (opts.withAudio) {
        args.push(
          "-c:a",
          "aac",
          "-b:a",
          "64k",
          "-map",
          "0:v:0",
          "-map",
          "1:a:0"
        );
      }
      break;
    case "webm":
      args.push("-c:v", "libvpx", "-b:v", "1M");
      if (opts.withAudio) {
        args.push("-c:a", "libvorbis", "-map", "0:v:0", "-map", "1:a:0");
      }
      break;
    case "ogg":
      args.push("-c:v", "libtheora");
      if (opts.withAudio) {
        args.push("-c:a", "libvorbis", "-map", "0:v:0", "-map", "1:a:0");
      }
      break;
  }

  // 더 자세한 출력을 위해
  args.push("-loglevel", "info");

  // 출력 파일명
  args.push("-y", outName);

  console.log("FFmpeg args:", args);

  // 실행
  try {
    await ffmpeg.exec(args);
    console.log("FFmpeg exec completed");
  } catch (error) {
    console.error("FFmpeg exec error:", error);
    throw error;
  }

  // 결과 읽기
  try {
    console.log("Reading file:", outName);
    const data = await ffmpeg.readFile(outName);
    console.log("File read successful, data type:", typeof data);
    const blob = new Blob([data as Uint8Array], { type: mimeOf(opts.format) });
    console.log("Blob created, size:", blob.size);
    await ffmpeg.deleteFile(outName);
    console.log("File deleted");

    return { blob, filename: outName };
  } catch (error) {
    console.error("File read error:", error);
    throw error;
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
