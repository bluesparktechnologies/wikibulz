import { getAllPostsForAdmin } from "@/repositories/content.repository";
import { getAutomationSettings, getBudgetSummary, getSiteNicheProfile } from "@/modules/autoblog/repositories/automation.repository";

export async function buildDailySeoPlan() {
  const [settings, profile, budget, posts] = await Promise.all([
    getAutomationSettings(),
    getSiteNicheProfile(),
    getBudgetSummary(),
    getAllPostsForAdmin(500),
  ]);
  const scheduled = posts.filter((post) => post.status === "scheduled").length;
  const review = posts.filter((post) => post.status === "review").length;
  const stalePublished = posts.filter((post) => post.status === "published" && Date.now() - Date.parse(post.updatedAt) > 1000 * 60 * 60 * 24 * 180).length;
  const work: string[] = [];
  if (budget.hardStop) work.push("Pause paid automation because configured budget is exhausted.");
  if (scheduled < settings.minimumReadyBacklog) work.push(`Build ready backlog for ${profile.primaryNiche}; target ${settings.minimumReadyBacklog}, current ${scheduled}.`);
  if (stalePublished > 0) work.push(`Review ${stalePublished} older published URLs for freshness and source updates.`);
  if (review > 0) work.push(`Move ${review} reviewed drafts through quality gates before creating more URLs.`);
  if (!work.length) work.push("Maintain current publishing cadence and monitor GSC/CTR opportunities.");
  return { date: new Date().toISOString().slice(0, 10), settings, profile, scheduled, review, stalePublished, work };
}
