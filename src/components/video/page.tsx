import * as React from "react";
import { Link } from "@tanstack/react-router";
import {
  generateVideo,
  VideoGenerationError,
} from "@/lib/video-gen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VideoFormat, VideoSource } from "@/types/video";
import {
  ArrowLeft,
  Clapperboard,
  Download,
  Film,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import type { FaqEntry } from "@/lib/seo";

type VideoGeneratorPageProps = {
  bestFor: readonly string[];
  faqs: readonly FaqEntry[];
};

export default function VideoGeneratorPage({
  bestFor,
  faqs,
}: VideoGeneratorPageProps) {
  const [kind, setKind] = React.useState<VideoSource>("testsrc");
  const [format, setFormat] = React.useState<VideoFormat>("mp4");
  const [duration, setDuration] = React.useState(5);
  const [resolution, setResolution] = React.useState("640x360");
  const [progress, setProgress] = React.useState<number | null>(null);
  const [url, setUrl] = React.useState<string | null>(null);
  const [filename, setFilename] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const onGenerate = async () => {
    if (url) {
      URL.revokeObjectURL(url);
    }

    setUrl(null);
    setErrorMessage(null);
    setProgress(0);
    try {
      const { blob, filename } = await generateVideo(
        { kind, format, durationSec: duration, resolution, withAudio: false },
        (p) => setProgress(Math.round(p * 100))
      );
      const objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
      setFilename(filename);
      setProgress(null);
    } catch (e) {
      console.error(e);
      setProgress(null);
      setErrorMessage(
        e instanceof VideoGenerationError
          ? e.message
          : "Video generation failed. Please review the settings and try again."
      );
    }
  };

  const sourceOptions = Object.entries(VideoSource) as [VideoSource, string][];
  const formatOptions = Object.entries(VideoFormat) as [VideoFormat, string][];
  const notes = [
    "Multiple synthetic source patterns",
    "Fast export to mp4, webm, or ogg",
    "Silent test clips for preview and QA",
  ] as const;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <section className="editorial-surface flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <Button asChild variant="ghost" className="mb-5 -ml-3">
            <Link to="/">
              <ArrowLeft className="size-4" />
              Back to overview
            </Link>
          </Button>
          <p className="section-kicker mb-4">Video workspace</p>
          <h1 className="font-display text-5xl leading-[0.95] tracking-[-0.05em] text-foreground sm:text-6xl">
            Build preview clips and test footage without leaving the browser.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            Tune source, duration, resolution, and format in one place, then
            render and inspect the result immediately.
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-foreground/84 sm:text-base">
            This tool assembles and exports video in the browser so you can
            create local preview clips, QA footage, and format checks without
            relying on a server-side render workflow.
          </p>
        </div>
        <div className="grid gap-3 sm:min-w-[320px]">
          {notes.map((note) => (
            <div key={note} className="editorial-panel flex items-center gap-3 px-4 py-3">
              <Sparkles className="size-4 text-primary" />
              <span className="text-sm text-foreground/88">{note}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_380px]">
        <section className="editorial-surface p-6 sm:p-8">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-kicker mb-3">Generator controls</p>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
                Define the render pass
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              Keep the workflow compact: set the source and output shape, then
              render a silent clip.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="grid gap-2.5">
              <Label>Source</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as VideoSource)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sourceOptions.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2.5">
              <Label>Format</Label>
              <Select
                value={format}
                onValueChange={(v) => setFormat(v as VideoFormat)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formatOptions.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2.5">
              <Label>Duration (sec)</Label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>

            <div className="grid gap-2.5">
              <Label>Resolution</Label>
              <Input
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="1280x720"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-h-11 items-center text-sm text-muted-foreground">
              {progress !== null
                ? `Processing ${Math.max(0, Math.min(progress, 100))}%`
                : errorMessage
                  ? errorMessage
                  : "Ready to generate a local preview clip."}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={onGenerate} disabled={progress !== null}>
                <Film className="size-4" />
                Generate video
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setKind("testsrc");
                  setFormat("mp4");
                  setDuration(5);
                  setResolution("640x360");
                  setProgress(null);
                  setErrorMessage(null);
                  if (url) {
                    URL.revokeObjectURL(url);
                  }
                  setUrl(null);
                }}
              >
                <RotateCcw className="size-4" />
                Reset setup
              </Button>
            </div>
          </div>

          {errorMessage ? (
            <div className="mt-4 rounded-3xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          ) : null}
        </section>

        <aside className="grid gap-6">
          <section className="editorial-surface p-6">
            <p className="section-kicker mb-3">Preview pane</p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
              {url
                ? "Video ready"
                : progress !== null
                  ? "Rendering now"
                  : "No preview yet"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {url
                ? "Inspect the generated output and download the file when it looks right."
                : errorMessage
                  ? "The render did not complete. Adjust the setup and try again."
                  : "Run a render to populate the preview area and export controls."}
            </p>

            <div className="mt-6 editorial-panel p-4">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Render state</span>
                <span className="font-semibold text-foreground">
                  {progress !== null
                    ? `${Math.max(0, Math.min(progress, 100))}%`
                    : url
                      ? "Complete"
                      : errorMessage
                        ? "Failed"
                      : "Idle"}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary transition-all duration-300"
                  style={{
                    width: `${
                      progress !== null
                        ? Math.max(6, Math.min(progress, 100))
                        : url
                          ? 100
                          : errorMessage
                            ? 100
                          : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {url ? (
              <div className="mt-6 grid gap-4">
                <div className="editorial-panel overflow-hidden p-4">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-background/70 text-primary">
                      <Clapperboard className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {filename}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Generated locally
                      </p>
                    </div>
                  </div>
                  <video
                    className="w-full rounded-[1rem] border border-border/70 bg-black/80"
                    controls
                    src={url}
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <a download={filename} href={url}>
                    <Button variant="secondary">
                      <Download className="size-4" />
                      Download file
                    </Button>
                  </a>
                  <Button
                    variant="outline"
                    onClick={() => {
                      URL.revokeObjectURL(url);
                      setUrl(null);
                    }}
                  >
                    Clear preview
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-6 editorial-panel p-5">
                <p className="text-sm leading-6 text-muted-foreground">
                  {errorMessage
                    ? "The last render failed before a preview could be created."
                    : "Choose a source pattern and output format, then render to populate the preview."}
                </p>
              </div>
            )}
          </section>
        </aside>
      </div>

      <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <article className="editorial-surface p-6 sm:p-8">
          <p className="section-kicker mb-4">Best for</p>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
            Synthetic clips, previews, and quick export checks
          </h2>
          <div className="mt-5 grid gap-3">
            {bestFor.map((item) => (
              <div key={item} className="editorial-panel px-4 py-3 text-sm leading-6 text-foreground/88">
                {item}
              </div>
            ))}
          </div>
        </article>

        <section className="editorial-surface p-6 sm:p-8">
          <p className="section-kicker mb-4">FAQ</p>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
            Common questions about the video generator
          </h2>
          <div className="mt-6 grid gap-4">
            {faqs.map((faq) => (
              <article key={faq.question} className="editorial-panel p-5">
                <h3 className="text-base font-semibold text-foreground">
                  {faq.question}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {faq.answer}
                </p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
