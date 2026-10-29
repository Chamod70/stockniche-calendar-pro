import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const router = express.Router();

app.use(express.json({ limit: '10mb' }));

function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// API Health & Status
router.get('/status', (_req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY'),
    serverTime: new Date().toISOString(),
    version: '1.0.0',
  });
});

// AI Niche Discovery Endpoint
router.post('/ai/niche-discovery', async (req, res) => {
  const { eventName, date, category, country, assetTypes, userQuery } = req.body || {};
  const ai = getGenAIClient();

  if (ai) {
    try {
      const prompt = `You are a world-class Adobe Stock commercial trend analyst and creative director.
Generate 4 highly specific, profitable, commercial Adobe Stock niche ideas for the following event:
Event: "${eventName}"
Date: "${date}"
Category: "${category}"
Country/Region: "${country || 'Global'}"
Target Asset Types: ${Array.isArray(assetTypes) ? assetTypes.join(', ') : 'Vectors, Photos, Video, 3D'}
Extra Context: ${userQuery || 'Focus on high commercial demand and clear visual differentiation.'}

Return JSON with an array named "niches", where each niche contains:
- nicheName: string (descriptive, professional niche title)
- specificConcept: string (exact, vivid asset concept)
- intendedCommercialUse: string (e.g., social media ad campaign, corporate annual report, greeting card, packaging)
- potentialCustomerIndustries: string[] (e.g. ["Fintech", "Food & Beverage", "Education"])
- targetMarket: string (e.g., US, Europe, Global, Asian SMBs)
- suggestedVisualStyle: string (e.g., "Glossy 3D isometric vector", "Authentic lifestyle natural light photo", "Minimalist duo-tone vector icon set")
- variationsRecommended: number (e.g. 6 to 12)
- differentiationStrategy: string (why this stands out against saturated generic stock)
- creationPriority: "Urgent" | "High" | "Medium" | "Evergreen"
- competitionLevel: "Low" | "Medium" | "High"
- productionComplexity: "Low" | "Medium" | "High"
- recommendedAssetType: "Vector" | "Vector Icon Pack" | "Stock Photography" | "Product Background" | "Stock Video" | "3D Render"
- suggestedTitle: string (Adobe Stock SEO title, under 70 chars, commercial)
- suggestedKeywords: string[] (15-25 highly relevant, clean Adobe Stock keywords without trademark violations)
- originalityConsiderations: string
- opportunityScore: number (0 to 100 explainable score based on commercial demand, competition, seasonality)
- scoreBreakdown: {
    commercialRelevance: number,
    seasonalDemand: number,
    differentiationPotential: number,
    marketReadiness: number
  }
- scoreExplanation: string (1-2 sentences explaining why this score was assigned)

Only return valid JSON without markdown wrapping.`;

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      return res.json(parsed);
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to algorithmic generator:', err?.message || err);
    }
  }

  const fallbackNiches = generateAlgorithmicNiches(eventName || 'Seasonal Event', category || 'Holiday', country, assetTypes);
  return res.json({ niches: fallbackNiches, source: 'algorithmic_engine' });
});

// AI Prompt Generator Endpoint
router.post('/ai/generate-prompts', async (req, res) => {
  const { eventName, nicheName, concept, assetType, visualStyle, orientation } = req.body || {};
  const ai = getGenAIClient();

  if (ai) {
    try {
      const prompt = `You are a specialized AI prompt engineer for commercial Adobe Stock production.
Create copy-ready generative prompts for:
Event: "${eventName}"
Niche: "${nicheName || eventName}"
Concept: "${concept || 'Commercial stock visual'}"
Asset Type: "${assetType || 'Vector'}"
Style: "${visualStyle || 'Modern commercial stock'}"
Orientation: "${orientation || 'Horizontal 16:9'}"

Generate 3 distinct prompt variations:
1. "Primary Commercial Master": Optimized for the primary commercial stock buyer.
2. "Negative Space / Copy Space": Staged with ample clean copy space for designers and marketers to add headline text.
3. "Detail & Iconography / Micro-Scene": Focused on isolated modular elements, icon packs, or macro-details.

Crucial Technical Guidelines:
- If Vector: Prompts must explicitly specify: "Native editable vector graphic, clean vector paths, flat vector fills and clean gradients, no raster artifacts, isolated on pure solid white background, no text, no watermark, commercial microstock quality".
- If Photography: Specify camera model suggestion (e.g. Sony A7IV 85mm f/1.8), soft diffused natural studio lighting, authentic diverse model expression, shallow depth of field, realistic textures, crisp color grading, ample copy space.
- If Video: 6-second stock clip specification, single coherent smooth camera motion (e.g. slow slider push-in at 24fps), seamless loopable cadence, high production lighting, 4K UHD.

Return JSON with:
{
  "prompts": [
    {
      "title": string,
      "type": string,
      "promptText": string,
      "negativePrompt": string,
      "technicalSpecs": string,
      "suggestedAspectRatios": string[],
      "adobeStockSubmissionTip": string
    }
  ]
}

Return ONLY valid JSON.`;

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.6,
        },
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      return res.json(parsed);
    } catch (err: any) {
      console.warn('Gemini prompt generation failed, using fallback:', err?.message || err);
    }
  }

  const fallbackPrompts = generateAlgorithmicPrompts(
    eventName || 'Seasonal Event',
    nicheName || '',
    concept || 'commercial stock design',
    assetType || 'Vector',
    visualStyle || ''
  );
  return res.json({ prompts: fallbackPrompts, source: 'algorithmic_engine' });
});

