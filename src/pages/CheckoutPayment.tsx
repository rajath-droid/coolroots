import {
  ArrowLeft,
  Banknote,
  Building2,
  CheckCircle2,
  CreditCard,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { PaymentMethod } from '../types';
import { calculateTotal, formatINR } from '../utils/cartUtils';

const DEMO_BANKS = [
  'Bharat Heritage Demo Bank',
  'Deccan Green Demo Bank',
  'Indus Cooperative Demo Bank',
  'Kaveri Commercial Demo Bank',
];

export function CheckoutPayment() {
  const {
    cart,
    cartSubtotal,
    cartShipping,
    checkoutDraft,
    placeDemoOrder,
    showToast,
  } = useStore();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash on Delivery');
  const [upiApp, setUpiApp] = useState('Simulated QR Scan');
  const [selectedBank, setSelectedBank] = useState(DEMO_BANKS[0]);
  const [processing, setProcessing] = useState(false);

  if (cart.length === 0 || !checkoutDraft) {
    return <Navigate to="/checkout" replace />;
  }

  const discount = checkoutDraft.discount || 0;
  const total = calculateTotal(cart, discount);

  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    let paymentNote = 'Pay on delivery (Demo)';
    if (paymentMethod === 'UPI (Demo)') {
      paymentNote = `Simulated UPI via ${upiApp}`;
    } else if (paymentMethod === 'Card Payment (Demo)') {
      paymentNote = 'Simulated test card ending in 4242';
    } else if (paymentMethod === 'Net Banking (Demo)') {
      paymentNote = `Simulated Net Banking (${selectedBank})`;
    }

    try {
      const order = await placeDemoOrder({
        customer: checkoutDraft.customer,
        paymentMethod,
        paymentNote,
        discount,
        promoCode: checkoutDraft.promoCode,
      });
      if (order.syncedToSupabase) {
        showToast(`Order ${order.orderId} saved to Supabase!`);
      } else {
        showToast(
          `Order ${order.orderId} saved locally. Check Supabase table setup.`,
          'info'
        );
      }
      navigate(`/checkout/success?orderId=${encodeURIComponent(order.orderId)}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
      <div className="mb-8">
        <Link
          to="/checkout"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#65574D] hover:text-[#B84E32] mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Back to Address & Order Review</span>
        </Link>
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#B84E32]">
          Demo Checkout · Step 3 of 4
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#261D17] mt-1">
          Demo Payment Selection
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
          <span className="text-[#1E3D2F]">1. Delivery Address</span>
          <span aria-hidden="true" className="text-[#B8AA96]">·</span>
          <span className="text-[#1E3D2F]">2. Order Review</span>
          <span aria-hidden="true" className="text-[#B8AA96]">·</span>
          <span className="font-semibold text-[#B84E32]">3. Payment (Demo)</span>
          <span aria-hidden="true" className="text-[#B8AA96]">·</span>
          <span className="text-[#65574D]">4. Confirmation</span>
        </div>
      </div>

      {/* Prominent Demo Disclaimer */}
      <div
        role="note"
        className="mb-8 p-4 rounded-xl bg-[#FAF3EE] border border-[#E7C9BF] flex items-start gap-3"
      >
        <ShieldCheck className="w-5 h-5 text-[#B84E32] shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-sm text-[#261D17]">
          <p className="font-semibold">Demo checkout — no real payment is being processed.</p>
          <p className="text-xs text-[#5A4C43] mt-0.5">
            This simulation never asks for or stores real credit/debit card numbers, CVV codes,
            UPI PINs, or bank passwords. Choose any option below to place a local browser demo order.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <form
          onSubmit={handlePlaceOrder}
          className="lg:col-span-7 bg-white rounded-xl border border-[#E2D9C9] p-6 sm:p-8 space-y-5"
        >
          <h2 className="font-display text-xl font-semibold text-[#261D17]">
            Choose Simulated Payment Method
          </h2>

          <div className="space-y-3">
            {/* Option 1: Cash on Delivery */}
            <label
              className={`block p-4 rounded-xl border cursor-pointer transition-colors ${
                paymentMethod === 'Cash on Delivery'
                  ? 'border-[#B84E32] bg-[#FAF3EE]'
                  : 'border-[#E2D9C9] bg-[#FAF8F4]'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'Cash on Delivery'}
                  onChange={() => setPaymentMethod('Cash on Delivery')}
                  className="mt-1 accent-[#B84E32]"
                />
                <Banknote className="w-5 h-5 text-[#1E3D2F] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-[#261D17]">Cash on Delivery</p>
                  <p className="text-xs text-[#5A4C43] mt-0.5">
                    Pay via cash or doorstep UPI when your passive-cooling items arrive (illustrative).
                  </p>
                </div>
              </div>
            </label>

            {/* Option 2: UPI (Demo) */}
            <div
              className={`p-4 rounded-xl border transition-colors ${
                paymentMethod === 'UPI (Demo)'
                  ? 'border-[#B84E32] bg-[#FAF3EE]'
                  : 'border-[#E2D9C9] bg-[#FAF8F4]'
              }`}
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'UPI (Demo)'}
                  onChange={() => setPaymentMethod('UPI (Demo)')}
                  className="mt-1 accent-[#B84E32]"
                />
                <QrCode className="w-5 h-5 text-[#1E3D2F] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-[#261D17]">UPI (Demo)</p>
                  <p className="text-xs text-[#5A4C43] mt-0.5">
                    Simulated UPI confirmation with zero real PIN or bank connection.
                  </p>
                </div>
              </label>

              {paymentMethod === 'UPI (Demo)' && (
                <div className="mt-3 pl-8 space-y-2 text-xs">
                  <div className="p-3 rounded-lg bg-white border border-[#E2D9C9] flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-[#261D17]">Demo Merchant VPA</p>
                      <p className="font-mono text-[#65574D]">coolroots.studio@demoupi</p>
                    </div>
                    <select
                      aria-label="Select simulated UPI flow"
                      value={upiApp}
                      onChange={(e) => setUpiApp(e.target.value)}
                      className="px-2.5 py-1.5 rounded border border-[#D8CBB5] bg-[#FAF8F4] text-xs"
                    >
                      <option value="Simulated QR Scan">Simulated QR Scan</option>
                      <option value="Demo UPI App Intent">Demo UPI App Intent</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Option 3: Card Payment (Demo) */}
            <div
              className={`p-4 rounded-xl border transition-colors ${
                paymentMethod === 'Card Payment (Demo)'
                  ? 'border-[#B84E32] bg-[#FAF3EE]'
                  : 'border-[#E2D9C9] bg-[#FAF8F4]'
              }`}
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'Card Payment (Demo)'}
                  onChange={() => setPaymentMethod('Card Payment (Demo)')}
                  className="mt-1 accent-[#B84E32]"
                />
                <CreditCard className="w-5 h-5 text-[#1E3D2F] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-[#261D17]">Card Payment (Demo)</p>
                  <p className="text-xs text-[#5A4C43] mt-0.5">
                    Uses a clearly fake placeholder card token—do not enter real card numbers.
                  </p>
                </div>
              </label>

              {paymentMethod === 'Card Payment (Demo)' && (
                <div className="mt-3 pl-8 text-xs">
                  <div className="p-3.5 rounded-lg bg-white border border-[#E2D9C9] space-y-1.5">
                    <p className="font-medium text-[#261D17]">
                      Placeholder Test Card Selected (Read-Only)
                    </p>
                    <p className="font-mono text-sm text-[#261D17]">4242 •••• •••• 4242</p>
                    <p className="text-[#65574D]">
                      Cardholder: {checkoutDraft.customer.fullName} · Simulated Auth Only
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Option 4: Net Banking (Demo) */}
            <div
              className={`p-4 rounded-xl border transition-colors ${
                paymentMethod === 'Net Banking (Demo)'
                  ? 'border-[#B84E32] bg-[#FAF3EE]'
                  : 'border-[#E2D9C9] bg-[#FAF8F4]'
              }`}
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'Net Banking (Demo)'}
                  onChange={() => setPaymentMethod('Net Banking (Demo)')}
                  className="mt-1 accent-[#B84E32]"
                />
                <Building2 className="w-5 h-5 text-[#1E3D2F] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-[#261D17]">Net Banking (Demo)</p>
                  <p className="text-xs text-[#5A4C43] mt-0.5">
                    Simulated bank selection only—no credentials requested.
                  </p>
                </div>
              </label>

              {paymentMethod === 'Net Banking (Demo)' && (
                <div className="mt-3 pl-8 text-xs">
                  <label htmlFor="demo-bank" className="block font-medium text-[#261D17] mb-1">
                    Choose Demo Bank
                  </label>
                  <select
                    id="demo-bank"
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#D8CBB5] bg-white text-xs"
                  >
                    {DEMO_BANKS.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full min-h-[46px] px-6 py-3 rounded-lg bg-[#B84E32] text-white text-sm font-semibold hover:bg-[#9E3F26] disabled:opacity-60 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            <span>
              {processing
                ? 'Confirming Demo Order...'
                : `Confirm & Place Demo Order · ${formatINR(total)}`}
            </span>
          </button>
        </form>

        {/* Summary Card */}
        <aside className="lg:col-span-5 bg-[#F2ECE1] rounded-xl border border-[#E2D9C9] p-6 space-y-5">
          <h2 className="font-display text-xl font-semibold text-[#261D17]">
            Shipping & Amount Summary
          </h2>

          <div className="p-4 rounded-xl bg-white border border-[#E2D9C9] text-xs space-y-1">
            <p className="font-semibold text-[#261D17] uppercase tracking-wider text-[11px]">
              Delivering To
            </p>
            <p className="font-medium text-sm text-[#261D17] pt-0.5">
              {checkoutDraft.customer.fullName}
            </p>
            <p className="text-[#5A4C43]">{checkoutDraft.customer.address}</p>
            <p className="text-[#5A4C43]">
              {checkoutDraft.customer.city}, {checkoutDraft.customer.state} –{' '}
              {checkoutDraft.customer.pinCode}
            </p>
            <p className="text-[#65574D]">{checkoutDraft.customer.phone}</p>
          </div>

          <div className="space-y-2 text-sm border-t border-[#D8CBB5] pt-4">
            <div className="flex justify-between text-[#5A4C43]">
              <span>Items ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
              <span className="tabular-nums text-[#261D17]">{formatINR(cartSubtotal)}</span>
            </div>
            <div className="flex justify-between text-[#5A4C43]">
              <span>Shipping</span>
              <span className="tabular-nums text-[#261D17]">
                {cartShipping === 0 ? 'Free' : formatINR(cartShipping)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[#1E3D2F] font-medium">
                <span>Promo ({checkoutDraft.promoCode})</span>
                <span className="tabular-nums">−{formatINR(discount)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-[#D8CBB5] flex justify-between text-base font-semibold text-[#261D17]">
              <span>Demo Total</span>
              <span className="tabular-nums">{formatINR(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
