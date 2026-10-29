import { ContributorProject, StockNiche, StockPrompt, ResolvedEvent } from '../types';

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Convert Array of Objects to CSV
export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const rows = data.map((obj) =>
    headers
      .map((header) => {
        let val = obj[header];
        if (Array.isArray(val)) {
          val = val.join('; ');
        } else if (typeof val === 'object' && val !== null) {
          val = JSON.stringify(val);
        }
        const stringVal = val === undefined || val === null ? '' : String(val);
        // Escape quotes and wrap in quotes
        return `"${stringVal.replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

export function exportNichesToCSV(niches: StockNiche[], eventName?: string) {
  const formatted = niches.map((n) => ({
    'Event Name': n.eventName,
    'Niche Name': n.nicheName,
    'Asset Type': n.recommendedAssetType,
    'Opportunity Score': n.opportunityScore,
    'Priority': n.creationPriority,
    'Competition': n.competitionLevel,
    'Complexity': n.productionComplexity,
    'Suggested Title': n.suggestedTitle,
    'Target Market': n.targetMarket,
    'Commercial Use': n.intendedCommercialUse,
    'Customer Industries': n.potentialCustomerIndustries.join(', '),
    'Visual Style': n.suggestedVisualStyle,
    'Differentiation Strategy': n.differentiationStrategy,
    'Keywords': n.suggestedKeywords.join(', '),
  }));

  const prefix = eventName ? `${eventName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_` : '';
  exportToCSV(formatted, `${prefix}stock_niches_${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportPromptsToCSV(prompts: StockPrompt[], eventName?: string) {
  const formatted = prompts.map((p) => ({
    'Title': p.title,
    'Asset Type': p.assetType,
    'Event Name': p.eventName,
    'Niche': p.nicheName || '',
    'Prompt Text': p.promptText,
    'Negative Prompt': p.negativePrompt,
    'Technical Specs': p.technicalSpecs,
    'Submission Tip': p.adobeStockSubmissionTip,
  }));

  const prefix = eventName ? `${eventName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_` : '';
  exportToCSV(formatted, `${prefix}prompts_${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportProjectsToCSV(projects: ContributorProject[]) {
  const formatted = projects.map((p) => ({
    'Project Name': p.name,
    'Related Event': p.eventName,
    'Target Market': p.targetMarket,
    'Asset Category': p.assetCategory,
    'Planned Quantity': p.plannedQuantity,
    'Priority': p.priority,
    'Status': p.status,
    'Start Date': p.startDate,
    'Deadline': p.deadline,
    'Notes': p.notes,
    'Keywords': p.keywords.join(', '),
  }));

  exportToCSV(formatted, `contributor_projects_${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportEventsToCSV(events: ResolvedEvent[]) {
  const formatted = events.map((e) => ({
    'Event Name': e.name,
    'Date': e.resolvedDate,
    'Category': e.category,
    'Countries': e.countries.join(', '),
    'Commercial Value': e.commercialValue,
    'Opportunity Score': e.opportunityScore,
    'Days Remaining': e.daysRemaining,
    'Preparation Status': e.preparationStatus,
    'Recommended Prep Date': e.recommendedPreparationDate,
    'Best Asset Types': e.bestAssetTypes.join(', '),
    'Official Source': e.officialSource || '',
    'Description': e.description,
  }));

  exportToCSV(formatted, `stock_events_calendar_${new Date().toISOString().slice(0, 10)}.csv`);
}

// Backup all contributor data to a single JSON file
export function exportBackupJSON(payload: {
  projects: ContributorProject[];
  favoritePrompts: StockPrompt[];
  customEvents?: any[];
  userSettings?: any;
}) {
  const dataStr = JSON.stringify(payload, null, 2);
  downloadFile(dataStr, `stockniche_backup_${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
}

// Parse imported JSON backup
export function parseBackupJSON(jsonStr: string): {
  projects?: ContributorProject[];
  favoritePrompts?: StockPrompt[];
  customEvents?: any[];
  userSettings?: any;
} {
  return JSON.parse(jsonStr);
}
