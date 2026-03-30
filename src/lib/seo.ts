import * as React from "react";

export type StructuredData = Record<string, unknown>;

export type FaqEntry = {
  question: string;
  answer: string;
};

export type PageSeo = {
  title: string;
  description: string;
  canonicalPath: string;
  ogTitle: string;
  ogDescription: string;
  ogType: "website" | "article";
  robots: string;
  keywords?: string[];
  imagePath?: string;
  jsonLd?: StructuredData[];
};

const DEFAULT_SITE_URL = "https://lorem-micsum.vercel.app/";

export const siteConfig = {
  siteName: "Lorem Micsum",
  siteUrl: import.meta.env.VITE_SITE_URL ?? DEFAULT_SITE_URL,
  defaultOgImage: "/favicon-512x512.png",
} as const;

function normalizePath(path: string) {
  if (!path || path === "/") {
    return "/";
  }

  return path.startsWith("/") ? path : `/${path}`;
}

function resolveAbsoluteUrl(path: string) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return new URL(path, siteConfig.siteUrl).toString();
}

function upsertMeta(
  selector: string,
  attributes: Record<string, string>,
  content: string,
) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement("meta");
    Object.entries(attributes).forEach(([key, value]) => {
      element?.setAttribute(key, value);
    });
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function removeMeta(selector: string) {
  document.head.querySelector(selector)?.remove();
}

function upsertCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }

  element.setAttribute("href", href);
}

function replaceJsonLd(jsonLd: StructuredData[] = []) {
  document.head
    .querySelectorAll('[data-seo-json-ld="true"]')
    .forEach((node) => node.remove());

  jsonLd.forEach((entry, index) => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.seoJsonLd = "true";
    script.dataset.seoJsonLdIndex = String(index);
    script.textContent = JSON.stringify(entry);
    document.head.appendChild(script);
  });
}

export function createPageTitle(pageName: string) {
  return `${pageName} | ${siteConfig.siteName}`;
}

export function createCanonicalUrl(path: string) {
  return resolveAbsoluteUrl(normalizePath(path));
}

export function createImageUrl(path?: string) {
  return resolveAbsoluteUrl(path ?? siteConfig.defaultOgImage);
}

export function createWebSiteJsonLd({
  description,
  path,
}: {
  description: string;
  path: string;
}): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.siteName,
    description,
    url: createCanonicalUrl(path),
  };
}

export function createSoftwareApplicationJsonLd({
  name,
  path,
  description,
  applicationCategory,
  featureList,
}: {
  name: string;
  path: string;
  description: string;
  applicationCategory: string;
  featureList: string[];
}): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    applicationCategory,
    operatingSystem: "Web Browser",
    description,
    url: createCanonicalUrl(path),
    image: createImageUrl(),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList,
  };
}

export function createFaqJsonLd(faqs: FaqEntry[]): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function usePageSeo(seo: PageSeo) {
  React.useEffect(() => {
    const canonicalUrl = createCanonicalUrl(seo.canonicalPath);
    const imageUrl = createImageUrl(seo.imagePath);

    document.title = seo.title;
    upsertMeta(
      'meta[name="description"]',
      { name: "description" },
      seo.description,
    );
    upsertMeta('meta[name="robots"]', { name: "robots" }, seo.robots);
    upsertMeta(
      'meta[property="og:title"]',
      { property: "og:title" },
      seo.ogTitle,
    );
    upsertMeta(
      'meta[property="og:description"]',
      { property: "og:description" },
      seo.ogDescription,
    );
    upsertMeta('meta[property="og:type"]', { property: "og:type" }, seo.ogType);
    upsertMeta('meta[property="og:url"]', { property: "og:url" }, canonicalUrl);
    upsertMeta('meta[property="og:image"]', { property: "og:image" }, imageUrl);
    upsertMeta(
      'meta[property="og:site_name"]',
      { property: "og:site_name" },
      siteConfig.siteName,
    );
    upsertMeta(
      'meta[name="twitter:card"]',
      { name: "twitter:card" },
      "summary_large_image",
    );
    upsertMeta(
      'meta[name="twitter:title"]',
      { name: "twitter:title" },
      seo.ogTitle,
    );
    upsertMeta(
      'meta[name="twitter:description"]',
      { name: "twitter:description" },
      seo.ogDescription,
    );
    upsertMeta(
      'meta[name="twitter:image"]',
      { name: "twitter:image" },
      imageUrl,
    );

    if (seo.keywords?.length) {
      upsertMeta(
        'meta[name="keywords"]',
        { name: "keywords" },
        seo.keywords.join(", "),
      );
    } else {
      removeMeta('meta[name="keywords"]');
    }

    upsertCanonical(canonicalUrl);
    replaceJsonLd(seo.jsonLd);
  }, [seo]);
}
