import { ArrowRight, Droplets, Sun, Wind } from 'lucide-react';
import { Link } from 'react-router-dom';

const METHODS = [
  {
    title: '01. Evaporative Cooling (Terracotta Towers, Khus & Matkas)',
    howItWorks:
      'When dry or warm air passes across a damp porous surface—such as unglazed terracotta clay or woven vetiver (khus) grass—water absorbs heat from the air and water inside the pot as it evaporates.',
    bestFor: 'Hot-dry afternoons in central, northern, and western India; patios, balconies, and drinking water.',
    climateNote:
      'Evaporative cooling slows down significantly during humid monsoons or in coastal cities where relative humidity exceeds 65–70%.',
    waterAndCare:
      'Matkas require ~300 ml/day evaporation loss and salt-scrubbing every 10 days. Khus screens need light misting and drying once a week; terracotta tubes should be rinsed fortnightly.',
  },
  {
    title: '02. Reflective Roof Cooling (Slaked Lime Chuna Wash)',
    howItWorks:
      'Exposed concrete roof slabs absorb intense solar radiation all day and radiate trapped heat downward into top-floor rooms well into the night. High-albedo white slaked lime reflects a large portion of sunlight before it enters the slab.',
    bestFor: 'Independent homes, apartments on the top floor, shops, and schools with flat RCC or brick-bat terraces.',
    climateNote:
      'Works across both dry and humid sunny climates because it stops solar heat gain rather than relying on air evaporation.',
    waterAndCare:
      'Requires water only during mixing and pre-dampening of the roof. Apply 2–3 thin coats; refresh every 1–2 summers after heavy monsoon wear.',
  },
  {
    title: '03. Solar Interception & Filtered Airflow (Bamboo Blinds & Jali)',
    howItWorks:
      'Once sunlight passes through window glass, it warms floors and furniture like a greenhouse. Exterior bamboo chick blinds intercept sunlight outside the glass while allowing warm air to rise out. Jali screens break glare into dappled light and channel breeze through smaller apertures.',
    bestFor: 'West- and south-facing windows, street-facing balconies, staircases, and verandas.',
    climateNote:
      'Effective in every Indian climate zone—especially humid coastal cities where shading and cross-ventilation matter more than adding moisture.',
    waterAndCare:
      'Zero water required. Dust monthly with a soft broom and roll up bamboo blinds during severe storms.',
  },
  {
    title: '04. Courtyard Stack Ventilation & Microclimate Design',
    howItWorks:
      'Traditional Indian courtyards (aangan / chowk) draw cool night air down into shaded rooms while warm indoor air rises and escapes upward through high openings, clerestories, and planted shade canopies.',
    bestFor: 'New home construction, farmhouse projects, schools, and major home renovations.',
    climateNote:
      'Layout, opening size, and courtyard depth must match local sun angles and wind direction—whether hot-dry or warm-humid.',
    waterAndCare:
      'Zero mechanical maintenance; relies on seasonal native planting care and keeping high vents clear.',
  },
];

