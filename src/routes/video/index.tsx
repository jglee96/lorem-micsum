import VideoGeneratorPage from "@/components/video/page";
import { createFileRoute } from "@tanstack/react-router";
import { videoBestFor, videoFaqs } from "@/lib/seo-content";
import {
  createFaqJsonLd,
  createPageTitle,
  createSoftwareApplicationJsonLd,
  usePageSeo,
} from "@/lib/seo";

const videoDescription =
  "Assemble browser-based test footage with configurable source patterns, duration, resolution, and export format, then preview and download the rendered clip locally.";

const videoSeo = {
  title: createPageTitle("Video Generator"),
  description: videoDescription,
  canonicalPath: "/video",
  ogTitle: "Video Generator | Lorem Micsum",
  ogDescription: videoDescription,
  ogType: "website" as const,
  robots: "index,follow",
  jsonLd: [
    createSoftwareApplicationJsonLd({
      name: "Lorem Micsum Video Generator",
      path: "/video",
      description: videoDescription,
      applicationCategory: "MultimediaApplication",
      featureList: [...videoBestFor],
    }),
    createFaqJsonLd([...videoFaqs]),
  ],
};

export const Route = createFileRoute("/video/")({
  component: RouteComponent,
});

function RouteComponent() {
  usePageSeo(videoSeo);

  return <VideoGeneratorPage bestFor={videoBestFor} faqs={videoFaqs} />;
}