// AI Keyword & Metadata Assistant Endpoint
router.post('/ai/keywords', async (req, res) => {
  const { eventName, concept, assetType, targetCountry } = req.body || {};
  const ai = getGenAIClient();

  if (ai) {
    try {
      const prompt = `You are an expert Adobe Stock metadata specialist.
For an asset with the following details:
Event/Theme: "${eventName}"
Concept: "${concept}"
Asset Type: "${assetType}"
Target Market: "${targetCountry || 'Global'}"

Generate:
1. Recommended Adobe Stock Title (max 70 characters, clear, commercial, grammatically natural, no comma-separated keywords in title).
2. Category: standard Adobe Stock category.
3. 25-35 highly relevant, high-search-intent keywords organized by:
   - Primary Subject Keywords (5-8 words)
   - Concept & Commercial Intent Keywords (6-8 words)
   - Visual Style & Technical Keywords (4-6 words)
   - Seasonal/Event Keywords (4-6 words)
   - Geographic/Regional Keywords (if applicable)
4. Blacklisted / Negative terms to avoid (e.g. brand names, trademarked slogans, prohibited Adobe Stock tags).

Return JSON:
{
  "title": string,
  "category": string,
  "allKeywords": string[],
  "keywordClusters": {
    "subject": string[],
    "concept": string[],
    "style": string[],
    "seasonal": string[],
    "regional": string[]
  },
  "forbiddenTags": string[],
  "bestPracticeTip": string
}

Return ONLY valid JSON.`;

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.5,
        },
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      return res.json(parsed);
    } catch (err: any) {
      console.warn('Gemini keywords failed, using fallback:', err?.message || err);
    }
  }

  const fallbackKeywords = generateAlgorithmicKeywords(
    eventName || 'Seasonal Event',
    concept || '',
    assetType || 'Vector'
  );
  return res.json(fallbackKeywords);
});

// Support both /api/* and /* paths for Vercel serverless & local Express compatibility
app.use('/api', router);
app.use('/', router);

