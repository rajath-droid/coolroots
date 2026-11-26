import {
  Check,
  Edit3,
  Info,
  LogOut,
  MapPin,
  Package,
  Plus,
  Settings,
  Trash2,
  User,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { DeliveryAddress, DemoUser } from '../types';
import { formatINR } from '../utils/cartUtils';

type ProfileTab = 'overview' | 'addresses' | 'orders' | 'settings';

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

const EMPTY_ADDRESS_FORM = {
  fullName: '',
  phone: '',
  houseBuilding: '',
  street: '',
  area: '',
  city: '',
  state: 'Rajasthan',
  pinCode: '',
  isDefault: false,
};

export function Profile() {
  const {
    currentUser,
    orders,
    updateProfile,
    changeDemoPassword,
    updatePreferences,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    signOutDemo,
  } = useStore();

  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');

  // Edit profile state
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState(currentUser?.fullName || '');
  const [editEmail, setEditEmail] = useState(currentUser?.email || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [profileError, setProfileError] = useState<string | null>(null);

  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrForm, setAddrForm] = useState(EMPTY_ADDRESS_FORM);
  const [addrError, setAddrError] = useState<string | null>(null);

  // Password change state
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState<string | null>(null);

  if (!currentUser) return null;

  const myOrders = orders.filter(
    (o) =>
      o.userId === currentUser.id ||
      o.customer.email.toLowerCase() === currentUser.email.toLowerCase()
  );

  const initials = currentUser.fullName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const startEditingProfile = () => {
    setEditName(currentUser.fullName);
    setEditEmail(currentUser.email);
    setEditPhone(currentUser.phone || '');
    setProfileError(null);
    setEditingProfile(true);
  };

  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    if (!editName.trim() || !editEmail.trim()) {
      setProfileError('Full name and email are required.');
      return;
    }
    const res = updateProfile({ fullName: editName, email: editEmail, phone: editPhone });
    if (!res.ok) {
      setProfileError(res.error || 'Could not update profile.');
      return;
    }
    setEditingProfile(false);
  };

  const openNewAddress = () => {
    setEditingAddressId(null);
    setAddrForm({
      ...EMPTY_ADDRESS_FORM,
      fullName: currentUser.fullName,
      phone: currentUser.phone || '',
      isDefault: currentUser.addresses.length === 0,
    });
    setAddrError(null);
    setShowAddressForm(true);
  };

  const openEditAddress = (addr: DeliveryAddress) => {
    setEditingAddressId(addr.id);
    setAddrForm({
      fullName: addr.fullName,
      phone: addr.phone,
      houseBuilding: addr.houseBuilding,
      street: addr.street,
      area: addr.area,
      city: addr.city,
      state: addr.state,
      pinCode: addr.pinCode,
      isDefault: addr.isDefault,
    });
    setAddrError(null);
    setShowAddressForm(true);
  };

  const handleSaveAddress = (e: FormEvent) => {
    e.preventDefault();
    setAddrError(null);
    if (
      !addrForm.fullName.trim() ||
      !addrForm.phone.trim() ||
      !addrForm.houseBuilding.trim() ||
      !addrForm.street.trim() ||
      !addrForm.area.trim() ||
      !addrForm.city.trim()
    ) {
      setAddrError('Please complete all required address fields.');
      return;
    }
    if (!/^\d{6}$/.test(addrForm.pinCode.trim())) {
      setAddrError('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    if (editingAddressId) {
      updateAddress({ id: editingAddressId, ...addrForm });
    } else {
      addAddress(addrForm);
    }
    setShowAddressForm(false);
    setEditingAddressId(null);
  };

  const handleChangePassword = (e: FormEvent) => {
    e.preventDefault();
    setPassMsg(null);
    if (newPass.length < 6) {
      setPassMsg('New password must be at least 6 characters.');
      return;
    }
    const res = changeDemoPassword(currPass, newPass);
    if (!res.ok) {
      setPassMsg(res.error || 'Failed to update password.');
      return;
    }
    setCurrPass('');
    setNewPass('');
    setPassMsg('Demo password updated successfully.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#E2D9C9] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#1E3D2F] text-white font-display text-2xl font-semibold flex items-center justify-center shrink-0">
            {initials || 'CR'}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#B84E32]">
              Customer Profile · Local Demo Account
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#261D17]">
              {currentUser.fullName}
            </h1>
            <p className="text-xs text-[#65574D] mt-0.5">
              {currentUser.email}
              {currentUser.phone ? ` · ${currentUser.phone}` : ''} · Member since{' '}
              {new Date(currentUser.createdAt).toLocaleDateString('en-IN')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={signOutDemo}
          className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-xs font-medium text-[#261D17] hover:bg-[#F2ECE1] self-start sm:self-auto cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-[#B84E32]" aria-hidden="true" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="p-3.5 rounded-xl bg-[#F2ECE1] border border-[#D8CBB5] flex items-start gap-2.5 text-xs text-[#4A3D34]">
        <Info className="w-4 h-4 text-[#1E3D2F] shrink-0 mt-0.5" aria-hidden="true" />
        <p>
          <strong>Local Prototype Persistence:</strong> Profile edits, saved delivery addresses,
          and demo orders are stored in your browser’s localStorage only. Clearing browser storage
          will reset this local data.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#E2D9C9] pb-3">
        {[
          { id: 'overview', label: 'Profile Overview', icon: User },
          { id: 'addresses', label: `Address Book (${currentUser.addresses.length})`, icon: MapPin },
          { id: 'orders', label: `My Orders (${myOrders.length})`, icon: Package },
          { id: 'settings', label: 'Account Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as ProfileTab)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#1E3D2F] text-white'
                  : 'bg-[#F2ECE1] text-[#261D17] hover:bg-[#E5DCCB]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview & Edit Profile */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <section className="lg:col-span-7 bg-white rounded-xl border border-[#E2D9C9] p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-[#261D17]">
                Personal Information
              </h2>
              {!editingProfile && (
                <button
                  type="button"
                  onClick={startEditingProfile}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D8CBB5] text-xs font-medium text-[#261D17] hover:bg-[#F2ECE1] cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            {editingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                {profileError && (
                  <p className="text-xs text-[#8D311B] bg-[#FDF2F0] p-3 rounded-lg border border-[#E7B5A8]">
                    {profileError}
                  </p>
                )}
                <div>
                  <label className="block text-xs font-medium text-[#261D17] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#261D17] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#261D17] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-sm"
                  />
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#B84E32] text-white text-xs font-medium hover:bg-[#9E3F26] cursor-pointer"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProfile(false)}
                    className="px-4 py-2 rounded-lg border border-[#D8CBB5] text-xs font-medium text-[#261D17] hover:bg-[#F2ECE1] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <dl className="divide-y divide-[#EFE7DA] text-sm">
                <div className="py-3 grid grid-cols-3 gap-2">
                  <dt className="text-xs font-semibold text-[#65574D]">Full Name</dt>
                  <dd className="col-span-2 text-[#261D17] font-medium">{currentUser.fullName}</dd>
                </div>
                <div className="py-3 grid grid-cols-3 gap-2">
                  <dt className="text-xs font-semibold text-[#65574D]">Email</dt>
                  <dd className="col-span-2 text-[#261D17]">{currentUser.email}</dd>
                </div>
                <div className="py-3 grid grid-cols-3 gap-2">
                  <dt className="text-xs font-semibold text-[#65574D]">Phone</dt>
                  <dd className="col-span-2 text-[#261D17]">{currentUser.phone || 'Not added'}</dd>
                </div>
                <div className="py-3 grid grid-cols-3 gap-2">
                  <dt className="text-xs font-semibold text-[#65574D]">Default Address</dt>
                  <dd className="col-span-2 text-[#261D17]">
                    {currentUser.addresses.find((a) => a.isDefault)
                      ? `${currentUser.addresses.find((a) => a.isDefault)!.houseBuilding}, ${
                          currentUser.addresses.find((a) => a.isDefault)!.city
                        }`
                      : 'No delivery address saved yet'}
                  </dd>
                </div>
              </dl>
            )}
          </section>

          <aside className="lg:col-span-5 bg-[#F2ECE1] rounded-xl border border-[#E2D9C9] p-6 space-y-4">
            <h2 className="font-display text-xl font-semibold text-[#261D17]">
              Quick Account Summary
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-[#E2D9C9]">
                <p className="text-xs text-[#65574D]">Saved Addresses</p>
                <p className="text-2xl font-semibold text-[#261D17] tabular-nums mt-1">
                  {currentUser.addresses.length}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#E2D9C9]">
                <p className="text-xs text-[#65574D]">Demo Orders</p>
                <p className="text-2xl font-semibold text-[#261D17] tabular-nums mt-1">
                  {myOrders.length}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('addresses')}
                className="px-4 py-2 rounded-lg bg-white border border-[#D8CBB5] text-xs font-medium text-[#261D17] hover:bg-[#FAF8F4] cursor-pointer"
              >
                Manage Addresses
              </button>
              <Link
                to="/orders"
                className="px-4 py-2 rounded-lg bg-[#1E3D2F] text-white text-xs font-medium hover:bg-[#173025]"
              >
                View Order History
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Tab 2: Address Book */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold text-[#261D17]">
              Saved Delivery Addresses
            </h2>
            <button
              type="button"
              onClick={openNewAddress}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#B84E32] text-white text-xs font-medium hover:bg-[#9E3F26] cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Add Delivery Address</span>
            </button>
          </div>

          {showAddressForm && (
            <form
              onSubmit={handleSaveAddress}
              className="bg-white rounded-xl border border-[#E2D9C9] p-6 space-y-4"
            >
              <h3 className="font-display text-lg font-semibold text-[#261D17]">
                {editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
              </h3>

              {addrError && (
                <p className="text-xs text-[#8D311B] bg-[#FDF2F0] p-3 rounded-lg border border-[#E7B5A8]">
                  {addrError}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#261D17] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addrForm.fullName}
                    onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#261D17] mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={addrForm.phone}
                    onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#261D17] mb-1">
                    House / Building *
                  </label>
                  <input
                    type="text"
                    required
                    value={addrForm.houseBuilding}
                    onChange={(e) => setAddrForm({ ...addrForm, houseBuilding: e.target.value })}
                    placeholder="Flat 4B, Terracotta Residency"
                    className="w-full px-3 py-2 rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#261D17] mb-1">Street *</label>
                  <input
                    type="text"
                    required
                    value={addrForm.street}
                    onChange={(e) => setAddrForm({ ...addrForm, street: e.target.value })}
                    placeholder="Bapu Nagar Main Road"
                    className="w-full px-3 py-2 rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#261D17] mb-1">
                    Area / Locality *
                  </label>
                  <input
                    type="text"
                    required
                    value={addrForm.area}
                    onChange={(e) => setAddrForm({ ...addrForm, area: e.target.value })}
                    placeholder="Near Central Park"
                    className="w-full px-3 py-2 rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#261D17] mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={addrForm.city}
                    onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#261D17] mb-1">State *</label>
                  <select
                    value={addrForm.state}
                    onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-sm"
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
                    value={addrForm.pinCode}
                    onChange={(e) => setAddrForm({ ...addrForm, pinCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-sm tabular-nums"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-[#261D17] cursor-pointer">
                <input
                  type="checkbox"
                  checked={addrForm.isDefault}
                  onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })}
                  className="w-4 h-4 accent-[#B84E32]"
                />
                <span>Set as default delivery address</span>
              </label>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#1E3D2F] text-white text-xs font-medium hover:bg-[#173025] cursor-pointer"
                >
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  className="px-4 py-2.5 rounded-lg border border-[#D8CBB5] text-xs font-medium text-[#261D17] hover:bg-[#F2ECE1] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {currentUser.addresses.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E2D9C9] p-8 text-center text-sm text-[#5A4C43]">
              No saved addresses yet. Add a delivery address for faster multi-step checkout.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {currentUser.addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-5 rounded-xl bg-white border space-y-3 ${
                    addr.isDefault ? 'border-[#1E3D2F]' : 'border-[#E2D9C9]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-[#65574D]">
                        {addr.isDefault ? 'Default Delivery Address' : 'Saved Address'}
                      </p>
                      <h3 className="font-semibold text-[#261D17] mt-0.5">{addr.fullName}</h3>
                    </div>
                    {addr.isDefault && (
                      <Check className="w-4 h-4 text-[#1E3D2F] shrink-0" aria-hidden="true" />
                    )}
                  </div>

                  <p className="text-sm text-[#5A4C43] leading-relaxed">
                    {addr.houseBuilding}, {addr.street}, {addr.area}, {addr.city}, {addr.state} –{' '}
                    <span className="tabular-nums">{addr.pinCode}</span>
                  </p>
                  <p className="text-xs text-[#65574D]">Phone: {addr.phone}</p>

                  <div className="pt-3 border-t border-[#EFE7DA] flex flex-wrap items-center gap-3 text-xs">
                    {!addr.isDefault && (
                      <button
                        type="button"
                        onClick={() => setDefaultAddress(addr.id)}
                        className="font-medium text-[#1E3D2F] hover:underline cursor-pointer"
                      >
                        Mark Default
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openEditAddress(addr)}
                      className="font-medium text-[#261D17] hover:text-[#B84E32] cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteAddress(addr.id)}
                      className="inline-flex items-center gap-1 text-[#8D311B] hover:underline cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: My Orders */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-xl border border-[#E2D9C9] overflow-hidden">
          {myOrders.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <p className="text-sm text-[#5A4C43]">You haven’t placed any demo orders yet.</p>
              <Link
                to="/shop"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-[#B84E32] text-white text-xs font-medium hover:bg-[#9E3F26]"
              >
                Explore Cooling Solutions
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F4] border-b border-[#E2D9C9] text-[#65574D]">
                  <tr>
                    <th className="p-3.5 font-semibold">Order ID</th>
                    <th className="p-3.5 font-semibold">Date</th>
                    <th className="p-3.5 font-semibold">Products & Qty</th>
                    <th className="p-3.5 font-semibold">Total</th>
                    <th className="p-3.5 font-semibold">Status</th>
                    <th className="p-3.5 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2D9C9]">
                  {myOrders.map((order) => (
                    <tr key={order.orderId}>
                      <td className="p-3.5 font-mono font-medium text-[#261D17]">
                        {order.orderId}
                      </td>
                      <td className="p-3.5 text-[#5A4C43]">
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="p-3.5 text-[#261D17]">
                        {order.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}
                      </td>
                      <td className="p-3.5 font-semibold tabular-nums text-[#261D17]">
                        {formatINR(order.total)}
                      </td>
                      <td className="p-3.5 font-medium text-[#1E3D2F]">{order.status}</td>
                      <td className="p-3.5">
                        <Link
                          to={`/orders/${encodeURIComponent(order.orderId)}`}
                          className="font-medium text-[#B84E32] hover:underline whitespace-nowrap"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Account Settings */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form
            onSubmit={handleChangePassword}
            className="bg-white rounded-xl border border-[#E2D9C9] p-6 space-y-4"
          >
            <h2 className="font-display text-xl font-semibold text-[#261D17]">
              Change Demo Password
            </h2>
            {passMsg && (
              <p className="text-xs p-3 rounded-lg bg-[#FAF8F4] border border-[#D8CBB5] text-[#261D17]">
                {passMsg}
              </p>
            )}
            <div>
              <label className="block text-xs font-medium text-[#261D17] mb-1">
                Current Password *
              </label>
              <input
                type="password"
                required
                value={currPass}
                onChange={(e) => setCurrPass(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#261D17] mb-1">
                New Password (min. 6 characters) *
              </label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-[#B84E32] text-white text-xs font-medium hover:bg-[#9E3F26] cursor-pointer"
            >
              Update Demo Password
            </button>
          </form>

          <div className="bg-white rounded-xl border border-[#E2D9C9] p-6 space-y-5">
            <h2 className="font-display text-xl font-semibold text-[#261D17]">
              Cooling & Account Preferences
            </h2>
            <div>
              <label className="block text-xs font-medium text-[#261D17] mb-1.5">
                Primary City Climate Zone
              </label>
              <select
                value={currentUser.preferences.climateZone}
                onChange={(e) =>
                  updatePreferences({
                    ...currentUser.preferences,
                    climateZone: e.target.value as DemoUser['preferences']['climateZone'],
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-sm"
              >
                <option value="Hot & Dry">Hot & Dry (e.g., Jaipur, Jodhpur, Nagpur)</option>
                <option value="Warm & Humid">Warm & Humid (e.g., Mumbai, Chennai, Kochi)</option>
                <option value="Composite">Composite (e.g., Delhi NCR, Lucknow, Bhopal)</option>
                <option value="Temperate">Temperate (e.g., Bengaluru, Pune)</option>
              </select>
            </div>

            <label className="flex items-center gap-2.5 text-sm text-[#261D17] cursor-pointer">
              <input
                type="checkbox"
                checked={currentUser.preferences.orderUpdates}
                onChange={(e) =>
                  updatePreferences({
                    ...currentUser.preferences,
                    orderUpdates: e.target.checked,
                  })
                }
                className="w-4 h-4 accent-[#1E3D2F]"
              />
              <span>Show simulated order status updates in account</span>
            </label>

            <div className="pt-4 border-t border-[#EFE7DA] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('overview');
                  startEditingProfile();
                }}
                className="text-xs font-medium text-[#1E3D2F] hover:underline cursor-pointer"
              >
                Edit Profile Details
              </button>
              <button
                type="button"
                onClick={signOutDemo}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E7B5A8] text-xs font-medium text-[#8D311B] hover:bg-[#FDF2F0] cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
