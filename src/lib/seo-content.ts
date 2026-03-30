import type { FaqEntry } from "@/lib/seo";

export const audioBestFor = [
  "Generating silence, sine tones, or colored noise without uploading files",
  "Exporting quick reference clips for QA, sound checks, or test fixtures",
  "Switching output formats and durations inside one browser-native workflow",
] as const;

export const videoBestFor = [
  "Creating synthetic preview clips for QA and player checks",
  "Exporting test footage in mp4, webm, or ogg without a server render",
  "Adjusting duration and resolution before downloading the final clip",
] as const;

export const audioFaqs: FaqEntry[] = [
  {
    question: "Does this run in the browser?",
    answer:
      "Yes. The audio generator runs FFmpeg in the browser so you can create files locally without sending the job to a remote render service.",
  },
  {
    question: "Are files uploaded to a server?",
    answer:
      "No. Your audio settings and generated files stay on-device unless you choose to share them somewhere else.",
  },
  {
    question: "What audio formats can I export?",
    answer:
      "The generator supports common audio exports including wav, mp3, aac, flac, and ogg depending on the selected settings.",
  },
  {
    question: "What can I generate with the audio tool?",
    answer:
      "You can generate silence, sine tones, and colored noise with configurable duration, format, bitrate, and other signal-specific controls.",
  },
] as const;

export const videoFaqs: FaqEntry[] = [
  {
    question: "Does this run in the browser?",
    answer:
      "Yes. The video generator renders synthetic clips in the browser so you can preview export settings locally before downloading the file.",
  },
  {
    question: "Are files uploaded to a server?",
    answer:
      "No. The tool keeps rendering and preview generation in your browser rather than uploading source material to a hosted service.",
  },
  {
    question: "What video formats can I export?",
    answer:
      "The current workflow focuses on quick synthetic exports in mp4, webm, and ogg for preview and QA use cases.",
  },
  {
    question: "Can I add audio to generated video?",
    answer:
      "The current interface focuses on silent preview clips. Optional audio support is planned in the render pipeline, but the visible workflow is optimized for video-first QA today.",
  },
] as const;
