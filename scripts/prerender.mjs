import { createReadStream } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { chromium } from "playwright";

const distDir = resolve("dist");
const siteUrl = (process.env.VITE_SITE_URL ?? "https://lorem-micsum.example.com").replace(
  /\/$/,
  ""
);
const routes = [
  {
    path: "/",
    title: "Browser Audio and Video Generator | Lorem Micsum",
    description:
      "Lorem Micsum is a browser-based audio and video generator for creating local test media, preview clips, and quick exports without sending files to a server.",
    navigationSelector: null,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Lorem Micsum",
        description:
          "Lorem Micsum is a browser-based audio and video generator for creating local test media, preview clips, and quick exports without sending files to a server.",
        url: `${siteUrl}/`,
      },
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Lorem Micsum",
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Web Browser",
        description:
          "Lorem Micsum is a browser-based audio and video generator for creating local test media, preview clips, and quick exports without sending files to a server.",
        url: `${siteUrl}/`,
        image: `${siteUrl}/favicon-512x512.png`,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        featureList: [
          "Generate audio and video directly in the browser",
          "Keep renders local without uploading media to a server",
          "Export quick test assets for QA, review, and previews",
        ],
      },
    ],
  },
  {
    path: "/audio",
    title: "Audio Generator | Lorem Micsum",
    description:
      "Generate silence, sine tones, and colored noise in the browser with local FFmpeg rendering, configurable export settings, and immediate download-ready audio files.",
    navigationSelector: 'a[href="/audio"]',
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Lorem Micsum Audio Generator",
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Web Browser",
        description:
          "Generate silence, sine tones, and colored noise in the browser with local FFmpeg rendering, configurable export settings, and immediate download-ready audio files.",
        url: `${siteUrl}/audio`,
        image: `${siteUrl}/favicon-512x512.png`,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        featureList: [
          "Generating silence, sine tones, or colored noise without uploading files",
          "Exporting quick reference clips for QA, sound checks, or test fixtures",
          "Switching output formats and durations inside one browser-native workflow",
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Does this run in the browser?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. The audio generator runs FFmpeg in the browser so you can create files locally without sending the job to a remote render service.",
            },
          },
          {
            "@type": "Question",
            name: "Are files uploaded to a server?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. Your audio settings and generated files stay on-device unless you choose to share them somewhere else.",
            },
          },
          {
            "@type": "Question",
            name: "What audio formats can I export?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The generator supports common audio exports including wav, mp3, aac, flac, and ogg depending on the selected settings.",
            },
          },
          {
            "@type": "Question",
            name: "What can I generate with the audio tool?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "You can generate silence, sine tones, and colored noise with configurable duration, format, bitrate, and other signal-specific controls.",
            },
          },
        ],
      },
    ],
  },
  {
    path: "/video",
    title: "Video Generator | Lorem Micsum",
    description:
      "Assemble browser-based test footage with configurable source patterns, duration, resolution, and export format, then preview and download the rendered clip locally.",
    navigationSelector: 'a[href="/video"]',
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Lorem Micsum Video Generator",
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Web Browser",
        description:
          "Assemble browser-based test footage with configurable source patterns, duration, resolution, and export format, then preview and download the rendered clip locally.",
        url: `${siteUrl}/video`,
        image: `${siteUrl}/favicon-512x512.png`,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        featureList: [
          "Creating synthetic preview clips for QA and player checks",
          "Exporting test footage in mp4, webm, or ogg without a server render",
          "Adjusting duration and resolution before downloading the final clip",
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Does this run in the browser?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. The video generator renders synthetic clips in the browser so you can preview export settings locally before downloading the file.",
            },
          },
          {
            "@type": "Question",
            name: "Are files uploaded to a server?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. The tool keeps rendering and preview generation in your browser rather than uploading source material to a hosted service.",
            },
          },
          {
            "@type": "Question",
            name: "What video formats can I export?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The current workflow focuses on quick synthetic exports in mp4, webm, and ogg for preview and QA use cases.",
            },
          },
          {
            "@type": "Question",
            name: "Can I add audio to generated video?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The current interface focuses on silent preview clips. Optional audio support is planned in the render pipeline, but the visible workflow is optimized for video-first QA today.",
            },
          },
        ],
      },
    ],
  },
];
const host = "127.0.0.1";
const port = 4173;

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function resolveRequestPath(urlPath) {
  const cleanPath = decodeURIComponent((urlPath ?? "/").split("?")[0]);
  const relativePath =
    cleanPath === "/" ? "index.html" : cleanPath.replace(/^\/+/, "");
  const normalizedPath = normalize(relativePath);

  if (normalizedPath.includes("..")) {
    return null;
  }

  return join(distDir, normalizedPath);
}

async function sendFile(res, filePath) {
  const extension = extname(filePath);
  const contentType = contentTypes[extension] ?? "application/octet-stream";

  res.writeHead(200, { "content-type": contentType });
  createReadStream(filePath).pipe(res);
}

async function createStaticServer() {
  return createServer(async (req, res) => {
    try {
      const requestedPath = resolveRequestPath(req.url);

      if (requestedPath) {
        try {
          const requestedStat = await stat(requestedPath);

          if (requestedStat.isFile()) {
            await sendFile(res, requestedPath);
            return;
          }
        } catch {
          // Fall back to the SPA entry for route requests.
        }
      }

      await sendFile(res, join(distDir, "index.html"));
    } catch (error) {
      res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      res.end(
        error instanceof Error
          ? error.message
          : "Unexpected prerender server error."
      );
    }
  });
}

