import { Heart, Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { SafeImage } from '../components/SafeImage';
import { useStore } from '../context/StoreContext';
import { formatINR } from '../utils/cartUtils';

type PriceRangeFilter = 'all' | 'under500' | '500to1500' | '1500to3000' | 'above3000';
type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'popularity';

export function Shop() {
  const { products, bundles, categories, addBundleToCart, wishlist, wishlistCount } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [wishlistOnly, setWishlistOnly] = useState(false);

  const initialCategory = searchParams.get('category') || 'All';
  const initialQuery = searchParams.get('q') || '';
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [priceRange, setPriceRange] = useState<PriceRangeFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  useEffect(() => {
    const paramCat = searchParams.get('category');
    if (paramCat && categories.includes(paramCat)) {
      setSelectedCategory(paramCat);
    } else if (!paramCat) {
      setSelectedCategory('All');
    }

    const paramQ = searchParams.get('q');
    if (paramQ !== null) {
      setSearchQuery(paramQ);
    }
  }, [searchParams, categories]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    const next = new URLSearchParams(searchParams);
    if (cat === 'All') {
      next.delete('category');
    } else {
      next.set('category', cat);
    }
    setSearchParams(next, { replace: true });
  };

  const getMinPrice = (variants: { price: number }[]) =>
    variants.length > 0 ? Math.min(...variants.map((v) => v.price)) : 0;

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const list = products.filter((product) => {
      if (wishlistOnly && !wishlist.includes(product.id)) {
        return false;
      }

      if (selectedCategory !== 'All' && product.category !== selectedCategory) {
        return false;
      }

      if (q) {
        const haystack = [
          product.name,
          product.category,
          product.shortDescription,
          product.description,
          product.specifications.material,
          ...(product.tags || []),
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      const minPrice = getMinPrice(product.variants);
      const maxPrice =
        product.variants.length > 0 ? Math.max(...product.variants.map((v) => v.price)) : 0;

      if (priceRange === 'under500' && minPrice > 500) return false;
      if (priceRange === '500to1500' && (maxPrice < 500 || minPrice > 1500)) return false;
      if (priceRange === '1500to3000' && (maxPrice < 1500 || minPrice > 3000)) return false;
      if (priceRange === 'above3000' && maxPrice <= 3000) return false;

      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'price-asc') {
        return getMinPrice(a.variants) - getMinPrice(b.variants);
      }
      if (sortBy === 'price-desc') {
        return getMinPrice(b.variants) - getMinPrice(a.variants);
      }
      if (sortBy === 'popularity') {
        return b.demoReviewCount - a.demoReviewCount;
      }
      return Number(b.featured) - Number(a.featured);
    });
  }, [products, selectedCategory, searchQuery, priceRange, sortBy, wishlistOnly, wishlist]);

  const resetFilters = () => {
    setSearchQuery('');
    setPriceRange('all');
    setSortBy('featured');
    setWishlistOnly(false);
    setSelectedCategory('All');
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#B84E32]">
          CoolRoots Storefront · Illustrative INR Pricing
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#261D17] mt-1">
          Passive Cooling Catalog
        </h1>
        <p className="mt-2 text-sm text-[#5A4C43] leading-relaxed">
          Browse terracotta cooling towers, khus screens, matka pots, lime roof kits, jali panels,
          courtyard consultations, and bamboo blinds. All ratings and prices are editable demo data.
        </p>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-xl border border-[#E2D9C9] p-4 sm:p-5 space-y-4 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-6 relative">
            <Search
              className="w-4 h-4 text-[#65574D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, clay, khus, roof, bamboo, tags..."
              aria-label="Search cooling products"
              className="w-full pl-10 pr-4 py-2.5 min-h-[42px] rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-sm text-[#261D17] placeholder:text-[#8A7B6F] focus:bg-white focus:border-[#B84E32] focus:outline-none"
            />
          </div>

          <div className="md:col-span-3">
            <label htmlFor="price-filter" className="sr-only">
              Filter by price
            </label>
            <select
              id="price-filter"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value as PriceRangeFilter)}
              className="w-full px-3 py-2.5 min-h-[42px] rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-sm text-[#261D17] focus:bg-white focus:border-[#B84E32] focus:outline-none"
            >
              <option value="all">All Prices</option>
              <option value="under500">Under ₹500</option>
              <option value="500to1500">₹500 – ₹1,500</option>
              <option value="1500to3000">₹1,500 – ₹3,000</option>
              <option value="above3000">Above ₹3,000</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label htmlFor="sort-select" className="sr-only">
              Sort products
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-3 py-2.5 min-h-[42px] rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-sm text-[#261D17] focus:bg-white focus:border-[#B84E32] focus:outline-none"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="popularity">Popularity (Demo)</option>
            </select>
          </div>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#EFE7DA]">
          <span className="inline-flex items-center gap-1.5 text-xs text-[#65574D] mr-2">
            <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Category:</span>
          </span>
          <button
            type="button"
            onClick={() => handleCategoryChange('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === 'All'
                ? 'bg-[#1E3D2F] text-white'
                : 'bg-[#F2ECE1] text-[#261D17] hover:bg-[#E5DCCB]'
            }`}
          >
            All ({products.length})
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => handleCategoryChange(category)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-[#1E3D2F] text-white'
                  : 'bg-[#F2ECE1] text-[#261D17] hover:bg-[#E5DCCB]'
              }`}
            >
              {category}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setWishlistOnly((prev) => !prev)}
            aria-pressed={wishlistOnly}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              wishlistOnly
                ? 'bg-[#B84E32] text-white'
                : 'bg-[#FAF3EE] text-[#B84E32] border border-[#E7C9BF] hover:bg-[#F3E2DC]'
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${wishlistOnly ? 'fill-white' : 'fill-[#B84E32]'}`}
              aria-hidden="true"
            />
            <span className="tabular-nums">Saved ({wishlistCount})</span>
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 text-xs text-[#65574D]">
        <div className="flex items-center gap-3">
          <p className="tabular-nums">
            Showing {filteredProducts.length} of {products.length} products
          </p>
          <span aria-hidden="true">·</span>
          <Link
            to="/wishlist"
            className="font-medium text-[#B84E32] hover:text-[#9E3F26] transition-colors"
          >
            Open Wishlist ({wishlistCount})
          </Link>
        </div>
        {(selectedCategory !== 'All' || searchQuery || priceRange !== 'all' || wishlistOnly) && (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1 text-[#B84E32] hover:text-[#9E3F26] font-medium cursor-pointer"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Clear filters</span>
          </button>
        )}
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2D9C9] p-12 text-center">
          <h2 className="font-display text-xl font-semibold text-[#261D17]">
            No matching cooling products found
          </h2>
          <p className="mt-2 text-sm text-[#5A4C43]">
            Try clearing your price filter or searching for another cooling material.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 px-5 py-2.5 rounded-lg bg-[#B84E32] text-white text-sm font-medium hover:bg-[#9E3F26] transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Bundles Section */}
      <section className="mt-16 pt-12 border-t border-[#E2D9C9]">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#1E3D2F]">
            Multi-Product Sets · Demo Pricing
          </p>
          <h2 className="font-display text-2xl font-semibold text-[#261D17] mt-1">
            Cooling Bundles
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bundles.map((bundle) => (
            <div
              key={bundle.id}
              className="p-5 rounded-xl bg-[#F2ECE1] border border-[#E2D9C9] flex flex-col justify-between gap-4"
            >
              <div className="flex gap-4 items-start">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-white border border-[#E2D9C9] shrink-0">
                  <SafeImage
                    src={bundle.image}
                    alt={bundle.name}
                    fallbackLabel={bundle.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-[#261D17]">
                    {bundle.name}
                  </h3>
                  <p className="text-xs text-[#5A4C43] mt-1 leading-relaxed">{bundle.summary}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#D8CBB5]">
                <span className="text-base font-semibold text-[#261D17] tabular-nums">
                  {formatINR(bundle.price)}
                </span>
                <button
                  type="button"
                  onClick={() => addBundleToCart(bundle)}
                  className="px-4 py-2 rounded-lg bg-[#1E3D2F] text-white text-xs font-medium hover:bg-[#173025] transition-colors cursor-pointer"
                >
                  Add Bundle
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
