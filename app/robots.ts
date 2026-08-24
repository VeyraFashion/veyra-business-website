import type { MetadataRoute } from "next";

// Per-brand demo links are meant to be sent privately, not discovered — keep them out of any
// crawler's index as a second layer on top of each page's own noindex metadata.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: ["/demo/"] },
  };
}
