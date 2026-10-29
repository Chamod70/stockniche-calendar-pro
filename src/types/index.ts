export type EventCategory =
  | 'International & UN'
  | 'National Holiday'
  | 'Religious & Cultural'
  | 'Commercial & Retail'
  | 'Seasonal & Nature'
  | 'Health & Awareness'
  | 'Technology & Innovation'
  | 'Education & Academic'
  | 'Food & Agriculture'
  | 'Sports & Entertainment'
  | 'Business & Finance'
  | 'Creative & Social Media';

export type TargetCountry =
  | 'Global'
  | 'United States'
  | 'United Kingdom'
  | 'Canada'
  | 'Australia'
  | 'Germany'
  | 'France'
  | 'Japan'
  | 'China'
  | 'India'
  | 'Sri Lanka';

export type AssetType =
  | 'Vector'
  | 'Vector Icon Pack'
  | 'Flat Illustration'
  | 'Glossy Vector'
  | 'Isolated Stock Object'
  | 'Stock Photography'
  | 'Product Background'
  | 'Text-Space Background'
  | 'Pattern & Texture'
  | 'Infographics'
  | 'Business Concept'
  | 'Seasonal Decoration'
  | 'Social Media Asset'
  | 'Stock Video'
  | '3D Render';

export type RecurrenceType = 'fixed' | 'floating' | 'lunar_estimate';

export type ConfirmationStatus = 'Official Public Holiday' | 'Confirmed Annual' | 'Estimated (Lunar/Astronomical)';

export interface StockEvent {
  id: string;
  name: string;
  month: number; // 1 - 12
  day?: number; // 1 - 31 (for fixed dates)
  calculateDate?: (year: number) => { month: number; day: number }; // For floating holidays like Thanksgiving, Easter, Mother's Day, Vesak
  category: EventCategory;
  countries: TargetCountry[];
  description: string;
  commercialValue: 'Extreme' | 'High' | 'Medium' | 'Emerging Niche';
  bestAssetTypes: AssetType[];
  confirmationStatus: ConfirmationStatus;
  officialSource?: string;
  sourceUrl?: string;
  recurrenceRule?: string;
  typicalPreparationWeeks: number; // e.g. 6 to 12 weeks before event
  tags: string[];
  seasonalTheme?: 'Spring' | 'Summer' | 'Autumn' | 'Winter' | 'Evergreen' | 'Monsoon';
}

export interface ResolvedEvent extends StockEvent {
  resolvedDate: string; // YYYY-MM-DD
  resolvedYear: number;
  resolvedMonth: number;
  resolvedDay: number;
  dayOfWeek: string;
  daysRemaining: number;
  recommendedPreparationDate: string; // YYYY-MM-DD
  preparationStatus: 'Immediate Action Needed' | 'Ideal Production Window' | 'Upcoming Planning' | 'Too Early / Evergreen' | 'Passed This Year';
  opportunityScore: number;
}

export interface ScoreBreakdown {
  commercialRelevance: number; // 0 - 100
  seasonalDemand: number; // 0 - 100
  differentiationPotential: number; // 0 - 100
  marketReadiness: number; // 0 - 100
}

export interface StockNiche {
  id: string;
  eventId?: string;
  eventName: string;
  nicheName: string;
  specificConcept: string;
  intendedCommercialUse: string;
  potentialCustomerIndustries: string[];
  targetMarket: string;
  suggestedVisualStyle: string;
  variationsRecommended: number;
  differentiationStrategy: string;
  creationPriority: 'Urgent' | 'High' | 'Medium' | 'Evergreen';
  competitionLevel: 'Low' | 'Medium' | 'High';
  productionComplexity: 'Low' | 'Medium' | 'High';
  recommendedAssetType: AssetType;
  suggestedTitle: string;
  suggestedKeywords: string[];
  originalityConsiderations: string;
  opportunityScore: number;
  scoreBreakdown: ScoreBreakdown;
  scoreExplanation: string;
  createdAt: string;
}

export interface StockPrompt {
  id: string;
  title: string;
  type: string;
  assetType: AssetType;
  eventName: string;
  nicheName?: string;
  promptText: string;
  negativePrompt: string;
  technicalSpecs: string;
  suggestedAspectRatios: string[];
  adobeStockSubmissionTip: string;
  isFavorite?: boolean;
  createdAt: string;
}

export type ProjectStatus =
  | 'Idea'
  | 'Researching'
  | 'Planned'
  | 'In Production'
  | 'Quality Review'
  | 'Ready for Submission'
  | 'Submitted'
  | 'Published'
  | 'Archived';

export interface ProjectChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ContributorProject {
  id: string;
  name: string;
  eventName: string;
  eventDate?: string;
  targetMarket: TargetCountry;
  assetCategory: AssetType;
  plannedQuantity: number;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  startDate: string; // YYYY-MM-DD
  deadline: string; // YYYY-MM-DD
  status: ProjectStatus;
  notes: string;
  prompts: string[];
  keywords: string[];
  checklist: ProjectChecklistItem[];
  opportunityScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface KeywordMetadata {
  title: string;
  category: string;
  allKeywords: string[];
  keywordClusters: {
    subject: string[];
    concept: string[];
    style: string[];
    seasonal: string[];
    regional: string[];
  };
  forbiddenTags: string[];
  bestPracticeTip: string;
}
