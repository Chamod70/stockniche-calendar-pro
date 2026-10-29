import { StockEvent, ResolvedEvent, ScoreBreakdown, AssetType } from '../types';

export interface ScoreExplanationResult {
  score: number;
  breakdown: ScoreBreakdown;
  explanation: string;
  isEditorialEstimate: boolean;
  demandTier: 'Ultra High Demand' | 'High Commercial Demand' | 'Steady Niche' | 'Moderate / Emerging';
  leadTimeFeasibility: 'Optimal Lead Time' | 'Tight Production Window' | 'Last-Minute Rush' | 'Future Horizon';
}

/**
 * Calculates an explainable 0-100 stock opportunity score based on:
 * - Commercial value rating of the event (Extreme: 40pts, High: 30pts, Medium: 20pts, Emerging: 15pts)
 * - Days remaining & lead-time window (Up to 25pts for ideal 4-12 weeks production window)
 * - Asset type synergy with the event (Up to 20pts)
 * - Market differentiation potential (Up to 15pts)
 */
export function calculateEventOpportunityScore(
  event: StockEvent,
  daysRemaining: number,
  preferredAssetType?: AssetType
): ScoreExplanationResult {
  let commercialBase = 20;
  if (event.commercialValue === 'Extreme') commercialBase = 38;
  else if (event.commercialValue === 'High') commercialBase = 30;
  else if (event.commercialValue === 'Medium') commercialBase = 22;
  else commercialBase = 16;

  // Lead-time window scoring
  let leadTimeScore = 15;
  let leadTimeFeasibility: ScoreExplanationResult['leadTimeFeasibility'] = 'Optimal Lead Time';

  const prepWeeks = event.typicalPreparationWeeks || 8;
  const prepDays = prepWeeks * 7;

  if (daysRemaining < 0) {
    leadTimeScore = 5; // Passed this year, reusable for next year
    leadTimeFeasibility = 'Future Horizon';
  } else if (daysRemaining <= 10) {
    leadTimeScore = 8; // Review queue might not approve in time
    leadTimeFeasibility = 'Last-Minute Rush';
  } else if (daysRemaining <= 28) {
    leadTimeScore = 18;
    leadTimeFeasibility = 'Tight Production Window';
  } else if (daysRemaining <= prepDays + 21 && daysRemaining >= 28) {
    leadTimeScore = 25; // Peak preparation window
    leadTimeFeasibility = 'Optimal Lead Time';
  } else if (daysRemaining <= prepDays + 60) {
    leadTimeScore = 20;
    leadTimeFeasibility = 'Optimal Lead Time';
  } else {
    leadTimeScore = 14;
    leadTimeFeasibility = 'Future Horizon';
  }

  // Asset type compatibility
  let assetScore = 15;
  if (preferredAssetType) {
    if (event.bestAssetTypes.includes(preferredAssetType)) {
      assetScore = 20;
    } else {
      assetScore = 10;
    }
  } else {
    assetScore = 18;
  }

  // Visual differentiation & seasonal demand
  const seasonalDemand = Math.min(98, Math.round(commercialBase * 2.3 + (event.commercialValue === 'Extreme' ? 10 : 0)));
  const commercialRelevance = Math.min(99, Math.round(commercialBase * 2.4));
  const differentiationPotential = event.bestAssetTypes.includes('3D Render') || event.bestAssetTypes.includes('Stock Video') ? 92 : 84;
  const marketReadiness = Math.round((leadTimeScore / 25) * 100);

  const rawScore = Math.round(commercialBase + leadTimeScore + assetScore + (differentiationPotential / 10));
  const normalizedScore = Math.max(25, Math.min(98, rawScore));

  let demandTier: ScoreExplanationResult['demandTier'] = 'Steady Niche';
  if (normalizedScore >= 88) demandTier = 'Ultra High Demand';
  else if (normalizedScore >= 75) demandTier = 'High Commercial Demand';
  else if (normalizedScore >= 55) demandTier = 'Steady Niche';
  else demandTier = 'Moderate / Emerging';

  const breakdown: ScoreBreakdown = {
    commercialRelevance,
    seasonalDemand,
    differentiationPotential,
    marketReadiness,
  };

  const explanation = `${event.commercialValue} commercial tier rating with ${daysRemaining >= 0 ? `${daysRemaining} days remaining` : 'upcoming annual cycle'}. ${
    leadTimeScore >= 20
      ? 'Current date offers the sweet spot for submission, indexing, and buyer search discovery.'
      : daysRemaining <= 14 && daysRemaining >= 0
      ? 'Note: Approaching event deadline; prioritize quick vector or photo submission to beat microstock review wait times.'
      : 'Ample time for research, concept testing, and building comprehensive asset bundles.'
  }`;

  return {
    score: normalizedScore,
    breakdown,
    explanation,
    isEditorialEstimate: true,
    demandTier,
    leadTimeFeasibility,
  };
}