function generateAlgorithmicNiches(eventName: string, _category: string, country?: string, _assetTypes?: string[]) {
  return [
    {
      nicheName: `${eventName} Commercial Hero Vectors & Badge Kits`,
      specificConcept: `Modular celebration emblem kit with typography placeholders, clean ribbon accents, and badge frames for ${eventName} social media banners.`,
      intendedCommercialUse: 'E-commerce promotional banners, social media marketing headers, company email newsletters.',
      potentialCustomerIndustries: ['Retail', 'Corporate Marketing', 'Graphic Design Agencies', 'E-commerce'],
      targetMarket: country || 'Global',
      suggestedVisualStyle: 'Polished vector flat-art with glossy gradient bevels and isolated elements on transparent layers',
      variationsRecommended: 8,
      differentiationStrategy: 'Avoid single flattened illustrations; provide multi-component kit where buyers can independently rearrange symbols, banners, and typography.',
      creationPriority: 'High',
      competitionLevel: 'Medium',
      productionComplexity: 'Medium',
      recommendedAssetType: 'Vector',
      suggestedTitle: `${eventName} Celebration Badges and Vector Marketing Elements Kit`,
      suggestedKeywords: [
        eventName.toLowerCase(),
        'celebration',
        'badge',
        'vector',
        'banner',
        'marketing',
        'sale promotion',
        'ribbon',
        'emblem',
        'graphic design',
        'isolated',
        'modern',
        'set',
        'collection',
        'copy space',
      ],
      originalityConsiderations: 'Include localized cultural nuances, modern typography pairing, and ensure no copyrighted brand elements.',
      opportunityScore: 88,
      scoreBreakdown: {
        commercialRelevance: 92,
        seasonalDemand: 86,
        differentiationPotential: 85,
        marketReadiness: 90,
      },
      scoreExplanation: 'High commercial demand from marketers seeking quick branding elements 4-6 weeks before the occasion.',
    },
    {
      nicheName: `${eventName} Authentic Lifestyle Stock Photography`,
      specificConcept: `Candid modern interactions of diverse families or colleagues celebrating and preparing for ${eventName} in bright, naturally lit interiors with authentic emotional resonance.`,
      intendedCommercialUse: 'Hero imagery for corporate diversity initiatives, banking ads, retail seasonal campaigns, editorial articles.',
      potentialCustomerIndustries: ['Advertising', 'Healthcare', 'Banking', 'Publishing'],
      targetMarket: country || 'Global',
      suggestedVisualStyle: 'Warm natural light, shallow depth of field, 50mm f/1.4 aesthetic, candid non-posed expressions',
      variationsRecommended: 12,
      differentiationStrategy: 'Steer clear of stiff, staged poses looking directly into camera; capture authentic unposed micro-moments with generous negative copy space.',
      creationPriority: 'High',
      competitionLevel: 'High',
      productionComplexity: 'High',
      recommendedAssetType: 'Stock Photography',
      suggestedTitle: `Diverse People Celebrating ${eventName} Together at Home`,
      suggestedKeywords: [
        eventName.toLowerCase(),
        'lifestyle',
        'people',
        'family',
        'togetherness',
        'authentic',
        'celebration',
        'happiness',
        'home interior',
        'natural light',
        'candid',
        'copy space',
        'generations',
      ],
      originalityConsiderations: 'Ensure valid model releases and property releases for private locations.',
      opportunityScore: 84,
      scoreBreakdown: {
        commercialRelevance: 90,
        seasonalDemand: 88,
        differentiationPotential: 75,
        marketReadiness: 85,
      },
      scoreExplanation: 'Consistently strong volume of corporate and editorial buyers, offset by moderate existing photo competition.',
    },
    {
      nicheName: `${eventName} Minimalist 3D Isometric Icon & Concept Pack`,
      specificConcept: `Set of 16 isometric 3D-styled icons representing key symbols, instruments, gifts, and activities associated with ${eventName}.`,
      intendedCommercialUse: 'Mobile app onboarding screens, fintech infographics, UI design systems, website landing pages.',
      potentialCustomerIndustries: ['Software & Tech', 'Fintech', 'EdTech', 'Creative Studios'],
      targetMarket: country || 'Global',
      suggestedVisualStyle: 'Soft clay 3D render look with subtle pastel palette and directional ambient occlusion shadows',
      variationsRecommended: 16,
      differentiationStrategy: 'Deliver uniform camera angles (30° isometric) and matching lighting setups so developers can mix and match icons seamlessly.',
      creationPriority: 'Medium',
      competitionLevel: 'Low',
      productionComplexity: 'Medium',
      recommendedAssetType: '3D Render',
      suggestedTitle: `${eventName} Isometric 3D Icons Set for UI and App Design`,
      suggestedKeywords: [
        eventName.toLowerCase(),
        'isometric',
        '3d icon',
        'ui design',
        'mobile app',
        'minimalist',
        'clay style',
        'symbol',
        'app icon',
        'vector 3d',
        'isolated on white',
      ],
      originalityConsiderations: 'Keep silhouettes bold and recognizable at 32x32px thumbnails for mobile UI usability.',
      opportunityScore: 91,
      scoreBreakdown: {
        commercialRelevance: 94,
        seasonalDemand: 85,
        differentiationPotential: 95,
        marketReadiness: 88,
      },
      scoreExplanation: 'Outstanding differentiation potential because tech and app creators actively seek clean 3D isometric seasonal UI assets with low competition.',
    },
    {
      nicheName: `${eventName} 6-Second Seamless Stock Video Background`,
      specificConcept: `Slow, elegant cinematic push-in on celebratory festive table setting or ambient atmospheric background with gentle floating particle lighting and ample text space for ${eventName}.`,
      intendedCommercialUse: 'Digital billboards, website video headers, Instagram Stories video ads, corporate video greetings.',
      potentialCustomerIndustries: ['Broadcast Media', 'Digital Marketing', 'Hospitality', 'Luxury Brands'],
      targetMarket: country || 'Global',
      suggestedVisualStyle: 'Cinematic 4K UHD, 24fps, subtle bokeh, shallow depth of field, warm ambient color grading',
      variationsRecommended: 4,
      differentiationStrategy: 'Strict 6-second seamless loopable motion that does not distract from overlaid client text or logos.',
      creationPriority: 'Medium',
      competitionLevel: 'Low',
      productionComplexity: 'High',
      recommendedAssetType: 'Stock Video',
      suggestedTitle: `Atmospheric ${eventName} Celebration Background 4K Video Loop`,
      suggestedKeywords: [
        eventName.toLowerCase(),
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
        'digital ad',
      ],
      originalityConsiderations: 'High commercial value on Adobe Stock Video where quality loops earn significantly higher royalties per download.',
      opportunityScore: 89,
      scoreBreakdown: {
        commercialRelevance: 90,
        seasonalDemand: 82,
        differentiationPotential: 94,
        marketReadiness: 90,
      },
      scoreExplanation: 'Video assets command higher revenue per license; low contributor saturation in niche festive video loops creates high ROI.',
    },
  ];
}

