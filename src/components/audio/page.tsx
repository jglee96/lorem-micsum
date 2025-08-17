import * as React from "react";
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
  audioSchema,
  getDefaultFormState,
} from "@/features/audio/schemas/audio.schema";
import type { AudioSchemaType } from "@/features/audio/schemas/audio.schema";

// bitrateK 필드를 포함한 확장 타입
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
      const url = URL.createObjectURL(blob);
      setUrl(url);
      setFilename(filename);
      setProgress(null);
    } catch (e) {
      alert("Something went wrong. Please try again.");
      console.error(e);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-bold mb-4">Audio Generator</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
                        {Object.entries(AudioNoiseColor).map(([key, value]) => (
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
                        onChange={(e) => field.onChange(Number(e.target.value))}
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

          <div className="flex items-center justify-between gap-3">
            <div>
              {progress !== null && (
                <span className="text-sm text-muted-foreground">
                  Processing… {Math.max(0, Math.min(progress, 100))}%
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={progress !== null}>
                Generate
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleResetForm}
              >
                Reset
              </Button>
            </div>
          </div>
        </form>
      </Form>
      {url && (
        <div className="flex flex-row items-center justify-between flex-wrap gap-2">
          <audio controls src={url} />
          <div className="flex gap-2">
            <a download={filename} href={url}>
              <Button variant="secondary">Download {filename}</Button>
            </a>
            <Button
              variant="destructive"
              onClick={() => {
                URL.revokeObjectURL(url);
                setUrl(null);
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
