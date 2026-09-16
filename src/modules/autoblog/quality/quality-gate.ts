import { analyzePostSeo } from "@/lib/seo/analysis";
import type { AutomationSettings } from "@/modules/autoblog/types/automation";
import type { Post } from "@/types/content";
import { findArticlePublicationBlockers } from "@/modules/autoblog/quality/article-quality";

export function runFinalQualityGate(post: Post, settings: AutomationSettings, signals: { plagiarismScore?: number; llmPlagiarismRisk?: "LOW" | "MEDIUM" | "HIGH"; factCheckPassed?: boolean; informationGain?: "LOW" | "MEDIUM" | "HIGH" }) {
  const seoChecks = analyzePostSeo(post);
  const articleBlockers = findArticlePublicationBlockers(post);
  const seoPassed = seoChecks.every((check) => check.status !== "fail") && seoChecks.filter((check) => check.status === "warning").length <= 2;
  const directPublishing = settings.publishingMode === "DIRECT_PUBLISH" || settings.autoPublish;
  const plagiarismPassed =
    settings.plagiarismMode === "DISABLED" ||
    settings.plagiarismMode === "MANUAL_CHECK" ||
    (settings.plagiarismMode === "LLM_RISK_ONLY" && signals.llmPlagiarismRisk !== "HIGH") ||
    (settings.plagiarismMode === "API_REQUIRED" && typeof signals.plagiarismScore === "number" && signals.plagiarismScore <= settings.maximumSimilarityPercent) ||
    (!directPublishing && settings.plagiarismMode !== "API_REQUIRED");
  const factPassed = settings.factVerificationRequired ? signals.factCheckPassed === true : true;
  const informationGainPassed = settings.informationGainRequired ? signals.informationGain === "MEDIUM" || signals.informationGain === "HIGH" : true;
  const publishAllowed = settings.publishingMode !== "DIRECT_PUBLISH" || (seoPassed && plagiarismPassed && factPassed && informationGainPassed && !articleBlockers.length);
  const passed = seoPassed && plagiarismPassed && factPassed && informationGainPassed && !articleBlockers.length && publishAllowed;
  return {
    passed,
    blockers: [
      ...articleBlockers,
      !seoPassed ? "SEO audit has hard failures or too many warnings." : "",
      !plagiarismPassed ? settings.plagiarismMode === "API_REQUIRED" ? "Plagiarism API is required and has not passed." : "LLM plagiarism risk is too high." : "",
      !factPassed ? "Fact verification is required and has not passed." : "",
      !informationGainPassed ? "Information gain is required and not strong enough." : "",
      !publishAllowed ? "Direct publish requires all quality gates to pass." : "",
    ].filter(Boolean),
    seoChecks,
  };
}
