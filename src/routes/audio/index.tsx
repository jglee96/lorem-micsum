import AudioGeneratorPage from "@/components/audio/page";
import { createFileRoute } from "@tanstack/react-router";
import { audioBestFor, audioFaqs } from "@/lib/seo-content";
import {
  createFaqJsonLd,
  createPageTitle,
  createSoftwareApplicationJsonLd,
  usePageSeo,
} from "@/lib/seo";

const audioDescription =
  "Generate silence, sine tones, and colored noise in the browser with local FFmpeg rendering, configurable export settings, and immediate download-ready audio files.";

const audioSeo = {
  title: createPageTitle("Audio Generator"),
  description: audioDescription,
  canonicalPath: "/audio",
  ogTitle: "Audio Generator | Lorem Micsum",
  ogDescription: audioDescription,
  ogType: "website" as const,
  robots: "index,follow",
  jsonLd: [
    createSoftwareApplicationJsonLd({
      name: "Lorem Micsum Audio Generator",
      path: "/audio",
      description: audioDescription,
      applicationCategory: "MultimediaApplication",
      featureList: [...audioBestFor],
    }),
    createFaqJsonLd([...audioFaqs]),
  ],
};

export const Route = createFileRoute("/audio/")({
  component: RouteComponent,
});

function RouteComponent() {
  usePageSeo(audioSeo);

  return <AudioGeneratorPage bestFor={audioBestFor} faqs={audioFaqs} />;
}
