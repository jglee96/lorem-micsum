import VideoGeneratorPage from "@/components/video/page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/video/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <VideoGeneratorPage />;
}
