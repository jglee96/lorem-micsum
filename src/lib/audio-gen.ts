import { getFFmpeg } from "./ffmpeg";

export type AudioKind = "silence" | "sine" | "noise";
export type AudioFormat = "wav" | "mp3" | "m4a" | "ogg" | "opus" | "webm";

export type GenOptions = {
  kind: AudioKind;
  durationSec: number; // 길이(초)
  format: AudioFormat; // 확장자
  sampleRate?: number; // 44100, 48000 ...
  channels?: 1 | 2; // 모노/스테레오
  frequency?: number; // sine 전용: Hz
  noiseColor?: "white" | "pink" | "brown" | "blue" | "violet"; // noise 전용
  bitrateK?: number; // 압축 포맷용 비트레이트(kbps) - mp3/aac 등
  title?: string; // 메타데이터
  artist?: string;
};

function buildInputFilter(opts: GenOptions) {
  const r = opts.sampleRate ?? 48000;
  const cl = (opts.channels ?? 2) === 2 ? "stereo" : "mono";

  switch (opts.kind) {
    case "silence":
      // 무음
      return `-f lavfi -t ${opts.durationSec} -i anullsrc=r=${r}:cl=${cl}`;
    case "sine": {
      const f = opts.frequency ?? 440;
      return `-f lavfi -t ${opts.durationSec} -i sine=frequency=${f}:sample_rate=${r}`;
    }
    case "noise": {
      const color = opts.noiseColor ?? "white";
      // anoisesrc: color=white|pink|brown|blue|violet
      return `-f lavfi -t ${
        opts.durationSec
      } -i anoisesrc=color=${color}:r=${r}:c=${cl === "stereo" ? 2 : 1}`;
    }
  }
}

function codecArgs(format: AudioFormat, bitrateK?: number): string {
  const b = bitrateK ?? 192;
  switch (format) {
    case "wav":
      return `-c:a pcm_s16le`;
    case "mp3":
      return `-c:a libmp3lame -b:a ${b}k`;
    case "m4a":
      // 컨테이너는 m4a, 코덱은 aac
      return `-c:a aac -b:a ${b}k -movflags +faststart`;
    case "ogg":
      return `-c:a libvorbis -b:a ${b}k`;
    case "opus":
      return `-c:a libopus -b:a ${b}k`;
    case "webm":
      return `-c:a libopus -b:a ${b}k -f webm`;
    default:
      return ``;
  }
}

function metadataArgs(title?: string, artist?: string): string[] {
  const parts: string[] = [];
  if (title) parts.push("-metadata", `title=${title}`);
  if (artist) parts.push("-metadata", `artist=${artist}`);
  return parts;
}

export async function generateAudio(
  opts: GenOptions,
  onProgress?: (p: number) => void
): Promise<{ blob: Blob; filename: string }> {
  console.log("generateAudio", opts);
  const ffmpeg = await getFFmpeg(onProgress);
  ffmpeg.on("log", ({ message }) => console.debug("[ffmpeg]", message));
  ffmpeg.on("progress", (p) => console.log("progress", p.progress));

  const input = buildInputFilter(opts);
  const codec = codecArgs(opts.format, opts.bitrateK);
  const meta = metadataArgs(opts.title, opts.artist);

  const outName = `lorem-micsum.${opts.format}`;

  // ffmpeg.run 에 인자를 배열로 넘겨도 되지만, 문자열 파싱이 더 편한 형태로 구성
  // 쉘은 아니므로 공백 단위 분해가 필요. 여기서는 간단히 split, 문자열 리터럴 처리된 부분 없음.
  const args = [
    ...input.split(" "),
    ...meta,
    "-ar",
    String(opts.sampleRate ?? 48000),
    "-ac",
    String(opts.channels ?? 2),
    ...codec.split(" "),
    outName,
  ].filter(Boolean);

  console.log("args", args);
  await ffmpeg.exec(args);
  const data = await ffmpeg.readFile(outName);
  const blob = new Blob([data as Uint8Array], { type: mimeOf(opts.format) });
  // 정리
  await ffmpeg.deleteFile(outName);
  return { blob, filename: outName };
}

function mimeOf(fmt: AudioFormat): string {
  switch (fmt) {
    case "wav":
      return "audio/wav";
    case "mp3":
      return "audio/mpeg";
    case "m4a":
      return "audio/mp4";
    case "ogg":
      return "audio/ogg";
    case "opus":
      return "audio/opus";
    case "webm":
      return "audio/webm";
    default:
      return "application/octet-stream";
  }
}
