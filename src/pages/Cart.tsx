import { ArrowRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CartItemRow } from '../components/CartItemRow';
import { useStore } from '../context/StoreContext';
import { FREE_SHIPPING_THRESHOLD, formatINR } from '../utils/cartUtils';

export function Cart() {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartShipping,
    cartTotal,
  } = useStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#65574D]">
            Saved Locally in Browser
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#261D17] mt-1">
            Shopping Cart
          </h1>
        </div>
        {cart.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="text-xs font-medium text-[#65574D] hover:text-[#B84E32] transition-colors cursor-pointer self-start sm:self-auto"
          >
            Empty Cart
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2D9C9] p-12 text-center max-w-2xl mx-auto">
          <ShoppingBag className="w-10 h-10 text-[#B84E32] mx-auto mb-3" aria-hidden="true" />
          <h2 className="font-display text-2xl font-semibold text-[#261D17]">
            Your CoolRoots cart is empty
          </h2>
          <p className="mt-2 text-sm text-[#5A4C43]">
            Add cooling products or bundles from the catalog, or use our Cooling Finder to match
            solutions to your room or terrace.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/shop"
              className="px-5 py-2.5 rounded-lg bg-[#B84E32] text-white text-sm font-medium hover:bg-[#9E3F26] transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              to="/finder"
              className="px-5 py-2.5 rounded-lg border border-[#D8CBB5] bg-white text-[#261D17] text-sm font-medium hover:bg-[#F2ECE1] transition-colors"
            >
              Find Your Cooling Solution
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-white rounded-xl border border-[#E2D9C9] px-6 divide-y divide-[#E2D9C9]">
            {cart.map((item) => (
              <CartItemRow
                key={item.cartItemId}
                item={item}
                onUpdateQuantity={updateCartQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </div>

          <aside className="lg:col-span-4 bg-[#F2ECE1] rounded-xl border border-[#E2D9C9] p-6 space-y-5">
            <h2 className="font-display text-xl font-semibold text-[#261D17]">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-[#5A4C43]">
                <span>Subtotal</span>
                <span className="tabular-nums font-medium text-[#261D17]">
                  {formatINR(cartSubtotal)}
                </span>
              </div>
              <div className="flex justify-between text-[#5A4C43]">
                <span>Shipping Estimate</span>
                <span className="tabular-nums font-medium text-[#261D17]">
                  {cartShipping === 0 ? 'Free' : formatINR(cartShipping)}
                </span>
              </div>
              {cartSubtotal < FREE_SHIPPING_THRESHOLD && (
                <p className="text-xs text-[#1E3D2F]">
                  Free prototype shipping on orders ₹{FREE_SHIPPING_THRESHOLD.toLocaleString('en-IN')}+.
                </p>
              )}
              <div className="pt-3 border-t border-[#D8CBB5] flex justify-between text-base font-semibold text-[#261D17]">
                <span>Total (Demo INR)</span>
                <span className="tabular-nums">{formatINR(cartTotal)}</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <Link
                to="/checkout"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#B84E32] text-white text-sm font-medium hover:bg-[#9E3F26] transition-colors"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                to="/shop"
                className="w-full inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-[#D8CBB5] bg-white text-[#261D17] text-sm font-medium hover:bg-[#FAF8F4] transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
