import { ArrowRight, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../context/StoreContext';

export function Wishlist() {
  const { products, wishlist, clearWishlist } = useStore();

  const savedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#B84E32]">
            Saved Locally in Browser
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#261D17] mt-1">
            Your Cooling Wishlist
          </h1>
          <p className="mt-2 text-sm text-[#5A4C43] leading-relaxed">
            Keep track of traditional cooling solutions you are comparing for your home, balcony,
            or workspace.
          </p>
        </div>

        {savedProducts.length > 0 && (
          <button
            type="button"
            onClick={clearWishlist}
            className="text-xs font-medium text-[#65574D] hover:text-[#B84E32] transition-colors cursor-pointer self-start sm:self-auto"
          >
            Clear Wishlist
          </button>
        )}
      </div>

      {savedProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2D9C9] p-12 text-center max-w-2xl mx-auto">
          <Heart className="w-10 h-10 text-[#B84E32] mx-auto mb-3" aria-hidden="true" />
          <h2 className="font-display text-2xl font-semibold text-[#261D17]">
            No saved cooling products yet
          </h2>
          <p className="mt-2 text-sm text-[#5A4C43]">
            Tap the heart icon on any product card or product details page to save favorites for
            later comparison.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#B84E32] text-white text-sm font-medium hover:bg-[#9E3F26] transition-colors"
            >
              <span>Browse Cooling Catalog</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              to="/finder"
              className="inline-flex items-center px-5 py-2.5 rounded-lg border border-[#D8CBB5] bg-white text-[#261D17] text-sm font-medium hover:bg-[#F2ECE1] transition-colors"
            >
              Find Your Cooling Solution
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-xs text-[#65574D] tabular-nums">
            {savedProducts.length} saved {savedProducts.length === 1 ? 'product' : 'products'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {savedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
