import * as React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import VideoGeneratorPage from "@/components/video/page";
import { VideoGenerationError } from "@/lib/video-gen";

const generateVideoMock = vi.fn();

vi.mock("@/lib/video-gen", async () => {
  const actual = await vi.importActual<typeof import("@/lib/video-gen")>(
    "@/lib/video-gen"
  );

  return {
    ...actual,
    generateVideo: (...args: Parameters<typeof actual.generateVideo>) =>
      generateVideoMock(...args),
  };
});

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props}>{children}</a>,
}));

describe("VideoGeneratorPage", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    generateVideoMock.mockReset();
    vi.stubGlobal("alert", vi.fn());
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:video"),
      revokeObjectURL: vi.fn(),
    });
  });

  it("renders a preview after a successful default video render", async () => {
    generateVideoMock.mockResolvedValue({
      blob: new Blob(["video"], { type: "video/mp4" }),
      filename: "lorem-micsum.mp4",
    });

    render(<VideoGeneratorPage />);

    fireEvent.click(screen.getByRole("button", { name: "Generate video" }));

    await screen.findByText("Video ready");
    expect(generateVideoMock).toHaveBeenCalledWith(
      expect.objectContaining({
        format: "mp4",
        withAudio: false,
      }),
      expect.any(Function)
    );
    expect(screen.getByText("lorem-micsum.mp4")).toBeTruthy();
  });

  it("shows the audio mux limitation clearly in the UI", async () => {
    render(<VideoGeneratorPage />);

    expect(
      screen.getAllByLabelText("Include audio")[0].hasAttribute("disabled")
    ).toBe(true);
    expect(
      screen.getByText(
        "Audio-in-video export is temporarily unavailable while we validate a stable browser FFmpeg path."
      )
    ).toBeTruthy();
  });

  it("restores the UI after a failed render", async () => {
    generateVideoMock.mockRejectedValue(
      new VideoGenerationError(
        "INVALID_OPTIONS",
        "Duration must be at least 1 second."
      )
    );

    render(<VideoGeneratorPage />);

    fireEvent.click(screen.getByRole("button", { name: "Generate video" }));

    await waitFor(() => {
      expect(
        screen.getAllByText("Duration must be at least 1 second.").length
      ).toBeGreaterThan(0);
    });
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Generate video" }).hasAttribute(
          "disabled"
        )
      ).toBe(false);
    });
    expect(screen.getByText("Failed")).toBeTruthy();
  });
});
