import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://poketore-bbs.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/mgmt-p8x2k",
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