function generateAlgorithmicPrompts(eventName: string, _nicheName: string, concept: string, assetType: string, _visualStyle: string) {
  if (assetType === 'Vector' || assetType === 'Vector Icon Pack') {
    return [
      {
        title: 'Master Commercial Vector Illustration',
        type: 'Vector',
        promptText: `Native editable vector illustration of ${eventName}, ${concept}. Clean geometric bezier paths, solid color fills with subtle smooth gradients, isolated on a pure solid white background (#FFFFFF). High commercial microstock vector art style, balanced composition with generous copy space, modern professional aesthetic. No raster artifacts, no bitmap textures, no embedded photographs, no blur filters, no text, no watermarks, perfectly scalable SVG vector graphic.`,
        negativePrompt: 'raster, bitmap, noise, grain, photographic elements, blurry edges, cut off elements, watermark, signature, text, messy paths, dark background',
        technicalSpecs: 'Pure editable vector paths, RGB color mode, EPS10 / AI compatible, isolated objects on transparent or solid white background.',
        suggestedAspectRatios: ['1:1', '16:9', '4:3'],
        adobeStockSubmissionTip: 'Save as EPS 10 or SVG and verify in Adobe Illustrator that no raster effects (drop shadows with raster blur) or open paths are present.',
      },
      {
        title: 'Marketing Header & Copy-Space Vector Banner',
        type: 'Vector',
        promptText: `Horizontal promotional header vector design for ${eventName}, featuring stylized commercial decorative motifs framing the edges, leaving a broad clean negative copy-space area in the center for marketing typography. Modern flat vector styling with vibrant gradient accents, clean vector curves, sharp edges. Isolated vector composition, commercial stock asset quality, no text or placeholder lettering.`,
        negativePrompt: 'pre-written text, messy sketches, raster pixels, photography, jagged outlines, logos, cluttered center',
        technicalSpecs: '16:9 aspect ratio, expansive central negative space (minimum 60% of canvas area free for client copy).',
        suggestedAspectRatios: ['16:9', '2:1'],
        adobeStockSubmissionTip: 'Commercial buyers specifically filter for copy-space. State "copy space" and "horizontal banner" in your keywords and title.',
      },
      {
        title: 'Cohesive Vector Icon & Symbol Set',
        type: 'Vector Icon Pack',
        promptText: `Set of 12 distinct vector icons and celebration symbols for ${eventName}. Cohesive visual language, consistent 4px stroke weight, rounded corners, dual-tone color palette (deep slate and bright accent color). Evenly spaced grid layout on a pure white background. Each icon cleanly separated with individual vector boundaries. Modern minimalist fintech and tech app icon style. No overlapping shapes, no text.`,
        negativePrompt: 'inconsistent stroke weights, photorealistic shading, 3D render, unaligned grid, watermarks, text labels',
        technicalSpecs: 'Grid alignment, uniform stroke widths, expandable stroke paths for EPS submission.',
        suggestedAspectRatios: ['1:1', '4:3'],
        adobeStockSubmissionTip: 'Include both an expanded outlines version and a strokes version if submitting as an EPS pack so buyers can easily change stroke thickness.',
      },
    ];
  }

  if (assetType === 'Stock Photography' || assetType === 'Product Background') {
    return [
      {
        title: 'Authentic Commercial Lifestyle Photo',
        type: 'Photography',
        promptText: `Commercial stock photography of ${eventName}, ${concept}. Shot on Sony A7R V with 50mm f/1.4 GM lens at f/2.2. Soft diffused natural morning window light illuminating authentic diverse subjects in a modern contemporary setting. Realistic skin textures, natural candid expressions, genuine emotional connection. Crisp focal sharpness on main subject with gentle organic background bokeh. Clean aesthetic, uncluttered staging, ample negative space on right third for advertising copy. No brand logos, no trademarks.`,
        negativePrompt: 'staged fake smiles, heavy filters, oversaturated colors, harsh direct flash, digital noise, distorted hands, stock photo cliché, logos',
        technicalSpecs: '300 DPI, full frame sensor resolution (minimum 24MP+), sRGB or Adobe RGB color space.',
        suggestedAspectRatios: ['3:2', '16:9'],
        adobeStockSubmissionTip: 'Ensure all recognizable faces have signed adult/minor model releases attached in Adobe Stock Contributor Portal.',
      },
      {
        title: 'Minimalist Festive Flat-Lay / Product Mockup Surface',
        type: 'Product Background',
        promptText: `Top-down flat-lay commercial stock photograph celebrating ${eventName}. Clean light neutral marble or linen surface decorated with tasteful artisanal seasonal props framing the borders. A clean, pristine podium or blank empty center area designed for product placement and graphic mockups. Soft directional studio lighting casting delicate realistic contact shadows. High-end lifestyle brand editorial aesthetic, 8K ultra-detailed texture.`,
        negativePrompt: 'cluttered center, dirty surfaces, blown out highlights, extreme shadows, fake plastic props, text, watermarks',
        technicalSpecs: 'Top-down 90-degree orthogonal angle, maximum depth of field (f/8 or f/11) ensuring sharp corner-to-corner focus.',
        suggestedAspectRatios: ['1:1', '16:9'],
        adobeStockSubmissionTip: 'Categorize under "Backgrounds & Textures" or "Still Life" for high visibility among e-commerce and packaging designers.',
      },
      {
        title: 'Moody Editorial & Cultural Documentary Still',
        type: 'Photography',
        promptText: `Cinematic cultural stock photograph depicting traditional preparations and rituals of ${eventName}. Atmospheric chiaroscuro lighting with warm tungsten lamp glow against deep shadow tones. Focus on artisan hands crafting celebratory ornaments or festive culinary dishes. Authentic cultural details, rich textures of heritage fabrics and wood. Documentary editorial tone with commercial polish. Shot on 35mm f/1.8 lens.`,
        negativePrompt: 'stereotypical caricature, artificial lighting, motion blur, out of focus subject, corporate suit, generic office setting',
        technicalSpecs: 'High dynamic range capture, rich shadow detail without digital noise, natural warm color temperature (3200K - 4000K).',
        suggestedAspectRatios: ['16:9', '3:2'],
        adobeStockSubmissionTip: 'Tag accurate geographic, cultural, and ethnic terms to help buyers searching for authentic regional representation.',
      },
    ];
  }

  return [
    {
      title: 'Cinematic 6-Second Atmospheric Loop',
      type: 'Stock Video',
      promptText: `6-second cinematic commercial stock video clip of ${eventName}, ${concept}. Slow, buttery-smooth motorized slider push-in at 24fps in 4K UHD. Beautiful festive table setting with gentle flickering candlelight and floating subtle golden dust particles catching ambient rim light. Natural cinematic color grading, ARRI Alexa Mini Look, Cooke anamorphic lens flare. The camera movement completes one subtle continuous focal transition, making it seamlessly loopable. Broad negative copy space on the left half of the frame.`,
      negativePrompt: 'shaky handheld camera, sudden zoom, erratic camera speed, jarring cuts, low resolution, digital artifacts, text overlays, logos',
      technicalSpecs: '4K ProRes 422 or H.264, 24fps or 30fps, 3840x2160, exactly 6.0 seconds duration, seamless loop friendly.',
      suggestedAspectRatios: ['16:9'],
      adobeStockSubmissionTip: 'Adobe Stock video buyers love 5-10 second clips that can be looped as website video backgrounds and digital out-of-home displays.',
    },
    {
      title: 'High-Impact Social Ad Vertical Video (9:16)',
      type: 'Stock Video',
      promptText: `Vertical 9:16 video clip for TikTok and Instagram Reels seasonal advertising. Dynamic top-down reveal of hands arranging festive gift boxes, ribbon bows, and celebration cards for ${eventName}. Fluid, cheerful motion with stop-motion charm or crisp high-frame-rate 60fps slow motion. Bright, vibrant commercial lighting, punchy modern pop-color palette. Center area optimized for mobile phone UI overlays.`,
      negativePrompt: 'landscape framing, horizontal black bars, dark muddy lighting, static boredom, jerky movements, brand labels',
      technicalSpecs: '1080x1920 (9:16 vertical), 60fps slowed to 30fps for smooth motion, clean commercial grade.',
      suggestedAspectRatios: ['9:16'],
      adobeStockSubmissionTip: 'Vertical video demand on Adobe Stock is accelerating rapidly due to social media marketing teams creating Reels and TikTok ads.',
    },
    {
      title: 'Subtle Abstract Celebration Motion Background',
      type: 'Stock Video',
      promptText: `Abstract elegant celebratory background for ${eventName}. Soft flowing silk-like gradient ribbons of light and gentle glowing bokeh orbs drifting gracefully across a deep navy and champagne gold environment. Ultra-smooth 6-second fluid physics simulation. Designed specifically as an unobtrusive backdrop for corporate keynote video presentations and broadcast news lower-thirds.`,
      negativePrompt: 'distracting flashing lights, strobe, chaotic motion, loud colors, low bitrate banding, pixilation',
      technicalSpecs: '16:9 4K, 30fps, wide color gamut (Rec.709 / DCI-P3), perfect 6-second cycle loop.',
      suggestedAspectRatios: ['16:9'],
      adobeStockSubmissionTip: 'Broadcast and corporate video editors purchase abstract themed motion backgrounds in high volume for seasonal greetings.',
    },
  ];
}

