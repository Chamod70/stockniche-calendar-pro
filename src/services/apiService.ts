import { GoogleGenAI } from '@google/genai';
import { StockNiche, StockPrompt, KeywordMetadata, AssetType } from '../types';

export const GEMINI_API_KEY_STORAGE = 'stockniche_pro_gemini_api_key_v1';

const FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
];

export function getStoredGeminiApiKey(): string {
  try {
    return localStorage.getItem(GEMINI_API_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export function setStoredGeminiApiKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem(GEMINI_API_KEY_STORAGE, key.trim());
    } else {
      localStorage.removeItem(GEMINI_API_KEY_STORAGE);
    }
  } catch (e) {
    console.error('Failed to save API key to localStorage', e);
  }
}

function getAuthHeaders(overrideKey?: string): Record<string, string> {
  const key = (overrideKey !== undefined ? overrideKey : getStoredGeminiApiKey()).trim();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (key) {
    headers['x-gemini-api-key'] = key;
  }
  return headers;
}

export interface NicheDiscoveryRequest {
  eventName: string;
  date: string;
  category: string;
  country?: string;
  assetTypes?: string[];
  userQuery?: string;
}

export interface PromptGenerationRequest {
  eventName: string;
  nicheName?: string;
  concept?: string;
  assetType: AssetType;
  visualStyle?: string;
  orientation?: string;
}

export interface KeywordRequest {
  eventName: string;
  concept: string;
  assetType: AssetType;
  targetCountry?: string;
}

export interface ConnectionTestResult {
  ok: boolean;
  latencyMs: number;
  modelUsed?: string;
  message?: string;
  error?: string;
}

