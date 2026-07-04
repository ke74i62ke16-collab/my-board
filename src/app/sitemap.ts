import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://poketore-bbs.com";

  const { data: threads } = await supabase
    .from("threads")
    .select("id, created_at")
    .eq("is_archived", false);

  const threadEntries: MetadataRoute.Sitemap = (threads ?? []).map((t) => ({
    url: `${siteUrl}/threads/${t.id}`,
    lastModified: new Date(t.created_at),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [
    {
      url: siteUrl,
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...threadEntries,
    {
      url: `${siteUrl}/contact`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${siteUrl}/privacy`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
