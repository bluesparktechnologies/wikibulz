import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  const { updateAutomationSettings, updateEditorialProfile, updateSiteNicheProfile, seedPromptTemplates } = await import("../src/modules/autoblog/repositories/automation.repository");
  await updateAutomationSettings({
    primaryNiche: "Technology News",
    allowedCategories: ["Technology News", "Artificial Intelligence", "Cybersecurity", "Software"],
    country: "IN",
    language: "en",
    dryRunMode: true,
    autoPublish: false,
    publishingMode: "SAVE_FOR_REVIEW",
    plagiarismMode: "LLM_RISK_ONLY",
    factVerificationRequired: true,
    informationGainRequired: true,
    minimumOpportunityScore: 60,
    minimumSeoQuality: 85,
    articlesPerDay: 1,
    imageGenerationMode: "WHEN_USEFUL",
  });
  await updateSiteNicheProfile({
    primaryNiche: "Technology News",
    secondaryTopics: ["Artificial Intelligence", "Cybersecurity", "Software", "Cloud Computing", "Startups", "SEO Technology"],
    country: "IN",
    language: "en",
    targetAudience: "technology readers, business owners, software teams, SEO teams, and startup operators in India and global English markets",
    businessGoals: ["grow useful organic traffic", "build topical authority in technology", "support Bluespark Technologies software and SEO services"],
    allowedTopics: ["Artificial Intelligence", "Cybersecurity", "Software", "Cloud Computing", "Developer Tools", "Digital Marketing", "SEO Technology"],
    excludedTopics: ["adult content", "gambling", "unsupported medical advice", "unsupported financial advice"],
    riskCategories: ["security claims", "privacy claims", "unverified breaking news", "legal or regulatory claims"],
  });
  await updateEditorialProfile({
    tone: "clear, practical, evidence-first technology journalism",
    audience: "smart non-expert readers, business owners, developers, and SEO teams",
    readingLevel: "grade 8-10",
    paragraphStyle: "short paragraphs with concrete examples and careful source wording",
    terminology: ["plain English", "specific technical terms when useful", "SEO terminology when relevant"],
    avoidTerms: ["guaranteed ranking", "undetectable AI", "exclusive if not sourced", "breaking if not verified"],
    brandVoice: "calm technology editor, no hype",
    citationStyle: "link factual claims to visible reputable sources",
    formattingPreferences: ["answer-first intros", "short sections", "practical takeaways", "FAQ when useful"],
  });
  const prompts = await seedPromptTemplates();
  console.log(`Technology automation profile configured. Prompt templates synced: ${prompts}`);
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
