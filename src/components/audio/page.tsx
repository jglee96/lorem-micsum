import * as React from "react";
import { Link } from "@tanstack/react-router";
import { generateAudio, type GenOptions } from "@/lib/audio-gen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AudioChannel,
  AudioFormat,
  AudioFormatWithBitrate,
  AudioKind,
  AudioNoiseColor,
} from "@/types/audio";
import {
  AudioWaveform,
  ArrowLeft,
  Download,
  RotateCcw,
  Sparkles,
  Volume2,
} from "lucide-react";
import {
  audioSchema,
  getDefaultFormState,
} from "@/features/audio/schemas/audio.schema";
import type { AudioSchemaType } from "@/features/audio/schemas/audio.schema";

type FormData = AudioSchemaType & {
  bitrateK?: number;
};

export default function AudioGeneratorPage() {
  const [progress, setProgress] = React.useState<number | null>(null);
  const [url, setUrl] = React.useState<string | null>(null);
  const [filename, setFilename] = React.useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(audioSchema()),
    defaultValues: getDefaultFormState("silence"),
  });

  const watchedKind = form.watch("kind");
  const watchedFormat = form.watch("format");

  const handleChangeAudioKind = (kind: AudioKind) => {
    form.reset(getDefaultFormState(kind));
  };

  const handleResetForm = () => {
    form.reset(getDefaultFormState(watchedKind));
  };

  const onSubmit = async (data: FormData) => {
    setUrl(null);
    setProgress(0);

    try {
      const audioData = {
        ...data,
        ...(data.kind === "sine" && { frequency: data.frequency }),
        ...(data.kind === "noise" && {
          noiseColor: data.noiseColor,
        }),
        ...(data.bitrateK && { bitrateK: data.bitrateK }),
      };

      const { blob, filename } = await generateAudio(
        audioData as GenOptions,
        (p) => setProgress(Math.round(p * 100))
      );
      const objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
      setFilename(filename);
      setProgress(null);
    } catch (e) {
      alert("Something went wrong. Please try again.");
      console.error(e);
    }
  };

  const generatorNotes = [
    "Browser-side FFmpeg render",
    "Conditional controls by audio type",
    "Immediate preview and download",
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
          <p className="section-kicker mb-4">Audio workspace</p>
          <h1 className="font-display text-5xl leading-[0.95] tracking-[-0.05em] text-foreground sm:text-6xl">
            Shape test tones, noise, and silence with less interface noise.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            Configure the signal, render it locally, and export a usable file
            without handing anything off to a server.
          </p>
        </div>
        <div className="grid gap-3 sm:min-w-[320px]">
          {generatorNotes.map((note) => (
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
                Configure render settings
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              Switch signal types freely. The form updates to show only the
              parameters that matter.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                <FormField
                  control={form.control}
                  name="kind"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kind</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleChangeAudioKind(value as AudioKind);
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(AudioKind).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Format</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(AudioFormat).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="durationSec"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (sec)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchedKind === "sine" && (
                  <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency (Hz)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={100}
                            max={10000}
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {watchedKind === "noise" && (
                  <FormField
                    control={form.control}
                    name="noiseColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Noise Color</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(AudioNoiseColor).map(
                              ([key, value]) => (
                                <SelectItem key={key} value={key}>
                                  {value}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="sampleRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sample Rate</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        defaultValue={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="44100">44100</SelectItem>
                          <SelectItem value="48000">48000</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="channels"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Channels</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(Number(value) as 1 | 2)
                        }
                        defaultValue={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(AudioChannel).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {Object.keys(AudioFormatWithBitrate).includes(watchedFormat) && (
                  <FormField
                    control={form.control}
                    name="bitrateK"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bitrate (kbps)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={32}
                            max={512}
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel aria-required="true">Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Audio title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="artist"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Artist</FormLabel>
                      <FormControl>
                        <Input placeholder="Artist name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="hairline" />

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-h-11 items-center text-sm text-muted-foreground">
                  {progress !== null
                    ? `Processing ${Math.max(0, Math.min(progress, 100))}%`
                    : "Ready to render locally in your browser."}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button type="submit" disabled={progress !== null}>
                    <AudioWaveform className="size-4" />
                    Generate audio
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResetForm}
                  >
                    <RotateCcw className="size-4" />
                    Reset form
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </section>

        <aside className="grid gap-6">
          <section className="editorial-surface p-6">
            <p className="section-kicker mb-3">Output status</p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
              {url
                ? "Preview ready"
                : progress !== null
                  ? "Rendering now"
                  : "No file generated yet"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {url
                ? "Review the generated file, download it, or clear the preview and run another pass."
                : "Once generation starts, progress appears here along with the rendered audio preview."}
            </p>

            <div className="mt-6 editorial-panel p-4">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Render state</span>
                <span className="font-semibold text-foreground">
                  {progress !== null
                    ? `${Math.max(0, Math.min(progress, 100))}%`
                    : url
                      ? "Complete"
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
                          : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {url ? (
              <div className="mt-6 grid gap-4">
                <div className="editorial-panel p-4">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-background/70 text-primary">
                      <Volume2 className="size-4" />
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
                  <audio className="w-full" controls src={url} />
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
                  Use the form to define the signal, then render once to inspect
                  the result here.
                </p>
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
