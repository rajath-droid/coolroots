import { ArrowRight, Package } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { OrderStatus } from '../types';
import { formatINR } from '../utils/cartUtils';

const FILTER_STATUSES: ('All' | OrderStatus)[] = [
  'All',
  'Order Placed',
  'Confirmed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

export function Orders() {
  const { orders, currentUser } = useStore();
  const [statusFilter, setStatusFilter] = useState<'All' | OrderStatus>('All');

  const userOrders = orders.filter(
    (o) =>
      !currentUser ||
      o.userId === currentUser.id ||
      o.customer.email.toLowerCase() === currentUser.email.toLowerCase()
  );

  const visibleOrders =
    statusFilter === 'All'
      ? userOrders
      : userOrders.filter((o) => o.status === statusFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#B84E32]">
            Demo Order History · Local Storage
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#261D17] mt-1">
            My Orders
          </h1>
          <p className="mt-1.5 text-sm text-[#5A4C43]">
            Track your simulated orders and view delivery progress updates.
          </p>
        </div>

        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#B84E32] hover:text-[#9E3F26]"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-1.5">
        {FILTER_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === status
                ? 'bg-[#1E3D2F] text-white'
                : 'bg-[#F2ECE1] text-[#261D17] hover:bg-[#E5DCCB]'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {visibleOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2D9C9] p-12 text-center max-w-2xl mx-auto space-y-3">
          <Package className="w-10 h-10 text-[#B84E32] mx-auto" aria-hidden="true" />
          <h2 className="font-display text-2xl font-semibold text-[#261D17]">
            No orders found
          </h2>
          <p className="text-sm text-[#5A4C43]">
            {statusFilter === 'All'
              ? 'You have not placed any demo orders yet.'
              : `No orders currently have the status "${statusFilter}".`}
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-[#B84E32] text-white text-sm font-medium hover:bg-[#9E3F26]"
          >
            Browse Cooling Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleOrders.map((order) => (
            <article
              key={order.orderId}
              className="bg-white rounded-xl border border-[#E2D9C9] p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="space-y-1.5">
                <p className="text-xs text-[#65574D] flex flex-wrap items-center gap-2">
                  <span className="font-mono font-semibold text-[#261D17]">{order.orderId}</span>
                  <span aria-hidden="true">·</span>
                  <span>{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                  <span aria-hidden="true">·</span>
                  <span>{order.paymentMethod}</span>
                </p>
                <p className="text-sm font-semibold text-[#261D17]">
                  {order.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}
                </p>
                <p className="text-xs text-[#5A4C43]">
                  Delivering to: {order.customer.fullName}, {order.customer.city},{' '}
                  {order.customer.state}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 md:justify-end shrink-0">
                <div className="text-left md:text-right">
                  <span className="block text-xs font-semibold text-[#1E3D2F]">
                    {order.status}
                  </span>
                  <span className="block text-base font-semibold text-[#261D17] tabular-nums">
                    {formatINR(order.total)}
                  </span>
                </div>
                <Link
                  to={`/orders/${encodeURIComponent(order.orderId)}`}
                  className="px-4 py-2 min-h-[40px] inline-flex items-center justify-center rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-xs font-medium text-[#261D17] hover:bg-[#F2ECE1] transition-colors whitespace-nowrap"
                >
                  View Details
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
