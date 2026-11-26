import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-[#1E3D2F] text-[#F2ECE1] border-t border-[#162D23]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-3">
            <Link to="/" className="font-display text-2xl font-semibold text-white">
              CoolRoots
            </Link>
            <p className="text-sm text-[#D7E0D9] leading-relaxed">
              Ancient Wisdom. Modern Cooling. Bringing traditional Indian heat-reduction and
              passive-cooling techniques into contemporary homes and spaces.
            </p>
            <p className="text-xs text-[#AFC0B5]">
              Prototype storefront · Prices shown in INR are illustrative estimates.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Cooling Catalog</h4>
            <ul className="space-y-2.5 text-sm text-[#D7E0D9]">
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  All Cooling Products
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?category=Terracotta%20Cooling"
                  className="hover:text-white transition-colors"
                >
                  Terracotta Cooling Towers
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?category=Khus%20Cooling"
                  className="hover:text-white transition-colors"
                >
                  Khus Grass Screens
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?category=Lime%20Roof%20Solutions"
                  className="hover:text-white transition-colors"
                >
                  Lime Roof Cooling Kits
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?category=Bamboo%20and%20Chick%20Blinds"
                  className="hover:text-white transition-colors"
                >
                  Bamboo & Chick Blinds
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Learn & Plan</h4>
            <ul className="space-y-2.5 text-sm text-[#D7E0D9]">
              <li>
                <Link to="/finder" className="hover:text-white transition-colors">
                  Find Your Cooling Solution
                </Link>
              </li>
              <li>
                <Link to="/cooling-guide" className="hover:text-white transition-colors">
                  Traditional Cooling Guide
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About CoolRoots
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact & FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Customer Account</h4>
            <ul className="space-y-2.5 text-sm text-[#D7E0D9]">
              <li>
                <Link to="/profile" className="hover:text-white transition-colors">
                  My Profile & Addresses
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-white transition-colors">
                  Order History & Tracking
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-white transition-colors">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/signin" className="hover:text-white transition-colors">
                  Demo Sign In / Sign Up
                </Link>
              </li>
            </ul>
            <div className="mt-5 pt-4 border-t border-[#2E5443] text-xs text-[#C5D3C9] space-y-1">
              <p>Studio (Demo): 42 Craft Courtyard Lane, Jaipur, RJ 302001</p>
              <p>Support (Demo): hello@coolroots.example</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#2E5443] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#B6C7BC]">
          <p>© {new Date().getFullYear()} CoolRoots Passive Cooling Studio. Prototype E-Commerce Build.</p>
          <p>
            Performance note: Evaporative & passive cooling effectiveness depends on local humidity, airflow, and installation.
          </p>
        </div>
      </div>
    </footer>
  );
}
