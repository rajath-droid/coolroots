import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ToastBanner } from './components/ToastBanner';
import { StoreProvider } from './context/StoreContext';
import { About } from './pages/About';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { CheckoutPayment } from './pages/CheckoutPayment';
import { Contact } from './pages/Contact';
import { CoolingFinder } from './pages/CoolingFinder';
import { CoolingGuide } from './pages/CoolingGuide';
import { ForgotPassword } from './pages/ForgotPassword';
import { Home } from './pages/Home';
import { OrderDetails } from './pages/OrderDetails';
import { Orders } from './pages/Orders';
import { OrderSuccess } from './pages/OrderSuccess';
import { ProductDetails } from './pages/ProductDetails';
import { Profile } from './pages/Profile';
import { Shop } from './pages/Shop';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { Wishlist } from './pages/Wishlist';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#FAF8F4] via-[#F2F6EE] to-[#F4EFE4] text-[#163024]">
          <Navbar />
          <CartDrawer />
          <ToastBanner />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/product/:slug" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/:id"
                element={
                  <ProtectedRoute>
                    <OrderDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout/payment"
                element={
                  <ProtectedRoute>
                    <CheckoutPayment />
                  </ProtectedRoute>
                }
              />
              <Route path="/checkout/success" element={<OrderSuccess />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/finder" element={<CoolingFinder />} />
              <Route path="/cooling-guide" element={<CoolingGuide />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </StoreProvider>
    </BrowserRouter>
  );
}
