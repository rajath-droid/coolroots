import { ArrowRight, Check, Compass, Droplets, Leaf, Sun, Wind } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CategoryCard } from '../components/CategoryCard';
import { ProductCard } from '../components/ProductCard';
import { ProductShowcaseMarquee } from '../components/ProductShowcaseMarquee';
import { SafeImage } from '../components/SafeImage';
import { useStore } from '../context/StoreContext';
import { CATEGORY_SUMMARIES, HERO_IMAGE } from '../data/products';
import { formatINR } from '../utils/cartUtils';

const DEMO_TESTIMONIALS = [
  {
    name: 'Ananya Deshmukh',
    role: 'Apartment Resident',
    city: 'Pune, Maharashtra',
    quote:
      'Before installing the Bamboo Chick Blinds and Khus Screen on our west-facing balcony, afternoon glare heated our study all evening. Now the room stays noticeably calmer through midday, cutting down how early we turn on fans.',
  },
  {
    name: 'Raghavendra Rao',
    role: 'Clinic Administrator',
    city: 'Jaipur, Rajasthan',
    quote:
      'Our open-air courtyard waiting area used to trap dry afternoon heat. Adding the Home Terracotta Cooler and lime-washing the verandah roof made waiting patients far more comfortable without adding heavy AC loads.',
  },
  {
    name: 'Meera & Karthik Iyer',
    role: 'Homeowners',
    city: 'Coimbatore, Tamil Nadu',
    quote:
      'The Courtyard Cooling Design Plan gave our mason clear shading and jali placement notes before renovation. We replaced solid parapet walls with terracotta jali panels and gained steady cross-breeze.',
  },
];

