import { ArrowRight, ShoppingBag, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { FREE_SHIPPING_THRESHOLD, formatINR } from '../utils/cartUtils';
import { CartItemRow } from './CartItemRow';

export function CartDrawer() {
  const {
    cart,
    cartDrawerOpen,
    setCartDrawerOpen,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    cartShipping,
    cartTotal,
  } = useStore();

  if (!cartDrawerOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping cart drawer"
    >
      <div
        className="fixed inset-0 bg-[#261D17]/40 transition-opacity"
        onClick={() => setCartDrawerOpen(false)}
      />

      <aside className="relative w-full max-w-md bg-[#FAF8F4] h-full shadow-2xl border-l border-[#E2D9C9] flex flex-col z-10">
        <div className="px-6 py-4 border-b border-[#E2D9C9] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-4 h-4 text-[#B84E32]" aria-hidden="true" />
            <h2 className="font-display text-lg font-semibold text-[#261D17]">Your Cooling Cart</h2>
          </div>
          <button
            type="button"
            onClick={() => setCartDrawerOpen(false)}
            aria-label="Close cart drawer"
            className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-[#65574D] hover:bg-[#F2ECE1] hover:text-[#261D17] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <p className="font-display text-lg text-[#261D17]">Your cart is currently empty</p>
              <p className="text-sm text-[#65574D] mt-2 max-w-xs">
                Explore traditional terracotta towers, khus screens, bamboo blinds, or roof kits.
              </p>
              <Link
                to="/shop"
                onClick={() => setCartDrawerOpen(false)}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#B84E32] text-white text-sm font-medium hover:bg-[#9E3F26] transition-colors"
              >
                Browse Products
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#E2D9C9]">
              {cart.map((item) => (
                <CartItemRow
                  key={item.cartItemId}
                  item={item}
                  onUpdateQuantity={updateCartQuantity}
                  onRemove={removeFromCart}
                  compact
                />
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 bg-[#F2ECE1] border-t border-[#E2D9C9] space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[#65574D]">
                <span>Subtotal</span>
                <span className="tabular-nums font-medium text-[#261D17]">
                  {formatINR(cartSubtotal)}
                </span>
              </div>
              <div className="flex justify-between text-[#65574D]">
                <span>Estimated Shipping</span>
                <span className="tabular-nums font-medium text-[#261D17]">
                  {cartShipping === 0 ? 'Free' : formatINR(cartShipping)}
                </span>
              </div>
              {cartSubtotal < FREE_SHIPPING_THRESHOLD && (
                <p className="text-xs text-[#1E3D2F]">
                  Add {formatINR(FREE_SHIPPING_THRESHOLD - cartSubtotal)} more for free prototype shipping.
                </p>
              )}
              <div className="pt-2 border-t border-[#D8CBB5] flex justify-between text-base font-semibold text-[#261D17]">
                <span>Total (Demo INR)</span>
                <span className="tabular-nums">{formatINR(cartTotal)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/cart"
                onClick={() => setCartDrawerOpen(false)}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-[#D8CBB5] bg-white text-sm font-medium text-[#261D17] hover:bg-[#FAF8F4] transition-colors whitespace-nowrap"
              >
                View Cart
              </Link>
              <Link
                to="/checkout"
                onClick={() => setCartDrawerOpen(false)}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-[#B84E32] text-sm font-medium text-white hover:bg-[#9E3F26] transition-colors whitespace-nowrap"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