export function CoolingGuide() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
      <div className="max-w-3xl space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#B84E32]">
          Educational Guide · Clear Climate Facts
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#261D17]">
          How Traditional Indian Passive Cooling Works
        </h1>
        <p className="text-base text-[#5A4C43] leading-relaxed">
          Traditional Indian architecture kept homes comfortable long before refrigerant compressors
          by working with sun angles, breeze paths, clay porosity, and plant shade. Understanding
          where each technique excels—and where it has limits—helps you choose the right solution.
        </p>
      </div>

      {/* Three Core Physical Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-white border border-[#E2D9C9] space-y-2.5">
          <Sun className="w-5 h-5 text-[#B84E32]" aria-hidden="true" />
          <h2 className="font-display text-lg font-semibold text-[#261D17]">
            1. Block & Reflect Heat Outside
          </h2>
          <p className="text-sm text-[#5A4C43] leading-relaxed">
            Lime-washed roofs and bamboo chick blinds stop solar radiation before it heats brick,
            concrete, or interior glass.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-white border border-[#E2D9C9] space-y-2.5">
          <Droplets className="w-5 h-5 text-[#1E3D2F]" aria-hidden="true" />
          <h2 className="font-display text-lg font-semibold text-[#261D17]">
            2. Cool Dry Air via Evaporation
          </h2>
          <p className="text-sm text-[#5A4C43] leading-relaxed">
            Terracotta towers, matka pots, and dampened khus grass use natural water evaporation to
            cool passing air or stored water when humidity is low.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-white border border-[#E2D9C9] space-y-2.5">
          <Wind className="w-5 h-5 text-[#B84E32]" aria-hidden="true" />
          <h2 className="font-display text-lg font-semibold text-[#261D17]">
            3. Channel Natural Cross-Breeze
          </h2>
          <p className="text-sm text-[#5A4C43] leading-relaxed">
            Perforated jali screens and courtyard vents encourage warm air to escape while drawing
            cooler shaded air across living areas.
          </p>
        </div>
      </div>

      {/* Detailed Method Breakdown */}
      <section className="space-y-6">
        <h2 className="font-display text-2xl font-semibold text-[#261D17]">
          Cooling Techniques Explained
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {METHODS.map((m) => (
            <article
              key={m.title}
              className="p-6 rounded-xl bg-white border border-[#E2D9C9] space-y-3"
            >
              <h3 className="font-display text-xl font-semibold text-[#261D17]">{m.title}</h3>
              <p className="text-sm text-[#5A4C43] leading-relaxed">{m.howItWorks}</p>
              <div className="pt-3 border-t border-[#EFE7DA] space-y-2 text-xs text-[#4A3D34]">
                <p>
                  <strong className="text-[#1E3D2F]">Best suited for:</strong> {m.bestFor}
                </p>
                <p>
                  <strong className="text-[#B84E32]">Climate suitability:</strong> {m.climateNote}
                </p>
                <p>
                  <strong className="text-[#261D17]">Water & maintenance:</strong> {m.waterAndCare}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Passive Cooling vs Air Conditioning Comparison */}
      <section className="bg-[#F2ECE1] rounded-2xl border border-[#E2D9C9] p-6 sm:p-8 space-y-5">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl font-semibold text-[#261D17]">
            Passive Cooling vs. Conventional Air Conditioning
          </h2>
          <p className="mt-2 text-sm text-[#5A4C43]">
            Passive cooling is not a universal replacement for AC in sealed rooms or extreme humid
            heatwaves. Instead, it lowers building heat gain so spaces stay pleasant longer and
            mechanical cooling is needed far less often.
          </p>
        </div>

        <div className="overflow-x-auto bg-white rounded-xl border border-[#E2D9C9]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF8F4] border-b border-[#E2D9C9] text-xs uppercase tracking-wider text-[#65574D]">
              <tr>
                <th className="p-4 font-semibold">Factor</th>
                <th className="p-4 font-semibold">Traditional Passive Cooling</th>
                <th className="p-4 font-semibold">Conventional Air Conditioning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2D9C9] text-[#261D17]">
              <tr>
                <td className="p-4 font-medium">Electricity Dependency</td>
                <td className="p-4 text-[#5A4C43]">
                  Zero to very low (optional low-wattage fan on select towers)
                </td>
                <td className="p-4 text-[#5A4C43]">High continuous compressor load</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Room Sealing Requirement</td>
                <td className="p-4 text-[#5A4C43]">
                  Works best with open windows, balconies, and cross-ventilation
                </td>
                <td className="p-4 text-[#5A4C43]">Requires closed, sealed rooms</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">High Humidity Performance</td>
                <td className="p-4 text-[#5A4C43]">
                  Shade & airflow work well; evaporative cooling slows down above ~65% RH
                </td>
                <td className="p-4 text-[#5A4C43]">Actively dehumidifies and cools sealed rooms</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Water & Maintenance</td>
                <td className="p-4 text-[#5A4C43]">
                  Periodic cleaning of clay/khus; seasonal lime recoating; regular water refill for
                  evaporative units
                </td>
                <td className="p-4 text-[#5A4C43]">Filter cleaning and technician servicing</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="pt-2 flex flex-wrap gap-3">
          <Link
            to="/finder"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#B84E32] text-white text-sm font-medium hover:bg-[#9E3F26] transition-colors"
          >
            <span>Find Your Cooling Solution</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#D8CBB5] bg-white text-[#261D17] text-sm font-medium hover:bg-[#FAF8F4] transition-colors"
          >
            <span>Browse All Products</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
