import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  Plus,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SafeImage } from '../components/SafeImage';
import { useStore } from '../context/StoreContext';
import { DeliveryAddress } from '../types';
import {
  calculateDiscount,
  calculateTotal,
  formatINR,
} from '../utils/cartUtils';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Delhi NCR',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export function Checkout() {
  const {
    cart,
    cartSubtotal,
    cartShipping,
    currentUser,
    checkoutDraft,
    setCheckoutDraft,
    addAddress,
    updateAddress,
    setDefaultAddress,
    showToast,
  } = useStore();
  const navigate = useNavigate();

  const addresses = currentUser?.addresses || [];
  const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];

  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    checkoutDraft?.addressId || defaultAddr?.id || (addresses.length > 0 ? addresses[0].id : 'new')
  );
  const [showAddressForm, setShowAddressForm] = useState(addresses.length === 0);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [saveToBook, setSaveToBook] = useState(true);

  const [fullName, setFullName] = useState(
    checkoutDraft?.customer.fullName || defaultAddr?.fullName || currentUser?.fullName || ''
  );
  const [email, setEmail] = useState(
    checkoutDraft?.customer.email || currentUser?.email || ''
  );
  const [phone, setPhone] = useState(
    checkoutDraft?.customer.phone || defaultAddr?.phone || currentUser?.phone || ''
  );
  const [houseBuilding, setHouseBuilding] = useState(defaultAddr?.houseBuilding || '');
  const [street, setStreet] = useState(defaultAddr?.street || '');
  const [area, setArea] = useState(defaultAddr?.area || '');
  const [city, setCity] = useState(checkoutDraft?.customer.city || defaultAddr?.city || '');
  const [state, setState] = useState(checkoutDraft?.customer.state || defaultAddr?.state || 'Rajasthan');
  const [pinCode, setPinCode] = useState(checkoutDraft?.customer.pinCode || defaultAddr?.pinCode || '');
  const [notes, setNotes] = useState(checkoutDraft?.customer.notes || '');

  const [promoInput, setPromoInput] = useState(checkoutDraft?.promoCode || '');
  const [appliedPromo, setAppliedPromo] = useState(checkoutDraft?.promoCode || '');
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedAddressId !== 'new' && addresses.length > 0) {
      const picked = addresses.find((a) => a.id === selectedAddressId);
      if (picked) {
        setFullName(picked.fullName);
        setPhone(picked.phone);
        setHouseBuilding(picked.houseBuilding);
        setStreet(picked.street);
        setArea(picked.area);
        setCity(picked.city);
        setState(picked.state);
        setPinCode(picked.pinCode);
      }
    }
  }, [selectedAddressId, addresses]);

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-semibold text-[#261D17]">
          Your cart is empty
        </h1>
        <p className="mt-2 text-sm text-[#5A4C43]">
          Add at least one cooling product or bundle before proceeding to checkout.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#B84E32] text-white text-sm font-medium hover:bg-[#9E3F26]"
        >
          Browse Catalog
        </Link>
      </div>
    );
  }

  const discount = calculateDiscount(cartSubtotal, appliedPromo);
  const finalTotal = calculateTotal(cart, discount);

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) {
      setAppliedPromo('');
      setPromoMessage(null);
      return;
    }
    const calc = calculateDiscount(cartSubtotal, code);
    if (calc > 0) {
      setAppliedPromo(code);
      setPromoMessage(`Demo code ${code} applied (-${formatINR(calc)})`);
      showToast(`Promo ${code} applied`);
    } else if (code === 'ROOTS100' && cartSubtotal < 1000) {
      setAppliedPromo('');
      setPromoMessage('ROOTS100 requires a subtotal of ₹1,000 or more.');
    } else {
      setAppliedPromo('');
      setPromoMessage('Unrecognized demo code. Try COOL10 (10% off) or ROOTS100 (₹100 off ₹1,000+).');
    }
  };

  const handleSaveInlineAddress = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !fullName.trim() ||
      !phone.trim() ||
      !houseBuilding.trim() ||
      !street.trim() ||
      !city.trim()
    ) {
      setError('Please complete all required address fields.');
      return;
    }
    if (!/^\d{6}$/.test(pinCode.trim())) {
      setError('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    if (editingAddressId) {
      const existing = addresses.find((a) => a.id === editingAddressId);
      const updated: DeliveryAddress = {
        id: editingAddressId,
        fullName: fullName.trim(),
        phone: phone.trim(),
        houseBuilding: houseBuilding.trim(),
        street: street.trim(),
        area: area.trim(),
        city: city.trim(),
        state,
        pinCode: pinCode.trim(),
        isDefault: existing?.isDefault ?? false,
      };
      updateAddress(updated);
      setSelectedAddressId(updated.id);
      setEditingAddressId(null);
      setShowAddressForm(false);
    } else if (saveToBook && currentUser) {
      const created = addAddress({
        fullName: fullName.trim(),
        phone: phone.trim(),
        houseBuilding: houseBuilding.trim(),
        street: street.trim(),
        area: area.trim(),
        city: city.trim(),
        state,
        pinCode: pinCode.trim(),
        isDefault: addresses.length === 0,
      });
      setSelectedAddressId(created.id);
      setShowAddressForm(false);
    } else {
      setSelectedAddressId('new');
      setShowAddressForm(false);
    }
  };

  const openEditAddress = (addr: DeliveryAddress) => {
    setEditingAddressId(addr.id);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setHouseBuilding(addr.houseBuilding);
    setStreet(addr.street);
    setArea(addr.area);
    setCity(addr.city);
    setState(addr.state);
    setPinCode(addr.pinCode);
    setShowAddressForm(true);
  };

  const handleContinueToPayment = () => {
    setError(null);

    const activeAddr = addresses.find((a) => a.id === selectedAddressId);
    const activeFullName = activeAddr ? activeAddr.fullName : fullName.trim();
    const activePhone = activeAddr ? activeAddr.phone : phone.trim();
    const activeAddressLine = activeAddr
      ? [activeAddr.houseBuilding, activeAddr.street, activeAddr.area].filter(Boolean).join(', ')
      : [houseBuilding.trim(), street.trim(), area.trim()].filter(Boolean).join(', ');
    const activeCity = activeAddr ? activeAddr.city : city.trim();
    const activeState = activeAddr ? activeAddr.state : state;
    const activePin = activeAddr ? activeAddr.pinCode : pinCode.trim();
    const activeEmail = email.trim() || currentUser?.email || '';

    if (!activeFullName || !activeEmail || !activePhone || !activeAddressLine || !activeCity) {
      setError('Please select a saved delivery address or complete the address form before continuing.');
      setShowAddressForm(true);
      return;
    }

    if (!/^\d{6}$/.test(activePin)) {
      setError('Please provide a valid 6-digit Indian PIN code.');
      setShowAddressForm(true);
      return;
    }

    setCheckoutDraft({
      addressId: activeAddr?.id,
      customer: {
        fullName: activeFullName,
        email: activeEmail,
        phone: activePhone,
        address: activeAddressLine,
        city: activeCity,
        state: activeState,
        pinCode: activePin,
        notes: notes.trim() || undefined,
      },
      promoCode: appliedPromo || undefined,
      discount,
    });

    navigate('/checkout/payment');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
      <div className="mb-8">
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#65574D] hover:text-[#B84E32] mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Return to Cart</span>
        </Link>
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#B84E32]">
          Demo Checkout · Step 1 & 2 of 4
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#261D17] mt-1">
          Delivery Address & Order Review
        </h1>

        {/* Step Indicator */}
        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
          <span className="font-semibold text-[#1E3D2F]">1. Delivery Address</span>
          <span aria-hidden="true" className="text-[#B8AA96]">·</span>
          <span className="font-semibold text-[#1E3D2F]">2. Order Review</span>
          <span aria-hidden="true" className="text-[#B8AA96]">·</span>
          <span className="text-[#65574D]">3. Payment (Demo)</span>
          <span aria-hidden="true" className="text-[#B8AA96]">·</span>
          <span className="text-[#65574D]">4. Confirmation</span>
        </div>
      </div>

      <div className="mb-8 p-4 rounded-xl bg-[#F2ECE1] border border-[#D8CBB5] flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#1E3D2F] shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-sm text-[#261D17]">
          <p className="font-semibold">Demo checkout — no real payment is being processed.</p>
          <p className="text-xs text-[#5A4C43] mt-0.5">
            Addresses and demo orders are saved locally in your browser for your signed-in CoolRoots
            demo account.
          </p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 p-3.5 rounded-lg bg-[#FDF2F0] border border-[#E7B5A8] text-xs text-[#8D311B] flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Step 1: Delivery Address */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-white rounded-xl border border-[#E2D9C9] p-6 sm:p-7 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#65574D]">
                  Step 1
                </p>
                <h2 className="font-display text-xl font-semibold text-[#261D17]">
                  Select Delivery Address
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingAddressId(null);
                  setHouseBuilding('');
                  setStreet('');
                  setArea('');
                  setCity('');
                  setPinCode('');
                  setShowAddressForm((prev) => !prev);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#D8CBB5] text-xs font-medium text-[#261D17] hover:bg-[#F2ECE1] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{showAddressForm ? 'Cancel Form' : 'Add New Address'}</span>
              </button>
            </div>

            {addresses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {addresses.map((addr) => {
                  const selected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      className={`p-4 rounded-xl border transition-colors ${
                        selected
                          ? 'border-[#B84E32] bg-[#FAF3EE]'
                          : 'border-[#E2D9C9] bg-[#FAF8F4]'
                      }`}
                    >
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="deliveryAddress"
                          checked={selected}
                          onChange={() => {
                            setSelectedAddressId(addr.id);
                            setShowAddressForm(false);
                          }}
                          className="mt-1 accent-[#B84E32]"
                        />
                        <div className="text-xs space-y-1 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-sm text-[#261D17]">
                              {addr.fullName}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[11px] font-medium text-[#1E3D2F]">
                                · Default
                              </span>
                            )}
                          </div>
                          <p className="text-[#5A4C43] leading-relaxed">
                            {[addr.houseBuilding, addr.street, addr.area].filter(Boolean).join(', ')}
                          </p>
                          <p className="text-[#5A4C43]">
                            {addr.city}, {addr.state} – {addr.pinCode}
                          </p>
                          <p className="text-[#65574D]">{addr.phone}</p>
                        </div>
                      </label>

                      <div className="mt-3 pt-2.5 border-t border-[#E2D9C9] flex items-center gap-3 text-[11px]">
                        <button
                          type="button"
                          onClick={() => openEditAddress(addr)}
                          className="font-medium text-[#261D17] hover:text-[#B84E32] cursor-pointer"
                        >
                          Edit
                        </button>
                        {!addr.isDefault && (
                          <button
                            type="button"
                            onClick={() => setDefaultAddress(addr.id)}
                            className="font-medium text-[#1E3D2F] hover:underline cursor-pointer"
                          >
                            Set as Default
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {showAddressForm && (
              <form
                onSubmit={handleSaveInlineAddress}
                className="p-5 rounded-xl bg-[#FAF8F4] border border-[#D8CBB5] space-y-4"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-[#261D17]">
                  <MapPin className="w-4 h-4 text-[#B84E32]" aria-hidden="true" />
                  <span>{editingAddressId ? 'Edit Saved Address' : 'New Delivery Address'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-[#261D17] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Priya Sharma"
                      className="w-full px-3 py-2 rounded-lg border border-[#D8CBB5] bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#261D17] mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98XXXXXXXX"
                      className="w-full px-3 py-2 rounded-lg border border-[#D8CBB5] bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#261D17] mb-1">
                      House / Building / Flat *
                    </label>
                    <input
                      type="text"
                      required
                      value={houseBuilding}
                      onChange={(e) => setHouseBuilding(e.target.value)}
                      placeholder="Flat 302, Neem Courtyard Apts"
                      className="w-full px-3 py-2 rounded-lg border border-[#D8CBB5] bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#261D17] mb-1">
                      Street / Road *
                    </label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Bapu Nagar Main Rd"
                      className="w-full px-3 py-2 rounded-lg border border-[#D8CBB5] bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#261D17] mb-1">
                      Area / Locality
                    </label>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="Near Central Park"
                      className="w-full px-3 py-2 rounded-lg border border-[#D8CBB5] bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#261D17] mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Jaipur"
                      className="w-full px-3 py-2 rounded-lg border border-[#D8CBB5] bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#261D17] mb-1">State *</label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#D8CBB5] bg-white text-sm"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#261D17] mb-1">
                      PIN Code (6 digits) *
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      placeholder="302001"
                      className="w-full px-3 py-2 rounded-lg border border-[#D8CBB5] bg-white text-sm tabular-nums"
                    />
                  </div>
                </div>

                {!editingAddressId && (
                  <label className="flex items-center gap-2 text-xs text-[#5A4C43] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveToBook}
                      onChange={(e) => setSaveToBook(e.target.checked)}
                      className="accent-[#1E3D2F]"
                    />
                    <span>Save this address to my CoolRoots Address Book</span>
                  </label>
                )}

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1E3D2F] text-white text-xs font-medium hover:bg-[#173025] cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{editingAddressId ? 'Update Address' : 'Use This Address'}</span>
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#EFE7DA]">
              <div>
                <label htmlFor="checkout-email" className="block text-xs font-medium text-[#261D17] mb-1">
                  Order Confirmation Email *
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-sm"
                />
              </div>
              <div>
                <label htmlFor="checkout-notes" className="block text-xs font-medium text-[#261D17] mb-1">
                  Window / Courtyard Delivery Note (Optional)
                </label>
                <input
                  id="checkout-notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., West-facing 4×3 ft window"
                  className="w-full px-3 py-2 rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-sm"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Step 2: Order Review & Promo */}
        <aside className="lg:col-span-5 bg-[#F2ECE1] rounded-xl border border-[#E2D9C9] p-6 space-y-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#65574D]">Step 2</p>
            <h2 className="font-display text-xl font-semibold text-[#261D17]">
              Order Review
            </h2>
          </div>

          <div className="divide-y divide-[#D8CBB5] max-h-80 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.cartItemId} className="py-3 flex items-start justify-between gap-3 text-sm">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-14 h-12 rounded-lg overflow-hidden bg-white border border-[#D8CBB5] shrink-0">
                    <SafeImage
                      src={item.image}
                      alt={item.name}
                      fallbackLabel={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-[#261D17] leading-snug">
                      {item.name} × {item.quantity}
                    </p>
                    {(item.variantName || item.materialOption) && (
                      <p className="text-xs text-[#65574D] mt-0.5">
                        {[item.variantName, item.materialOption].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    <p className="text-xs text-[#65574D] tabular-nums mt-0.5">
                      {formatINR(item.price)} each
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-[#261D17] tabular-nums shrink-0">
                  {formatINR(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Demo Promo Code */}
          <div className="pt-3 border-t border-[#D8CBB5] space-y-2">
            <label htmlFor="promo-code" className="flex items-center gap-1.5 text-xs font-medium text-[#261D17]">
              <Tag className="w-3.5 h-3.5 text-[#B84E32]" aria-hidden="true" />
              <span>Demo Promo Code (try COOL10 or ROOTS100)</span>
            </label>
            <div className="flex gap-2">
              <input
                id="promo-code"
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="COOL10"
                className="flex-1 px-3 py-2 rounded-lg border border-[#D8CBB5] bg-white text-xs uppercase"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                className="px-4 py-2 rounded-lg bg-[#1E3D2F] text-white text-xs font-medium hover:bg-[#173025] cursor-pointer"
              >
                Apply
              </button>
            </div>
            {promoMessage && (
              <p className="text-xs text-[#1E3D2F] font-medium">{promoMessage}</p>
            )}
          </div>

          <div className="pt-3 border-t border-[#D8CBB5] space-y-2 text-sm">
            <div className="flex justify-between text-[#5A4C43]">
              <span>Subtotal</span>
              <span className="tabular-nums text-[#261D17]">{formatINR(cartSubtotal)}</span>
            </div>
            <div className="flex justify-between text-[#5A4C43]">
              <span>Shipping Charge</span>
              <span className="tabular-nums text-[#261D17]">
                {cartShipping === 0 ? 'Free' : formatINR(cartShipping)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[#1E3D2F] font-medium">
                <span>Demo Discount ({appliedPromo})</span>
                <span className="tabular-nums">−{formatINR(discount)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-[#D8CBB5] flex justify-between text-base font-semibold text-[#261D17]">
              <span>Total Payable (Demo)</span>
              <span className="tabular-nums">{formatINR(finalTotal)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleContinueToPayment}
            className="w-full min-h-[46px] px-6 py-3 rounded-lg bg-[#B84E32] text-white text-sm font-semibold hover:bg-[#9E3F26] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue to Demo Payment</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </aside>
      </div>
    </div>
  );
}
