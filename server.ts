import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const GEMINI_MODEL = 'gemini-4-hydrogen';
const MAX_IMAGES = 5;
const MAX_BASE64_CHARS = 7_500_000;

interface ValidatedImagePart {
  mimeType: string;
  data: string;
}

interface CatalogVariantInput {
  id: string;
  name: string;
  price: number;
  dimensionsOrCoverage: string;
  stock: number;
}

interface CatalogProductInput {
  id: string;
  name: string;
  category: string;
  shortDescription: string;
  image: string;
  climateSuitability?: string;
  coverageOrCapacity?: string;
  limitations?: string[];
  variants: CatalogVariantInput[];
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function mapGeminiError(err: unknown): { status: number; message: string } {
  const rawMessage = err instanceof Error ? err.message : String(err);
  const lower = rawMessage.toLowerCase();

  if (lower.includes('api_key_invalid') || lower.includes('permission_denied') || lower.includes('403')) {
    return {
      status: 403,
      message:
        'Gemini API key could not be verified. Please check your GEMINI_API_KEY in Settings > Secrets.',
    };
  }
  if (lower.includes('resource_exhausted') || lower.includes('429')) {
    return {
      status: 429,
      message: 'AI analysis quota is temporarily busy. Please wait a moment and try again.',
    };
  }
  if (lower.includes('not_found') || lower.includes('404')) {
    return {
      status: 502,
      message: 'Configured Gemini model was not found. Please try again shortly.',
    };
  }
  return {
    status: 502,
    message: 'Unable to complete AI analysis right now. Please try again.',
  };
}

function parseDataUrlImage(input: unknown): ValidatedImagePart | null {
  if (typeof input !== 'string' || input.length > MAX_BASE64_CHARS) {
    return null;
  }
  const match = /^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(input);
  if (!match) {
    return null;
  }
  const mimeType = match[1] === 'image/jpg' ? 'image/jpeg' : match[1];
  const data = match[2];
  if (!data || data.length < 32) {
    return null;
  }
  return { mimeType, data };
}

function weatherCodeToLabel(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code === 1) return 'Mainly clear';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Hazy / Fog';
  if (code >= 51 && code <= 57) return 'Light drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Ambient outdoor weather';
}

