"use client";

import { useActionState } from "react";
import { saveAutomationSettingsAction, type AutomationActionState } from "@/app/admin/automation/actions";
import type { AutomationSettings, EditorialProfile, SiteNicheProfile } from "@/modules/autoblog/types/automation";

const initialState: AutomationActionState = { ok: false, message: "" };
const join = (value: string[] | undefined) => value?.join(", ") ?? "";

export function AutomationSettingsForm({ settings, siteProfile, editorialProfile }: { settings: AutomationSettings; siteProfile: SiteNicheProfile; editorialProfile: EditorialProfile }) {
  const [state, action, pending] = useActionState(saveAutomationSettingsAction, initialState);
  return (
    <form action={action} className="mt-8 grid gap-5 rounded-lg border border-[var(--line)] bg-white p-5">
      <div>
        <h2 className="text-2xl font-black">Final Automation Settings</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Production defaults stay safe: dry run on, auto publish off.</p>
      </div>
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] bg-white py-3">
        <p className="text-sm font-bold text-[var(--muted)]">Change settings, then save once before refreshing.</p>
        <button disabled={pending} className="rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{pending ? "Saving..." : "Save Automation Settings"}</button>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <label className="grid gap-1 text-sm font-bold">Mode<select name="mode" defaultValue={settings.mode} className="rounded border border-[var(--line)] px-3 py-2"><option>MANUAL</option><option>ASSISTED</option><option>AUTOPILOT</option></select></label>
        <label className="grid gap-1 text-sm font-bold">Publishing<select name="publishingMode" defaultValue={settings.publishingMode} className="rounded border border-[var(--line)] px-3 py-2"><option value="SAVE_DRAFT">Save Draft</option><option value="SAVE_FOR_REVIEW">Save For Review</option><option value="AUTO_SCHEDULE">Auto Schedule</option><option value="DIRECT_PUBLISH">Direct Publish</option></select></label>
        <label className="grid gap-1 text-sm font-bold">Plagiarism<select name="plagiarismMode" defaultValue={settings.plagiarismMode} className="rounded border border-[var(--line)] px-3 py-2"><option value="MANUAL_CHECK">Manual Check</option><option value="LLM_RISK_ONLY">LLM Risk Only</option><option value="API_REQUIRED">API Required</option><option value="DISABLED">Disabled</option></select></label>
        <label className="grid gap-1 text-sm font-bold">Country<input name="country" defaultValue={settings.country} className="rounded border border-[var(--line)] px-3 py-2" /></label>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <label className="grid gap-1 text-sm font-bold">Language<input name="language" defaultValue={settings.language} className="rounded border border-[var(--line)] px-3 py-2" /></label>
        <label className="grid gap-1 text-sm font-bold">Timezone<input name="timezone" defaultValue={settings.timezone} className="rounded border border-[var(--line)] px-3 py-2" /></label>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <label className="text-sm font-bold"><input type="checkbox" name="enabled" defaultChecked={settings.enabled} /> Enabled</label>
        <label className="text-sm font-bold"><input type="checkbox" name="dryRunMode" defaultChecked={settings.dryRunMode} /> Dry Run</label>
        <label className="text-sm font-bold"><input type="checkbox" name="autoPublish" defaultChecked={settings.autoPublish} /> Auto Publish</label>
        <label className="text-sm font-bold"><input type="checkbox" name="useNewsDiscovery" defaultChecked={settings.useNewsDiscovery} /> News Discovery</label>
        <label className="text-sm font-bold"><input type="checkbox" name="internalLinksAutomatic" defaultChecked={settings.internalLinksAutomatic} /> Auto Internal Links</label>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <label className="grid gap-1 text-sm font-bold">Opportunity<input name="minimumOpportunityScore" type="number" defaultValue={settings.minimumOpportunityScore} className="rounded border border-[var(--line)] px-3 py-2" /></label>
        <label className="grid gap-1 text-sm font-bold">SEO Quality<input name="minimumSeoQuality" type="number" defaultValue={settings.minimumSeoQuality} className="rounded border border-[var(--line)] px-3 py-2" /></label>
        <label className="grid gap-1 text-sm font-bold">Similarity %<input name="maximumSimilarityPercent" type="number" defaultValue={settings.maximumSimilarityPercent} className="rounded border border-[var(--line)] px-3 py-2" /></label>
        <label className="grid gap-1 text-sm font-bold">Ready Backlog<input name="minimumReadyBacklog" type="number" defaultValue={settings.minimumReadyBacklog} className="rounded border border-[var(--line)] px-3 py-2" /></label>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <label className="grid gap-1 text-sm font-bold">Articles/Day<input name="articlesPerDay" type="number" defaultValue={settings.articlesPerDay} className="rounded border border-[var(--line)] px-3 py-2" /></label>
        <label className="grid gap-1 text-sm font-bold">Publish Times<input name="publishTimes" defaultValue={join(settings.publishTimes)} className="rounded border border-[var(--line)] px-3 py-2" /></label>
        <label className="grid gap-1 text-sm font-bold">Allowed Days<input name="allowedDays" defaultValue={join(settings.allowedDays.map(String))} className="rounded border border-[var(--line)] px-3 py-2" /></label>
        <label className="grid gap-1 text-sm font-bold">Images<select name="imageGenerationMode" defaultValue={settings.imageGenerationMode} className="rounded border border-[var(--line)] px-3 py-2"><option>DISABLED</option><option>WHEN_USEFUL</option><option>REQUIRED</option></select></label>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <label className="grid gap-1 text-sm font-bold">Daily AI Budget<input name="dailyAIBudget" type="number" defaultValue={settings.dailyAIBudget} className="rounded border border-[var(--line)] px-3 py-2" /></label>
        <label className="grid gap-1 text-sm font-bold">Monthly AI Budget<input name="monthlyAIBudget" type="number" defaultValue={settings.monthlyAIBudget} className="rounded border border-[var(--line)] px-3 py-2" /></label>
        <label className="grid gap-1 text-sm font-bold">Max Cost/Article<input name="maxCostPerArticle" type="number" defaultValue={settings.maxCostPerArticle} className="rounded border border-[var(--line)] px-3 py-2" /></label>
        <label className="grid gap-1 text-sm font-bold">SERP Requests<input name="maxSERPRequests" type="number" defaultValue={settings.maxSERPRequests} className="rounded border border-[var(--line)] px-3 py-2" /></label>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-sm font-bold"><input type="checkbox" name="factVerificationRequired" defaultChecked={settings.factVerificationRequired} /> Fact Verification Required</label>
        <label className="text-sm font-bold"><input type="checkbox" name="cannibalizationCheckRequired" defaultChecked={settings.cannibalizationCheckRequired} /> Cannibalization Required</label>
        <label className="text-sm font-bold"><input type="checkbox" name="informationGainRequired" defaultChecked={settings.informationGainRequired} /> Information Gain Required</label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold">Primary Niche<input name="primaryNiche" defaultValue={siteProfile.primaryNiche} className="rounded border border-[var(--line)] px-3 py-2" /></label>
        <label className="grid gap-1 text-sm font-bold">Secondary Topics<input name="secondaryTopics" defaultValue={join(siteProfile.secondaryTopics)} className="rounded border border-[var(--line)] px-3 py-2" /></label>
        <label className="grid gap-1 text-sm font-bold">Allowed Categories<input name="allowedCategories" defaultValue={join(settings.allowedCategories)} className="rounded border border-[var(--line)] px-3 py-2" /></label>
        <label className="grid gap-1 text-sm font-bold">Allowed Topics<input name="allowedTopics" defaultValue={join(siteProfile.allowedTopics)} className="rounded border border-[var(--line)] px-3 py-2" /></label>
        <label className="grid gap-1 text-sm font-bold">Excluded Topics<input name="excludedTopics" defaultValue={join(siteProfile.excludedTopics)} className="rounded border border-[var(--line)] px-3 py-2" /></label>
        <label className="grid gap-1 text-sm font-bold">Risk Categories<input name="riskCategories" defaultValue={join(siteProfile.riskCategories)} className="rounded border border-[var(--line)] px-3 py-2" /></label>
      </div>
      <label className="grid gap-1 text-sm font-bold">Target Audience<textarea name="targetAudience" defaultValue={siteProfile.targetAudience} className="min-h-20 rounded border border-[var(--line)] px-3 py-2" /></label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold">Tone<input name="tone" defaultValue={editorialProfile.tone} className="rounded border border-[var(--line)] px-3 py-2" /></label>
        <label className="grid gap-1 text-sm font-bold">Audience<input name="audience" defaultValue={editorialProfile.audience} className="rounded border border-[var(--line)] px-3 py-2" /></label>
        <label className="grid gap-1 text-sm font-bold">Reading Level<input name="readingLevel" defaultValue={editorialProfile.readingLevel} className="rounded border border-[var(--line)] px-3 py-2" /></label>
        <label className="grid gap-1 text-sm font-bold">Brand Voice<input name="brandVoice" defaultValue={editorialProfile.brandVoice} className="rounded border border-[var(--line)] px-3 py-2" /></label>
      </div>
      <label className="grid gap-1 text-sm font-bold">Paragraph Style<input name="paragraphStyle" defaultValue={editorialProfile.paragraphStyle} className="rounded border border-[var(--line)] px-3 py-2" /></label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold">Terminology<input name="terminology" defaultValue={join(editorialProfile.terminology)} className="rounded border border-[var(--line)] px-3 py-2" /></label>
        <label className="grid gap-1 text-sm font-bold">Avoid Terms<input name="avoidTerms" defaultValue={join(editorialProfile.avoidTerms)} className="rounded border border-[var(--line)] px-3 py-2" /></label>
        <label className="grid gap-1 text-sm font-bold">Citation Style<input name="citationStyle" defaultValue={editorialProfile.citationStyle} className="rounded border border-[var(--line)] px-3 py-2" /></label>
        <label className="grid gap-1 text-sm font-bold">Formatting<input name="formattingPreferences" defaultValue={join(editorialProfile.formattingPreferences)} className="rounded border border-[var(--line)] px-3 py-2" /></label>
      </div>
      <label className="text-sm font-bold"><input type="checkbox" name="reverseInternalLinksEnabled" defaultChecked={settings.reverseInternalLinksEnabled} /> Reverse Internal Links Enabled</label>
      <input type="hidden" name="businessGoals" defaultValue={join(siteProfile.businessGoals)} />
      <input type="hidden" name="maxImageGenerations" value={settings.maxImageGenerations} />
      <button disabled={pending} className="w-fit rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{pending ? "Saving..." : "Save Automation Settings"}</button>
      {state.message ? <p className={state.ok ? "text-sm text-green-700" : "text-sm text-red-700"}>{state.message}</p> : null}
    </form>
  );
}
