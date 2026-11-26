import { Check, Compass, RotateCcw, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SafeImage } from '../components/SafeImage';
import { useStore } from '../context/StoreContext';
import {
  BudgetOption,
  FinderAnswers,
  PreferenceOption,
  ProblemOption,
  SpaceOption,
} from '../types';
import { formatINR } from '../utils/cartUtils';
import { generateCoolingRecommendations } from '../utils/recommendationEngine';

const SPACE_OPTIONS: SpaceOption[] = [
  'Bedroom',
  'Living room',
  'Rooftop',
  'Balcony',
  'Courtyard',
  'Shop',
  'Office',
  'Outdoor waiting area',
];

const PROBLEM_OPTIONS: ProblemOption[] = [
  'Direct sunlight',
  'Hot roof',
  'Poor airflow',
  'Hot outdoor waiting area',
  'Need cooler water',
  'Need natural shade',
];

const BUDGET_OPTIONS: BudgetOption[] = [
  'Under ₹500',
  '₹500–₹1,500',
  '₹1,500–₹3,000',
  '₹3,000+',
];

const PREFERENCE_OPTIONS: PreferenceOption[] = [
  'Traditional natural materials',
  'Low electricity usage',
  'Home architecture solution',
  'Outdoor cooling',
  'Affordable solution',
];

const DEFAULT_ANSWERS: FinderAnswers = {
  space: 'Bedroom',
  problem: 'Direct sunlight',
  budget: '₹500–₹1,500',
  preference: 'Traditional natural materials',
};

