import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CATEGORY_IMAGES } from '../data/products';
import { CategoryName } from '../types';
import { SafeImage } from './SafeImage';

interface CategoryCardProps {
  category: CategoryName;
  description: string;
  startingPrice: number;
  image?: string;
}

export function CategoryCard({
  category,
  description,
  startingPrice,
  image,
}: CategoryCardProps) {
  const resolvedImage =
    image ||
    CATEGORY_IMAGES[category] ||
    '/src/assets/images/hero_courtyard_cooling_1795643215641.jpg';

  return (
    <Link
      to={`/shop?category=${encodeURIComponent(category)}`}
      className="group rounded-[20px] bg-white/65 backdrop-blur-lg border border-white/85 shadow-[0_8px_26px_-10px_rgba(22,48,36,0.12),inset_0_1px_0_rgba(255,255,255,0.85)] overflow-hidden hover:bg-white/82 hover:shadow-[0_16px_34px_-12px_rgba(22,48,36,0.18)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        <div className="p-2 pb-0">
          <div className="aspect-[4/3] rounded-[14px] bg-[#ECE8DC] overflow-hidden ring-1 ring-white/60">
            <SafeImage
              src={resolvedImage}
              alt={`${category} passive cooling products`}
              fallbackLabel={category}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </div>
        </div>
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-base font-semibold text-[#163024] group-hover:text-[#0F241B] transition-colors">
              {category}
            </h3>
            <ArrowRight
              className="w-4 h-4 text-[#1E3D2F] group-hover:translate-x-0.5 transition-transform shrink-0"
              aria-hidden="true"
            />
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-[#2D4B3C]/90 leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-[#1E3D2F]/10">
        <p className="text-xs text-[#3C5849] tabular-nums">
          From ₹{startingPrice.toLocaleString('en-IN')} · Demo pricing
        </p>
      </div>
    </Link>
  );
}
