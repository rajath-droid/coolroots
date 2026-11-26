import {
  ArrowRight,
  Heart,
  Leaf,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  User,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { formatINR } from '../utils/cartUtils';
import { SafeImage } from './SafeImage';

const CENTER_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/cooling-guide', label: 'Cooling Guide' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
];

export function Navbar() {
  const {
    products,
    cartCount,
    wishlistCount,
    currentUser,
    signOutDemo,
    setCartDrawerOpen,
    lastAddedNotice,
  } = useStore();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountOpen, setAccountOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (searchOpen) {
      window.setTimeout(() => searchInputRef.current?.focus(), 40);
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => {
      const haystack = [
        p.name,
        p.shortDescription,
        p.description,
        p.category,
        ...(p.tags || []),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [products, searchQuery]);

  const handleOpenProductFromSearch = (slug: string) => {
    setSearchOpen(false);
    setSearchQuery('');
    setMobileOpen(false);
    navigate(`/product/${slug}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F4]/68 backdrop-blur-xl border-b border-white/75 shadow-[0_4px_24px_-8px_rgba(22,48,36,0.09)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 lg:gap-8">
        {/* LEFT: Leaf/earth icon + CoolRoots brand */}
        <Link
          to="/"
          onClick={() => {
            setMobileOpen(false);
            setSearchOpen(false);
            setAccountOpen(false);
          }}
          className="inline-flex items-center gap-2.5 font-display text-2xl font-semibold tracking-tight text-[#163024] whitespace-nowrap shrink-0 hover:text-[#1E3D2F] transition-colors duration-150"
        >
          <span className="w-8 h-8 rounded-[12px] bg-gradient-to-br from-[#1E3D2F] to-[#2B5240] text-white inline-flex items-center justify-center shrink-0 shadow-[0_4px_12px_-4px_rgba(22,48,36,0.4)]">
            <Leaf className="w-4 h-4" aria-hidden="true" />
          </span>
          <span>CoolRoots</span>
        </Link>

        {/* CENTER: Home, Shop, Cooling Guide, About Us, Contact */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-2 lg:gap-3 text-sm font-medium text-[#284838]"
        >
          {CENTER_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 px-3 py-1.5 rounded-full transition-all duration-150 ${
                  isActive
                    ? 'bg-white/75 backdrop-blur-md text-[#163024] border border-white/90 shadow-[0_2px_10px_-4px_rgba(22,48,36,0.16)]'
                    : 'border border-transparent hover:bg-white/45 hover:text-[#163024]'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* RIGHT: Search icon, Cart icon with live count, Account/Profile icon */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setSearchOpen((prev) => !prev);
              setAccountOpen(false);
            }}
            aria-expanded={searchOpen}
            aria-label="Search cooling products"
            className={`w-10 h-10 rounded-[14px] inline-flex items-center justify-center backdrop-blur-md border transition-all cursor-pointer ${
              searchOpen
                ? 'bg-white/85 border-[#1E3D2F]/30 text-[#163024] shadow-sm'
                : 'bg-white/55 border-white/80 text-[#163024] hover:bg-white/85 shadow-xs'
            }`}
          >
            {searchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </button>

          {/* Cart Button */}
          <button
            type="button"
            onClick={() => setCartDrawerOpen(true)}
            aria-label={`Open shopping cart with ${cartCount} items`}
            className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-[14px] bg-gradient-to-r from-[#1E3D2F]/90 to-[#2B5240]/90 backdrop-blur-md border border-white/25 text-white text-sm font-medium hover:from-[#163024] hover:to-[#1E3D2F] transition-all duration-150 shadow-[0_6px_18px_-6px_rgba(22,48,36,0.35)] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="tabular-nums">Cart ({cartCount})</span>
          </button>

          {/* Account Menu */}
          <div className="relative" ref={accountMenuRef}>
            <button
              type="button"
              onClick={() => {
                setAccountOpen((prev) => !prev);
                setSearchOpen(false);
              }}
              aria-expanded={accountOpen}
              aria-label={currentUser ? `Account menu for ${currentUser.fullName}` : 'Open account menu'}
              className={`h-10 px-2.5 sm:px-3 rounded-[14px] inline-flex items-center gap-1.5 backdrop-blur-md border transition-all cursor-pointer ${
                accountOpen || currentUser
                  ? 'bg-white/80 border-white/90 text-[#163024] hover:bg-white/95 shadow-xs'
                  : 'bg-white/55 border-white/80 text-[#163024] hover:bg-white/85 shadow-xs'
              }`}
            >
              <User className="w-4 h-4 text-[#1E3D2F]" aria-hidden="true" />
              {currentUser && (
                <span className="hidden lg:inline text-xs font-medium max-w-[96px] truncate">
                  {currentUser.fullName.split(' ')[0]}
                </span>
              )}
            </button>

            {accountOpen && (
              <div
                role="menu"
                aria-label="Account menu"
                className="absolute right-0 mt-2 w-64 rounded-[20px] bg-white/85 backdrop-blur-xl border border-white/90 shadow-[0_18px_42px_-12px_rgba(22,48,36,0.20)] py-2 z-50"
              >
                {currentUser ? (
                  <>
                    <div className="px-4 py-2.5 border-b border-[#EFE7DA]">
                      <p className="text-xs text-[#65574D]">Signed in (Demo Account)</p>
                      <p className="text-sm font-semibold text-[#261D17] truncate">
                        {currentUser.fullName}
                      </p>
                      <p className="text-xs text-[#65574D] truncate">{currentUser.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#261D17] hover:bg-[#FAF8F4]"
                    >
                      <User className="w-4 h-4 text-[#65574D]" aria-hidden="true" />
                      <span>My Profile & Addresses</span>
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#261D17] hover:bg-[#FAF8F4]"
                    >
                      <Package className="w-4 h-4 text-[#65574D]" aria-hidden="true" />
                      <span>My Orders</span>
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 text-sm text-[#261D17] hover:bg-[#FAF8F4]"
                    >
                      <span className="inline-flex items-center gap-2.5">
                        <Heart className="w-4 h-4 text-[#B84E32]" aria-hidden="true" />
                        <span>Wishlist</span>
                      </span>
                      <span className="text-xs text-[#65574D] tabular-nums">{wishlistCount}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        signOutDemo();
                        setAccountOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#B84E32] hover:bg-[#FAF3EE] border-t border-[#EFE7DA] cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" aria-hidden="true" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-2.5 border-b border-[#EFE7DA]">
                      <p className="text-xs font-semibold text-[#261D17]">CoolRoots Account</p>
                      <p className="text-[11px] text-[#65574D]">Demo sign-in for orders & profile</p>
                    </div>
                    <Link
                      to="/signin"
                      onClick={() => setAccountOpen(false)}
                      className="block px-4 py-2.5 text-sm font-medium text-[#B84E32] hover:bg-[#FAF8F4]"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setAccountOpen(false)}
                      className="block px-4 py-2.5 text-sm text-[#261D17] hover:bg-[#FAF8F4]"
                    >
                      Create Demo Account
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 text-sm text-[#261D17] hover:bg-[#FAF8F4] border-t border-[#EFE7DA]"
                    >
                      <span>Saved Wishlist</span>
                      <span className="text-xs text-[#65574D] tabular-nums">{wishlistCount}</span>
                    </Link>
                    <Link
                      to="/finder"
                      onClick={() => setAccountOpen(false)}
                      className="block px-4 py-2.5 text-sm text-[#261D17] hover:bg-[#FAF8F4]"
                    >
                      Cooling Solution Finder
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={() => {
              setMobileOpen((prev) => !prev);
              setSearchOpen(false);
              setAccountOpen(false);
            }}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-[14px] bg-white/55 backdrop-blur-md border border-white/80 text-[#163024] hover:bg-white/85 transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Global Search Panel (Desktop + Mobile) */}
      {searchOpen && (
        <div className="border-t border-white/70 bg-white/82 backdrop-blur-xl shadow-lg">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search
                  className="w-4 h-4 text-[#65574D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by product name, clay, khus, roof, bamboo, balcony..."
                  aria-label="Global product search"
                  className="w-full pl-10 pr-4 py-2.5 min-h-[44px] rounded-lg border border-[#D8CBB5] bg-[#FAF8F4] text-sm text-[#261D17] focus:bg-white focus:border-[#B84E32] focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  if (searchQuery.trim()) {
                    navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
                    setSearchQuery('');
                  }
                }}
                className="px-4 py-2.5 min-h-[44px] rounded-lg bg-[#B84E32] text-white text-xs font-medium hover:bg-[#9E3F26] whitespace-nowrap cursor-pointer"
              >
                View in Shop
              </button>
            </div>

            {searchQuery.trim() && (
              <div className="max-h-80 overflow-y-auto divide-y divide-[#EFE7DA] border border-[#E2D9C9] rounded-xl bg-[#FAF8F4]">
                {searchResults.length === 0 ? (
                  <div className="p-6 text-center text-sm text-[#5A4C43]">
                    <p className="font-medium text-[#261D17]">
                      No cooling products matched “{searchQuery}”
                    </p>
                    <p className="text-xs mt-1">
                      Try searching for terracotta, khus, matka, lime roof, jali, courtyard, or
                      bamboo blinds.
                    </p>
                  </div>
                ) : (
                  searchResults.map((item) => {
                    const minPrice = Math.min(...item.variants.map((v) => v.price));
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleOpenProductFromSearch(item.slug)}
                        className="w-full text-left p-3 hover:bg-white transition-colors flex items-center justify-between gap-4 cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-14 h-11 rounded-lg overflow-hidden bg-[#F2ECE1] border border-[#E2D9C9] shrink-0">
                            <SafeImage
                              src={item.image}
                              alt={item.name}
                              fallbackLabel={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-[#B84E32] font-medium">{item.category}</p>
                            <p className="text-sm font-semibold text-[#261D17] truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-[#65574D] truncate">{item.shortDescription}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm font-semibold text-[#261D17] tabular-nums">
                            From {formatINR(minPrice)}
                          </span>
                          <ArrowRight className="w-4 h-4 text-[#65574D]" aria-hidden="true" />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile navigation drawer */}
      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="md:hidden border-t border-white/70 bg-[#FAF8F4]/88 backdrop-blur-xl px-4 py-3 space-y-1 max-h-[75vh] overflow-y-auto"
        >
          {CENTER_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#F2ECE1] text-[#B84E32]'
                    : 'text-[#261D17] hover:bg-[#F2ECE1]'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="pt-2 mt-2 border-t border-[#E2D9C9] space-y-1">
            <NavLink
              to="/finder"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#261D17] hover:bg-[#F2ECE1]"
            >
              Cooling Solution Finder
            </NavLink>
            <NavLink
              to="/wishlist"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#261D17] hover:bg-[#F2ECE1]"
            >
              Saved Wishlist ({wishlistCount})
            </NavLink>
            {currentUser ? (
              <>
                <NavLink
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#261D17] hover:bg-[#F2ECE1]"
                >
                  My Profile
                </NavLink>
                <NavLink
                  to="/orders"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#261D17] hover:bg-[#F2ECE1]"
                >
                  My Orders
                </NavLink>
              </>
            ) : (
              <NavLink
                to="/signin"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#B84E32] hover:bg-[#F2ECE1]"
              >
                Sign In / Create Account
              </NavLink>
            )}
          </div>
        </nav>
      )}

      {/* Subtle cart add confirmation */}
      {lastAddedNotice && (
        <div
          role="status"
          aria-live="polite"
          className="border-t border-white/25 bg-[#1E3D2F]/90 backdrop-blur-md text-white text-xs py-1.5 px-4 text-center"
        >
          Added to cart: {lastAddedNotice}
        </div>
      )}
    </header>
  );
}
