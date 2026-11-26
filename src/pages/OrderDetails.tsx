import { ArrowLeft, CheckCircle2, Truck, XCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { SafeImage } from '../components/SafeImage';
import { useStore } from '../context/StoreContext';
import { OrderStatus } from '../types';
import { formatINR } from '../utils/cartUtils';

const TIMELINE_STEPS: OrderStatus[] = [
  'Order Placed',
  'Confirmed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

export function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const { orders } = useStore();

  const order = orders.find((o) => o.orderId === id);

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-display text-3xl font-semibold text-[#261D17]">
          Demo order not found
        </h1>
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#B84E32] text-white text-sm font-medium hover:bg-[#9E3F26]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Orders</span>
        </Link>
      </div>
    );
  }

  const isCancelled = order.status === 'Cancelled';
  const currentStepIndex = TIMELINE_STEPS.indexOf(order.status);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#65574D] hover:text-[#B84E32] mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Back to My Orders</span>
        </Link>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#B84E32]">
              Demo Order Details · Local Prototype Record
            </p>
            <h1 className="font-display text-3xl font-semibold text-[#261D17] mt-1 font-mono">
              {order.orderId}
            </h1>
          </div>
          <p className="text-xs text-[#65574D]">
            Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Order Timeline */}
      <section className="bg-white rounded-2xl border border-[#E2D9C9] p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-xl font-semibold text-[#261D17]">Order Timeline</h2>
          <span className="text-xs font-semibold text-[#1E3D2F]">{order.status}</span>
        </div>

        {isCancelled ? (
          <div className="p-4 rounded-xl bg-[#FDF2F0] border border-[#E7B5A8] flex items-center gap-3 text-sm text-[#8D311B]">
            <XCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>This demo order has been marked as Cancelled.</span>
          </div>
        ) : (
          <ol className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            {TIMELINE_STEPS.map((step, idx) => {
              const reached = currentStepIndex >= idx;
              return (
                <li
                  key={step}
                  className={`p-3 rounded-xl border text-xs ${
                    reached
                      ? 'bg-[#EEF4F0] border-[#1E3D2F] text-[#1E3D2F]'
                      : 'bg-[#FAF8F4] border-[#E2D9C9] text-[#65574D]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 shrink-0 ${
                        reached ? 'text-[#1E3D2F]' : 'text-[#CBBCA5]'
                      }`}
                      aria-hidden="true"
                    />
                    <span>{step}</span>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {order.shippingDetails && (
          <div className="pt-3 border-t border-[#EFE7DA] flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#5A4C43]">
            <span className="inline-flex items-center gap-1.5 font-medium text-[#261D17]">
              <Truck className="w-4 h-4 text-[#1E3D2F]" aria-hidden="true" />
              {order.shippingDetails.carrier}
            </span>
            <span>Tracking (Demo): {order.shippingDetails.trackingId}</span>
            <span>Est. Delivery (Illustrative): {order.shippingDetails.estimatedDelivery}</span>
          </div>
        )}
      </section>

      {/* Items & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#E2D9C9] p-6 space-y-4">
          <h2 className="font-display text-xl font-semibold text-[#261D17]">Ordered Items</h2>
          <div className="divide-y divide-[#EFE7DA]">
            {order.items.map((item) => (
              <div key={item.cartItemId} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-16 h-14 rounded-lg overflow-hidden bg-[#F2ECE1] border border-[#E2D9C9] shrink-0">
                    <SafeImage
                      src={item.image}
                      alt={item.name}
                      fallbackLabel={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#261D17] truncate">{item.name}</p>
                    <p className="text-xs text-[#65574D]">
                      {[item.variantName, item.materialOption, `Qty ${item.quantity}`]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-[#261D17] tabular-nums shrink-0">
                  {formatINR(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <aside className="lg:col-span-5 space-y-5">
          <div className="bg-[#F2ECE1] rounded-xl border border-[#E2D9C9] p-6 space-y-3 text-sm">
            <h2 className="font-display text-lg font-semibold text-[#261D17]">Payment Summary</h2>
            <div className="flex justify-between text-[#5A4C43]">
              <span>Payment Method</span>
              <span className="font-medium text-[#261D17]">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-[#5A4C43]">
              <span>Subtotal</span>
              <span className="tabular-nums text-[#261D17]">{formatINR(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#5A4C43]">
              <span>Shipping</span>
              <span className="tabular-nums text-[#261D17]">
                {order.shipping === 0 ? 'Free' : formatINR(order.shipping)}
              </span>
            </div>
            {order.discount && order.discount > 0 ? (
              <div className="flex justify-between text-[#1E3D2F]">
                <span>Demo Discount ({order.promoCode})</span>
                <span className="tabular-nums">-{formatINR(order.discount)}</span>
              </div>
            ) : null}
            <div className="pt-2 border-t border-[#D8CBB5] flex justify-between text-base font-semibold text-[#261D17]">
              <span>Total (Demo)</span>
              <span className="tabular-nums">{formatINR(order.total)}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E2D9C9] p-6 space-y-2 text-sm">
            <h2 className="font-display text-lg font-semibold text-[#261D17]">Delivery Address</h2>
            <p className="font-medium text-[#261D17]">{order.customer.fullName}</p>
            <p className="text-[#5A4C43]">{order.customer.address}</p>
            <p className="text-[#5A4C43]">
              {order.customer.city}, {order.customer.state} – {order.customer.pinCode}
            </p>
            <p className="text-xs text-[#65574D] pt-1">
              {order.customer.phone} · {order.customer.email}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
