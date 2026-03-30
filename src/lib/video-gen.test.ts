import { describe, expect, it } from "vitest";

import {
  VideoGenerationError,
  buildVideoCommandPlan,
  isVideoAudioMuxSupported,
  validateVideoOptions,
} from "@/lib/video-gen";

describe("video command planning", () => {
  it("builds a direct render command for video-only mp4", () => {
    const plan = buildVideoCommandPlan({
      kind: "testsrc",
      durationSec: 5,
      format: "mp4",
      resolution: "640x360",
      withAudio: false,
    });

    expect(plan.tempFiles).toEqual([]);
    expect(plan.commands).toHaveLength(1);
    expect(plan.commands[0]).toEqual(
      expect.arrayContaining(["-c:v", "libx264", "-pix_fmt", "yuv420p"])
    );
    expect(plan.commands[0]).toContain("lorem-micsum.mp4");
  });

  it("builds a two-step render plan for mp4 with audio", () => {
    const plan = buildVideoCommandPlan({
      kind: "testsrc",
      durationSec: 5,
      format: "mp4",
      resolution: "640x360",
      withAudio: true,
    });

    expect(plan.tempFiles).toEqual(["lorem-micsum-audio.m4a"]);
    expect(plan.commands).toHaveLength(2);
    expect(plan.commands[0]).toEqual(
      expect.arrayContaining(["-c:a", "aac", "-ar", "48000", "-ac", "2"])
    );
    expect(plan.commands[1]).toEqual(
      expect.arrayContaining([
        "-map",
        "0:v:0",
        "-map",
        "1:a:0",
        "-c:a",
        "copy",
        "-shortest",
      ])
    );
  });

  it("builds a copy-audio final command for webm with audio", () => {
    const plan = buildVideoCommandPlan({
      kind: "testsrc",
      durationSec: 5,
      format: "webm",
      resolution: "640x360",
      withAudio: true,
    });

    expect(plan.tempFiles).toEqual(["lorem-micsum-audio.webm"]);
    expect(plan.commands[1]).toEqual(
      expect.arrayContaining(["-c:v", "libvpx", "-c:a", "copy", "-shortest"])
    );
  });

  it("rejects invalid resolutions before rendering", () => {
    expect(() =>
      validateVideoOptions({
        kind: "testsrc",
        durationSec: 5,
        format: "mp4",
        resolution: "640-360",
        withAudio: false,
      })
    ).toThrowError(VideoGenerationError);
  });

  it("blocks audio mux paths that are not yet verified in the browser", () => {
    expect(isVideoAudioMuxSupported("mp4")).toBe(false);
    expect(() =>
      validateVideoOptions({
        kind: "testsrc",
        durationSec: 5,
        format: "mp4",
        resolution: "640x360",
        withAudio: true,
      })
    ).toThrowError(VideoGenerationError);
  });
});
