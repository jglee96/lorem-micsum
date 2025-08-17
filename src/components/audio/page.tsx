import * as React from "react";
import {
  generateAudio,
  type AudioFormat,
  type AudioKind,
} from "@/lib/audio-gen";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AudioGeneratorPage() {
  const [kind, setKind] = React.useState<AudioKind>("silence");
  const [format, setFormat] = React.useState<AudioFormat>("wav");
  const [duration, setDuration] = React.useState(5);
  const [sampleRate, setSampleRate] = React.useState(48000);
  const [channels, setChannels] = React.useState<1 | 2>(2);
  const [frequency, setFrequency] = React.useState(440);
  const [noiseColor, setNoiseColor] = React.useState<
    "white" | "pink" | "brown" | "blue" | "violet"
  >("white");
  const [bitrateK, setBitrateK] = React.useState(192);
  const [title, setTitle] = React.useState("lorem-micsum audio");
  const [artist, setArtist] = React.useState("lorem-micsum");
  const [progress, setProgress] = React.useState(0);
  const [url, setUrl] = React.useState<string | null>(null);
  const [filename, setFilename] = React.useState("");

  const onGenerate = async () => {
    console.log("onGenerate", window.crossOriginIsolated);
    setUrl(null);
    setProgress(0);
    try {
      const { blob, filename } = await generateAudio(
        {
          kind,
          format,
          durationSec: duration,
          sampleRate,
          channels,
          frequency,
          noiseColor,
          bitrateK,
          title,
          artist,
        },
        (p) => setProgress(Math.round(p * 100))
      );
      const url = URL.createObjectURL(blob);
      setUrl(url);
      setFilename(filename);
    } catch (e) {
      alert(
        "생성 중 오류가 발생했어요. 포맷을 'wav'로 바꾸어 다시 시도해 보세요."
      );
      console.error(e);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Dummy Audio Generator</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Kind</Label>
              <Select
                value={kind}
                onValueChange={(v) => setKind(v as AudioKind)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="silence">Silence</SelectItem>
                  <SelectItem value="sine">Sine (Beep)</SelectItem>
                  <SelectItem value="noise">Noise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Format</Label>
              <Select
                value={format}
                onValueChange={(v) => setFormat(v as AudioFormat)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wav">wav</SelectItem>
                  <SelectItem value="mp3">mp3</SelectItem>
                  <SelectItem value="m4a">m4a (aac)</SelectItem>
                  <SelectItem value="ogg">ogg (vorbis)</SelectItem>
                  <SelectItem value="opus">opus</SelectItem>
                  <SelectItem value="webm">webm (opus)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Duration (sec)</Label>
              <Input
                type="number"
                value={duration}
                min={1}
                max={600}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>

            {kind === "sine" && (
              <div>
                <Label>Frequency (Hz)</Label>
                <Input
                  type="number"
                  value={frequency}
                  min={20}
                  max={20000}
                  onChange={(e) => setFrequency(Number(e.target.value))}
                />
              </div>
            )}

            {kind === "noise" && (
              <div>
                <Label>Noise Color</Label>
                <Select
                  value={noiseColor}
                  onValueChange={(v) => setNoiseColor(v as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="white">white</SelectItem>
                    <SelectItem value="pink">pink</SelectItem>
                    <SelectItem value="brown">brown</SelectItem>
                    <SelectItem value="blue">blue</SelectItem>
                    <SelectItem value="violet">violet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Sample Rate</Label>
              <Select
                value={String(sampleRate)}
                onValueChange={(v) => setSampleRate(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="44100">44100</SelectItem>
                  <SelectItem value="48000">48000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Channels</Label>
              <Select
                value={String(channels)}
                onValueChange={(v) => setChannels(Number(v) as 1 | 2)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Mono</SelectItem>
                  <SelectItem value="2">Stereo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {["mp3", "m4a", "ogg", "opus", "webm"].includes(format) && (
              <div>
                <Label>Bitrate (kbps)</Label>
                <Input
                  type="number"
                  value={bitrateK}
                  min={32}
                  max={512}
                  onChange={(e) => setBitrateK(Number(e.target.value))}
                />
              </div>
            )}

            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label>Artist</Label>
              <Input
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={onGenerate}>Generate</Button>
            {progress > 0 && progress < 100 && (
              <span className="text-sm text-muted-foreground">
                Processing… {progress}%
              </span>
            )}
            {progress >= 100 && (
              <span className="text-sm text-muted-foreground">Done</span>
            )}
          </div>

          {url && (
            <div className="grid gap-2">
              <audio controls src={url} />
              <div className="flex gap-2">
                <a download={filename} href={url}>
                  <Button variant="secondary">Download {filename}</Button>
                </a>
                <Button
                  variant="ghost"
                  onClick={() => {
                    URL.revokeObjectURL(url);
                    setUrl(null);
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