async function writePrerenderedPage(route, html) {
  const outputDirectory =
    route === "/" ? distDir : join(distDir, route.replace(/^\/|\/$/g, ""));

  await mkdir(outputDirectory, { recursive: true });
  await writeFile(join(outputDirectory, "index.html"), html);
}

function buildCanonical(path) {
  return path === "/" ? `${siteUrl}/` : `${siteUrl}${path}`;
}

function replaceOrInsertMeta(html, selectorPattern, replacement) {
  if (selectorPattern.test(html)) {
    return html.replace(selectorPattern, replacement);
  }

  return html.replace("</head>", `${replacement}</head>`);
}

function replaceTitle(html, title) {
  return html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
}

function replaceJsonLd(html, jsonLd) {
  const withoutJsonLd = html.replace(
    /<script type="application\/ld\+json" data-seo-json-ld="true"[\s\S]*?<\/script>/g,
    ""
  );
  const scripts = jsonLd
    .map(
      (entry, index) =>
        `<script type="application/ld+json" data-seo-json-ld="true" data-seo-json-ld-index="${index}">${JSON.stringify(
          entry
        )}</script>`
    )
    .join("");

  return withoutJsonLd.replace("</head>", `${scripts}</head>`);
}

function buildFallbackHtml(template, route) {
  const canonical = buildCanonical(route.path);
  const imageUrl = `${siteUrl}/favicon-512x512.png`;
  let html = template;

  html = replaceTitle(html, route.title);
  html = replaceOrInsertMeta(
    html,
    /<meta name="description" content=".*?">/,
    `<meta name="description" content="${route.description}">`
  );
  html = replaceOrInsertMeta(
    html,
    /<meta property="og:title" content=".*?">/,
    `<meta property="og:title" content="${route.title}">`
  );
  html = replaceOrInsertMeta(
    html,
    /<meta property="og:description" content=".*?">/,
    `<meta property="og:description" content="${route.description}">`
  );
  html = replaceOrInsertMeta(
    html,
    /<meta property="og:url" content=".*?">/,
    `<meta property="og:url" content="${canonical}">`
  );
  html = replaceOrInsertMeta(
    html,
    /<meta property="og:image" content=".*?">/,
    `<meta property="og:image" content="${imageUrl}">`
  );
  html = replaceOrInsertMeta(
    html,
    /<meta name="twitter:title" content=".*?">/,
    `<meta name="twitter:title" content="${route.title}">`
  );
  html = replaceOrInsertMeta(
    html,
    /<meta name="twitter:description" content=".*?">/,
    `<meta name="twitter:description" content="${route.description}">`
  );
  html = replaceOrInsertMeta(
    html,
    /<meta name="twitter:image" content=".*?">/,
    `<meta name="twitter:image" content="${imageUrl}">`
  );
  html = replaceOrInsertMeta(
    html,
    /<link rel="canonical" href=".*?">/,
    `<link rel="canonical" href="${canonical}">`
  );
  html = replaceJsonLd(html, route.jsonLd);

  return html;
}

async function writeFallbackPages() {
  const template = await readFile(join(distDir, "index.html"), "utf8");

  for (const route of routes) {
    const html = buildFallbackHtml(template, route);
    await writePrerenderedPage(route.path, html);
  }
}

function isRecoverableBrowserError(error) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes("Executable doesn't exist") ||
    error.message.includes("error while loading shared libraries") ||
    error.message.includes("Target page, context or browser has been closed")
  );
}

async function prerender() {
  const entryHtml = await readFile(join(distDir, "index.html"), "utf8");

  if (!entryHtml.includes('id="app"')) {
    throw new Error("The built app entry HTML is missing the #app mount point.");
  }

  const server = await createStaticServer();

  await new Promise((resolveServer) => {
    server.listen(port, host, resolveServer);
  });

  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    for (const route of routes) {
      await page.goto(`http://${host}:${port}/`, { waitUntil: "networkidle" });

      if (route.navigationSelector) {
        await page.click(route.navigationSelector);
      }

      try {
        await page.waitForFunction(
          ({ title, path }) =>
            document.title === title &&
            window.location.pathname === path,
          {
            title: route.title,
            path: route.path,
          }
        );
      } catch (error) {
        const debugState = await page.evaluate(() => ({
          url: window.location.href,
          title: document.title,
          canonical:
            document.head
              .querySelector('link[rel="canonical"]')
              ?.getAttribute("href") ?? null,
          heading: document.querySelector("h1")?.textContent ?? null,
        }));

        throw new Error(
          `Timed out while prerendering ${route.path}. Current state: ${JSON.stringify(
            debugState
          )}\n${error instanceof Error ? error.message : "Unknown prerender error."}`
        );
      }

      const html = await page.content();

      if (!html.includes(route.title)) {
        throw new Error(`Failed to prerender the expected route: ${route.path}`);
      }

      await writePrerenderedPage(route.path, html);
    }
  } catch (error) {
    if (isRecoverableBrowserError(error)) {
      console.warn(
        `Skipping full browser prerender and writing static SEO fallback pages instead.\n${error instanceof Error ? error.message : "Unknown browser error."}`
      );
      await writeFallbackPages();
      return;
    }

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw error;
  } finally {
    await browser?.close();
    await new Promise((resolveServer, rejectServer) => {
      server.close((error) => {
        if (error) {
          rejectServer(error);
          return;
        }

        resolveServer(undefined);
      });
    });
  }
}

await prerender();
