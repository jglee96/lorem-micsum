import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  AudioWaveform,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  createPageTitle,
  createSoftwareApplicationJsonLd,
  createWebSiteJsonLd,
  usePageSeo,
} from "@/lib/seo";

const homeDescription =
  "Lorem Micsum is a browser-based audio and video generator for creating local test media, preview clips, and quick exports without sending files to a server.";

const homeSeo = {
  title: createPageTitle("Browser Audio and Video Generator"),
  description: homeDescription,
  canonicalPath: "/",
  ogTitle: "Browser Audio and Video Generator | Lorem Micsum",
  ogDescription: homeDescription,
  ogType: "website" as const,
  robots: "index,follow",
  jsonLd: [
    createWebSiteJsonLd({
      path: "/",
      description: homeDescription,
    }),
    createSoftwareApplicationJsonLd({
      name: "Lorem Micsum",
      path: "/",
      description: homeDescription,
      applicationCategory: "MultimediaApplication",
      featureList: [
        "Generate audio and video directly in the browser",
        "Keep renders local without uploading media to a server",
        "Export quick test assets for QA, review, and previews",
      ],
    }),
  ],
};

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  usePageSeo(homeSeo);

  const productPaths = [
    {
      title: "Audio generator",
      description:
        "Silence, sine tones, and textured noise built directly in your browser.",
      to: "/audio",
      meta: "FFmpeg WASM / local render",
      icon: AudioWaveform,
    },
    {
      title: "Video generator",
      description:
        "Assemble test footage with timing, format, and optional audio in one pass.",
      to: "/video",
      meta: "Preview-ready / export fast",
      icon: Video,
    },
  ] as const;

  const principles = [
    {
      title: "Rendered locally",
      body: "Files stay on-device while FFmpeg runs in the browser.",
    },
    {
      title: "Operational clarity",
      body: "Shorter flows, clearer states, and less starter-template chrome.",
    },
    {
      title: "Built for iteration",
      body: "Switch formats, tweak settings, regenerate, download, repeat.",
    },
  ] as const;

  const workflow = [
    "Choose a generator and set the parameters that matter.",
    "Run FFmpeg in-browser with visible progress feedback.",
    "Preview the output immediately and download when it is ready.",
  ] as const;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <section className="editorial-surface relative overflow-hidden px-6 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div className="absolute inset-y-0 right-0 hidden w-[42%] border-l border-border/50 bg-[linear-gradient(180deg,rgba(31,47,82,0.02),rgba(31,47,82,0.14))] lg:block" />
        <div className="absolute right-10 bottom-10 hidden h-28 w-28 rounded-full border border-border/60 bg-background/60 lg:block" />

        <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-end">
          <div className="max-w-3xl">
            <Badge
              variant="outline"
              className="stagger-fade mb-6 rounded-full px-4 py-2 text-[0.68rem] tracking-[0.24em]"
            >
              Browser-native generation suite
            </Badge>
            <div className="stagger-fade stagger-delay-1">
              <p className="section-kicker mb-4">
                Client-side audio and video rendering
              </p>
              <h1 className="font-display max-w-4xl text-6xl leading-[0.92] tracking-[-0.05em] text-foreground sm:text-7xl lg:text-[6.4rem]">
                Lorem Micsum
              </h1>
            </div>
            <p className="stagger-fade stagger-delay-2 mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Generate media directly in the browser with a sharper workspace,
              faster decisions, and no server handoff.
            </p>
            <p className="stagger-fade stagger-delay-2 mt-4 max-w-2xl text-sm leading-7 text-foreground/84 sm:text-base">
              Lorem Micsum is a browser-based audio and video generator that
              helps you create local test media, review clips, and downloadable
              outputs without uploading files to a remote service.
            </p>
            <div className="stagger-fade stagger-delay-3 mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/audio">
                  Open audio generator
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/video">Explore video workflow</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 lg:pl-10">
            {principles.map((item, index) => (
              <article key={item.title} className="editorial-panel p-5">
                <p className="section-kicker mb-3">0{index + 1}</p>
                <h2 className="mb-2 text-lg font-semibold tracking-[-0.03em] text-foreground">
                  {item.title}
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {productPaths.map(({ title, description, to, meta, icon: Icon }) => (
          <article
            key={title}
            className="editorial-surface group relative overflow-hidden p-6 sm:p-8"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-border/80" />
            <div className="absolute top-6 right-6 flex h-12 w-12 items-center justify-center rounded-full border border-border/70 bg-background/80 text-primary transition-transform duration-300 group-hover:-translate-y-1">
              <Icon className="size-5" />
            </div>
            <p className="section-kicker mb-10">{meta}</p>
            <div className="max-w-md">
              <h2 className="font-display text-4xl leading-none tracking-[-0.04em] text-foreground">
                {title}
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                {description}
              </p>
            </div>
            <div className="mt-12 flex items-center justify-between gap-4 border-t border-border/70 pt-5">
              <span className="text-sm font-medium text-muted-foreground">
                Designed for quick iteration
              </span>
              <Button asChild variant="ghost">
                <Link to={to}>
                  Launch
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="editorial-surface p-6 sm:p-8">
          <p className="section-kicker mb-4">Answer engine summary</p>
          <h2 className="font-display text-4xl leading-none tracking-[-0.04em] text-foreground">
            A local-first media generator for quick test assets.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
            Use Lorem Micsum when you need browser-based audio and video
            generation for QA, demos, placeholder media, or rapid format
            checks. The app focuses on compact setup, clear export options, and
            on-device rendering.
          </p>
        </article>
        <div className="editorial-surface grid gap-px overflow-hidden bg-border/70">
          {[
            "What it does: generates browser-native audio and video test assets.",
            "What you control: signal type, duration, format, source pattern, and resolution.",
            "How it runs: FFmpeg executes locally in the browser without a server render pass.",
          ].map((item) => (
            <div key={item} className="bg-background px-6 py-5 text-sm leading-7 text-foreground/86 sm:px-8">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="editorial-surface p-6 sm:p-8">
          <p className="section-kicker mb-4">Workflow</p>
          <h2 className="font-display text-4xl leading-none tracking-[-0.04em] text-foreground">
            Fewer steps, clearer output.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
            The interface stays focused on setup, generation state, and export
            so the browser feels like a real production tool.
          </p>
        </article>
        <div className="editorial-surface divide-y divide-border/70 overflow-hidden">
          {workflow.map((step, index) => (
            <div
              key={step}
              className="grid gap-3 px-6 py-5 sm:grid-cols-[64px_minmax(0,1fr)] sm:items-start sm:px-8"
            >
              <div className="font-display text-4xl leading-none text-primary">
                0{index + 1}
              </div>
              <p className="pt-1 text-base leading-7 text-foreground/88">
                {step}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="editorial-surface flex flex-col gap-6 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div>
          <p className="section-kicker mb-4">Local-first promise</p>
          <h2 className="font-display text-4xl leading-none tracking-[-0.04em] text-foreground">
            Your files stay with you.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
            Lorem Micsum keeps the heavy lifting inside the browser, so previews
            and exports happen without shipping media to a remote service.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" size="lg">
            <Link to="/audio">Start with audio</Link>
          </Button>
          <Button asChild size="lg">
            <Link to="/video">Open video</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
