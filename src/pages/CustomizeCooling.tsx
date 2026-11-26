import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  CloudSun,
  Compass,
  Droplets,
  ImagePlus,
  Loader2,
  MapPin,
  Minus,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Upload,
  Users,
  Wind,
} from 'lucide-react';
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { RoomVisualizer360 } from '../components/RoomVisualizer360';
import { SafeImage } from '../components/SafeImage';
import { useStore } from '../context/StoreContext';
import {
  CoolingRecommendationItem,
  CoolingRecommendationReport,
  RoomOverlayItem,
  RoomVisionAnalysis,
  UploadedRoomImage,
  WeatherSnapshot,
} from '../types';
import { formatINR } from '../utils/cartUtils';
import { captureVideoFrameToRoomImage, processRoomImageFile } from '../utils/imageUtils';

const STEPS = [
  { num: 1, short: 'Upload Room', title: 'Step 1 – Upload Your Room' },
  { num: 2, short: 'Occupants', title: 'Step 2 – Enter Number of People' },
  { num: 3, short: 'Weather', title: 'Step 3 – Detect Location & Temperature' },
  { num: 4, short: 'Analyze', title: 'Step 4 – Analyze Cooling Requirements' },
  { num: 5, short: 'Recommendations', title: 'Step 5 – Get AI Product Recommendations' },
  { num: 6, short: 'View in Room', title: 'Step 6 – Visualize Products in Your Room' },
  { num: 7, short: 'Confirm & Cart', title: 'Step 7 – Confirm & Add to Cart' },
] as const;

interface SearchCandidate {
  name: string;
  region: string;
  latitude: number;
  longitude: number;
}