function generateAlgorithmicKeywords(eventName: string, concept: string, assetType: string) {
  const words = eventName.toLowerCase().split(/\s+/).filter(Boolean);
  const cleanConcept = (concept || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 3);

  const primarySubject = Array.from(new Set([
    ...words,
    'celebration',
    'holiday',
    'occasion',
    'event',
    'festival',
    'tradition',
  ]));

  const conceptKeywords = Array.from(new Set([
    ...cleanConcept.slice(0, 5),
    'commercial',
    'marketing',
    'promotion',
    'advertisement',
    'campaign',
    'banner',
    'copy space',
    'greeting card',
  ]));

  const styleKeywords = assetType.includes('Vector')
    ? ['vector', 'illustration', 'graphic', 'isolated', 'white background', 'clipart', 'design element', 'flat design', 'badge', 'eps']
    : assetType.includes('Photo')
    ? ['photography', 'real life', 'authentic', 'natural light', 'depth of field', 'copy space', 'high resolution', 'close up', 'candid']
    : ['video', 'footage', 'motion', '4k', 'loop', 'cinematic', 'background', 'clip', 'animation'];

  const seasonalKeywords = [
    'annual',
    'seasonal',
    'festive',
    'special day',
    'commemoration',
    'culture',
  ];

  const all = Array.from(new Set([...primarySubject, ...conceptKeywords, ...styleKeywords, ...seasonalKeywords])).slice(0, 35);

  return {
    title: `${eventName} Commercial ${assetType} Concept for Marketing and Design`,
    category: assetType.includes('Vector') ? 'Illustrations / Vectors' : assetType.includes('Photo') ? 'Lifestyle & People' : 'Video Footage',
    allKeywords: all,
    keywordClusters: {
      subject: primarySubject,
      concept: conceptKeywords,
      style: styleKeywords,
      seasonal: seasonalKeywords,
      regional: ['global', 'international'],
    },
    forbiddenTags: ['trademark names', 'disney', 'nike', 'apple', 'adobe', 'copyrighted characters', 'unrelated buzzwords'],
    bestPracticeTip: 'Adobe Stock algorithm prioritizes the first 10 keywords most heavily. Ensure your most specific subject and commercial use keywords are placed at positions 1 through 10.',
  };
}

export default app;