export function CoolingFinder() {
  const { products, addToCart } = useStore();
  const [answers, setAnswers] = useState<FinderAnswers>(DEFAULT_ANSWERS);
  const [submitted, setSubmitted] = useState(true);

  const recommendations = generateCoolingRecommendations(products, answers);

  const updateAnswer = <K extends keyof FinderAnswers>(key: K, value: FinderAnswers[K]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mb-10">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#B84E32] inline-flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Rule-Based Passive Cooling Matcher · No External AI Required</span>
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#261D17] mt-1">
          Find Your Cooling Solution
        </h1>
        <p className="mt-2 text-sm text-[#5A4C43] leading-relaxed">
          Answer four quick questions about your space, heat issue, budget, and preference. Our
          matching rules recommend practical CoolRoots options along with honest climate limits.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Questionnaire Panel */}
        <section
          aria-label="Cooling requirements questionnaire"
          className="lg:col-span-5 bg-white rounded-xl border border-[#E2D9C9] p-6 space-y-6"
        >
          <div>
            <h2 className="text-sm font-semibold text-[#261D17] mb-2.5">
              1. Where do you need cooling?
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {SPACE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => updateAnswer('space', option)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium text-left border transition-colors cursor-pointer ${
                    answers.space === option
                      ? 'bg-[#1E3D2F] text-white border-[#1E3D2F]'
                      : 'bg-[#FAF8F4] text-[#261D17] border-[#E2D9C9] hover:bg-[#F2ECE1]'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-[#261D17] mb-2.5">
              2. What is your primary problem?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PROBLEM_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => updateAnswer('problem', option)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium text-left border transition-colors cursor-pointer ${
                    answers.problem === option
                      ? 'bg-[#1E3D2F] text-white border-[#1E3D2F]'
                      : 'bg-[#FAF8F4] text-[#261D17] border-[#E2D9C9] hover:bg-[#F2ECE1]'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-[#261D17] mb-2.5">
              3. What is your budget?
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {BUDGET_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => updateAnswer('budget', option)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium text-left border transition-colors cursor-pointer tabular-nums ${
                    answers.budget === option
                      ? 'bg-[#B84E32] text-white border-[#B84E32]'
                      : 'bg-[#FAF8F4] text-[#261D17] border-[#E2D9C9] hover:bg-[#F2ECE1]'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-[#261D17] mb-2.5">
              4. What type of solution do you prefer?
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {PREFERENCE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => updateAnswer('preference', option)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium text-left border transition-colors cursor-pointer ${
                    answers.preference === option
                      ? 'bg-[#1E3D2F] text-white border-[#1E3D2F]'
                      : 'bg-[#FAF8F4] text-[#261D17] border-[#E2D9C9] hover:bg-[#F2ECE1]'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#EFE7DA] flex items-center justify-between">
            <span className="text-xs text-[#65574D]">Results update automatically</span>
            <button
              type="button"
              onClick={() => setAnswers(DEFAULT_ANSWERS)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#B84E32] hover:text-[#9E3F26] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset Answers</span>
            </button>
          </div>
        </section>

        {/* Recommendations Output */}
        <section aria-label="Recommended products" className="lg:col-span-7 space-y-5">
          <div className="p-4 rounded-xl bg-[#F2ECE1] border border-[#E2D9C9] text-xs text-[#4A3D34]">
            Showing top matches for <strong className="text-[#261D17]">{answers.space}</strong> ·{' '}
            <strong className="text-[#261D17]">{answers.problem}</strong> ·{' '}
            <strong className="text-[#261D17]">{answers.budget}</strong> ·{' '}
            <strong className="text-[#261D17]">{answers.preference}</strong>
          </div>

          {submitted &&
            recommendations.map(({ product, recommendedVariant, reason }, index) => (
              <article
                key={product.id}
                className="bg-white rounded-xl border border-[#E2D9C9] overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-12">
                  <div className="sm:col-span-4 aspect-[4/3] sm:aspect-auto bg-[#F2ECE1]">
                    <SafeImage
                      src={product.image}
                      alt={product.name}
                      fallbackLabel={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="sm:col-span-8 p-5 sm:p-6 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-[#65574D]">
                          Match #{index + 1} · {product.category}
                        </p>
                        <h3 className="font-display text-xl font-semibold text-[#261D17] mt-0.5">
                          {product.name}
                        </h3>
                        <p className="text-xs font-medium text-[#1E3D2F] mt-0.5">
                          Suggested variant: {recommendedVariant.name} ({recommendedVariant.dimensionsOrCoverage})
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="block text-[11px] text-[#65574D]">Demo price</span>
                        <span className="text-lg font-semibold text-[#261D17] tabular-nums">
                          {formatINR(recommendedVariant.price)}
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-lg bg-[#FAF8F4] border border-[#EFE7DA]">
                      <p className="text-xs font-semibold text-[#261D17] mb-1">
                        Why this product is recommended
                      </p>
                      <p className="text-xs text-[#5A4C43] leading-relaxed">{reason}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="font-semibold text-[#1E3D2F] mb-1.5">Benefits</p>
                        <ul className="space-y-1 text-[#261D17]">
                          {product.benefits.slice(0, 2).map((b) => (
                            <li key={b} className="flex items-start gap-1.5">
                              <Check className="w-3.5 h-3.5 text-[#1E3D2F] shrink-0 mt-0.5" aria-hidden="true" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-[#B84E32] mb-1.5">Honest Limitations</p>
                        <ul className="space-y-1 text-[#5A4C43]">
                          {product.limitations.slice(0, 2).map((l) => (
                            <li key={l}>• {l}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#EFE7DA] flex flex-wrap items-center gap-3">
                      <Link
                        to={`/product/${product.slug}`}
                        className="px-4 py-2 min-h-[40px] inline-flex items-center justify-center rounded-lg border border-[#D8CBB5] text-xs font-medium text-[#261D17] hover:bg-[#F2ECE1] transition-colors"
                      >
                        View Product
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          addToCart({
                            itemType: 'product',
                            productId: product.id,
                            variantId: recommendedVariant.id,
                            variantName: recommendedVariant.name,
                            materialOption: product.materialOptions?.[0],
                            name: product.name,
                            category: product.category,
                            price: recommendedVariant.price,
                            quantity: 1,
                            image: product.image,
                          })
                        }
                        className="px-4 py-2 min-h-[40px] inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#B84E32] text-white text-xs font-medium hover:bg-[#9E3F26] transition-colors cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
        </section>
      </div>
    </div>
  );
}