export function CustomizeCooling() {
  const { products, addToCart, showToast } = useStore();

  const inStockProducts = useMemo(
    () => products.filter((p) => p.variants.some((v) => v.stock > 0)),
    [products]
  );

  const [step, setStep] = useState<number>(1);

  // Step 1: Room Images, Consent, AI Analysis & Manual Dimensions
  const [uploadMode, setUploadMode] = useState<'panoramic' | 'multi'>('multi');
  const [roomImages, setRoomImages] = useState<UploadedRoomImage[]>([]);
  const [consentGranted, setConsentGranted] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isAnalyzingRoom, setIsAnalyzingRoom] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [roomAnalysis, setRoomAnalysis] = useState<RoomVisionAnalysis | null>(null);

  const [lengthFtInput, setLengthFtInput] = useState('');
  const [widthFtInput, setWidthFtInput] = useState('');
  const [heightFtInput, setHeightFtInput] = useState('10');

  // Camera modal state
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);
  const replaceTargetIdRef = useRef<string | null>(null);
  const cameraFallbackInputRef = useRef<HTMLInputElement | null>(null);

  // Step 2: Occupants
  const [occupants, setOccupants] = useState<number>(3);
  const [occupantsError, setOccupantsError] = useState<string | null>(null);

  // Step 3: Location & Real-Time Weather
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [isDetectingGeo, setIsDetectingGeo] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [cityQuery, setCityQuery] = useState('');
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [cityCandidates, setCityCandidates] = useState<SearchCandidate[]>([]);

  // Step 4: Preferred Product Selection & Recommendation Generation
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(() =>
    inStockProducts.map((p) => p.id)
  );
  const [isGeneratingRec, setIsGeneratingRec] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);

  // Step 5: Report & Editable Quantities
  const [report, setReport] = useState<CoolingRecommendationReport | null>(null);
  const [finalItems, setFinalItems] = useState<CoolingRecommendationItem[]>([]);

  // Step 6: Room Visualization Overlays
  const [overlays, setOverlays] = useState<RoomOverlayItem[]>([]);

  // Step 7: Cart confirmation
  const [addedToCartSuccess, setAddedToCartSuccess] = useState(false);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Computed room area from user inputs or AI estimate
  const computedAreaSqFt = useMemo(() => {
    const l = parseFloat(lengthFtInput);
    const w = parseFloat(widthFtInput);
    if (Number.isFinite(l) && l > 0 && Number.isFinite(w) && w > 0) {
      return Math.round(l * w);
    }
    if (roomAnalysis?.estimatedAreaSqFt && roomAnalysis.estimatedAreaSqFt > 0) {
      return Math.round(roomAnalysis.estimatedAreaSqFt);
    }
    return null;
  }, [lengthFtInput, widthFtInput, roomAnalysis]);

  const handleFilesSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = '';
    if (files.length === 0) return;

    setUploadError(null);
    const isPan = uploadMode === 'panoramic';
    const maxSlots = isPan ? 1 : 5;

    try {
      const processed: UploadedRoomImage[] = [];
      for (const file of files.slice(0, maxSlots)) {
        const img = await processRoomImageFile(file, isPan);
        processed.push(img);
      }

      if (isPan) {
        setRoomImages(processed.slice(0, 1));
      } else {
        setRoomImages((prev) => [...prev, ...processed].slice(0, 5));
      }
      setRoomAnalysis(null);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Unable to process selected image.');
    }
  };

  const handleReplaceFileSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    const targetId = replaceTargetIdRef.current;
    replaceTargetIdRef.current = null;
    if (!file || !targetId) return;

    setUploadError(null);
    try {
      const updated = await processRoomImageFile(file, uploadMode === 'panoramic');
      setRoomImages((prev) => prev.map((img) => (img.id === targetId ? updated : img)));
      setRoomAnalysis(null);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Unable to replace image.');
    }
  };

  const handleRemoveImage = (id: string) => {
    setRoomImages((prev) => prev.filter((img) => img.id !== id));
    setRoomAnalysis(null);
  };

  const openCamera = async () => {
    setCameraError(null);
    setUploadError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      cameraFallbackInputRef.current?.click();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      window.setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      }, 60);
    } catch {
      setCameraError(
        'Camera permission was unavailable or declined. You can upload a photo from your device instead.'
      );
      cameraFallbackInputRef.current?.click();
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    try {
      const captured = captureVideoFrameToRoomImage(
        videoRef.current,
        uploadMode === 'panoramic'
      );
      if (uploadMode === 'panoramic') {
        setRoomImages([captured]);
      } else {
        setRoomImages((prev) => [...prev, captured].slice(0, 5));
      }
      setRoomAnalysis(null);
      closeCamera();
    } catch (err) {
      setCameraError(err instanceof Error ? err.message : 'Failed to capture camera photo.');
    }
  };

  const handleAnalyzeRoom = async () => {
    setAnalysisError(null);
    if (roomImages.length === 0) {
      setAnalysisError('Please upload or capture at least one room photo first.');
      return;
    }
    if (!consentGranted) {
      setAnalysisError(
        'Please confirm your privacy consent before sending your room photos for AI analysis.'
      );
      return;
    }

    setIsAnalyzingRoom(true);
    try {
      const l = parseFloat(lengthFtInput);
      const w = parseFloat(widthFtInput);
      const h = parseFloat(heightFtInput);

      const res = await fetch('/api/cooling/analyze-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consentGranted: true,
          images: roomImages.map((img) => img.dataUrl),
          isPanoramic: uploadMode === 'panoramic' || roomImages.some((i) => i.isPanoramic),
          userDimensions:
            Number.isFinite(l) && l > 0 && Number.isFinite(w) && w > 0
              ? {
                  lengthFt: l,
                  widthFt: w,
                  heightFt: Number.isFinite(h) && h > 0 ? h : undefined,
                }
              : undefined,
        }),
      });

      const data = (await res.json()) as { analysis?: RoomVisionAnalysis; error?: string };
      if (!res.ok || !data.analysis) {
        throw new Error(data.error || 'Failed to analyze room photos.');
      }

      setRoomAnalysis(data.analysis);
      if (!lengthFtInput && data.analysis.estimatedLengthFt) {
        setLengthFtInput(String(data.analysis.estimatedLengthFt));
      }
      if (!widthFtInput && data.analysis.estimatedWidthFt) {
        setWidthFtInput(String(data.analysis.estimatedWidthFt));
      }
      if (data.analysis.estimatedHeightFt) {
        setHeightFtInput(String(data.analysis.estimatedHeightFt));
      }
    } catch (err) {
      setAnalysisError(
        err instanceof Error ? err.message : 'Unable to analyze room photos right now.'
      );
    } finally {
      setIsAnalyzingRoom(false);
    }
  };

  const handleDetectGeolocation = () => {
    setGeoError(null);
    setCityCandidates([]);
    if (!navigator.geolocation) {
      setGeoError('Browser geolocation is not supported. Please search for your city manually.');
      return;
    }

    setIsDetectingGeo(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `/api/weather?lat=${encodeURIComponent(pos.coords.latitude)}&lon=${encodeURIComponent(
              pos.coords.longitude
            )}`
          );
          const data = (await res.json()) as WeatherSnapshot & { error?: string };
          if (!res.ok || typeof data.temperatureC !== 'number') {
            throw new Error(data.error || 'Unable to fetch outdoor weather.');
          }
          setWeather(data);
        } catch (err) {
          setGeoError(
            err instanceof Error
              ? err.message
              : 'Could not retrieve weather for your location. Try searching manually.'
          );
        } finally {
          setIsDetectingGeo(false);
        }
      },
      (err) => {
        setIsDetectingGeo(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError(
            'Location permission was denied. Please enter your city or town below to fetch live outdoor temperature.'
          );
        } else {
          setGeoError(
            'Unable to determine your location automatically. Please search for your city below.'
          );
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleSearchCityWeather = async (queryOverride?: string) => {
    const q = (queryOverride ?? cityQuery).trim();
    setGeoError(null);
    if (q.length < 2) {
      setGeoError('Please enter at least 2 characters for your city or town.');
      return;
    }

    setIsSearchingCity(true);
    try {
      const res = await fetch(`/api/weather/search?q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as {
        weather?: WeatherSnapshot;
        candidates?: SearchCandidate[];
        error?: string;
      };
      if (!res.ok || !data.weather) {
        throw new Error(data.error || 'Could not find weather for that city.');
      }
      setWeather(data.weather);
      setCityCandidates(data.candidates || []);
    } catch (err) {
      setGeoError(err instanceof Error ? err.message : 'Unable to look up city weather.');
    } finally {
      setIsSearchingCity(false);
    }
  };

  const handleSelectCandidate = async (candidate: SearchCandidate) => {
    setIsSearchingCity(true);
    setGeoError(null);
    try {
      const res = await fetch(
        `/api/weather?lat=${encodeURIComponent(candidate.latitude)}&lon=${encodeURIComponent(
          candidate.longitude
        )}`
      );
      const data = (await res.json()) as WeatherSnapshot & { error?: string };
      if (!res.ok || typeof data.temperatureC !== 'number') {
        throw new Error(data.error || 'Unable to fetch weather for selected city.');
      }
      setWeather({
        ...data,
        locationName: candidate.name,
        regionOrCountry: candidate.region || data.regionOrCountry,
        source: 'manual',
      });
    } catch (err) {
      setGeoError(err instanceof Error ? err.message : 'Could not fetch selected city weather.');
    } finally {
      setIsSearchingCity(false);
    }
  };

  const togglePreferredProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleGenerateRecommendations = async () => {
    setRecError(null);

    const area = computedAreaSqFt;
    if (!area || area < 10) {
      setRecError(
        'Please enter your room length and width in feet so we can calculate an accurate cooling recommendation.'
      );
      return;
    }
    if (!weather) {
      setRecError('Please detect or enter your location to fetch live outdoor temperature first.');
      return;
    }
    if (selectedProductIds.length === 0) {
      setRecError('Please select at least one preferred CoolRoots product category to evaluate.');
      return;
    }

    setIsGeneratingRec(true);
    try {
      const l = parseFloat(lengthFtInput);
      const w = parseFloat(widthFtInput);
      const h = parseFloat(heightFtInput);

      const res = await fetch('/api/cooling/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomAnalysis: {
            roomType: roomAnalysis?.roomType || 'Residential Room',
            areaSqFt: area,
            lengthFt: Number.isFinite(l) && l > 0 ? l : roomAnalysis?.estimatedLengthFt,
            widthFt: Number.isFinite(w) && w > 0 ? w : roomAnalysis?.estimatedWidthFt,
            heightFt: Number.isFinite(h) && h > 0 ? h : roomAnalysis?.estimatedHeightFt,
            windowsCount: roomAnalysis?.windowsCount ?? 1,
            doorsCount: roomAnalysis?.doorsCount ?? 1,
            ventilationNotes: roomAnalysis?.ventilationNotes || 'Standard cross-ventilation',
            sunlightExposure: roomAnalysis?.sunlightExposure || 'Moderate daytime sunlight',
            installationZones: roomAnalysis?.installationZones || [],
          },
          occupants,
          weather,
          selectedProductIds,
          catalog: inStockProducts.map((p) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            shortDescription: p.shortDescription,
            image: p.image,
            climateSuitability: p.specifications.climateSuitability,
            coverageOrCapacity: p.specifications.coverageOrCapacity,
            limitations: p.limitations,
            variants: p.variants,
          })),
        }),
      });

      const data = (await res.json()) as {
        report?: CoolingRecommendationReport;
        error?: string;
      };
      if (!res.ok || !data.report) {
        throw new Error(data.error || 'Could not generate cooling recommendations.');
      }

      setReport(data.report);
      setFinalItems(data.report.recommendations);
      setAddedToCartSuccess(false);

      // Seed visualizer overlays with the recommended products
      const seededOverlays: RoomOverlayItem[] = data.report.recommendations.map((rec, idx) => ({
        instanceId: `rec_ov_${rec.productId}_${idx}`,
        productId: rec.productId,
        variantId: rec.variantId,
        name: rec.productName,
        image: rec.image,
        xPercent: Math.min(80, 26 + idx * 22),
        yPercent: idx % 2 === 0 ? 48 : 62,
        widthPx: 148,
        rotationDeg: 0,
        flipX: false,
        opacity: 0.96,
      }));
      setOverlays(seededOverlays);

      setStep(5);
    } catch (err) {
      setRecError(
        err instanceof Error ? err.message : 'Unable to generate recommendations right now.'
      );
    } finally {
      setIsGeneratingRec(false);
    }
  };

  const updateFinalQuantity = (productId: string, variantId: string, nextQty: number) => {
    setAddedToCartSuccess(false);
    setFinalItems((prev) =>
      prev.map((item) => {
        if (item.productId !== productId || item.variantId !== variantId) return item;
        const clamped = Math.max(0, Math.min(nextQty, item.maxStock));
        return { ...item, recommendedQuantity: clamped };
      })
    );
  };

  const changeFinalVariant = (productId: string, oldVariantId: string, newVariantId: string) => {
    const product = products.find((p) => p.id === productId);
    const nextVariant = product?.variants.find((v) => v.id === newVariantId);
    if (!product || !nextVariant) return;
    setAddedToCartSuccess(false);

    setFinalItems((prev) =>
      prev.map((item) => {
        if (item.productId !== productId || item.variantId !== oldVariantId) return item;
        return {
          ...item,
          variantId: nextVariant.id,
          variantName: nextVariant.name,
          unitPrice: nextVariant.price,
          maxStock: nextVariant.stock,
          recommendedQuantity: Math.max(1, Math.min(item.recommendedQuantity, nextVariant.stock)),
        };
      })
    );
  };

  const syncPlacedOverlaysIntoFinalList = () => {
    // Ensure any additional products added inside Step 6 visualizer are included in Step 7 review
    const existingKeys = new Set(finalItems.map((i) => i.productId));
    const additions: CoolingRecommendationItem[] = [];

    for (const ov of overlays) {
      if (!existingKeys.has(ov.productId)) {
        const prod = products.find((p) => p.id === ov.productId);
        const variant = prod?.variants.find((v) => v.stock > 0);
        if (prod && variant) {
          existingKeys.add(prod.id);
          additions.push({
            productId: prod.id,
            variantId: variant.id,
            productName: prod.name,
            variantName: variant.name,
            category: prod.category,
            image: prod.image,
            unitPrice: variant.price,
            recommendedQuantity: 1,
            suggestedLocation: 'Added in Room Visualizer',
            whyRecommended: 'Added manually during your interactive room preview.',
            maxStock: variant.stock,
          });
        }
      }
    }

    if (additions.length > 0) {
      setFinalItems((prev) => [...prev, ...additions]);
    }
    setStep(7);
  };

  const finalSubtotal = useMemo(
    () => finalItems.reduce((sum, item) => sum + item.unitPrice * item.recommendedQuantity, 0),
    [finalItems]
  );

  const activeCartItemsCount = useMemo(
    () => finalItems.reduce((sum, item) => sum + item.recommendedQuantity, 0),
    [finalItems]
  );

  const handleAddAllToCart = () => {
    const itemsToAdd = finalItems.filter((item) => item.recommendedQuantity > 0);
    if (itemsToAdd.length === 0) {
      showToast('Please select at least 1 product quantity to add to cart.', 'error');
      return;
    }

    itemsToAdd.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      addToCart({
        itemType: 'product',
        productId: item.productId,
        variantId: item.variantId,
        variantName: item.variantName,
        materialOption: product?.materialOptions?.[0],
        name: item.productName,
        category: item.category,
        price: item.unitPrice,
        quantity: item.recommendedQuantity,
        image: item.image,
      });
    });

    setAddedToCartSuccess(true);
    showToast(`Added ${activeCartItemsCount} customized cooling item(s) to your cart.`, 'success');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-[#1E3D2F]">
          <Sparkles className="w-3.5 h-3.5 text-[#B84E32]" aria-hidden="true" />
          <span>AI Smart Cooling & Room Customization</span>
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#163024] mt-1.5">
          Customize Cooling for My Space
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#2D4B3C] max-w-3xl leading-relaxed">
          Upload your room photos or 360° panorama, combine occupancy with live local outdoor
          temperature, get tailored CoolRoots recommendations, and preview products directly in your
          room.
        </p>
      </div>

      {/* 7-Step Progress Bar */}
      <nav
        aria-label="Room customization steps"
        className="mb-8 rounded-[20px] bg-white/68 backdrop-blur-lg border border-white/85 p-3 sm:p-4 shadow-[0_8px_28px_-10px_rgba(22,48,36,0.10)] overflow-x-auto"
      >
        <ol className="flex items-center justify-between gap-2 min-w-[660px]">
          {STEPS.map((s) => {
            const isCurrent = step === s.num;
            const isCompleted = step > s.num;
            const canClick =
              s.num < step ||
              (s.num === 2 && roomImages.length > 0) ||
              (s.num === 3 && roomImages.length > 0) ||
              (s.num === 4 && roomImages.length > 0 && Boolean(weather)) ||
              (s.num >= 5 && Boolean(report));

            return (
              <li key={s.num} className="flex-1">
                <button
                  type="button"
                  disabled={!canClick && !isCurrent}
                  onClick={() => canClick && setStep(s.num)}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-[14px] text-left transition-all ${
                    isCurrent
                      ? 'bg-[#1E3D2F] text-white shadow-sm'
                      : isCompleted
                        ? 'bg-[#1E3D2F]/10 text-[#163024] hover:bg-[#1E3D2F]/16 cursor-pointer'
                        : canClick
                          ? 'bg-white/60 text-[#2D4B3C] hover:bg-white cursor-pointer'
                          : 'bg-transparent text-[#6E8276] opacity-70 cursor-not-allowed'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center shrink-0 tabular-nums ${
                      isCurrent
                        ? 'bg-white text-[#1E3D2F]'
                        : isCompleted
                          ? 'bg-[#1E3D2F] text-white'
                          : 'bg-white/80 text-[#3C5849] border border-[#1E3D2F]/15'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </span>
                  <span className="text-xs font-medium truncate">{s.short}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Active Step Title */}
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#163024]">
          {STEPS[step - 1].title}
        </h2>
        <span className="text-xs font-medium text-[#3C5849] tabular-nums">
          Step {step} of {STEPS.length}
        </span>
      </div>

      {/* STEP 1: UPLOAD YOUR ROOM */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="rounded-[22px] bg-white/70 backdrop-blur-lg border border-white/85 p-6 shadow-[0_10px_30px_-10px_rgba(22,48,36,0.10)] space-y-5">
            {/* Upload Mode Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex rounded-[14px] p-1 bg-[#EAE5D8]/80 border border-white/80">
                <button
                  type="button"
                  onClick={() => {
                    setUploadMode('multi');
                    setUploadError(null);
                  }}
                  className={`px-3.5 py-2 rounded-[10px] text-xs font-medium transition-all cursor-pointer ${
                    uploadMode === 'multi'
                      ? 'bg-white text-[#163024] shadow-xs'
                      : 'text-[#3C5849] hover:text-[#163024]'
                  }`}
                >
                  Multiple Room Photos (up to 5)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUploadMode('panoramic');
                    setUploadError(null);
                    if (roomImages.length > 1) {
                      setRoomImages((prev) => prev.slice(0, 1).map((i) => ({ ...i, isPanoramic: true })));
                    } else if (roomImages.length === 1) {
                      setRoomImages((prev) => prev.map((i) => ({ ...i, isPanoramic: true })));
                    }
                  }}
                  className={`px-3.5 py-2 rounded-[10px] text-xs font-medium transition-all cursor-pointer ${
                    uploadMode === 'panoramic'
                      ? 'bg-white text-[#163024] shadow-xs'
                      : 'text-[#3C5849] hover:text-[#163024]'
                  }`}
                >
                  360° Panoramic Image
                </button>
              </div>

              <span className="text-xs text-[#3C5849]">
                Supports JPG, PNG, WebP · Auto-optimized locally
              </span>
            </div>

            {/* Upload & Camera Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 p-6 rounded-[18px] border-2 border-dashed border-[#1E3D2F]/25 bg-white/55 hover:bg-white/85 hover:border-[#1E3D2F]/45 transition-all text-center cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-[#1E3D2F]/10 text-[#1E3D2F] flex items-center justify-center">
                  <Upload className="w-5 h-5" aria-hidden="true" />
                </div>
                <p className="text-sm font-semibold text-[#163024]">
                  {uploadMode === 'panoramic'
                    ? 'Upload 360° Panoramic Photo'
                    : 'Upload Room / House Photos'}
                </p>
                <p className="text-xs text-[#3C5849]">
                  {uploadMode === 'panoramic'
                    ? 'Wide panoramic view for look-around placement'
                    : 'Show windows, walls, balcony, or roof areas'}
                </p>
              </button>

              <button
                type="button"
                onClick={openCamera}
                className="flex flex-col items-center justify-center gap-2 p-6 rounded-[18px] border border-white/90 bg-white/65 hover:bg-white/90 transition-all text-center shadow-xs cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-[#B84E32]/12 text-[#B84E32] flex items-center justify-center">
                  <Camera className="w-5 h-5" aria-hidden="true" />
                </div>
                <p className="text-sm font-semibold text-[#163024]">Capture with Device Camera</p>
                <p className="text-xs text-[#3C5849]">
                  Take a live snapshot of your room where supported
                </p>
              </button>
            </div>

            {/* Hidden File Inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple={uploadMode === 'multi'}
              onChange={handleFilesSelected}
              className="hidden"
            />
            <input
              ref={replaceInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleReplaceFileSelected}
              className="hidden"
            />
            <input
              ref={cameraFallbackInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFilesSelected}
              className="hidden"
            />

            {(uploadError || cameraError) && (
              <div
                role="alert"
                className="p-3.5 rounded-[14px] bg-[#FAF3EE] border border-[#B84E32]/30 text-xs text-[#9E3F26] flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{uploadError || cameraError}</span>
              </div>
            )}

            {/* Uploaded Room Image Previews */}
            {roomImages.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#1E3D2F]">
                    Uploaded Images ({roomImages.length})
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#1E3D2F] hover:underline cursor-pointer"
                  >
                    <ImagePlus className="w-3.5 h-3.5" />
                    <span>Add / Replace</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {roomImages.map((img, idx) => (
                    <div
                      key={img.id}
                      className="rounded-[16px] bg-white/80 border border-white overflow-hidden shadow-xs"
                    >
                      <div className="relative aspect-[16/10] bg-[#ECE8DC]">
                        <img
                          src={img.dataUrl}
                          alt={`Uploaded room ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {img.isPanoramic && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#1E3D2F]/85 text-white text-[10px] font-medium">
                            360° Panorama
                          </span>
                        )}
                      </div>
                      <div className="p-2.5 flex items-center justify-between gap-2 text-xs">
                        <span className="truncate text-[#2D4B3C] font-medium">{img.name}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              replaceTargetIdRef.current = img.id;
                              replaceInputRef.current?.click();
                            }}
                            className="px-2 py-1 rounded-lg bg-[#FAF8F4] border border-[#E2D9C9] text-[#163024] hover:bg-white cursor-pointer"
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(img.id)}
                            aria-label={`Remove ${img.name}`}
                            className="p-1.5 rounded-lg text-[#B84E32] hover:bg-[#FAF3EE] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Optional Reference Dimensions + Privacy Consent + AI Vision Analysis */}
            <div className="pt-4 border-t border-[#1E3D2F]/10 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#1E3D2F]">
                  Room Dimensions (Recommended for Accurate Area)
                </p>
                <p className="text-xs text-[#3C5849] mt-0.5">
                  Ordinary photos cannot confirm exact measurements without a scale reference. Enter
                  approximate dimensions below or verify after AI scan.
                </p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <label className="block">
                    <span className="block text-[11px] font-medium text-[#2D4B3C] mb-1">
                      Length (ft)
                    </span>
                    <input
                      type="number"
                      min={3}
                      max={300}
                      step="0.5"
                      value={lengthFtInput}
                      onChange={(e) => setLengthFtInput(e.target.value)}
                      placeholder="e.g. 14"
                      className="w-full px-3 py-2 rounded-[12px] bg-white/85 border border-[#D8CBB5] text-sm text-[#163024] focus:outline-none focus:border-[#1E3D2F]"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-[11px] font-medium text-[#2D4B3C] mb-1">
                      Width (ft)
                    </span>
                    <input
                      type="number"
                      min={3}
                      max={300}
                      step="0.5"
                      value={widthFtInput}
                      onChange={(e) => setWidthFtInput(e.target.value)}
                      placeholder="e.g. 12"
                      className="w-full px-3 py-2 rounded-[12px] bg-white/85 border border-[#D8CBB5] text-sm text-[#163024] focus:outline-none focus:border-[#1E3D2F]"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-[11px] font-medium text-[#2D4B3C] mb-1">
                      Ceiling Height (ft)
                    </span>
                    <input
                      type="number"
                      min={6}
                      max={40}
                      step="0.5"
                      value={heightFtInput}
                      onChange={(e) => setHeightFtInput(e.target.value)}
                      placeholder="e.g. 10"
                      className="w-full px-3 py-2 rounded-[12px] bg-white/85 border border-[#D8CBB5] text-sm text-[#163024] focus:outline-none focus:border-[#1E3D2F]"
                    />
                  </label>
                  <div className="flex flex-col justify-end">
                    <div className="px-3 py-2 rounded-[12px] bg-[#1E3D2F]/8 border border-[#1E3D2F]/15 text-xs text-[#163024]">
                      <span className="block text-[10px] text-[#3C5849]">Approx. Floor Area</span>
                      <span className="font-semibold tabular-nums">
                        {computedAreaSqFt ? `${computedAreaSqFt} sq. ft.` : 'Enter L × W'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy Consent Checkbox */}
              <label className="flex items-start gap-2.5 p-3.5 rounded-[14px] bg-white/60 border border-white/90 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentGranted}
                  onChange={(e) => setConsentGranted(e.target.checked)}
                  className="mt-0.5 rounded border-[#1E3D2F] accent-[#1E3D2F]"
                />
                <span className="text-xs text-[#2D4B3C] leading-relaxed">
                  <strong className="text-[#163024] inline-flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#1E3D2F]" />
                    Privacy consent:
                  </strong>{' '}
                  I consent to send my uploaded room image(s) privately for AI cooling-layout
                  analysis. Images are processed for this session only and are not published.
                </span>
              </label>

              {analysisError && (
                <div
                  role="alert"
                  className="p-3.5 rounded-[14px] bg-[#FAF3EE] border border-[#B84E32]/30 text-xs text-[#9E3F26] flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{analysisError}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleAnalyzeRoom}
                  disabled={isAnalyzingRoom || roomImages.length === 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[42px] rounded-[14px] bg-white/85 border border-[#1E3D2F]/25 text-[#163024] text-sm font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
                >
                  {isAnalyzingRoom ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing Room Layout...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#B84E32]" />
                      <span>{roomAnalysis ? 'Re-Analyze Room with AI' : 'Analyze Room with AI'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (roomImages.length === 0) {
                      setAnalysisError('Please upload or capture at least one room image first.');
                      return;
                    }
                    setStep(2);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 min-h-[42px] rounded-[14px] bg-gradient-to-r from-[#1E3D2F]/92 to-[#2B5240]/92 text-white text-sm font-medium hover:from-[#163024] hover:to-[#1E3D2F] transition-all shadow-sm cursor-pointer"
                >
                  <span>Continue to Occupants</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* AI Vision Analysis Result Card */}
          {roomAnalysis && (
            <div className="rounded-[22px] bg-white/75 backdrop-blur-lg border border-white/90 p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#1E3D2F]" />
                  <h3 className="font-display text-lg font-semibold text-[#163024]">
                    AI Room Assessment: {roomAnalysis.roomType}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#1E3D2F]/10 text-[#1E3D2F] text-xs font-medium">
                  {roomAnalysis.windowsCount} window(s) · {roomAnalysis.doorsCount} door(s)
                </span>
              </div>

              <p className="text-sm text-[#2D4B3C] leading-relaxed">{roomAnalysis.summary}</p>

              {roomAnalysis.needsUserDimensions && !computedAreaSqFt && (
                <div className="p-3.5 rounded-[14px] bg-[#FAF3EE] border border-[#B84E32]/30 text-xs text-[#9E3F26]">
                  <strong>Dimensions Needed:</strong> {roomAnalysis.dimensionNote} Please enter your
                  room Length and Width above before generating recommendations.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-[14px] bg-white/75 border border-white">
                  <p className="font-semibold text-[#163024] mb-1">Sunlight Exposure</p>
                  <p className="text-[#2D4B3C] leading-relaxed">{roomAnalysis.sunlightExposure}</p>
                </div>
                <div className="p-3.5 rounded-[14px] bg-white/75 border border-white">
                  <p className="font-semibold text-[#163024] mb-1">Ventilation & Openings</p>
                  <p className="text-[#2D4B3C] leading-relaxed">{roomAnalysis.ventilationNotes}</p>
                </div>
                <div className="p-3.5 rounded-[14px] bg-white/75 border border-white">
                  <p className="font-semibold text-[#163024] mb-1">Walls, Ceiling & Surfaces</p>
                  <p className="text-[#2D4B3C] leading-relaxed">{roomAnalysis.wallAndRoofNotes}</p>
                </div>
              </div>

              {roomAnalysis.installationZones.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#1E3D2F] mb-2">
                    Identified Cooling Installation Zones
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {roomAnalysis.installationZones.map((zone, i) => (
                      <div
                        key={`${zone.zoneName}-${i}`}
                        className="p-3 rounded-[14px] bg-white/70 border border-white text-xs"
                      >
                        <p className="font-semibold text-[#163024]">
                          {zone.zoneName}{' '}
                          <span className="font-normal text-[#3C5849]">({zone.surfaceType})</span>
                        </p>
                        <p className="mt-1 text-[#2D4B3C]">{zone.suitabilityNote}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* STEP 2: ENTER NUMBER OF PEOPLE */}
      {step === 2 && (
        <div className="rounded-[22px] bg-white/72 backdrop-blur-lg border border-white/85 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="max-w-xl space-y-2">
            <div className="w-11 h-11 rounded-[14px] bg-[#1E3D2F]/10 text-[#1E3D2F] flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-display text-2xl font-semibold text-[#163024]">
              How many people usually occupy this room?
            </h3>
            <p className="text-sm text-[#2D4B3C] leading-relaxed">
              Body heat, hydration needs, and airflow demand scale with the number of occupants.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center rounded-[16px] bg-white/85 border border-[#D8CBB5] p-1">
              <button
                type="button"
                onClick={() => {
                  setOccupants((n) => Math.max(1, n - 1));
                  setOccupantsError(null);
                }}
                aria-label="Decrease number of people"
                className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[#163024] hover:bg-[#F2ECE1] cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min={1}
                max={500}
                value={occupants}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (Number.isNaN(val)) {
                    setOccupants(1);
                  } else {
                    setOccupants(Math.min(500, Math.max(1, val)));
                  }
                  setOccupantsError(null);
                }}
                aria-label="Number of occupants"
                className="w-20 text-center text-lg font-semibold text-[#163024] bg-transparent focus:outline-none tabular-nums"
              />
              <button
                type="button"
                onClick={() => {
                  setOccupants((n) => Math.min(500, n + 1));
                  setOccupantsError(null);
                }}
                aria-label="Increase number of people"
                className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[#163024] hover:bg-[#F2ECE1] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[1, 2, 4, 8, 15].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setOccupants(preset);
                    setOccupantsError(null);
                  }}
                  className={`px-3.5 py-2 rounded-[12px] text-xs font-medium border transition-all cursor-pointer tabular-nums ${
                    occupants === preset
                      ? 'bg-[#1E3D2F] text-white border-[#1E3D2F]'
                      : 'bg-white/80 text-[#163024] border-white hover:bg-white'
                  }`}
                >
                  {preset} {preset === 1 ? 'person' : 'people'}
                </button>
              ))}
            </div>
          </div>

          {occupantsError && (
            <p className="text-xs text-[#B84E32] font-medium">{occupantsError}</p>
          )}

          <div className="pt-4 border-t border-[#1E3D2F]/10 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[42px] rounded-[14px] bg-white/80 border border-white text-sm font-medium text-[#163024] hover:bg-white cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (occupants < 1 || occupants > 500) {
                  setOccupantsError('Please enter a number of occupants between 1 and 500.');
                  return;
                }
                setStep(3);
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 min-h-[42px] rounded-[14px] bg-gradient-to-r from-[#1E3D2F]/92 to-[#2B5240]/92 text-white text-sm font-medium hover:from-[#163024] hover:to-[#1E3D2F] shadow-sm cursor-pointer"
            >
              <span>Continue to Weather</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: DETECT LOCATION & TEMPERATURE */}
      {step === 3 && (
        <div className="rounded-[22px] bg-white/72 backdrop-blur-lg border border-white/85 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="max-w-2xl space-y-2">
            <p className="text-sm text-[#2D4B3C] leading-relaxed">
              We fetch real-time outdoor temperature, relative humidity, and wind conditions from
              Open-Meteo weather data so evaporative vs. shading products are matched accurately to
              your local climate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Automatic Browser Geolocation */}
            <div className="p-5 rounded-[18px] bg-white/70 border border-white space-y-3">
              <div className="flex items-center gap-2 text-[#163024]">
                <MapPin className="w-5 h-5 text-[#B84E32]" />
                <h3 className="font-display text-lg font-semibold">Automatic Location Detection</h3>
              </div>
              <p className="text-xs text-[#3C5849] leading-relaxed">
                Grant location permission to detect your approximate area and fetch live outdoor
                temperature automatically.
              </p>
              <button
                type="button"
                onClick={handleDetectGeolocation}
                disabled={isDetectingGeo}
                className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] rounded-[14px] bg-gradient-to-r from-[#1E3D2F]/92 to-[#2B5240]/92 text-white text-xs sm:text-sm font-medium hover:from-[#163024] hover:to-[#1E3D2F] disabled:opacity-60 cursor-pointer"
              >
                {isDetectingGeo ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Detecting Location & Temperature...</span>
                  </>
                ) : (
                  <>
                    <Compass className="w-4 h-4" />
                    <span>Detect My Location & Temperature</span>
                  </>
                )}
              </button>
            </div>

            {/* Manual City Search */}
            <div className="p-5 rounded-[18px] bg-white/70 border border-white space-y-3">
              <div className="flex items-center gap-2 text-[#163024]">
                <CloudSun className="w-5 h-5 text-[#1E3D2F]" />
                <h3 className="font-display text-lg font-semibold">Manual City / Town Lookup</h3>
              </div>
              <p className="text-xs text-[#3C5849] leading-relaxed">
                Prefer not to share GPS or checking another property? Enter any city or town name.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={cityQuery}
                  onChange={(e) => setCityQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void handleSearchCityWeather();
                    }
                  }}
                  placeholder="e.g. Jaipur, Chennai, Pune..."
                  aria-label="Enter city or town name"
                  className="flex-1 px-3 py-2 min-h-[42px] rounded-[12px] bg-white/90 border border-[#D8CBB5] text-sm text-[#163024] focus:outline-none focus:border-[#1E3D2F]"
                />
                <button
                  type="button"
                  onClick={() => void handleSearchCityWeather()}
                  disabled={isSearchingCity}
                  className="px-4 py-2 min-h-[42px] rounded-[12px] bg-white border border-[#1E3D2F]/25 text-xs font-medium text-[#163024] hover:bg-[#F2ECE1] disabled:opacity-60 cursor-pointer"
                >
                  {isSearchingCity ? 'Searching...' : 'Check Weather'}
                </button>
              </div>

              {cityCandidates.length > 1 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cityCandidates.map((cand, idx) => (
                    <button
                      key={`${cand.name}-${idx}`}
                      type="button"
                      onClick={() => void handleSelectCandidate(cand)}
                      className="px-2.5 py-1 rounded-lg bg-[#FAF8F4] border border-[#E2D9C9] text-[11px] text-[#163024] hover:bg-white cursor-pointer"
                    >
                      {cand.name}
                      {cand.region ? `, ${cand.region}` : ''}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {geoError && (
            <div
              role="alert"
              className="p-3.5 rounded-[14px] bg-[#FAF3EE] border border-[#B84E32]/30 text-xs text-[#9E3F26] flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{geoError}</span>
            </div>
          )}

          {/* Live Weather Display */}
          {weather && (
            <div className="rounded-[18px] bg-gradient-to-r from-[#1E3D2F]/8 to-[#B84E32]/6 border border-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider font-medium text-[#1E3D2F]">
                    Live Local Weather ({weather.source === 'geolocation' ? 'Detected' : 'Manual'})
                  </p>
                  <h4 className="font-display text-2xl font-semibold text-[#163024] mt-0.5">
                    {weather.locationName}
                    {weather.regionOrCountry ? `, ${weather.regionOrCountry}` : ''}
                  </h4>
                  <p className="text-xs text-[#3C5849] mt-0.5">
                    Condition: {weather.conditionLabel} · Open-Meteo real-time data
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <div className="text-center px-3 py-2 rounded-[14px] bg-white/80 border border-white">
                    <span className="block text-[10px] text-[#3C5849]">Outdoor Temp</span>
                    <span className="text-xl font-semibold text-[#B84E32] tabular-nums">
                      {weather.temperatureC}°C
                    </span>
                  </div>
                  <div className="text-center px-3 py-2 rounded-[14px] bg-white/80 border border-white">
                    <span className="block text-[10px] text-[#3C5849]">Feels Like</span>
                    <span className="text-lg font-semibold text-[#163024] tabular-nums">
                      {weather.apparentTempC}°C
                    </span>
                  </div>
                  <div className="text-center px-3 py-2 rounded-[14px] bg-white/80 border border-white">
                    <span className="block text-[10px] text-[#3C5849] inline-flex items-center gap-1">
                      <Droplets className="w-3 h-3" /> Humidity
                    </span>
                    <span className="text-lg font-semibold text-[#1E3D2F] tabular-nums">
                      {weather.humidityPct}%
                    </span>
                  </div>
                  <div className="text-center px-3 py-2 rounded-[14px] bg-white/80 border border-white">
                    <span className="block text-[10px] text-[#3C5849] inline-flex items-center gap-1">
                      <Wind className="w-3 h-3" /> Wind
                    </span>
                    <span className="text-lg font-semibold text-[#163024] tabular-nums">
                      {weather.windSpeedKmh} km/h
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-[#1E3D2F]/10 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[42px] rounded-[14px] bg-white/80 border border-white text-sm font-medium text-[#163024] hover:bg-white cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (!weather) {
                  setGeoError(
                    'Please detect your location or search for your city so we have real-time outdoor temperature.'
                  );
                  return;
                }
                setStep(4);
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 min-h-[42px] rounded-[14px] bg-gradient-to-r from-[#1E3D2F]/92 to-[#2B5240]/92 text-white text-sm font-medium hover:from-[#163024] hover:to-[#1E3D2F] shadow-sm cursor-pointer"
            >
              <span>Continue to Requirement Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: ANALYZE COOLING REQUIREMENTS & PREFERRED PRODUCT SELECTION */}
      {step === 4 && (
        <div className="space-y-6">
          {/* Combined Inputs Verification */}
          <div className="rounded-[22px] bg-white/72 backdrop-blur-lg border border-white/85 p-6 shadow-sm space-y-5">
            <h3 className="font-display text-lg font-semibold text-[#163024]">
              Confirm Room Parameters & Preferred CoolRoots Products
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-[16px] bg-white/75 border border-white space-y-2">
                <p className="text-xs font-medium text-[#3C5849]">Room Size & Floor Area</p>
                {computedAreaSqFt ? (
                  <p className="text-xl font-semibold text-[#163024] tabular-nums">
                    ~{computedAreaSqFt} sq. ft.
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-[#B84E32]">Dimensions Required</p>
                )}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <input
                    type="number"
                    min={3}
                    max={300}
                    value={lengthFtInput}
                    onChange={(e) => setLengthFtInput(e.target.value)}
                    placeholder="Length (ft)"
                    aria-label="Room length in feet"
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-[#D8CBB5] text-xs text-[#163024]"
                  />
                  <input
                    type="number"
                    min={3}
                    max={300}
                    value={widthFtInput}
                    onChange={(e) => setWidthFtInput(e.target.value)}
                    placeholder="Width (ft)"
                    aria-label="Room width in feet"
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-[#D8CBB5] text-xs text-[#163024]"
                  />
                </div>
              </div>

              <div className="p-4 rounded-[16px] bg-white/75 border border-white space-y-1">
                <p className="text-xs font-medium text-[#3C5849]">Usual Occupants</p>
                <p className="text-xl font-semibold text-[#163024] tabular-nums">
                  {occupants} {occupants === 1 ? 'person' : 'people'}
                </p>
                <p className="text-xs text-[#3C5849]">
                  {roomAnalysis?.roomType || 'Living / Working Space'} ·{' '}
                  {roomAnalysis ? `${roomAnalysis.windowsCount} window(s)` : `${roomImages.length} photo(s)`}
                </p>
              </div>

              <div className="p-4 rounded-[16px] bg-white/75 border border-white space-y-1">
                <p className="text-xs font-medium text-[#3C5849]">Live Outdoor Weather</p>
                <p className="text-xl font-semibold text-[#B84E32] tabular-nums">
                  {weather ? `${weather.temperatureC}°C` : '—'}
                </p>
                <p className="text-xs text-[#3C5849]">
                  {weather ? `${weather.locationName} · ${weather.humidityPct}% humidity` : 'Not set'}
                </p>
              </div>
            </div>

            {/* Preferred Products Multi-Select */}
            <div className="pt-2 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[#163024]">
                    Select Preferred Products for AI Evaluation
                  </p>
                  <p className="text-xs text-[#3C5849]">
                    Choose which CoolRoots solutions you are open to using in your room.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedProductIds(inStockProducts.map((p) => p.id))}
                    className="text-[#1E3D2F] font-medium hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span aria-hidden="true">·</span>
                  <button
                    type="button"
                    onClick={() => setSelectedProductIds([])}
                    className="text-[#65574D] hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {inStockProducts.map((product) => {
                  const checked = selectedProductIds.includes(product.id);
                  const minPrice = Math.min(...product.variants.map((v) => v.price));
                  return (
                    <label
                      key={product.id}
                      className={`flex items-center gap-3 p-3 rounded-[16px] border transition-all cursor-pointer ${
                        checked
                          ? 'bg-white border-[#1E3D2F]/45 shadow-xs'
                          : 'bg-white/50 border-white hover:bg-white/75'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePreferredProduct(product.id)}
                        className="accent-[#1E3D2F] rounded shrink-0"
                      />
                      <div className="w-12 h-10 rounded-[10px] overflow-hidden bg-[#ECE8DC] shrink-0">
                        <SafeImage
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#163024] truncate">
                          {product.name}
                        </p>
                        <p className="text-[11px] text-[#3C5849] tabular-nums">
                          {product.category} · From {formatINR(minPrice)}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {recError && (
              <div
                role="alert"
                className="p-3.5 rounded-[14px] bg-[#FAF3EE] border border-[#B84E32]/30 text-xs text-[#9E3F26] flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{recError}</span>
              </div>
            )}

            <div className="pt-4 border-t border-[#1E3D2F]/10 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[42px] rounded-[14px] bg-white/80 border border-white text-sm font-medium text-[#163024] hover:bg-white cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => void handleGenerateRecommendations()}
                disabled={isGeneratingRec}
                className="inline-flex items-center gap-2 px-6 py-2.5 min-h-[44px] rounded-[14px] bg-gradient-to-r from-[#1E3D2F]/92 to-[#2B5240]/92 text-white text-sm font-medium hover:from-[#163024] hover:to-[#1E3D2F] disabled:opacity-60 shadow-sm cursor-pointer"
              >
                {isGeneratingRec ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Calculating AI Cooling Plan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Cooling Recommendation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: PERSONALIZED PRODUCT RECOMMENDATIONS REPORT */}
      {step === 5 && report && (
        <div className="space-y-6">
          {/* Report Summary Header */}
          <div className="rounded-[22px] bg-white/75 backdrop-blur-lg border border-white/90 p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#1E3D2F]">
                  Personalized Cooling Report · {report.coolingLoadLevel} Heat Load
                </p>
                <h3 className="font-display text-2xl font-semibold text-[#163024] mt-1">
                  Recommended Passive Cooling Plan
                </h3>
              </div>

              <div className="px-4 py-2.5 rounded-[16px] bg-[#1E3D2F] text-white text-right">
                <span className="block text-[10px] text-[#D7E0D9]">Estimated Total Cost</span>
                <span className="text-xl font-semibold tabular-nums">
                  {formatINR(report.estimatedTotalCost)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-[14px] bg-white/80 border border-white">
                <span className="block text-[#3C5849]">Approx. Area</span>
                <span className="font-semibold text-[#163024] text-sm tabular-nums">
                  {report.estimatedAreaSqFt} sq. ft.
                </span>
              </div>
              <div className="p-3 rounded-[14px] bg-white/80 border border-white">
                <span className="block text-[#3C5849]">Occupants</span>
                <span className="font-semibold text-[#163024] text-sm tabular-nums">
                  {report.occupants} people
                </span>
              </div>
              <div className="p-3 rounded-[14px] bg-white/80 border border-white">
                <span className="block text-[#3C5849]">Outdoor Temp</span>
                <span className="font-semibold text-[#B84E32] text-sm tabular-nums">
                  {report.outdoorTemperatureC}°C ({report.locationName})
                </span>
              </div>
              <div className="p-3 rounded-[14px] bg-white/80 border border-white">
                <span className="block text-[#3C5849]">Recommended Units</span>
                <span className="font-semibold text-[#163024] text-sm tabular-nums">
                  {report.recommendations.reduce((s, i) => s + i.recommendedQuantity, 0)} items
                </span>
              </div>
            </div>

            <div className="p-4 rounded-[16px] bg-[#FAF8F4]/90 border border-[#E2D9C9] space-y-2 text-sm text-[#2D4B3C]">
              <p>{report.overallExplanation}</p>
              <p className="text-xs text-[#1E3D2F] font-medium">
                Climate Guidance: {report.climateAdvice}
              </p>
            </div>
          </div>

          {/* Recommended Products List */}
          <div className="space-y-4">
            {report.recommendations.map((rec) => (
              <div
                key={`${rec.productId}-${rec.variantId}`}
                className="rounded-[20px] bg-white/75 backdrop-blur-lg border border-white/90 p-5 shadow-xs flex flex-col md:flex-row gap-5"
              >
                <div className="w-full md:w-44 aspect-[4/3] rounded-[14px] overflow-hidden bg-[#ECE8DC] shrink-0">
                  <SafeImage
                    src={rec.image}
                    alt={rec.productName}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider font-medium text-[#1E3D2F]">
                        {rec.category} · {rec.variantName}
                      </p>
                      <h4 className="font-display text-lg font-semibold text-[#163024]">
                        {rec.productName}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs text-[#3C5849]">
                        {rec.recommendedQuantity} × {formatINR(rec.unitPrice)}
                      </span>
                      <span className="text-base font-semibold text-[#163024] tabular-nums">
                        {formatINR(rec.unitPrice * rec.recommendedQuantity)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-[#B84E32]">
                    Suggested Placement: {rec.suggestedLocation}
                  </p>
                  <p className="text-sm text-[#2D4B3C] leading-relaxed">{rec.whyRecommended}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[42px] rounded-[14px] bg-white/80 border border-white text-sm font-medium text-[#163024] hover:bg-white cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Adjust Preferences</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(6)}
              className="inline-flex items-center gap-2 px-6 py-2.5 min-h-[44px] rounded-[14px] bg-gradient-to-r from-[#1E3D2F]/92 to-[#2B5240]/92 text-white text-sm font-medium hover:from-[#163024] hover:to-[#1E3D2F] shadow-sm cursor-pointer"
            >
              <span>Visualize Products in My Room</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: 360° ROOM VISUALIZATION */}
      {step === 6 && (
        <div className="space-y-6">
          <RoomVisualizer360
            roomImages={roomImages}
            recommendations={finalItems}
            allProducts={inStockProducts}
            overlays={overlays}
            onChangeOverlays={setOverlays}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(5)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[42px] rounded-[14px] bg-white/80 border border-white text-sm font-medium text-[#163024] hover:bg-white cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Recommendations</span>
            </button>
            <button
              type="button"
              onClick={syncPlacedOverlaysIntoFinalList}
              className="inline-flex items-center gap-2 px-6 py-2.5 min-h-[44px] rounded-[14px] bg-gradient-to-r from-[#1E3D2F]/92 to-[#2B5240]/92 text-white text-sm font-medium hover:from-[#163024] hover:to-[#1E3D2F] shadow-sm cursor-pointer"
            >
              <span>Confirm & Review Quantities</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: FINAL CUSTOMIZATION & ADD TO CART */}
      {step === 7 && (
        <div className="space-y-6">
          <div className="rounded-[22px] bg-white/75 backdrop-blur-lg border border-white/90 p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-xl font-semibold text-[#163024]">
                  Finalize Your Customized Cooling Setup
                </h3>
                <p className="text-xs text-[#3C5849] mt-0.5">
                  Adjust sizes or quantities below before adding directly to your CoolRoots cart.
                </p>
              </div>
              <div className="text-right">
                <span className="block text-[11px] text-[#3C5849]">Customized Total (Demo INR)</span>
                <span className="text-2xl font-semibold text-[#163024] tabular-nums">
                  {formatINR(finalSubtotal)}
                </span>
              </div>
            </div>

            <div className="divide-y divide-[#1E3D2F]/10">
              {finalItems.map((item) => {
                const catalogProduct = products.find((p) => p.id === item.productId);
                return (
                  <div
                    key={`${item.productId}-${item.variantId}`}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-16 h-14 rounded-[12px] overflow-hidden bg-[#ECE8DC] shrink-0">
                        <SafeImage
                          src={item.image}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <p className="font-display text-base font-semibold text-[#163024] truncate">
                          {item.productName}
                        </p>
                        {catalogProduct && catalogProduct.variants.length > 1 ? (
                          <select
                            value={item.variantId}
                            onChange={(e) =>
                              changeFinalVariant(item.productId, item.variantId, e.target.value)
                            }
                            aria-label={`Select variant for ${item.productName}`}
                            className="px-2.5 py-1 rounded-lg bg-white/90 border border-[#D8CBB5] text-xs text-[#163024]"
                          >
                            {catalogProduct.variants
                              .filter((v) => v.stock > 0)
                              .map((v) => (
                                <option key={v.id} value={v.id}>
                                  {v.name} — {formatINR(v.price)}
                                </option>
                              ))}
                          </select>
                        ) : (
                          <p className="text-xs text-[#3C5849]">
                            {item.variantName} · {formatINR(item.unitPrice)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      <div className="inline-flex items-center rounded-[12px] bg-white border border-[#D8CBB5] p-0.5">
                        <button
                          type="button"
                          onClick={() =>
                            updateFinalQuantity(
                              item.productId,
                              item.variantId,
                              item.recommendedQuantity - 1
                            )
                          }
                          aria-label={`Decrease quantity for ${item.productName}`}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#163024] hover:bg-[#F2ECE1] cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-9 text-center text-sm font-semibold text-[#163024] tabular-nums">
                          {item.recommendedQuantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateFinalQuantity(
                              item.productId,
                              item.variantId,
                              item.recommendedQuantity + 1
                            )
                          }
                          aria-label={`Increase quantity for ${item.productName}`}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#163024] hover:bg-[#F2ECE1] cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="w-24 text-right text-sm font-semibold text-[#163024] tabular-nums">
                        {formatINR(item.unitPrice * item.recommendedQuantity)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {addedToCartSuccess && (
              <div className="p-4 rounded-[16px] bg-[#1E3D2F]/10 border border-[#1E3D2F]/25 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-[#163024]">
                  <CheckCircle2 className="w-5 h-5 text-[#1E3D2F]" />
                  <span>Your customized cooling products have been added to your cart!</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to="/cart"
                    className="px-4 py-2 rounded-[12px] bg-white border border-[#1E3D2F]/20 text-xs font-medium text-[#163024] hover:bg-[#FAF8F4]"
                  >
                    View Cart
                  </Link>
                  <Link
                    to="/checkout"
                    className="px-4 py-2 rounded-[12px] bg-[#B84E32] text-white text-xs font-medium hover:bg-[#9E3F26]"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-[#1E3D2F]/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(6)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[42px] rounded-[14px] bg-white/80 border border-white text-sm font-medium text-[#163024] hover:bg-white cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Room View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[42px] rounded-[14px] bg-white/60 border border-white text-xs font-medium text-[#3C5849] hover:bg-white cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Start Another Room</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddAllToCart}
                disabled={activeCartItemsCount === 0}
                className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-[14px] bg-gradient-to-r from-[#1E3D2F]/92 to-[#2B5240]/92 text-white text-sm font-medium hover:from-[#163024] hover:to-[#1E3D2F] disabled:opacity-50 shadow-sm cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add Customized Products to Cart ({activeCartItemsCount})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Camera Capture Modal */}
      {cameraOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Room Camera Capture"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-xl rounded-[22px] bg-white p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-[#163024]">
                Capture Room Photograph
              </h3>
              <button
                type="button"
                onClick={closeCamera}
                className="px-3 py-1.5 rounded-lg bg-[#F2ECE1] text-xs font-medium text-[#163024] cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="rounded-[16px] overflow-hidden bg-black aspect-video">
              <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeCamera}
                className="px-4 py-2 rounded-[12px] border border-[#D8CBB5] text-xs font-medium text-[#163024] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCaptureSnapshot}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-[12px] bg-[#1E3D2F] text-white text-xs font-medium hover:bg-[#163024] cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Snapshot</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
