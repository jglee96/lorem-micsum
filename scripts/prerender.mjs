import { createReadStream } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { chromium } from "playwright";

const distDir = resolve("dist");
const routes = [
  {
    path: "/",
    title: "Browser Audio and Video Generator | Lorem Micsum",
    canonical: "https://lorem-micsum.example.com/",
    navigationSelector: null,
  },
  {
    path: "/audio",
    title: "Audio Generator | Lorem Micsum",
    canonical: "https://lorem-micsum.example.com/audio",
    navigationSelector: 'a[href="/audio"]',
  },
  {
    path: "/video",
    title: "Video Generator | Lorem Micsum",
    canonical: "https://lorem-micsum.example.com/video",
    navigationSelector: 'a[href="/video"]',
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
          ({ title, canonical }) =>
            document.title === title &&
            document.head
              .querySelector('link[rel="canonical"]')
              ?.getAttribute("href") === canonical,
          {
            title: route.title,
            canonical: route.canonical,
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
    if (error instanceof Error) {
      throw new Error(
        `${error.message}\nInstall the browser binary with: npx playwright install chromium`
      );
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
