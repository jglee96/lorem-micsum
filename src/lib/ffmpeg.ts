import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

type FFmpegBundle = {
  coreURL: string;
  wasmURL: string;
  workerURL?: string;
};

let _ffmpeg: FFmpeg | null = null;
let _loading: Promise<FFmpeg> | null = null;

const coreVersion = "0.12.6";

async function getBundle(mt: boolean): Promise<FFmpegBundle> {
  // 로컬 node_modules 안에 있는 ffmpeg core 파일들을 브라우저에서 직접 접근 가능하게 서빙하려면 dev server나 빌드 설정을 손대야 해서 번거롭다.
  // 따라서 브라우저에서 직접 접근 가능하게 서빙하는 CDN blob URL로 변환
  const base = `https://unpkg.com/@ffmpeg/core${
    mt ? "-mt" : ""
  }@${coreVersion}/dist/esm`;
  const coreURL = await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript");
  const wasmURL = await toBlobURL(
    `${base}/ffmpeg-core.wasm`,
    "application/wasm"
  );
  const workerURL = mt
    ? await toBlobURL(`${base}/ffmpeg-core.worker.js`, "text/javascript")
    : undefined;
  return { coreURL, wasmURL, workerURL };
}

export async function getFFmpeg(
  onProgress?: (ratio: number) => void
): Promise<FFmpeg> {
  if (_ffmpeg) return _ffmpeg;
  if (_loading) return _loading;

  _loading = (async () => {
    const ffmpeg = new FFmpeg();

    if (onProgress) ffmpeg.on("progress", (p) => onProgress(p.progress));

    // 1) 멀티스레드 시도
    try {
      const mt = await getBundle(true);
      await ffmpeg.load({
        coreURL: mt.coreURL,
        wasmURL: mt.wasmURL,
        workerURL: mt.workerURL,
      });
    } catch {
      // 2) 싱글스레드 폴백
      const st = await getBundle(false);
      await ffmpeg.load({
        coreURL: st.coreURL,
        wasmURL: st.wasmURL,
      });
    }

    _ffmpeg = ffmpeg;
    return ffmpeg;
  })();

  return _loading;
}
