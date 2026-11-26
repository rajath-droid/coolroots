import { ArrowLeft, Check, Heart, Info, Minus, Plus, Share2, ShieldAlert, ShoppingBag, Truck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { SafeImage } from '../components/SafeImage';
import { useStore } from '../context/StoreContext';
import { formatINR } from '../utils/cartUtils';

export function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const { products, addToCart, isInWishlist, toggleWishlist, showToast } = useStore();

  const product = products.find((p) => p.slug === slug || p.id === slug);

  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (product) {
      setSelectedVariantId(product.variants[0]?.id || '');
      setSelectedMaterial(product.materialOptions?.[0] || '');
      setActiveImage(product.image);
      setQuantity(1);
      setCopiedLink(false);
    }
    return () => {
      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, [product]);

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-semibold text-[#261D17]">Product not found</h1>
        <p className="mt-3 text-sm text-[#5A4C43]">
          This cooling item is currently unavailable or could not be found in the catalog.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#B84E32] text-white text-sm font-medium hover:bg-[#9E3F26]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shop</span>
        </Link>
      </div>
    );
  }

  const activeVariant =
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];
  const galleryImages =
    product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];
  const relatedProducts = products.filter((p) => p.id !== product.id).slice(0, 3);
  const saved = isInWishlist(product.id);

  const handleAdd = () => {
    if (!activeVariant || activeVariant.stock <= 0) return;
    addToCart({
      itemType: 'product',
      productId: product.id,
      variantId: activeVariant.id,
      variantName: activeVariant.name,
      materialOption: selectedMaterial || undefined,
      name: product.name,
      category: product.category,
      price: activeVariant.price,
      quantity,
      image: product.image,
    });
  };

  const copyToClipboard = async (url: string): Promise<boolean> => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        return true;
      } catch {
        // Fall through to legacy textarea copy fallback
      }
    }
    try {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `${product.name} — CoolRoots`,
          text: product.shortDescription,
          url: shareUrl,
        });
        showToast('Product link shared');
        return;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        // Fall back to clipboard copy if Web Share API is blocked or unavailable
      }
    }

    const copied = await copyToClipboard(shareUrl);
    if (copied) {
      setCopiedLink(true);
      showToast('Product link copied to clipboard');
      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => setCopiedLink(false), 2200);
    } else {
      showToast('Unable to copy link in this browser', 'error');
    }
  };

  return (
    <div className="pb-24 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <nav aria-label="Breadcrumb" className="mb-6">
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#65574D] hover:text-[#B84E32] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Back to All Cooling Products</span>
          </Link>
        </nav>

        {/* Contiguous Purchase Module */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left: Sticky Gallery */}
          <div className="lg:col-span-6 lg:sticky lg:top-24 space-y-4">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#F2ECE1] border border-[#E2D9C9]">
              <SafeImage
                src={activeImage || product.image}
                alt={product.name}
                fallbackLabel={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {galleryImages.length > 1 && (
              <div className="flex items-center gap-3">
                {galleryImages.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`w-24 aspect-[4/3] rounded-lg overflow-hidden border transition-colors cursor-pointer ${
                      activeImage === img
                        ? 'border-[#B84E32] ring-2 ring-[#B84E32]/25'
                        : 'border-[#E2D9C9] opacity-80 hover:opacity-100'
                    }`}
                  >
                    <SafeImage
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      fallbackLabel={product.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Purchase & Variant Configuration */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <p className="text-xs text-[#65574D] flex flex-wrap items-center gap-2">
                <span className="uppercase tracking-wider font-medium text-[#B84E32]">
                  {product.category}
                </span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">
                  {product.demoRating.toFixed(1)} ★ ({product.demoReviewCount} demo reviews)
                </span>
              </p>

              <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#261D17] mt-2">
                {product.name}
              </h1>

              <div className="mt-4 flex flex-wrap items-baseline gap-3">
                <span className="text-2xl font-semibold text-[#261D17] tabular-nums">
                  {activeVariant ? formatINR(activeVariant.price) : 'Custom'}
                </span>
                <span className="text-xs text-[#65574D]">
                  Illustrative prototype INR price ·{' '}
                  {activeVariant && activeVariant.stock > 0
                    ? `${activeVariant.stock} units in local stock`
                    : 'Currently out of stock'}
                </span>
              </div>

              <p className="mt-4 text-sm sm:text-base text-[#5A4C43] leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Variant Selector */}
            <div className="pt-4 border-t border-[#E2D9C9] space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#261D17]">
                Select Variant / Size
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {product.variants.map((variant) => {
                  const selected = activeVariant?.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer flex items-center justify-between gap-4 ${
                        selected
                          ? 'border-[#B84E32] bg-[#FAF3EE]'
                          : 'border-[#E2D9C9] bg-white hover:border-[#CBBCA5]'
                      }`}
                    >
                      <div>
                        <span className="block text-sm font-semibold text-[#261D17]">
                          {variant.name}
                        </span>
                        <span className="block text-xs text-[#65574D] mt-0.5">
                          {variant.dimensionsOrCoverage}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-[#261D17] tabular-nums shrink-0">
                        {formatINR(variant.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Material Option Selector (e.g., Jali panels) */}
            {product.materialOptions && product.materialOptions.length > 0 && (
              <div className="space-y-2.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#261D17]">
                  Material Option
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.materialOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSelectedMaterial(option)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                        selectedMaterial === option
                          ? 'bg-[#1E3D2F] text-white border-[#1E3D2F]'
                          : 'bg-white text-[#261D17] border-[#D8CBB5] hover:bg-[#F2ECE1]'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center border border-[#D8CBB5] rounded-lg bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-11 h-11 inline-flex items-center justify-center text-[#261D17] hover:bg-[#F2ECE1] rounded-l-lg cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-semibold text-[#261D17] tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) =>
                      activeVariant ? Math.min(activeVariant.stock, q + 1) : q + 1
                    )
                  }
                  aria-label="Increase quantity"
                  className="w-11 h-11 inline-flex items-center justify-center text-[#261D17] hover:bg-[#F2ECE1] rounded-r-lg cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                disabled={!activeVariant || activeVariant.stock <= 0}
                className="flex-1 min-w-[180px] min-h-[44px] px-6 py-3 rounded-lg bg-[#B84E32] text-white text-sm font-medium hover:bg-[#9E3F26] disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                <span>
                  Add to Cart ·{' '}
                  {activeVariant ? formatINR(activeVariant.price * quantity) : ''}
                </span>
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                aria-pressed={saved}
                aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
                className={`min-h-[44px] px-4 py-3 rounded-lg border text-sm font-medium transition-colors inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                  saved
                    ? 'border-[#B84E32] bg-[#FAF3EE] text-[#B84E32]'
                    : 'border-[#D8CBB5] bg-white text-[#261D17] hover:bg-[#F2ECE1]'
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${saved ? 'fill-[#B84E32]' : ''}`}
                  aria-hidden="true"
                />
                <span>{saved ? 'Saved' : 'Save'}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                aria-label={`Share ${product.name}`}
                className={`min-h-[44px] px-4 py-3 rounded-lg border text-sm font-medium transition-colors inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                  copiedLink
                    ? 'border-[#1E3D2F] bg-[#EEF4F0] text-[#1E3D2F]'
                    : 'border-[#D8CBB5] bg-white text-[#261D17] hover:bg-[#F2ECE1]'
                }`}
              >
                {copiedLink ? (
                  <Check className="w-4 h-4 text-[#1E3D2F]" aria-hidden="true" />
                ) : (
                  <Share2 className="w-4 h-4" aria-hidden="true" />
                )}
                <span>{copiedLink ? 'Copied' : 'Share'}</span>
              </button>
            </div>

            {saved && (
              <p className="text-xs text-[#65574D]">
                Saved in your local wishlist.{' '}
                <Link
                  to="/wishlist"
                  className="font-medium text-[#B84E32] hover:text-[#9E3F26] underline underline-offset-2"
                >
                  View Wishlist
                </Link>
              </p>
            )}

            {/* Shipping & Optional Service */}
            <div className="p-4 rounded-xl bg-[#F2ECE1] border border-[#E2D9C9] space-y-2 text-xs text-[#4A3D34]">
              <div className="flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-[#1E3D2F] shrink-0 mt-0.5" aria-hidden="true" />
                <p>{product.shippingInfo}</p>
              </div>
              {product.serviceOption && (
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-[#B84E32] shrink-0 mt-0.5" aria-hidden="true" />
                  <p>{product.serviceOption}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Specifications, Benefits & Honest Limitations */}
        <div className="mt-14 pt-12 border-t border-[#E2D9C9] grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-4">
            <h2 className="font-display text-2xl font-semibold text-[#261D17]">
              Technical & Climate Specifications
            </h2>
            <dl className="divide-y divide-[#E2D9C9] border border-[#E2D9C9] rounded-xl bg-white">
              {[
                { label: 'Material', value: product.specifications.material },
                { label: 'Dimensions', value: product.specifications.dimensions },
                { label: 'Water Requirements', value: product.specifications.waterRequirement },
                { label: 'Installation Guidance', value: product.specifications.installation },
                { label: 'Maintenance', value: product.specifications.maintenance },
                { label: 'Climate Suitability', value: product.specifications.climateSuitability },
                ...(product.specifications.coverageOrCapacity
                  ? [{ label: 'Coverage / Capacity', value: product.specifications.coverageOrCapacity }]
                  : []),
                ...(product.specifications.coatsOrCycle
                  ? [{ label: 'Application Coats', value: product.specifications.coatsOrCycle }]
                  : []),
                { label: 'Safety Notes', value: product.safetyNotes },
              ].map((row) => (
                <div key={row.label} className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-[#65574D]">
                    {row.label}
                  </dt>
                  <dd className="sm:col-span-2 text-sm text-[#261D17] leading-relaxed">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-xl bg-white border border-[#E2D9C9] space-y-3">
              <h3 className="font-display text-xl font-semibold text-[#1E3D2F]">
                Key Passive-Cooling Benefits
              </h3>
              <ul className="space-y-2.5 text-sm text-[#261D17]">
                {product.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#1E3D2F] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-xl bg-[#F2ECE1] border border-[#D8CBB5] space-y-3">
              <div className="flex items-center gap-2 text-[#261D17]">
                <ShieldAlert className="w-4 h-4 text-[#B84E32] shrink-0" aria-hidden="true" />
                <h3 className="font-display text-xl font-semibold">
                  Limitations & Realistic Expectations
                </h3>
              </div>
              <ul className="space-y-2.5 text-sm text-[#4A3D34]">
                {product.limitations.map((lim) => (
                  <li key={lim} className="leading-relaxed">
                    • {lim}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <section className="mt-16 pt-12 border-t border-[#E2D9C9]">
          <h2 className="font-display text-2xl font-semibold text-[#261D17] mb-6">
            Complementary Cooling Solutions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      </div>

      {/* Mobile Sticky Bottom Buy Bar (<=15% viewport height) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#E2D9C9] px-4 py-2.5 flex items-center justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-[#65574D] truncate">{activeVariant?.name}</p>
          <p className="text-base font-semibold text-[#261D17] tabular-nums">
            {activeVariant ? formatINR(activeVariant.price * quantity) : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          className={`w-11 h-11 rounded-lg border inline-flex items-center justify-center shrink-0 cursor-pointer ${
            saved
              ? 'border-[#B84E32] bg-[#FAF3EE] text-[#B84E32]'
              : 'border-[#D8CBB5] bg-white text-[#261D17]'
          }`}
        >
          <Heart className={`w-4 h-4 ${saved ? 'fill-[#B84E32]' : ''}`} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={handleShare}
          aria-label={`Share ${product.name}`}
          className={`w-11 h-11 rounded-lg border inline-flex items-center justify-center shrink-0 cursor-pointer ${
            copiedLink
              ? 'border-[#1E3D2F] bg-[#EEF4F0] text-[#1E3D2F]'
              : 'border-[#D8CBB5] bg-white text-[#261D17]'
          }`}
        >
          {copiedLink ? (
            <Check className="w-4 h-4 text-[#1E3D2F]" aria-hidden="true" />
          ) : (
            <Share2 className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!activeVariant || activeVariant.stock <= 0}
          className="px-5 py-2.5 min-h-[42px] rounded-lg bg-[#B84E32] text-white text-sm font-medium hover:bg-[#9E3F26] disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
