import type { MetadataRoute } from "next";
import { seoConfig } from "@/config/seo";
export default function robots(): MetadataRoute.Robots {
  const adminPrefix = "/" + (process.env.ADMIN_PATH_SECRET?.trim().replace(/^\/+|\/+$/g, "") || "control-room");
  return { rules: [{ userAgent: "*", allow: ["/"], disallow: ["/admin", adminPrefix, "/api/", "/api/admin", "/api/internal/"] }], sitemap: seoConfig.siteUrl + "/sitemap.xml" };
}