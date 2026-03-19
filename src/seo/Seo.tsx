import { useEffect } from 'react';

type OpenGraphConfig = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
};

type TwitterConfig = {
  card?: string;
  title?: string;
  description?: string;
  image?: string;
};

type SeoProps = {
  title: string;
  description?: string;
  robots?: string;
  canonical?: string | null;
  openGraph?: OpenGraphConfig;
  twitter?: TwitterConfig;
};

function getSiteOrigin() {
  if (import.meta.env.VITE_SITE_URL) {
    return import.meta.env.VITE_SITE_URL;
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return '';
}

function toAbsoluteUrl(value: string) {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const siteOrigin = getSiteOrigin();

  if (!siteOrigin) {
    return value;
  }

  return new URL(value, siteOrigin).toString();
}

function upsertMeta(attribute: 'name' | 'property', key: string, content?: string) {
  if (typeof document === 'undefined' || !content) {
    return;
  }

  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  );

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

function upsertCanonical(canonical: string | null | undefined) {
  if (typeof document === 'undefined') {
    return;
  }

  const existing =
    document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (canonical === null) {
    existing?.remove();
    return;
  }

  if (!canonical) {
    return;
  }

  const href = toAbsoluteUrl(canonical);
  const link = existing ?? document.createElement('link');

  link.setAttribute('rel', 'canonical');
  link.setAttribute('href', href);

  if (!existing) {
    document.head.appendChild(link);
  }
}

export function Seo({
  title,
  description,
  robots,
  canonical,
  openGraph,
  twitter,
}: SeoProps) {
  useEffect(() => {
    document.title = title;

    if (description) {
      upsertMeta('name', 'description', description);
    }

    if (robots) {
      upsertMeta('name', 'robots', robots);
    }

    upsertCanonical(canonical);

    if (openGraph) {
      upsertMeta('property', 'og:title', openGraph.title ?? title);

      if (openGraph.description ?? description) {
        upsertMeta(
          'property',
          'og:description',
          openGraph.description ?? description,
        );
      }

      if (openGraph.url) {
        upsertMeta('property', 'og:url', toAbsoluteUrl(openGraph.url));
      }

      if (openGraph.image) {
        upsertMeta('property', 'og:image', toAbsoluteUrl(openGraph.image));
      }

      if (openGraph.type) {
        upsertMeta('property', 'og:type', openGraph.type);
      }

      if (openGraph.siteName) {
        upsertMeta('property', 'og:site_name', openGraph.siteName);
      }
    }

    if (twitter) {
      if (twitter.card) {
        upsertMeta('name', 'twitter:card', twitter.card);
      }

      upsertMeta('name', 'twitter:title', twitter.title ?? title);

      if (twitter.description ?? description) {
        upsertMeta(
          'name',
          'twitter:description',
          twitter.description ?? description,
        );
      }

      if (twitter.image) {
        upsertMeta('name', 'twitter:image', toAbsoluteUrl(twitter.image));
      }
    }
  }, [canonical, description, openGraph, robots, title, twitter]);

  return null;
}