export const apiService = {
  async getStatus(): Promise<{ status: string; hasGeminiKey: boolean; serverTime: string }> {
    const localKey = getStoredGeminiApiKey();
    try {
      const res = await fetch('/api/status', {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return {
        ...data,
        hasGeminiKey: Boolean(data.hasGeminiKey || localKey),
      };
    } catch {
      return {
        status: 'fallback',
        hasGeminiKey: Boolean(localKey),
        serverTime: new Date().toISOString(),
      };
    }
  },

  async testConnection(keyToTest?: string): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    const activeKey = (keyToTest !== undefined ? keyToTest : getStoredGeminiApiKey()).trim();

    // Try backend endpoint first
    try {
      const res = await fetch('/api/ai/test-connection', {
        method: 'POST',
        headers: getAuthHeaders(activeKey),
        body: JSON.stringify({ apiKey: activeKey }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        return data;
      }
      // If backend returned a specific validation error and we didn't get a 404/502, return it
      if (res.status === 400 && data.error && activeKey) {
        // Still try direct client SDK in case serverless env had an issue
      } else if (!activeKey) {
        return {
          ok: false,
          latencyMs: Date.now() - startTime,
          error: data.error || 'API Key එකක් ලබා දී නොමැත. කරුණාකර Gemini API Key එකක් ඇතුළත් කරන්න.',
        };
      }
    } catch {
      // Fallback to direct browser SDK test below
    }

    if (!activeKey) {
      return {
        ok: false,
        latencyMs: Date.now() - startTime,
        error: 'API Key එකක් ලබා දී නොමැත. කරුණාකර Gemini API Key එකක් ඇතුළත් කරන්න.',
      };
    }

    try {
      const ai = new GoogleGenAI({ apiKey: activeKey });
      let lastErr: any = null;
      for (const model of FALLBACK_MODELS) {
        try {
          await ai.models.generateContent({
            model,
            contents: 'Reply with OK',
          });
          const latencyMs = Date.now() - startTime;
          return {
            ok: true,
            latencyMs,
            modelUsed: model,
            message: `Connected (${model}) in ${latencyMs}ms`,
          };
        } catch (err: any) {
          lastErr = err;
        }
      }
      throw lastErr || new Error('Connection failed');
    } catch (err: any) {
      return {
        ok: false,
        latencyMs: Date.now() - startTime,
        error: err?.message || 'API Key පරීක්ෂාව අසාර්ථක විය. කරුණාකර යතුර නැවත පරීක්ෂා කරන්න.',
      };
    }
  },

  async discoverNiches(req: NicheDiscoveryRequest): Promise<StockNiche[]> {
    try {
      const res = await fetch('/api/ai/niche-discovery', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(req),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return (data.niches || []).map((n: any, idx: number) => ({
        ...n,
        id: `niche-${Date.now()}-${idx}`,
        eventName: req.eventName,
        createdAt: new Date().toISOString(),
      }));
    } catch (err) {
      console.warn('API error in discoverNiches, using client fallback:', err);
      return getClientFallbackNiches(req);
    }
  },

  async generatePrompts(req: PromptGenerationRequest): Promise<StockPrompt[]> {
    try {
      const res = await fetch('/api/ai/generate-prompts', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(req),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return (data.prompts || []).map((p: any, idx: number) => ({
        ...p,
        id: `prompt-${Date.now()}-${idx}`,
        assetType: req.assetType,
        eventName: req.eventName,
        nicheName: req.nicheName,
        createdAt: new Date().toISOString(),
      }));
    } catch (err) {
      console.warn('API error in generatePrompts, using client fallback:', err);
      return getClientFallbackPrompts(req);
    }
  },

  async generateKeywords(req: KeywordRequest): Promise<KeywordMetadata> {
    try {
      const res = await fetch('/api/ai/keywords', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(req),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API error in generateKeywords, using client fallback:', err);
      return getClientFallbackKeywords(req);
    }
  },
};

// High quality client-side fallback if disconnected or offline
function getClientFallbackNiches(req: NicheDiscoveryRequest): StockNiche[] {
  return [
    {
      id: `fallback-niche-1-${Date.now()}`,
      eventName: req.eventName,
      nicheName: `${req.eventName} Modular Marketing Badges & Emblems`,
      specificConcept: `Collection of 8 versatile celebration badges with clean editable typography space, ribbon banners, and festive embellishments for ${req.eventName}.`,
      intendedCommercialUse: 'E-commerce email marketing, website banners, social media announcements, packaging labels.',
      potentialCustomerIndustries: ['Retail', 'Digital Marketing Agencies', 'Publishing', 'Small Business'],
      targetMarket: req.country || 'Global',
      suggestedVisualStyle: 'Polished vector flat art with subtle gradient bevels, 100% scalable SVG paths',
      variationsRecommended: 8,
      differentiationStrategy: 'Offer unmerged editable vector shapes so graphic designers can easily swap brand colors and font sizes.',
      creationPriority: 'High',
      competitionLevel: 'Medium',
      productionComplexity: 'Medium',
      recommendedAssetType: 'Vector',
      suggestedTitle: `${req.eventName} Celebration Badges and Vector Elements Kit`,
      suggestedKeywords: [
        req.eventName.toLowerCase(),
        'celebration',
        'badge',
        'vector',
        'banner',
        'marketing',
        'ribbon',
        'emblem',
        'sale',
        'isolated on white',
        'copy space',
        'graphic design',
      ],
      originalityConsiderations: 'Verify zero trademark infringement and ensure harmonious contemporary color palette.',
      opportunityScore: 89,
      scoreBreakdown: {
        commercialRelevance: 92,
        seasonalDemand: 88,
        differentiationPotential: 86,
        marketReadiness: 90,
      },
      scoreExplanation: 'High search volume prior to event date by marketers looking for quick social assets.',
      createdAt: new Date().toISOString(),
    },
    {
      id: `fallback-niche-2-${Date.now()}`,
      eventName: req.eventName,
      nicheName: `${req.eventName} Authentic Diverse Lifestyle Photography`,
      specificConcept: `Candid modern interactions of diverse families or colleagues celebrating ${req.eventName} in naturally illuminated interiors.`,
      intendedCommercialUse: 'Hero web banners, magazine articles, corporate diversity and inclusion materials.',
      potentialCustomerIndustries: ['Corporate', 'Healthcare', 'Banking', 'Publishing'],
      targetMarket: req.country || 'Global',
      suggestedVisualStyle: 'Warm natural light, shallow depth of field, genuine non-posed facial expressions',
      variationsRecommended: 12,
      differentiationStrategy: 'Avoid stiff, unnatural stock photo poses; capture authentic micro-expressions with generous copy space.',
      creationPriority: 'High',
      competitionLevel: 'High',
      productionComplexity: 'High',
      recommendedAssetType: 'Stock Photography',
      suggestedTitle: `Candid Diverse People Celebrating ${req.eventName} Together`,
      suggestedKeywords: [
        req.eventName.toLowerCase(),
        'lifestyle',
        'people',
        'authentic',
        'family',
        'togetherness',
        'natural light',
        'candid',
        'celebration',
        'copy space',
      ],
      originalityConsiderations: 'Signed model releases for all identifiable individuals are strictly required for Adobe Stock commercial licensing.',
      opportunityScore: 85,
      scoreBreakdown: {
        commercialRelevance: 90,
        seasonalDemand: 86,
        differentiationPotential: 78,
        marketReadiness: 86,
      },
      scoreExplanation: 'Reliably high buyer volume from corporate creative departments.',
      createdAt: new Date().toISOString(),
    },
    {
      id: `fallback-niche-3-${Date.now()}`,
      eventName: req.eventName,
      nicheName: `${req.eventName} 3D Isometric Icon & UI Illustration Set`,
      specificConcept: `Set of 16 isometric 3D-styled icons representing celebratory items, gifts, and tools for ${req.eventName}.`,
      intendedCommercialUse: 'Mobile app onboarding screens, fintech infographics, UI design systems, website landing pages.',
      potentialCustomerIndustries: ['Software & Tech', 'Fintech', 'EdTech', 'Creative Studios'],
      targetMarket: req.country || 'Global',
      suggestedVisualStyle: 'Soft clay 3D render look with pastel gradients and subtle directional ambient occlusion',
      variationsRecommended: 16,
      differentiationStrategy: 'Consistent isometric camera perspective (30 degrees) and lighting across all 16 items for effortless UI composition.',
      creationPriority: 'Medium',
      competitionLevel: 'Low',
      productionComplexity: 'Medium',
      recommendedAssetType: '3D Render',
      suggestedTitle: `${req.eventName} Isometric 3D Icons Set for UI and App Design`,
      suggestedKeywords: [
        req.eventName.toLowerCase(),
        'isometric',
        '3d icon',
        'ui design',
        'mobile app',
        'clay style',
        'isolated on white',
        'infographics',
        'minimalist',
      ],
      originalityConsiderations: 'Keep silhouettes crisp and uncluttered for readability at small 48x48 icon scale.',
      opportunityScore: 92,
      scoreBreakdown: {
        commercialRelevance: 94,
        seasonalDemand: 85,
        differentiationPotential: 96,
        marketReadiness: 90,
      },
      scoreExplanation: 'Very low contributor competition combined with high willingness-to-pay from tech product teams.',
      createdAt: new Date().toISOString(),
    },
    {
      id: `fallback-niche-4-${Date.now()}`,
      eventName: req.eventName,
      nicheName: `${req.eventName} 6-Second Seamless Stock Video Loop`,
      specificConcept: `Atmospheric, slow cinematic push-in on celebratory festive table setting or decorative backdrop with gentle particle lighting for ${req.eventName}.`,
      intendedCommercialUse: 'Digital billboard advertising, website background video, Instagram Story video ads.',
      potentialCustomerIndustries: ['Broadcast Media', 'Digital Marketing Agencies', 'Hospitality', 'Retail'],
      targetMarket: req.country || 'Global',
      suggestedVisualStyle: 'Cinematic 4K UHD, 24fps, shallow depth of field, warm ambient lighting',
      variationsRecommended: 4,
      differentiationStrategy: 'Single smooth continuous camera motion that seamlessly loops without abrupt cuts.',
      creationPriority: 'Medium',
      competitionLevel: 'Low',
      productionComplexity: 'High',
      recommendedAssetType: 'Stock Video',
      suggestedTitle: `Atmospheric ${req.eventName} Celebration Background 4K Video Loop`,
      suggestedKeywords: [
        req.eventName.toLowerCase(),
        'background',
        'video loop',
        '4k',
        'celebration',
        'motion',
        'cinematic',
        'bokeh',
        'text space',
        'festive',
        'atmosphere',
      ],
      originalityConsiderations: 'Stock video licenses on Adobe Stock pay significantly higher royalties per download than standard image downloads.',
      opportunityScore: 90,
      scoreBreakdown: {
        commercialRelevance: 90,
        seasonalDemand: 84,
        differentiationPotential: 95,
        marketReadiness: 90,
      },
      scoreExplanation: 'High commercial value on Adobe Stock Video where quality loops earn top-tier royalties.',
      createdAt: new Date().toISOString(),
    },
  ];
}

function getClientFallbackPrompts(req: PromptGenerationRequest): StockPrompt[] {
  if (req.assetType.includes('Vector')) {
    return [
      {
        id: `fb-p-1-${Date.now()}`,
        title: 'Master Commercial Vector Illustration',
        type: 'Vector',
        assetType: req.assetType,
        eventName: req.eventName,
        nicheName: req.nicheName,
        promptText: `Native editable vector illustration of ${req.eventName}, ${req.concept || 'commercial stock design'}. Clean geometric bezier paths, solid color fills with subtle smooth gradients, isolated on a pure solid white background (#FFFFFF). High commercial microstock vector art style, balanced composition with generous copy space, modern professional aesthetic. No raster artifacts, no bitmap textures, no embedded photographs, no blur filters, no text, no watermarks, perfectly scalable SVG vector graphic.`,
        negativePrompt: 'raster, bitmap, noise, grain, photographic elements, blurry edges, cut off elements, watermark, signature, text, messy paths, dark background',
        technicalSpecs: 'Pure editable vector paths, RGB color mode, EPS10 / AI compatible, isolated objects on transparent or solid white background.',
        suggestedAspectRatios: ['1:1', '16:9', '4:3'],
        adobeStockSubmissionTip: 'Save as EPS 10 or SVG and verify in Adobe Illustrator that no raster effects (drop shadows with raster blur) or open paths are present.',
        createdAt: new Date().toISOString(),
      },
      {
        id: `fb-p-2-${Date.now()}`,
        title: 'Marketing Header & Copy-Space Banner',
        type: 'Vector',
        assetType: req.assetType,
        eventName: req.eventName,
        nicheName: req.nicheName,
        promptText: `Horizontal promotional header vector design for ${req.eventName}, featuring stylized commercial decorative motifs framing the edges, leaving a broad clean negative copy-space area in the center for marketing typography. Modern flat vector styling with vibrant gradient accents, clean vector curves, sharp edges. Isolated vector composition, commercial stock asset quality, no text or placeholder lettering.`,
        negativePrompt: 'pre-written text, messy sketches, raster pixels, photography, jagged outlines, logos, cluttered center',
        technicalSpecs: '16:9 aspect ratio, expansive central negative space (minimum 60% of canvas area free for client copy).',
        suggestedAspectRatios: ['16:9', '2:1'],
        adobeStockSubmissionTip: 'Commercial buyers specifically filter for copy-space. State "copy space" and "horizontal banner" in your keywords and title.',
        createdAt: new Date().toISOString(),
      },
      {
        id: `fb-p-3-${Date.now()}`,
        title: 'Cohesive Vector Icon & Symbol Set',
        type: 'Vector Icon Pack',
        assetType: req.assetType,
        eventName: req.eventName,
        nicheName: req.nicheName,
        promptText: `Set of 12 distinct vector icons and celebration symbols for ${req.eventName}. Cohesive visual language, consistent 4px stroke weight, rounded corners, dual-tone color palette (deep slate and bright accent color). Evenly spaced grid layout on a pure white background. Each icon cleanly separated with individual vector boundaries. Modern minimalist fintech and tech app icon style. No overlapping shapes, no text.`,
        negativePrompt: 'inconsistent stroke weights, photorealistic shading, 3D render, unaligned grid, watermarks, text labels',
        technicalSpecs: 'Grid alignment, uniform stroke widths, expandable stroke paths for EPS submission.',
        suggestedAspectRatios: ['1:1', '4:3'],
        adobeStockSubmissionTip: 'Include both an expanded outlines version and a strokes version if submitting as an EPS pack so buyers can easily change stroke thickness.',
        createdAt: new Date().toISOString(),
      },
    ];
  }

  return [
    {
      id: `fb-p-photo-1-${Date.now()}`,
      title: 'Authentic Commercial Lifestyle Photo',
      type: 'Photography',
      assetType: req.assetType,
      eventName: req.eventName,
      nicheName: req.nicheName,
      promptText: `Commercial stock photography of ${req.eventName}, ${req.concept || 'authentic celebration scene'}. Shot on Sony A7R V with 50mm f/1.4 GM lens at f/2.2. Soft diffused natural morning window light illuminating authentic diverse subjects in a modern contemporary setting. Realistic skin textures, natural candid expressions, genuine emotional connection. Crisp focal sharpness on main subject with gentle organic background bokeh. Clean aesthetic, uncluttered staging, ample negative space on right third for advertising copy. No brand logos, no trademarks.`,
      negativePrompt: 'staged fake smiles, heavy filters, oversaturated colors, harsh direct flash, digital noise, distorted hands, stock photo cliché, logos',
      technicalSpecs: '300 DPI, full frame sensor resolution (minimum 24MP+), sRGB or Adobe RGB color space.',
      suggestedAspectRatios: ['3:2', '16:9'],
      adobeStockSubmissionTip: 'Ensure all recognizable faces have signed adult/minor model releases attached in Adobe Stock Contributor Portal.',
      createdAt: new Date().toISOString(),
    },
    {
      id: `fb-p-photo-2-${Date.now()}`,
      title: 'Minimalist Festive Flat-Lay & Product Surface',
      type: 'Product Background',
      assetType: req.assetType,
      eventName: req.eventName,
      nicheName: req.nicheName,
      promptText: `Top-down flat-lay commercial stock photograph celebrating ${req.eventName}. Clean light neutral marble or linen surface decorated with tasteful artisanal seasonal props framing the borders. A clean, pristine podium or blank empty center area designed for product placement and graphic mockups. Soft directional studio lighting casting delicate realistic contact shadows. High-end lifestyle brand editorial aesthetic, 8K ultra-detailed texture.`,
      negativePrompt: 'cluttered center, dirty surfaces, blown out highlights, extreme shadows, fake plastic props, text, watermarks',
      technicalSpecs: 'Top-down 90-degree orthogonal angle, maximum depth of field (f/8 or f/11) ensuring sharp corner-to-corner focus.',
      suggestedAspectRatios: ['1:1', '16:9'],
      adobeStockSubmissionTip: 'Categorize under "Backgrounds & Textures" or "Still Life" for high visibility among e-commerce and packaging designers.',
      createdAt: new Date().toISOString(),
    },
  ];
}

function getClientFallbackKeywords(req: KeywordRequest): KeywordMetadata {
  const words = req.eventName.toLowerCase().split(/\s+/).filter(Boolean);
  const primarySubject = Array.from(new Set([...words, 'celebration', 'holiday', 'occasion', 'event', 'festival', 'tradition']));
  const conceptKeywords = ['commercial', 'marketing', 'promotion', 'advertising', 'banner', 'copy space', 'greeting card', 'design'];
  const styleKeywords = req.assetType.includes('Vector')
    ? ['vector', 'illustration', 'graphic', 'isolated', 'white background', 'clipart', 'design element', 'flat design']
    : ['photography', 'real life', 'authentic', 'natural light', 'depth of field', 'copy space', 'high resolution'];
  const seasonalKeywords = ['annual', 'seasonal', 'festive', 'commemoration', 'culture'];

  const all = Array.from(new Set([...primarySubject, ...conceptKeywords, ...styleKeywords, ...seasonalKeywords])).slice(0, 30);

  return {
    title: `${req.eventName} Commercial ${req.assetType} Concept for Advertising and Design`,
    category: req.assetType.includes('Vector') ? 'Illustrations / Vectors' : 'Lifestyle & People',
    allKeywords: all,
    keywordClusters: {
      subject: primarySubject,
      concept: conceptKeywords,
      style: styleKeywords,
      seasonal: seasonalKeywords,
      regional: [req.targetCountry?.toLowerCase() || 'global'],
    },
    forbiddenTags: ['trademark names', 'disney', 'nike', 'apple', 'adobe', 'copyrighted characters', 'unrelated buzzwords'],
    bestPracticeTip: 'Adobe Stock search places highest weight on the first 10 keywords. Place your most specific subject and commercial use terms at positions 1 through 10.',
  };
}
