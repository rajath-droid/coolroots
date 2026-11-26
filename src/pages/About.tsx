import { ArrowRight, Hammer, Leaf, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SafeImage } from '../components/SafeImage';
import { HERO_IMAGE } from '../data/products';

export function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
      {/* Intro Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6 space-y-4">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#B84E32]">
            About CoolRoots · Ancient Wisdom. Modern Cooling.
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#261D17]">
            Bringing traditional Indian cooling wisdom into modern life.
          </h1>
          <p className="text-base text-[#5A4C43] leading-relaxed">
            Our mission is simple: bringing traditional Indian cooling wisdom into modern life to
            reduce heat, electricity dependency, and improve comfort sustainably.
          </p>
          <p className="text-sm text-[#5A4C43] leading-relaxed">
            Across India, potters, bamboo weavers, lime-plaster masons, and courtyard architects
            developed time-tested ways to soften harsh summers using porous clay, vetiver roots,
            perforated stone, and reflective lime. CoolRoots adapts these proven materials into
            clean, modular products for today’s apartments, independent houses, offices, shops, and
            schools.
          </p>
        </div>

        <div className="lg:col-span-6">
          <div className="aspect-[16/10] rounded-2xl overflow-hidden border border-[#E2D9C9] bg-[#F2ECE1]">
            <SafeImage
              src={HERO_IMAGE}
              alt="CoolRoots passive cooling veranda courtyard"
              fallbackLabel="CoolRoots Studio"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Vision, Heritage, Business Model */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-white border border-[#E2D9C9] space-y-2.5">
          <Leaf className="w-5 h-5 text-[#1E3D2F]" aria-hidden="true" />
          <h2 className="font-display text-xl font-semibold text-[#261D17]">
            Why Traditional Cooling Matters Today
          </h2>
          <p className="text-sm text-[#5A4C43] leading-relaxed">
            Rising urban heat islands and peak electricity loads make mechanical cooling expensive
            and grid-heavy. When buildings shade windows externally, reflect roof sunlight, and use
            natural ventilation, indoor surfaces stay cooler before a single compressor turns on.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-white border border-[#E2D9C9] space-y-2.5">
          <Users className="w-5 h-5 text-[#B84E32]" aria-hidden="true" />
          <h2 className="font-display text-xl font-semibold text-[#261D17]">
            Supporting Indian Craft Heritage
          </h2>
          <p className="text-sm text-[#5A4C43] leading-relaxed">
            Rather than importing plastic cooling gadgets, CoolRoots is designed around regional
            artisan livelihoods—kumhar terracotta makers, khus weavers, bamboo craftspeople, and
            traditional lime applicators—paired with clear sizing and installation guides.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-white border border-[#E2D9C9] space-y-2.5">
          <Hammer className="w-5 h-5 text-[#B84E32]" aria-hidden="true" />
          <h2 className="font-display text-xl font-semibold text-[#261D17]">
            Our Startup Business Model
          </h2>
          <p className="text-sm text-[#5A4C43] leading-relaxed">
            CoolRoots operates as a direct-to-customer e-commerce storefront offering standardized
            sizes, custom architectural jali and blind dimensions, multi-product cooling bundles,
            optional local installation guidance, and remote courtyard cooling consultations.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-white border border-[#E2D9C9] space-y-2.5">
          <ShieldCheck className="w-5 h-5 text-[#1E3D2F]" aria-hidden="true" />
          <h2 className="font-display text-xl font-semibold text-[#261D17]">
            Honest Expectations & Prototype Status
          </h2>
          <p className="text-sm text-[#5A4C43] leading-relaxed">
            We never market passive products as guaranteed replacements for air conditioners in
            every climate. This web application is a working startup prototype with editable INR
            pricing and simulated orders stored locally for business validation.
          </p>
        </div>
      </div>

      <div className="p-8 rounded-2xl bg-[#F2ECE1] border border-[#E2D9C9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[#261D17]">
            Ready to explore passive cooling for your space?
          </h2>
          <p className="text-sm text-[#5A4C43] mt-1">
            Use our Cooling Solution Finder or browse all seven traditional categories.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <Link
            to="/finder"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#B84E32] text-white text-sm font-medium hover:bg-[#9E3F26] transition-colors"
          >
            <span>Open Cooling Finder</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center px-5 py-2.5 rounded-lg border border-[#D8CBB5] bg-white text-[#261D17] text-sm font-medium hover:bg-[#FAF8F4] transition-colors"
          >
            Contact Our Team
          </Link>
        </div>
      </div>
    </div>
  );
}
