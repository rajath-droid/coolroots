import { AlertCircle, CheckCircle2, Package, ShoppingBag, Truck } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { SafeImage } from '../components/SafeImage';
import { useStore } from '../context/StoreContext';
import { formatINR } from '../utils/cartUtils';

export function OrderSuccess() {
  const { orders } = useStore();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  const order = orders.find((o) => o.orderId === orderId) || orders[0];

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-semibold text-[#261D17]">
          No recent demo order found
        </h1>
        <Link
          to="/shop"
          className="mt-6 inline-flex items-center px-5 py-2.5 rounded-lg bg-[#B84E32] text-white text-sm font-medium hover:bg-[#9E3F26]"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
      <div className="bg-white rounded-2xl border border-[#E2D9C9] p-6 sm:p-10 space-y-6">
        <div className="flex items-start gap-4">
          <CheckCircle2 className="w-9 h-9 text-[#1E3D2F] shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#1E3D2F]">
              Step 4 · Simulated Order Confirmation · No Real Payment Taken
            </p>
            <h1 className="font-display text-3xl font-semibold text-[#261D17] mt-1">
              Order {order.orderId} Confirmed
            </h1>
            <p className="mt-2 text-sm text-[#5A4C43]">
              Thank you, {order.customer.fullName}.{' '}
              {order.syncedToSupabase
                ? 'Your order has been saved to the Supabase database and your account order history.'
                : 'Your order is saved in your account history.'}
            </p>
          </div>
        </div>

        {order.syncedToSupabase === false && order.supabaseError && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-[#FDF2F0] border border-[#E7B5A8] flex items-start gap-3 text-xs text-[#8D311B]"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold">Supabase Database Sync Notice</p>
              <p className="mt-0.5">
                {order.supabaseError} — Run the SQL script in <code>supabase/schema.sql</code>{' '}
                inside your Supabase SQL Editor so orders appear in your Supabase tables.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#FAF8F4] border border-[#E2D9C9] text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#65574D]">
              Delivery Address
            </p>
            <p className="mt-1 text-[#261D17] font-medium">{order.customer.fullName}</p>
            <p className="text-[#5A4C43]">{order.customer.address}</p>
            <p className="text-[#5A4C43]">
              {order.customer.city}, {order.customer.state} – {order.customer.pinCode}
            </p>
            <p className="text-[#5A4C43] mt-1">{order.customer.phone}</p>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#65574D]">
              Payment & Delivery Estimate
            </p>
            <p className="text-[#1E3D2F] font-semibold">
              {order.status} · {order.paymentMethod}
            </p>
            {order.paymentNote && <p className="text-xs text-[#65574D]">{order.paymentNote}</p>}
            {order.shippingDetails?.estimatedDelivery && (
              <p className="text-xs text-[#261D17] inline-flex items-center gap-1.5 pt-1">
                <Truck className="w-3.5 h-3.5 text-[#B84E32]" aria-hidden="true" />
                <span>Estimated Delivery (Demo): {order.shippingDetails.estimatedDelivery}</span>
              </p>
            )}
            <p className="text-[#261D17] font-semibold tabular-nums pt-1">
              Total (Demo): {formatINR(order.total)}
            </p>
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-[#261D17] mb-3">
            Items in This Demo Order
          </h2>
          <div className="divide-y divide-[#E2D9C9] border border-[#E2D9C9] rounded-xl">
            {order.items.map((item) => (
              <div key={item.cartItemId} className="p-4 flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-10 rounded-lg overflow-hidden bg-[#F2ECE1] border border-[#E2D9C9] shrink-0">
                    <SafeImage
                      src={item.image}
                      alt={item.name}
                      fallbackLabel={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-[#261D17]">
                      {item.name} × {item.quantity}
                    </p>
                    {(item.variantName || item.materialOption) && (
                      <p className="text-xs text-[#65574D]">
                        {[item.variantName, item.materialOption].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
                <span className="font-semibold text-[#261D17] tabular-nums shrink-0">
                  {formatINR(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-[#EFE7DA] flex flex-wrap gap-3">
          <Link
            to={`/orders/${encodeURIComponent(order.orderId)}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1E3D2F] text-white text-sm font-medium hover:bg-[#173025] transition-colors"
          >
            <Package className="w-4 h-4" aria-hidden="true" />
            <span>View Order Details</span>
          </Link>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#B84E32] text-white text-sm font-medium hover:bg-[#9E3F26] transition-colors"
          >
            <ShoppingBag className="w-4 h-4" aria-hidden="true" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
