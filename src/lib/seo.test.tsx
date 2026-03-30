import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  createCanonicalUrl,
  createFaqJsonLd,
  createPageTitle,
  usePageSeo,
} from "@/lib/seo";

function SeoHarness() {
  usePageSeo({
    title: createPageTitle("Audio Generator"),
    description: "Audio SEO description",
    canonicalPath: "/audio/",
    ogTitle: "Audio Generator | Lorem Micsum",
    ogDescription: "Audio SEO description",
    ogType: "website",
    robots: "index,follow",
    jsonLd: [
      createFaqJsonLd([
        {
          question: "Does this run in the browser?",
          answer: "Yes.",
        },
      ]),
    ],
  });

  return <div>seo</div>;
}

describe("usePageSeo", () => {
  afterEach(() => {
    cleanup();
    document.head
      .querySelectorAll(
        'meta[name="description"], meta[name="robots"], meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"], script[data-seo-json-ld="true"]'
      )
      .forEach((node) => node.remove());
    document.title = "";
  });

  it("updates document head with canonical, social metadata, and JSON-LD", () => {
    render(<SeoHarness />);

    expect(document.title).toBe("Audio Generator | Lorem Micsum");
    expect(
      document.head.querySelector('meta[name="description"]')?.getAttribute("content")
    ).toBe("Audio SEO description");
    expect(
      document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")
    ).toBe(createCanonicalUrl("/audio/"));
    expect(
      document.head.querySelector('meta[property="og:title"]')?.getAttribute("content")
    ).toBe("Audio Generator | Lorem Micsum");
    expect(
      document.head.querySelector('meta[name="twitter:card"]')?.getAttribute("content")
    ).toBe("summary_large_image");
    expect(
      document.head.querySelectorAll('script[data-seo-json-ld="true"]').length
    ).toBe(1);
  });
});