async function fetchOpenMeteoCurrent(lat: number, lon: number) {
  const weatherParams = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
    timezone: 'auto',
  });

  const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?${weatherParams.toString()}`);
  if (!weatherRes.ok) {
    throw new Error(`Open-Meteo weather request failed (${weatherRes.status})`);
  }
  const weatherJson = (await weatherRes.json()) as {
    current?: {
      temperature_2m?: number;
      relative_humidity_2m?: number;
      apparent_temperature?: number;
      weather_code?: number;
      wind_speed_10m?: number;
      time?: string;
    };
  };

  const curr = weatherJson.current;
  if (!curr || typeof curr.temperature_2m !== 'number') {
    throw new Error('Weather API returned incomplete data');
  }

  return {
    temperatureC: Math.round(curr.temperature_2m * 10) / 10,
    apparentTempC:
      typeof curr.apparent_temperature === 'number'
        ? Math.round(curr.apparent_temperature * 10) / 10
        : Math.round(curr.temperature_2m * 10) / 10,
    humidityPct: typeof curr.relative_humidity_2m === 'number' ? Math.round(curr.relative_humidity_2m) : 50,
    windSpeedKmh: typeof curr.wind_speed_10m === 'number' ? Math.round(curr.wind_speed_10m * 10) / 10 : 0,
    conditionLabel: weatherCodeToLabel(typeof curr.weather_code === 'number' ? curr.weather_code : 0),
    fetchedAt: curr.time || new Date().toISOString(),
  };
}

async function reverseGeocodeLabel(lat: number, lon: number): Promise<{ name: string; region?: string }> {
  try {
    const geoParams = new URLSearchParams({
      latitude: lat.toFixed(4),
      longitude: lon.toFixed(4),
      localityLanguage: 'en',
    });
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?${geoParams.toString()}`
    );
    if (!res.ok) {
      return { name: `Coordinates (${lat.toFixed(2)}, ${lon.toFixed(2)})` };
    }
    const data = (await res.json()) as {
      city?: string;
      locality?: string;
      principalSubdivision?: string;
      countryName?: string;
    };
    const city = data.city || data.locality || data.principalSubdivision;
    const region = [data.principalSubdivision, data.countryName].filter(Boolean).join(', ');
    return {
      name: city || `Coordinates (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
      region: region || undefined,
    };
  } catch {
    return { name: `Coordinates (${lat.toFixed(2)}, ${lon.toFixed(2)})` };
  }
}

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  // Real-time weather by coordinates
  app.get('/api/weather', async (req: Request, res: Response) => {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({ error: 'Valid latitude and longitude coordinates are required.' });
    }

    try {
      const [weather, place] = await Promise.all([
        fetchOpenMeteoCurrent(lat, lon),
        reverseGeocodeLabel(lat, lon),
      ]);

      return res.json({
        locationName: place.name,
        regionOrCountry: place.region,
        latitude: lat,
        longitude: lon,
        ...weather,
        source: 'geolocation',
      });
    } catch (err) {
      console.error('Weather API error:', err);
      return res.status(502).json({
        error: 'Unable to fetch real-time outdoor temperature from the weather service right now.',
      });
    }
  });

  // Real-time weather by city / town search
  app.get('/api/weather/search', async (req: Request, res: Response) => {
    const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (query.length < 2 || query.length > 100) {
      return res.status(400).json({ error: 'Please enter a city or town name (at least 2 characters).' });
    }

    try {
      const searchParams = new URLSearchParams({
        name: query,
        count: '5',
        language: 'en',
        format: 'json',
      });
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${searchParams.toString()}`);
      if (!geoRes.ok) {
        throw new Error(`Geocoding failed (${geoRes.status})`);
      }

      const geoJson = (await geoRes.json()) as {
        results?: Array<{
          name: string;
          admin1?: string;
          country?: string;
          latitude: number;
          longitude: number;
        }>;
      };

      const matches = geoJson.results || [];
      if (matches.length === 0) {
        return res.status(404).json({
          error: `No matching location found for "${query}". Try a nearby major city.`,
        });
      }

      const top = matches[0];
      const weather = await fetchOpenMeteoCurrent(top.latitude, top.longitude);
      const regionParts = [top.admin1, top.country].filter(Boolean).join(', ');

      return res.json({
        weather: {
          locationName: top.name,
          regionOrCountry: regionParts || undefined,
          latitude: top.latitude,
          longitude: top.longitude,
          ...weather,
          source: 'manual',
        },
        candidates: matches.map((m) => ({
          name: m.name,
          region: [m.admin1, m.country].filter(Boolean).join(', '),
          latitude: m.latitude,
          longitude: m.longitude,
        })),
      });
    } catch (err) {
      console.error('Weather search error:', err);
      return res.status(502).json({
        error: 'Could not look up weather for that location. Please try again.',
      });
    }
  });

  // AI Room Photo & 360 Panoramic Analysis
  app.post('/api/cooling/analyze-room', async (req: Request, res: Response) => {
    const body = req.body as {
      consentGranted?: unknown;
      images?: unknown;
      isPanoramic?: unknown;
      userDimensions?: {
        lengthFt?: unknown;
        widthFt?: unknown;
        heightFt?: unknown;
      };
    };

    if (body?.consentGranted !== true) {
      return res.status(400).json({
        error: 'User privacy consent is required before analyzing room photographs.',
      });
    }

    if (!Array.isArray(body.images) || body.images.length === 0 || body.images.length > MAX_IMAGES) {
      return res.status(400).json({
        error: `Please provide between 1 and ${MAX_IMAGES} valid room images (JPEG, PNG, or WebP).`,
      });
    }

    const parsedImages: ValidatedImagePart[] = [];
    for (const rawImg of body.images) {
      const parsed = parseDataUrlImage(rawImg);
      if (!parsed) {
        return res.status(400).json({
          error: 'One or more uploaded images are invalid or exceed the size limit.',
        });
      }
      parsedImages.push(parsed);
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error:
          'GEMINI_API_KEY is not configured on the server yet. Add it in Settings > Secrets to enable AI room analysis.',
      });
    }

    const isPanoramic = body.isPanoramic === true;
    const len = Number(body.userDimensions?.lengthFt);
    const wid = Number(body.userDimensions?.widthFt);
    const hgt = Number(body.userDimensions?.heightFt);
    const hasUserDims =
      Number.isFinite(len) && len > 0 && len <= 500 && Number.isFinite(wid) && wid > 0 && wid <= 500;

    const dimensionContext = hasUserDims
      ? `The user also provided measured room dimensions: ${len} ft length × ${wid} ft width${
          Number.isFinite(hgt) && hgt > 0 ? ` × ${hgt} ft ceiling height` : ''
        } (approx ${Math.round(len * wid)} sq ft).`
      : 'The user has NOT entered manual room dimensions yet.';

    const promptText = `Analyze ${
      isPanoramic ? 'this 360-degree panoramic room image' : `these ${parsedImages.length} room photo(s)`
    } for passive & traditional Indian natural cooling planning (e.g., khus window screens, bamboo chick blinds, terracotta cooling towers, matka clay water pots, lime-washed terrace/roof cooling, jali ventilation panels, or courtyard airflow design).

${dimensionContext}

CRITICAL HONESTY RULES:
1. NEVER claim exact measurements from ordinary photographs without a physical scale reference.
2. If the user has not provided dimensions, set "dimensionsCertainty" to "uncertain" and "needsUserDimensions" to true, and give an honest explanation in "dimensionNote" asking the user to enter room length, width, and ceiling height (you may leave estimatedLengthFt/WidthFt/AreaSqFt null or give a clearly marked rough visual range only if clear architectural cues like standard 7ft doors exist).
3. Identify visible windows, doors, ventilation openings, wall/balcony surfaces, direct sunlight or glare cues, and concrete installation spots for natural cooling items.
4. Keep observations grounded strictly in what is visible in the photo(s).`;

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: {
          parts: [
            ...parsedImages.map((img) => ({
              inlineData: {
                mimeType: img.mimeType,
                data: img.data,
              },
            })),
            { text: promptText },
          ],
        },
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              roomType: {
                type: Type.STRING,
                description: 'Detected space type such as Bedroom, Living Room, Balcony, Kitchen, Office, or Courtyard.',
              },
              summary: {
                type: Type.STRING,
                description: 'Concise 2-sentence architectural and airflow summary of the photographed space.',
              },
              dimensionsCertainty: {
                type: Type.STRING,
                description: 'Either "approximate" (only if user supplied dimensions or clear standard cues) or "uncertain".',
              },
              estimatedLengthFt: { type: Type.NUMBER, nullable: true },
              estimatedWidthFt: { type: Type.NUMBER, nullable: true },
              estimatedHeightFt: { type: Type.NUMBER, nullable: true },
              estimatedAreaSqFt: { type: Type.NUMBER, nullable: true },
              needsUserDimensions: {
                type: Type.BOOLEAN,
                description: 'True whenever dimensions cannot be reliably determined from photos alone.',
              },
              dimensionNote: {
                type: Type.STRING,
                description: 'Transparent note explaining dimension certainty and asking user to confirm Length/Width/Height if uncertain.',
              },
              windowsCount: { type: Type.INTEGER },
              doorsCount: { type: Type.INTEGER },
              ventilationNotes: { type: Type.STRING },
              sunlightExposure: { type: Type.STRING },
              wallAndRoofNotes: { type: Type.STRING },
              installationZones: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    zoneName: { type: Type.STRING },
                    surfaceType: { type: Type.STRING },
                    suitabilityNote: { type: Type.STRING },
                  },
                  required: ['zoneName', 'surfaceType', 'suitabilityNote'],
                },
              },
            },
            required: [
              'roomType',
              'summary',
              'dimensionsCertainty',
              'needsUserDimensions',
              'dimensionNote',
              'windowsCount',
              'doorsCount',
              'ventilationNotes',
              'sunlightExposure',
              'wallAndRoofNotes',
              'installationZones',
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      if (hasUserDims) {
        parsed.estimatedLengthFt = len;
        parsed.estimatedWidthFt = wid;
        if (Number.isFinite(hgt) && hgt > 0) {
          parsed.estimatedHeightFt = hgt;
        }
        parsed.estimatedAreaSqFt = Math.round(len * wid);
        parsed.dimensionsCertainty = 'approximate';
        parsed.needsUserDimensions = false;
      }

      return res.json({ analysis: parsed });
    } catch (err) {
      console.error('Gemini room analysis error:', err);
      const mapped = mapGeminiError(err);
      return res.status(mapped.status).json({ error: mapped.message });
    }
  });

  // AI Cooling Requirement Calculation & Personalized Recommendation Report
  app.post('/api/cooling/recommend', async (req: Request, res: Response) => {
    const body = req.body as {
      roomAnalysis?: {
        roomType?: string;
        areaSqFt?: number;
        lengthFt?: number | null;
        widthFt?: number | null;
        heightFt?: number | null;
        windowsCount?: number;
        doorsCount?: number;
        ventilationNotes?: string;
        sunlightExposure?: string;
        installationZones?: Array<{ zoneName: string; surfaceType: string; suitabilityNote: string }>;
      };
      occupants?: unknown;
      weather?: {
        locationName?: string;
        temperatureC?: number;
        apparentTempC?: number;
        humidityPct?: number;
        windSpeedKmh?: number;
        conditionLabel?: string;
      };
      selectedProductIds?: unknown;
      catalog?: unknown;
    };

    const occupants = Number(body?.occupants);
    if (!Number.isInteger(occupants) || occupants < 1 || occupants > 500) {
      return res.status(400).json({ error: 'Please enter a valid number of occupants (1 to 500).' });
    }

    const areaSqFt = Number(body?.roomAnalysis?.areaSqFt);
    if (!Number.isFinite(areaSqFt) || areaSqFt < 10 || areaSqFt > 100_000) {
      return res.status(400).json({
        error: 'Please enter valid room dimensions so approximate floor area can be calculated.',
      });
    }

    if (!body.weather || typeof body.weather.temperatureC !== 'number') {
      return res.status(400).json({
        error: 'Real-time outdoor temperature and location are required before generating recommendations.',
      });
    }

    if (!Array.isArray(body.catalog) || body.catalog.length === 0) {
      return res.status(400).json({ error: 'Product catalog data is required.' });
    }

    // Sanitize & index available in-stock catalog products strictly
    const rawCatalog = body.catalog as CatalogProductInput[];
    const availableCatalog = rawCatalog
      .map((p) => ({
        ...p,
        variants: (Array.isArray(p.variants) ? p.variants : []).filter(
          (v) => v && typeof v.id === 'string' && typeof v.price === 'number' && v.stock > 0
        ),
      }))
      .filter((p) => p && typeof p.id === 'string' && p.variants.length > 0);

    if (availableCatalog.length === 0) {
      return res.status(400).json({ error: 'No in-stock products available in catalog.' });
    }

    const selectedSet = new Set(
      Array.isArray(body.selectedProductIds)
        ? body.selectedProductIds.filter((id): id is string => typeof id === 'string')
        : []
    );

    const candidateCatalog =
      selectedSet.size > 0
        ? availableCatalog.filter((p) => selectedSet.has(p.id))
        : availableCatalog;

    const finalCatalog = candidateCatalog.length > 0 ? candidateCatalog : availableCatalog;

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error:
          'GEMINI_API_KEY is not configured on the server yet. Add it in Settings > Secrets to generate AI cooling recommendations.',
      });
    }

    const catalogSummary = finalCatalog.map((p) => ({
      productId: p.id,
      name: p.name,
      category: p.category,
      shortDescription: p.shortDescription,
      climateSuitability: p.climateSuitability,
      coverageOrCapacity: p.coverageOrCapacity,
      limitations: p.limitations,
      availableVariants: p.variants.map((v) => ({
        variantId: v.id,
        name: v.name,
        priceINR: v.price,
        dimensionsOrCoverage: v.dimensionsOrCoverage,
        stock: v.stock,
      })),
    }));

    const promptText = `You are CoolRoots' passive-cooling architectural engineer. Calculate cooling requirements and recommend ONLY existing in-stock products & variants from the JSON catalog below.

ROOM & OCCUPANCY DATA:
- Room Type: ${body.roomAnalysis?.roomType || 'Living Space'}
- Approximate Floor Area: ${Math.round(areaSqFt)} sq. ft.${
      body.roomAnalysis?.lengthFt && body.roomAnalysis?.widthFt
        ? ` (${body.roomAnalysis.lengthFt} ft × ${body.roomAnalysis.widthFt} ft${
            body.roomAnalysis.heightFt ? ` × ${body.roomAnalysis.heightFt} ft ceiling` : ''
          })`
        : ''
    }
- Usual Occupants: ${occupants} people
- Windows Detected: ${body.roomAnalysis?.windowsCount ?? 1}, Doors: ${body.roomAnalysis?.doorsCount ?? 1}
- Sunlight Exposure: ${body.roomAnalysis?.sunlightExposure || 'Not specified'}
- Ventilation Notes: ${body.roomAnalysis?.ventilationNotes || 'Standard cross-ventilation'}
- Installation Zones: ${JSON.stringify(body.roomAnalysis?.installationZones || [])}

LIVE WEATHER AT ${body.weather.locationName || 'Location'}:
- Outdoor Temperature: ${body.weather.temperatureC}°C (Feels like ${body.weather.apparentTempC ?? body.weather.temperatureC}°C)
- Relative Humidity: ${body.weather.humidityPct ?? 50}%
- Wind Speed: ${body.weather.windSpeedKmh ?? 0} km/h
- Condition: ${body.weather.conditionLabel || 'Clear'}

RULES:
1. You MUST ONLY pick productId and variantId values that exist verbatim in the AVAILABLE CATALOG below.
2. Respect climate physics: if humidity > 65%, prioritize shading (Bamboo Blinds, Jali, Lime Roof) and water hydration (Matka) rather than heavy evaporative cooling, and explain why honestly in climateAdvice. If dry/hot, recommend evaporative options (Terracotta Cooling Tower, Khus Screens) along with shading.
3. Recommend realistic quantities (<= variant stock, sized appropriately for the ${Math.round(areaSqFt)} sq ft area, window count, and ${occupants} people).
4. Recommend at least 2 and at most ${Math.min(5, finalCatalog.length)} suitable products from the candidate catalog.

AVAILABLE CATALOG:
${JSON.stringify(catalogSummary, null, 2)}`;

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: promptText,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              coolingLoadLevel: {
                type: Type.STRING,
                description: 'One of: Light, Moderate, High, Intense',
              },
              climateAdvice: {
                type: Type.STRING,
                description: 'Brief climate-specific passive cooling advice referencing the live temperature and humidity.',
              },
              overallExplanation: {
                type: Type.STRING,
                description: 'Clear 2-3 sentence summary explaining how room size, occupancy, and outdoor weather shaped these recommendations.',
              },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    productId: { type: Type.STRING },
                    variantId: { type: Type.STRING },
                    quantity: { type: Type.INTEGER },
                    suggestedLocation: { type: Type.STRING },
                    whyRecommended: { type: Type.STRING },
                  },
                  required: ['productId', 'variantId', 'quantity', 'suggestedLocation', 'whyRecommended'],
                },
              },
            },
            required: ['coolingLoadLevel', 'climateAdvice', 'overallExplanation', 'items'],
          },
        },
      });

      const aiJson = JSON.parse((response.text ?? '{}').trim()) as {
        coolingLoadLevel?: string;
        climateAdvice?: string;
        overallExplanation?: string;
        items?: Array<{
          productId: string;
          variantId: string;
          quantity: number;
          suggestedLocation: string;
          whyRecommended: string;
        }>;
      };

      // Strictly verify against real existing CoolRoots catalogue items & prices
      const productMap = new Map(finalCatalog.map((p) => [p.id, p]));
      const verifiedItems = [];
      const usedKeys = new Set<string>();

      for (const rawItem of aiJson.items || []) {
        const product = productMap.get(rawItem.productId);
        if (!product) continue;

        const variant =
          product.variants.find((v) => v.id === rawItem.variantId) || product.variants[0];
        if (!variant) continue;

        const dedupKey = `${product.id}::${variant.id}`;
        if (usedKeys.has(dedupKey)) continue;
        usedKeys.add(dedupKey);

        const clampedQty = Math.max(1, Math.min(Math.round(rawItem.quantity || 1), Math.min(12, variant.stock)));
        verifiedItems.push({
          productId: product.id,
          variantId: variant.id,
          productName: product.name,
          variantName: variant.name,
          category: product.category,
          image: product.image,
          unitPrice: variant.price,
          recommendedQuantity: clampedQty,
          suggestedLocation:
            (rawItem.suggestedLocation || '').trim() || 'Primary ventilated window or floor zone',
          whyRecommended:
            (rawItem.whyRecommended || '').trim() ||
            `Matched to ${Math.round(areaSqFt)} sq ft space and ${occupants} occupants.`,
          maxStock: variant.stock,
        });
      }

      // Guarantee at least one valid selected catalog recommendation if AI returned unmatched IDs
      if (verifiedItems.length === 0) {
        const fallbackProduct = finalCatalog[0];
        const fallbackVariant = fallbackProduct.variants[0];
        verifiedItems.push({
          productId: fallbackProduct.id,
          variantId: fallbackVariant.id,
          productName: fallbackProduct.name,
          variantName: fallbackVariant.name,
          category: fallbackProduct.category,
          image: fallbackProduct.image,
          unitPrice: fallbackVariant.price,
          recommendedQuantity: 1,
          suggestedLocation: 'Primary ventilated room zone',
          whyRecommended: `Selected from your preferred CoolRoots products for a ${Math.round(areaSqFt)} sq ft room.`,
          maxStock: fallbackVariant.stock,
        });
      }

      const estimatedTotalCost = verifiedItems.reduce(
        (sum, item) => sum + item.unitPrice * item.recommendedQuantity,
        0
      );

      const loadLevel = (['Light', 'Moderate', 'High', 'Intense'].includes(
        aiJson.coolingLoadLevel || ''
      )
        ? aiJson.coolingLoadLevel
        : body.weather.temperatureC >= 36
          ? 'Intense'
          : body.weather.temperatureC >= 30
            ? 'High'
            : 'Moderate') as 'Light' | 'Moderate' | 'High' | 'Intense';

      return res.json({
        report: {
          coolingLoadLevel: loadLevel,
          estimatedAreaSqFt: Math.round(areaSqFt),
          occupants,
          outdoorTemperatureC: body.weather.temperatureC,
          locationName: body.weather.locationName || 'Detected Location',
          climateAdvice:
            aiJson.climateAdvice ||
            'Combine exterior solar shading with cross-ventilation during cooler hours.',
          overallExplanation:
            aiJson.overallExplanation ||
            `Calculated for ${Math.round(areaSqFt)} sq ft with ${occupants} occupants at ${body.weather.temperatureC}°C outdoor temperature.`,
          recommendations: verifiedItems,
          estimatedTotalCost,
        },
      });
    } catch (err) {
      console.error('Gemini recommendation error:', err);
      const mapped = mapGeminiError(err);
      return res.status(mapped.status).json({ error: mapped.message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CoolRoots server running on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start CoolRoots server:', err);
  process.exit(1);
});
