export type OpportunityInputs = {
  serpWeakness: number;
  topicalRelevance: number;
  rankingFeasibility: number;
  searchDemand: number;
  businessValue: number;
  trafficPotential: number;
  contentGap: number;
  trend: number;
  internalLinkSupport: number;
};

const weights: Record<keyof OpportunityInputs, number> = {
  serpWeakness: 20,
  topicalRelevance: 15,
  rankingFeasibility: 15,
  searchDemand: 15,
  businessValue: 10,
  trafficPotential: 10,
  contentGap: 5,
  trend: 5,
  internalLinkSupport: 5,
};

export function scoreOpportunity(input: OpportunityInputs) {
  const components = Object.fromEntries(Object.entries(input).map(([key, value]) => {
    const weight = weights[key as keyof OpportunityInputs];
    return [key, Math.max(0, Math.min(100, value)) * weight / 100];
  })) as Record<keyof OpportunityInputs, number>;
  const total = Object.values(components).reduce((sum, value) => sum + value, 0);
  return { score: Math.round(total), components };
}
