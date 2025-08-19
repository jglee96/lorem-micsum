import * as React from "react";
import { generateVideo } from "@/lib/video-gen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoFormat, VideoSource } from "@/types/video";

export default function VideoGeneratorPage() {
  const [kind, setKind] = React.useState<VideoSource>("testsrc");
  const [format, setFormat] = React.useState<VideoFormat>("mp4");
  const [duration, setDuration] = React.useState(5);
  const [resolution, setResolution] = React.useState("640x360");
  const [withAudio, setWithAudio] = React.useState(false);
  const [progress, setProgress] = React.useState<number | null>(null);
  const [url, setUrl] = React.useState<string | null>(null);
  const [filename, setFilename] = React.useState("");

  const onGenerate = async () => {
    setUrl(null);
    setProgress(0);
    try {
      const { blob, filename } = await generateVideo(
        { kind, format, durationSec: duration, resolution, withAudio },
        (p) => setProgress(Math.round(p * 100))
      );
      const url = URL.createObjectURL(blob);
      setUrl(url);
      setFilename(filename);
      setProgress(null);
    } catch (e) {
      console.error(e);
      alert("비디오 생성 실패. 포맷을 mp4로 바꿔보세요.");
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Dummy Video Generator</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Source</Label>
              <Select
                value={kind}
                onValueChange={(v) => setKind(v as VideoSource)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="testsrc">testsrc</SelectItem>
                  <SelectItem value="smptebars">smptebars</SelectItem>
                  <SelectItem value="testsrc2">testsrc2</SelectItem>
                  <SelectItem value="color">color</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Format</Label>
              <Select
                value={format}
                onValueChange={(v) => setFormat(v as VideoFormat)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp4">mp4</SelectItem>
                  <SelectItem value="webm">webm</SelectItem>
                  <SelectItem value="ogg">ogg</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Duration (sec)</Label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Resolution</Label>
              <Input
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="1280x720"
              />
            </div>
            <div className="flex items-center gap-2 mt-4">
              <input
                id="audio"
                type="checkbox"
                checked={withAudio}
                onChange={(e) => setWithAudio(e.target.checked)}
              />
              <Label htmlFor="audio">Include Audio</Label>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={onGenerate} disabled={progress !== null}>
              Generate
            </Button>
            {progress !== null && (
              <span className="text-sm text-muted-foreground">
                Processing… {Math.max(0, Math.min(progress, 100))}%
              </span>
            )}
          </div>

          {url && (
            <div className="grid gap-2">
              <video controls width={400} src={url} />
              <a download={filename} href={url}>
                <Button variant="secondary">Download {filename}</Button>
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
