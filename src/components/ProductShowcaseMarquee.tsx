import {
  PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { SafeImage } from './SafeImage';

interface ProductShowcaseMarqueeProps {
  products: Product[];
}

const NATURE_BACKDROP_IMAGE = '/src/assets/images/nature_glass_backdrop_1795654171721.jpg';
const DWELL_DURATION_MS = 1250;
const TRANSITION_DURATION_MS = 750;
const DRAG_THRESHOLD_PX = 6;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function getScaleAndOpacity(stepDistance: number): { scale: number; opacity: number; zIndex: number } {
  if (stepDistance <= 0.02) {
    return { scale: 1.08, opacity: 1, zIndex: 30 };
  }
  if (stepDistance < 1) {
    const scale = 1.08 - 0.16 * stepDistance;
    const opacity = 1 - 0.08 * stepDistance;
    return { scale, opacity, zIndex: 25 };
  }
  if (stepDistance < 2) {
    const t = stepDistance - 1;
    const scale = 0.92 - 0.11 * t;
    const opacity = 0.92 - 0.14 * t;
    return { scale, opacity, zIndex: 15 };
  }
  if (stepDistance < 3) {
    const t = stepDistance - 2;
    const scale = 0.81 - 0.09 * t;
    const opacity = 0.78 - 0.14 * t;
    return { scale, opacity, zIndex: 8 };
  }
  const extra = stepDistance - 3;
  return {
    scale: Math.max(0.66, 0.72 - extra * 0.05),
    opacity: Math.max(0.55, 0.64 - extra * 0.08),
    zIndex: 2,
  };
}

export function ProductShowcaseMarquee({ products }: ProductShowcaseMarqueeProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const middleTrackRef = useRef<HTMLDivElement>(null);
  const cardElsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  const trackWidthRef = useRef<number>(0);
  const slotStrideRef = useRef<number>(264);

  const isHoveredRef = useRef<boolean>(false);
  const isFocusedRef = useRef<boolean>(false);
  const isTouchActiveRef = useRef<boolean>(false);
  const touchResumeTimerRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const suppressClickRef = useRef<boolean>(false);

  const dragStartXRef = useRef<number>(0);
  const dragStartScrollRef = useRef<number>(0);

  const phaseRef = useRef<'dwell' | 'moving'>('dwell');
  const dwellElapsedRef = useRef<number>(0);
  const moveElapsedRef = useRef<number>(0);
  const moveStartScrollRef = useRef<number>(0);
  const moveTargetScrollRef = useRef<number>(0);

  const [isDraggingUI, setIsDraggingUI] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const showcaseProducts = useMemo(() => {
    if (products.length === 0) return [];
    if (products.length >= 6) return products;
    const repeated: Product[] = [];
    while (repeated.length < 6) {
      repeated.push(...products);
    }
    return repeated.slice(0, Math.max(6, products.length * 2));
  }, [products]);

  const totalCards = showcaseProducts.length * 3;

  const wrapToMiddleTrack = useCallback((scrollLeft: number): number => {
    const trackWidth = trackWidthRef.current;
    if (trackWidth <= 0) return scrollLeft;
    let wrapped = scrollLeft;
    while (wrapped < trackWidth) {
      wrapped += trackWidth;
    }
    while (wrapped >= trackWidth * 2) {
      wrapped -= trackWidth;
    }
    return wrapped;
  }, []);

  const updateCardVisuals = useCallback(() => {
    const container = scrollContainerRef.current;
    const middleTrack = middleTrackRef.current;
    if (!container || !middleTrack) return;

    const trackWidth = middleTrack.getBoundingClientRect().width;
    if (trackWidth > 0) {
      trackWidthRef.current = trackWidth;
      slotStrideRef.current = trackWidth / showcaseProducts.length;
    }

    const viewportCenter = container.scrollLeft + container.clientWidth / 2;
    const stride = slotStrideRef.current || 264;

    for (let i = 0; i < totalCards; i++) {
      const cardEl = cardElsRef.current[i];
      if (!cardEl) continue;

      const cardCenter = cardEl.offsetLeft + cardEl.offsetWidth / 2;
      const absDiff = Math.abs(cardCenter - viewportCenter);
      const stepDistance = absDiff / stride;
      const { scale, opacity, zIndex } = getScaleAndOpacity(stepDistance);
      const isCenter = stepDistance < 0.32;

      cardEl.style.transform = `scale(${scale.toFixed(4)})`;
      cardEl.style.opacity = opacity.toFixed(3);
      cardEl.style.zIndex = String(zIndex);
      cardEl.dataset.centered = isCenter ? 'true' : 'false';
    }
  }, [showcaseProducts.length, totalCards]);

  const centerInitialCard = useCallback(() => {
    const container = scrollContainerRef.current;
    const middleTrack = middleTrackRef.current;
    if (!container || !middleTrack || showcaseProducts.length === 0) return;

    const trackWidth = middleTrack.getBoundingClientRect().width;
    if (trackWidth <= 0) return;
    trackWidthRef.current = trackWidth;
    slotStrideRef.current = trackWidth / showcaseProducts.length;

    const startIdx = showcaseProducts.length + Math.floor(showcaseProducts.length / 2);
    const cardEl = cardElsRef.current[startIdx];
    if (!cardEl) return;

    const targetScroll = cardEl.offsetLeft + cardEl.offsetWidth / 2 - container.clientWidth / 2;
    container.scrollLeft = wrapToMiddleTrack(targetScroll);
    phaseRef.current = 'dwell';
    dwellElapsedRef.current = 0;
    updateCardVisuals();
  }, [showcaseProducts.length, updateCardVisuals, wrapToMiddleTrack]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches);
    syncPreference();
    mediaQuery.addEventListener('change', syncPreference);
    return () => mediaQuery.removeEventListener('change', syncPreference);
  }, []);

  useEffect(() => {
    const middleTrack = middleTrackRef.current;
    if (!middleTrack) return;

    centerInitialCard();
    const observer = new ResizeObserver(() => {
      const trackWidth = middleTrack.getBoundingClientRect().width;
      if (trackWidth > 0) {
        trackWidthRef.current = trackWidth;
        slotStrideRef.current = trackWidth / showcaseProducts.length;
      }
      updateCardVisuals();
    });
    observer.observe(middleTrack);
    return () => observer.disconnect();
  }, [centerInitialCard, showcaseProducts.length, updateCardVisuals]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || showcaseProducts.length === 0) return;

    if (prefersReducedMotion) {
      updateCardVisuals();
      return;
    }

    let frameId = 0;
    let lastTime = performance.now();

    const step = (now: number) => {
      const deltaMs = Math.min(now - lastTime, 48);
      lastTime = now;

      const isPaused =
        isHoveredRef.current ||
        isFocusedRef.current ||
        isDraggingRef.current ||
        isTouchActiveRef.current;

      if (!isPaused && trackWidthRef.current > 0) {
        if (phaseRef.current === 'dwell') {
          dwellElapsedRef.current += deltaMs;

          if (dwellElapsedRef.current >= DWELL_DURATION_MS) {
            const viewportCenter = container.scrollLeft + container.clientWidth / 2;
            let closestIdx = showcaseProducts.length;
            let minDiff = Infinity;

            for (let i = 0; i < totalCards; i++) {
              const cardEl = cardElsRef.current[i];
              if (!cardEl) continue;
              const diff = Math.abs(cardEl.offsetLeft + cardEl.offsetWidth / 2 - viewportCenter);
              if (diff < minDiff) {
                minDiff = diff;
                closestIdx = i;
              }
            }

            const prevIdx = Math.max(0, closestIdx - 1);
            const prevCardEl = cardElsRef.current[prevIdx];
            if (prevCardEl) {
              const rawTarget =
                prevCardEl.offsetLeft + prevCardEl.offsetWidth / 2 - container.clientWidth / 2;
              moveStartScrollRef.current = container.scrollLeft;
              moveTargetScrollRef.current = rawTarget;
              moveElapsedRef.current = 0;
              phaseRef.current = 'moving';
            }
          }
        } else {
          moveElapsedRef.current += deltaMs;
          const progress = Math.min(1, moveElapsedRef.current / TRANSITION_DURATION_MS);
          const eased = easeInOutCubic(progress);

          const interpolated =
            moveStartScrollRef.current +
            (moveTargetScrollRef.current - moveStartScrollRef.current) * eased;

          if (progress >= 1) {
            container.scrollLeft = wrapToMiddleTrack(moveTargetScrollRef.current);
            phaseRef.current = 'dwell';
            dwellElapsedRef.current = 0;
          } else {
            container.scrollLeft = interpolated;
          }
          updateCardVisuals();
        }
      }

      frameId = window.requestAnimationFrame(step);
    };

    frameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frameId);
  }, [
    prefersReducedMotion,
    showcaseProducts.length,
    totalCards,
    updateCardVisuals,
    wrapToMiddleTrack,
  ]);

  useEffect(() => {
    return () => {
      if (touchResumeTimerRef.current !== null) {
        window.clearTimeout(touchResumeTimerRef.current);
      }
    };
  }, []);

  const handleContainerScroll = () => {
    const container = scrollContainerRef.current;
    const trackWidth = trackWidthRef.current;
    if (!container || trackWidth <= 0) return;

    if (phaseRef.current !== 'moving') {
      if (container.scrollLeft < trackWidth * 0.5) {
        container.scrollLeft += trackWidth;
      } else if (container.scrollLeft >= trackWidth * 2.5) {
        container.scrollLeft -= trackWidth;
      }
    }
    updateCardVisuals();
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    container.scrollLeft = wrapToMiddleTrack(container.scrollLeft);
    phaseRef.current = 'dwell';
    dwellElapsedRef.current = 0;

    isDraggingRef.current = true;
    suppressClickRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartScrollRef.current = container.scrollLeft;
    setIsDraggingUI(true);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const container = scrollContainerRef.current;
    const trackWidth = trackWidthRef.current;
    if (!container) return;

    const deltaX = e.clientX - dragStartXRef.current;
    if (Math.abs(deltaX) > DRAG_THRESHOLD_PX) {
      suppressClickRef.current = true;
    }

    let nextScroll = dragStartScrollRef.current - deltaX;
    if (trackWidth > 0) {
      if (nextScroll < trackWidth) {
        nextScroll += trackWidth;
        dragStartScrollRef.current += trackWidth;
      } else if (nextScroll >= trackWidth * 2) {
        nextScroll -= trackWidth;
        dragStartScrollRef.current -= trackWidth;
      }
    }

    container.scrollLeft = nextScroll;
    updateCardVisuals();
  };

  const stopDragging = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDraggingUI(false);
    phaseRef.current = 'dwell';
    dwellElapsedRef.current = 0;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 50);
  };

  const handleClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (suppressClickRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleTouchStart = () => {
    if (touchResumeTimerRef.current !== null) {
      window.clearTimeout(touchResumeTimerRef.current);
      touchResumeTimerRef.current = null;
    }
    phaseRef.current = 'dwell';
    dwellElapsedRef.current = 0;
    isTouchActiveRef.current = true;
  };

  const handleTouchEnd = () => {
    if (touchResumeTimerRef.current !== null) {
      window.clearTimeout(touchResumeTimerRef.current);
    }
    touchResumeTimerRef.current = window.setTimeout(() => {
      isTouchActiveRef.current = false;
      dwellElapsedRef.current = 0;
    }, 1000);
  };

  if (showcaseProducts.length === 0) {
    return null;
  }

  const renderCard = (
    product: Product,
    globalIndex: number,
    keyPrefix: string,
    isAccessible: boolean
  ) => {
    return (
      <Link
        key={`${keyPrefix}-${product.id}-${globalIndex}`}
        ref={(el) => {
          cardElsRef.current[globalIndex] = el;
        }}
        to={`/product/${product.slug}`}
        tabIndex={isAccessible ? undefined : -1}
        draggable={false}
        onMouseEnter={() => {
          isHoveredRef.current = true;
        }}
        onMouseLeave={() => {
          isHoveredRef.current = false;
        }}
        className="group relative w-[224px] sm:w-[244px] lg:w-[254px] h-[292px] sm:h-[302px] shrink-0 rounded-[22px] border border-white/75 bg-white/48 backdrop-blur-xl shadow-[0_10px_32px_-8px_rgba(22,48,36,0.18),inset_0_1px_0_rgba(255,255,255,0.88)] data-[centered=true]:bg-white/66 data-[centered=true]:border-white/95 data-[centered=true]:shadow-[0_22px_48px_-12px_rgba(22,48,36,0.28),inset_0_1px_0_rgba(255,255,255,0.96)] hover:bg-white/68 transition-[box-shadow,background-color,border-color] duration-300 overflow-hidden flex flex-col origin-center will-change-transform"
      >
        <div className="relative h-[170px] sm:h-[178px] w-full shrink-0 p-2.5 pb-0">
          <div className="relative w-full h-full rounded-[16px] overflow-hidden bg-[#EAE5D8]/80 ring-1 ring-white/60">
            <SafeImage
              src={product.image}
              alt={isAccessible ? product.name : ''}
              fallbackLabel={product.name}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] select-none pointer-events-none"
            />
          </div>
        </div>

        <div className="flex-1 px-4 pt-2.5 pb-3.5 flex flex-col justify-start">
          <h3 className="font-display text-[15px] font-semibold text-[#163024] leading-snug line-clamp-2 group-hover:text-[#0F241B] transition-colors">
            {product.name}
          </h3>
          <p className="mt-1 text-xs text-[#284838]/90 leading-relaxed line-clamp-2">
            {product.shortDescription}
          </p>
        </div>
      </Link>
    );
  };

  return (
    <section
      aria-labelledby="hero-cooling-heading"
      className="relative pt-7 sm:pt-9 pb-6 sm:pb-8 border-b border-white/60 overflow-hidden bg-[#ECE8DC]"
    >
      {/* Nature-inspired blurred foliage, sunlight & warm cream background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          src={NATURE_BACKDROP_IMAGE}
          alt=""
          className="w-full h-full object-cover scale-105 blur-[4px] opacity-95 select-none"
        />
        {/* Soft sunlit cream & sage green luminous atmospheric veil for glass refraction + text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF8F4]/78 via-[#F3F6EE]/35 to-[#FAF8F4]/85" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[42rem] h-64 rounded-full bg-amber-100/45 blur-3xl" />
        <div className="absolute -bottom-24 left-[15%] w-80 h-64 rounded-full bg-[#1E3D2F]/14 blur-3xl" />
        <div className="absolute -bottom-20 right-[12%] w-80 h-64 rounded-full bg-[#2B5240]/12 blur-3xl" />
      </div>

      {/* Centered dark forest-green headline above moving glass cards */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-3 sm:mb-4">
        <p className="inline-flex items-center px-3.5 py-1 rounded-full bg-white/55 backdrop-blur-md border border-white/80 text-[11px] sm:text-xs font-medium uppercase tracking-[0.14em] text-[#1E3D2F] shadow-[0_4px_16px_-6px_rgba(22,48,36,0.12)]">
          CoolRoots · Ancient Wisdom. Modern Cooling.
        </p>
        <h1
          id="hero-cooling-heading"
          className="font-display text-2xl sm:text-4xl lg:text-[42px] font-semibold tracking-tight text-[#142E22] leading-[1.14] mt-2 drop-shadow-[0_1px_12px_rgba(255,255,255,0.85)]"
        >
          Passive cooling crafted from earth, grass, and shade.
        </h1>
      </div>

      {/* Continuous Left-to-Right Center-Focus Glassmorphic Carousel */}
      <div className="relative z-10 sm:[mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <div
          ref={scrollContainerRef}
          onScroll={handleContainerScroll}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
          onPointerLeave={stopDragging}
          onClickCapture={handleClickCapture}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onFocus={() => {
            isFocusedRef.current = true;
          }}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              isFocusedRef.current = false;
            }
          }}
          aria-label="Interactive showcase of CoolRoots passive cooling products"
          className={`relative no-scrollbar overflow-x-auto touch-pan-x py-6 select-none ${
            isDraggingUI ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          <div className="flex w-max items-center">
            {/* Left buffer track */}
            <div aria-hidden="true" className="flex items-center gap-3 sm:gap-4 pr-3 sm:pr-4">
              {showcaseProducts.map((product, index) =>
                renderCard(product, index, 'left', false)
              )}
            </div>

            {/* Primary accessible middle track */}
            <div ref={middleTrackRef} className="flex items-center gap-3 sm:gap-4 pr-3 sm:pr-4">
              {showcaseProducts.map((product, index) =>
                renderCard(product, showcaseProducts.length + index, 'center', true)
              )}
            </div>

            {/* Right buffer track */}
            <div aria-hidden="true" className="flex items-center gap-3 sm:gap-4 pr-3 sm:pr-4">
              {showcaseProducts.map((product, index) =>
                renderCard(product, showcaseProducts.length * 2 + index, 'right', false)
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
