import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { formatINR } from '../utils/cartUtils';
import { SafeImage } from './SafeImage';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, isInWishlist, toggleWishlist } = useStore();
  const lowestVariant = [...product.variants].sort((a, b) => a.price - b.price)[0];
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const inStock = totalStock > 0;
  const saved = isInWishlist(product.id);

  const handleQuickAdd = () => {
    if (!lowestVariant || !inStock) return;
    addToCart({
      itemType: 'product',
      productId: product.id,
      variantId: lowestVariant.id,
      variantName: lowestVariant.name,
      materialOption: product.materialOptions?.[0],
      name: product.name,
      category: product.category,
      price: lowestVariant.price,
      quantity: 1,
      image: product.image,
    });
  };

  return (
    <article className="group rounded-[22px] border border-white/85 bg-white/65 backdrop-blur-lg shadow-[0_10px_30px_-10px_rgba(22,48,36,0.12),inset_0_1px_0_rgba(255,255,255,0.85)] overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/80 hover:shadow-[0_18px_38px_-12px_rgba(22,48,36,0.18)]">
      <div className="relative p-2.5 pb-0">
        <div className="relative aspect-[4/3] rounded-[16px] bg-[#ECE8DC] overflow-hidden ring-1 ring-white/60">
          <Link to={`/product/${product.slug}`} className="block w-full h-full">
            <SafeImage
              src={product.image}
              alt={product.name}
              fallbackLabel={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </Link>
          <button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            aria-pressed={saved}
            aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
            title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
            className={`absolute top-2.5 right-2.5 w-10 h-10 rounded-full inline-flex items-center justify-center backdrop-blur-md border transition-colors duration-150 cursor-pointer shadow-sm ${
              saved
                ? 'bg-[#FAF3EE]/90 border-[#B84E32]/70 text-[#B84E32]'
                : 'bg-white/75 border-white/85 text-[#163024] hover:text-[#B84E32] hover:bg-white/95'
            }`}
          >
            <Heart
              className={`w-4 h-4 ${saved ? 'fill-[#B84E32]' : ''}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          <p className="text-xs text-[#3C5849] flex flex-wrap items-center gap-1.5">
            <span className="uppercase tracking-wider text-[11px] font-medium text-[#1E3D2F]">
              {product.category}
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {product.demoRating.toFixed(1)} ★ (Demo)
            </span>
            <span aria-hidden="true">·</span>
            <span className={inStock ? 'text-[#1E3D2F] font-medium' : 'text-[#B84E32] font-medium'}>
              {inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </p>

          <Link to={`/product/${product.slug}`} className="block mt-1.5">
            <h3 className="font-display text-lg font-semibold text-[#163024] group-hover:text-[#0F241B] transition-colors">
              {product.name}
            </h3>
          </Link>

          <p className="mt-1.5 text-sm text-[#2D4B3C]/90 leading-relaxed line-clamp-2">
            {product.shortDescription}
          </p>
        </div>

        <div className="pt-3 border-t border-[#1E3D2F]/10 flex items-center justify-between gap-3">
          <div>
            <span className="block text-[11px] text-[#3C5849]">Starting from (Demo)</span>
            <span className="text-base font-semibold text-[#163024] tabular-nums">
              {lowestVariant ? formatINR(lowestVariant.price) : 'Custom'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to={`/product/${product.slug}`}
              className="px-3 py-2 min-h-[40px] inline-flex items-center justify-center rounded-[14px] bg-white/70 backdrop-blur-md border border-[#1E3D2F]/15 text-xs font-medium text-[#163024] hover:bg-white transition-colors whitespace-nowrap"
            >
              Details
            </Link>
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={!inStock}
              className="px-3.5 py-2 min-h-[40px] inline-flex items-center justify-center gap-1.5 rounded-[14px] bg-gradient-to-r from-[#1E3D2F]/92 to-[#2B5240]/92 backdrop-blur-md border border-white/25 text-white text-xs font-medium hover:from-[#163024] hover:to-[#1E3D2F] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs whitespace-nowrap cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