export function Home() {
  const { products, bundles, categories, addBundleToCart } = useStore();

  const featuredProducts = products.filter((p) => p.featured || p.bestSeller).slice(0, 6);

  const getCategoryStartingPrice = (category: string) => {
    const matching = products.filter((p) => p.category === category);
    const prices = matching.flatMap((p) => p.variants.map((v) => v.price));
    return prices.length > 0 ? Math.min(...prices) : 499;
  };

  return (
    <div>
      {/* Animated Horizontal Product Showcase — First Main Section */}
      <ProductShowcaseMarquee products={products} />

      {/* Hero Section */}
      <section className="relative border-b border-white/70 bg-gradient-to-b from-[#FAF8F4] via-[#F2F6EE]/75 to-[#FAF8F4] overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-16 w-72 h-72 rounded-full bg-[#1E3D2F]/8 blur-3xl" />
          <div className="absolute -bottom-24 right-[15%] w-80 h-72 rounded-full bg-amber-100/45 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
              <p className="text-base sm:text-lg text-[#284838] leading-relaxed max-w-xl">
                Bringing traditional Indian cooling wisdom into modern life to reduce heat,
                electricity dependency, and improve comfort sustainably. Built for contemporary
                apartments, independent homes, shops, schools, and open courtyards.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-[16px] bg-gradient-to-r from-[#1E3D2F]/92 to-[#2B5240]/92 backdrop-blur-md border border-white/25 text-white text-sm font-medium hover:from-[#163024] hover:to-[#1E3D2F] transition-all shadow-[0_8px_22px_-6px_rgba(22,48,36,0.38)] whitespace-nowrap"
                >
                  <span>Shop Cooling Solutions</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/cooling-guide"
                  className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-[16px] border border-white/85 bg-white/65 backdrop-blur-md text-[#163024] text-sm font-medium hover:bg-white/90 transition-all shadow-xs whitespace-nowrap"
                >
                  <span>Explore Traditional Cooling</span>
                </Link>
              </div>

              <div className="pt-4 border-t border-[#1E3D2F]/12 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#3C5849]">
                <span>Prototype storefront · Illustrative INR pricing</span>
                <span aria-hidden="true">·</span>
                <Link
                  to="/finder"
                  className="font-medium text-[#1E3D2F] hover:text-[#163024] inline-flex items-center gap-1 transition-colors"
                >
                  <Compass className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Try Find Your Cooling Solution</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="h-full min-h-[300px] sm:min-h-[380px] lg:min-h-[460px] rounded-[24px] p-2.5 bg-white/55 backdrop-blur-lg border border-white/85 shadow-[0_18px_42px_-12px_rgba(22,48,36,0.16)]">
                <div className="w-full h-full rounded-[18px] overflow-hidden bg-[#ECE8DC]">
                  <SafeImage
                    src={HERO_IMAGE}
                    alt="Sunlit Indian courtyard veranda with terracotta cooling columns, jali screen, and bamboo blinds"
                    fallbackLabel="CoolRoots Courtyard Passive Cooling"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured & Best-Selling Products */}
      <section className="relative py-16 lg:py-20 bg-gradient-to-b from-[#FAF8F4] via-[#EFF4EA]/70 to-[#FAF8F4] overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-12 right-[10%] w-96 h-96 rounded-full bg-[#1E3D2F]/7 blur-3xl" />
          <div className="absolute bottom-10 left-[8%] w-80 h-80 rounded-full bg-[#D8CBB5]/35 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#1E3D2F]">
                Featured Collection & Best-Sellers
              </p>
              <h2 className="font-display text-3xl font-semibold text-[#163024] mt-1">
                Traditional cooling essentials for modern spaces
              </h2>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[14px] bg-white/65 backdrop-blur-md border border-white/85 text-sm font-medium text-[#163024] hover:bg-white/90 transition-colors whitespace-nowrap shrink-0 shadow-xs"
            >
              <span>View all {products.length} solutions</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Cooling Bundles Section */}
      <section className="relative py-16 lg:py-20 bg-gradient-to-b from-[#EEF2E8] via-[#F3EFE5] to-[#EEF2E8] border-y border-white/75 overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-16 left-[20%] w-80 h-80 rounded-full bg-[#1E3D2F]/10 blur-3xl" />
          <div className="absolute -bottom-16 right-[18%] w-80 h-80 rounded-full bg-amber-100/50 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#1E3D2F]">
              Curated Value · Demo Bundle Pricing
            </p>
            <h2 className="font-display text-3xl font-semibold text-[#163024] mt-1">
              Ready-to-use Cooling Bundles
            </h2>
            <p className="mt-2 text-sm text-[#2D4B3C] leading-relaxed">
              Practical combinations designed for windows, independent roofs, and daily household
              hydration.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {bundles.map((bundle) => (
              <article
                key={bundle.id}
                className="rounded-[22px] bg-white/65 backdrop-blur-lg border border-white/85 shadow-[0_10px_30px_-10px_rgba(22,48,36,0.12),inset_0_1px_0_rgba(255,255,255,0.85)] overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="p-2.5 pb-0">
                    <div className="aspect-[4/3] rounded-[16px] bg-[#E8DFCE] overflow-hidden ring-1 ring-white/60">
                      <SafeImage
                        src={bundle.image}
                        alt={bundle.name}
                        fallbackLabel={bundle.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-xs text-[#3C5849]">{bundle.recommendedFor}</p>
                    <h3 className="font-display text-xl font-semibold text-[#163024] mt-1">
                      {bundle.name}
                    </h3>
                    <p className="mt-2 text-sm text-[#2D4B3C]/90 leading-relaxed">{bundle.summary}</p>
                    <ul className="mt-4 space-y-1.5 text-sm text-[#163024]">
                      {bundle.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-[#1E3D2F] shrink-0 mt-0.5" aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="px-6 py-4 bg-white/45 border-t border-[#1E3D2F]/10 flex items-center justify-between gap-4">
                  <div>
                    <span className="block text-[11px] text-[#3C5849]">Demo bundle price</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-semibold text-[#163024] tabular-nums">
                        {formatINR(bundle.price)}
                      </span>
                      {bundle.originalEstimate && bundle.originalEstimate > bundle.price && (
                        <span className="text-xs text-[#4C6658] line-through tabular-nums">
                          {formatINR(bundle.originalEstimate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => addBundleToCart(bundle)}
                    className="px-4 py-2.5 min-h-[40px] rounded-[14px] bg-gradient-to-r from-[#1E3D2F]/92 to-[#2B5240]/92 backdrop-blur-md border border-white/25 text-white text-xs font-medium hover:from-[#163024] hover:to-[#1E3D2F] transition-all shadow-xs whitespace-nowrap cursor-pointer"
                  >
                    Add Bundle
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Categories & Techniques */}
      <section className="relative py-16 lg:py-20 bg-gradient-to-b from-[#FAF8F4] via-[#F2F6EE]/70 to-[#FAF8F4] overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#1E3D2F]">
              Seven Cooling Categories
            </p>
            <h2 className="font-display text-3xl font-semibold text-[#163024] mt-1">
              Traditional Indian techniques adapted for daily living
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map((category) => (
              <CategoryCard
                key={category}
                category={category}
                description={
                  CATEGORY_SUMMARIES[category] ||
                  'Sustainable passive-cooling solution inspired by Indian craft traditions.'
                }
                startingPrice={getCategoryStartingPrice(category)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why CoolRoots & Passive Cooling Principles */}
      <section className="relative py-16 lg:py-20 bg-gradient-to-b from-[#F3EFE5] via-[#EEF3EA] to-[#F7F5EE] border-y border-white/75 overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-12 left-[10%] w-72 h-72 rounded-full bg-[#1E3D2F]/8 blur-3xl" />
          <div className="absolute bottom-10 right-[12%] w-80 h-80 rounded-full bg-amber-100/45 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-4">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#1E3D2F]">
                Why Choose CoolRoots
              </p>
              <h2 className="font-display text-3xl font-semibold text-[#163024]">
                Honest passive cooling grounded in climate science and craft.
              </h2>
              <p className="text-sm text-[#2D4B3C] leading-relaxed">
                Air conditioning is indispensable in extreme heat, yet much of the solar warmth
                entering Indian buildings can be intercepted before mechanical cooling is ever
                needed. CoolRoots pairs regional clay, vetiver, lime, and bamboo craft with clear
                climate suitability guidance.
              </p>
              <div className="pt-2">
                <Link
                  to="/finder"
                  className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[42px] rounded-[14px] bg-gradient-to-r from-[#1E3D2F]/92 to-[#2B5240]/92 backdrop-blur-md border border-white/25 text-white text-sm font-medium hover:from-[#163024] hover:to-[#1E3D2F] transition-all shadow-sm"
                >
                  <span>Match a Solution to Your Space</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-[20px] bg-white/65 backdrop-blur-lg border border-white/85 shadow-[0_8px_24px_-10px_rgba(22,48,36,0.10)] space-y-2.5">
                <Sun className="w-5 h-5 text-[#B84E32]" aria-hidden="true" />
                <h3 className="font-display text-lg font-semibold text-[#163024]">
                  Solar Interception First
                </h3>
                <p className="text-sm text-[#2D4B3C]/90 leading-relaxed">
                  Reflective lime roofs and bamboo blinds intercept sunlight on the building exterior
                  before it heats interior walls and glass.
                </p>
              </div>

              <div className="p-6 rounded-[20px] bg-white/65 backdrop-blur-lg border border-white/85 shadow-[0_8px_24px_-10px_rgba(22,48,36,0.10)] space-y-2.5">
                <Droplets className="w-5 h-5 text-[#1E3D2F]" aria-hidden="true" />
                <h3 className="font-display text-lg font-semibold text-[#163024]">
                  Evaporative Support Where Dry
                </h3>
                <p className="text-sm text-[#2D4B3C]/90 leading-relaxed">
                  Porous terracotta towers, matkas, and dampened khus screens work best in dry or
                  semi-arid airflows—with transparent humidity limitations stated upfront.
                </p>
              </div>

              <div className="p-6 rounded-[20px] bg-white/65 backdrop-blur-lg border border-white/85 shadow-[0_8px_24px_-10px_rgba(22,48,36,0.10)] space-y-2.5">
                <Wind className="w-5 h-5 text-[#B84E32]" aria-hidden="true" />
                <h3 className="font-display text-lg font-semibold text-[#163024]">
                  Ventilation & Daylight Balance
                </h3>
                <p className="text-sm text-[#2D4B3C]/90 leading-relaxed">
                  Jali screens and courtyard layout plans promote natural cross-breezes and privacy
                  without sealing rooms behind dark synthetic curtains.
                </p>
              </div>

              <div className="p-6 rounded-[20px] bg-white/65 backdrop-blur-lg border border-white/85 shadow-[0_8px_24px_-10px_rgba(22,48,36,0.10)] space-y-2.5">
                <Leaf className="w-5 h-5 text-[#1E3D2F]" aria-hidden="true" />
                <h3 className="font-display text-lg font-semibold text-[#163024]">
                  Low-Impact Earth Materials
                </h3>
                <p className="text-sm text-[#2D4B3C]/90 leading-relaxed">
                  Crafted with kiln-fired clay, slaked mineral lime, sustainably harvested bamboo,
                  and replaceable vetiver grass fibres to support local artisans.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Testimonials */}
      <section className="py-16 lg:py-20 bg-gradient-to-b from-[#FAF8F4] via-[#F2F6EE]/65 to-[#FAF8F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#1E3D2F]">
              Illustrative Demo Testimonials
            </p>
            <h2 className="font-display text-3xl font-semibold text-[#163024] mt-1">
              How Indian households and workspaces use passive cooling
            </h2>
            <p className="mt-2 text-xs text-[#3C5849]">
              Note: The stories below are prototype demonstration examples illustrating intended
              product use cases.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DEMO_TESTIMONIALS.map((item) => (
              <figure
                key={item.name}
                className="p-6 rounded-[20px] bg-white/68 backdrop-blur-lg border border-white/85 shadow-[0_8px_24px_-10px_rgba(22,48,36,0.10)] flex flex-col justify-between gap-5"
              >
                <blockquote className="text-sm text-[#163024] leading-relaxed">
                  “{item.quote}”
                </blockquote>
                <figcaption className="pt-4 border-t border-[#1E3D2F]/10 text-xs text-[#3C5849]">
                  <span className="block font-semibold text-[#163024]">{item.name}</span>
                  <span>
                    {item.role} · {item.city} · Demo Story
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
