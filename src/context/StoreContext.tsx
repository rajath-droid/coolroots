import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  CartItem,
  CategoryName,
  CheckoutDraft,
  ContactSubmission,
  CoolingBundle,
  CustomerDetails,
  DeliveryAddress,
  DemoOrder,
  DemoUser,
  OrderStatus,
  PaymentMethod,
  Product,
  ProductVariant,
  ShippingDetails,
} from '../types';
import {
  fetchOrdersFromSupabase,
  insertContactToSupabase,
  insertOrderToSupabase,
} from '../lib/supabase';
import {
  calculateShipping,
  calculateSubtotal,
  calculateTotal,
  getCartItemCount,
} from '../utils/cartUtils';
import {
  loadBundles,
  loadCart,
  loadCategories,
  loadCheckoutDraft,
  loadContacts,
  loadOrders,
  loadProducts,
  loadSessionUserId,
  loadUsers,
  loadWishlist,
  resetCatalogStorage,
  saveBundles,
  saveCart,
  saveCategories,
  saveCheckoutDraft,
  saveContacts,
  saveOrders,
  saveProducts,
  saveSessionUserId,
  saveUsers,
  saveWishlist,
} from '../utils/storage';

export interface ToastNotice {
  message: string;
  type: 'success' | 'info' | 'error';
}

interface StoreContextValue {
  products: Product[];
  bundles: CoolingBundle[];
  categories: CategoryName[];
  cart: CartItem[];
  orders: DemoOrder[];
  contacts: ContactSubmission[];
  wishlist: string[];
  users: DemoUser[];
  currentUser: DemoUser | null;
  checkoutDraft: CheckoutDraft | null;
  cartDrawerOpen: boolean;
  lastAddedNotice: string | null;
  toast: ToastNotice | null;
  setCartDrawerOpen: (open: boolean) => void;
  showToast: (message: string, type?: ToastNotice['type']) => void;
  dismissToast: () => void;
  addToCart: (item: Omit<CartItem, 'cartItemId'>) => void;
  addBundleToCart: (bundle: CoolingBundle) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  signUpDemo: (input: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
  }) => { ok: true; user: DemoUser } | { ok: false; error: string };
  signInDemo: (input: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }) => { ok: true; user: DemoUser } | { ok: false; error: string };
  signOutDemo: () => void;
  resetDemoPassword: (email: string, newPassword: string) => { ok: boolean; error?: string };
  updateProfile: (input: { fullName: string; email: string; phone?: string }) => {
    ok: boolean;
    error?: string;
  };
  changeDemoPassword: (currentPassword: string, newPassword: string) => {
    ok: boolean;
    error?: string;
  };
  updatePreferences: (prefs: DemoUser['preferences']) => void;
  addAddress: (address: Omit<DeliveryAddress, 'id'>) => DeliveryAddress;
  updateAddress: (address: DeliveryAddress) => void;
  deleteAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;
  setCheckoutDraft: (draft: CheckoutDraft | null) => void;
  placeDemoOrder: (input: {
    customer: CustomerDetails;
    paymentMethod: PaymentMethod;
    paymentNote?: string;
    discount?: number;
    promoCode?: string;
  }) => Promise<DemoOrder>;
  updateProduct: (updated: Product) => void;
  addProduct: (newProduct: Product) => void;
  deleteProduct: (productId: string) => void;
  addVariantToProduct: (productId: string, variant: ProductVariant) => void;
  addCategory: (category: CategoryName) => void;
  updateBundle: (updated: CoolingBundle) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrderShipping: (orderId: string, shippingDetails: ShippingDetails) => void;
  submitContactForm: (
    entry: Omit<ContactSubmission, 'id' | 'submittedAt'>
  ) => Promise<ContactSubmission>;
  resetDemoCatalog: () => void;
  cartCount: number;
  wishlistCount: number;
  cartSubtotal: number;
  cartShipping: number;
  cartTotal: number;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

function encodeDemoPass(raw: string): string {
  try {
    return btoa(unescape(encodeURIComponent(`cr_demo_${raw}`)));
  } catch {
    return `cr_demo_${raw}`;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => loadProducts());
  const [bundles, setBundles] = useState<CoolingBundle[]>(() => loadBundles());
  const [categories, setCategories] = useState<CategoryName[]>(() => loadCategories());
  const [cart, setCart] = useState<CartItem[]>(() => loadCart());
  const [orders, setOrders] = useState<DemoOrder[]>(() => loadOrders());
  const [contacts, setContacts] = useState<ContactSubmission[]>(() => loadContacts());
  const [wishlist, setWishlist] = useState<string[]>(() => loadWishlist());
  const [users, setUsers] = useState<DemoUser[]>(() => loadUsers());
  const [sessionUserId, setSessionUserId] = useState<string | null>(() => loadSessionUserId());
  const [checkoutDraft, setCheckoutDraftState] = useState<CheckoutDraft | null>(() =>
    loadCheckoutDraft()
  );
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [lastAddedNotice, setLastAddedNotice] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastNotice | null>(null);

  const currentUser = users.find((u) => u.id === sessionUserId) || null;

  useEffect(() => {
    saveProducts(products);
  }, [products]);

  useEffect(() => {
    saveBundles(bundles);
  }, [bundles]);

  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  useEffect(() => {
    saveOrders(orders);
  }, [orders]);

  useEffect(() => {
    saveContacts(contacts);
  }, [contacts]);

  useEffect(() => {
    saveWishlist(wishlist);
  }, [wishlist]);

  useEffect(() => {
    saveUsers(users);
  }, [users]);

  useEffect(() => {
    let active = true;
    fetchOrdersFromSupabase(currentUser?.email).then((remoteOrders) => {
      if (!active || remoteOrders.length === 0) return;
      setOrders((prev) => {
        const merged = new Map<string, DemoOrder>();
        remoteOrders.forEach((o) => merged.set(o.orderId, o));
        prev.forEach((o) => {
          if (!merged.has(o.orderId)) {
            merged.set(o.orderId, o);
          }
        });
        return Array.from(merged.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    });
    return () => {
      active = false;
    };
  }, [currentUser?.email]);

  const showToast = (message: string, type: ToastNotice['type'] = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 3200);
  };

  const dismissToast = () => setToast(null);

  const showAddedFeedback = (label: string) => {
    setLastAddedNotice(label);
    window.setTimeout(() => {
      setLastAddedNotice((current) => (current === label ? null : current));
    }, 2600);
  };

  const setCheckoutDraft = (draft: CheckoutDraft | null) => {
    setCheckoutDraftState(draft);
    saveCheckoutDraft(draft);
  };

  const addToCart = (incoming: Omit<CartItem, 'cartItemId'>) => {
    const cartItemId = [
      incoming.itemType,
      incoming.productId,
      incoming.variantId || 'default',
      incoming.materialOption || 'standard',
    ].join('::');

    setCart((prev) => {
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + incoming.quantity }
            : item
        );
      }
      return [...prev, { ...incoming, cartItemId }];
    });

    showAddedFeedback(
      incoming.variantName ? `${incoming.name} (${incoming.variantName})` : incoming.name
    );
    setCartDrawerOpen(true);
  };

  const addBundleToCart = (bundle: CoolingBundle) => {
    addToCart({
      itemType: 'bundle',
      productId: bundle.id,
      variantId: bundle.id,
      variantName: 'Cooling Bundle',
      name: bundle.name,
      category: 'Cooling Bundle',
      price: bundle.price,
      quantity: 1,
      image: bundle.image,
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.cartItemId === cartItemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const toggleWishlist = (productId: string) => {
    const exists = wishlist.includes(productId);
    setWishlist((prev) =>
      exists ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
    showToast(exists ? 'Removed from wishlist' : 'Saved to wishlist', 'info');
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((id) => id !== productId));
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  const signUpDemo = (input: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
  }) => {
    const normalizedEmail = input.email.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      return { ok: false as const, error: 'An account with this email already exists in local demo storage.' };
    }

    const newUser: DemoUser = {
      id: `usr-${Date.now().toString(36)}`,
      fullName: input.fullName.trim(),
      email: normalizedEmail,
      phone: input.phone?.trim() || undefined,
      demoPassHash: encodeDemoPass(input.password),
      createdAt: new Date().toISOString(),
      addresses: [],
      preferences: {
        climateZone: 'Hot & Dry',
        orderUpdates: true,
      },
    };

    setUsers((prev) => [...prev, newUser]);
    setSessionUserId(newUser.id);
    saveSessionUserId(newUser.id, true);
    showToast(`Welcome to CoolRoots, ${newUser.fullName}!`);
    return { ok: true as const, user: newUser };
  };

  const signInDemo = (input: { email: string; password: string; rememberMe?: boolean }) => {
    const normalizedEmail = input.email.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!user || user.demoPassHash !== encodeDemoPass(input.password)) {
      return {
        ok: false as const,
        error: 'Invalid email or password for local demo accounts. Create a new account if needed.',
      };
    }

    setSessionUserId(user.id);
    saveSessionUserId(user.id, input.rememberMe ?? true);
    showToast(`Signed in as ${user.fullName}`);
    return { ok: true as const, user };
  };

  const signOutDemo = () => {
    setSessionUserId(null);
    saveSessionUserId(null);
    showToast('Signed out of demo account', 'info');
  };

  const resetDemoPassword = (email: string, newPassword: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!user) {
      return { ok: false, error: 'No local demo account found with that email address.' };
    }
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id ? { ...u, demoPassHash: encodeDemoPass(newPassword) } : u
      )
    );
    return { ok: true };
  };

  const updateProfile = (input: { fullName: string; email: string; phone?: string }) => {
    if (!currentUser) return { ok: false, error: 'Please sign in first.' };
    const normalizedEmail = input.email.trim().toLowerCase();
    const duplicate = users.some(
      (u) => u.id !== currentUser.id && u.email.toLowerCase() === normalizedEmail
    );
    if (duplicate) {
      return { ok: false, error: 'Another demo account already uses this email.' };
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              fullName: input.fullName.trim(),
              email: normalizedEmail,
              phone: input.phone?.trim() || undefined,
            }
          : u
      )
    );
    showToast('Profile details updated');
    return { ok: true };
  };

  const changeDemoPassword = (currentPassword: string, newPassword: string) => {
    if (!currentUser) return { ok: false, error: 'Please sign in first.' };
    if (currentUser.demoPassHash !== encodeDemoPass(currentPassword)) {
      return { ok: false, error: 'Current demo password does not match.' };
    }
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id ? { ...u, demoPassHash: encodeDemoPass(newPassword) } : u
      )
    );
    showToast('Demo password updated');
    return { ok: true };
  };

  const updatePreferences = (prefs: DemoUser['preferences']) => {
    if (!currentUser) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, preferences: prefs } : u))
    );
    showToast('Preferences saved');
  };

  const addAddress = (address: Omit<DeliveryAddress, 'id'>): DeliveryAddress => {
    const created: DeliveryAddress = {
      ...address,
      id: `addr-${Date.now().toString(36)}`,
    };
    if (!currentUser) return created;

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== currentUser.id) return u;
        const shouldDefault = created.isDefault || u.addresses.length === 0;
        const nextList = shouldDefault
          ? u.addresses.map((a) => ({ ...a, isDefault: false }))
          : u.addresses;
        return { ...u, addresses: [...nextList, { ...created, isDefault: shouldDefault }] };
      })
    );
    showToast('Delivery address saved');
    return created;
  };

  const updateAddress = (updated: DeliveryAddress) => {
    if (!currentUser) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== currentUser.id) return u;
        const list = u.addresses.map((a) => {
          if (a.id === updated.id) return updated;
          return updated.isDefault ? { ...a, isDefault: false } : a;
        });
        return { ...u, addresses: list };
      })
    );
    showToast('Delivery address updated');
  };

  const deleteAddress = (addressId: string) => {
    if (!currentUser) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== currentUser.id) return u;
        const remaining = u.addresses.filter((a) => a.id !== addressId);
        if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
          remaining[0] = { ...remaining[0], isDefault: true };
        }
        return { ...u, addresses: remaining };
      })
    );
    showToast('Address removed', 'info');
  };

  const setDefaultAddress = (addressId: string) => {
    if (!currentUser) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              addresses: u.addresses.map((a) => ({ ...a, isDefault: a.id === addressId })),
            }
          : u
      )
    );
    showToast('Default delivery address updated');
  };

  const placeDemoOrder = async (input: {
    customer: CustomerDetails;
    paymentMethod: PaymentMethod;
    paymentNote?: string;
    discount?: number;
    promoCode?: string;
  }): Promise<DemoOrder> => {
    const subtotal = calculateSubtotal(cart);
    const shipping = calculateShipping(subtotal);
    const discount = input.discount || 0;
    const total = calculateTotal(cart, discount);
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const orderId = `CR-DEMO-${randomDigits}`;

    const etaDate = new Date();
    etaDate.setDate(etaDate.getDate() + 5);
    const estimatedDelivery = etaDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const baseOrder: DemoOrder = {
      orderId,
      userId: currentUser?.id,
      createdAt: new Date().toISOString(),
      customer: input.customer,
      items: [...cart],
      subtotal,
      shipping,
      discount,
      promoCode: input.promoCode,
      total,
      paymentMethod: input.paymentMethod,
      paymentNote: input.paymentNote,
      shippingDetails: {
        carrier: 'CoolRoots Regional Courier (Demo)',
        trackingId: `TRK-${randomDigits}IN`,
        estimatedDelivery,
      },
      status: 'Order Placed',
      isDemo: true,
    };

    const syncResult = await insertOrderToSupabase(baseOrder);
    const savedOrder: DemoOrder = {
      ...baseOrder,
      syncedToSupabase: syncResult.ok,
      supabaseError: syncResult.ok ? undefined : syncResult.error,
    };

    setOrders((prev) => [savedOrder, ...prev]);
    setCart([]);
    setCheckoutDraft(null);
    return savedOrder;
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const addProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
    if (!categories.includes(newProduct.category)) {
      setCategories((prev) => [...prev, newProduct.category]);
    }
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setWishlist((prev) => prev.filter((id) => id !== productId));
  };

  const addVariantToProduct = (productId: string, variant: ProductVariant) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, variants: [...p.variants, variant] } : p
      )
    );
  };

  const addCategory = (category: CategoryName) => {
    const clean = category.trim();
    if (!clean || categories.includes(clean)) return;
    setCategories((prev) => [...prev, clean]);
  };

  const updateBundle = (updated: CoolingBundle) => {
    setBundles((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) => (order.orderId === orderId ? { ...order, status } : order))
    );
  };

  const updateOrderShipping = (orderId: string, shippingDetails: ShippingDetails) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.orderId === orderId ? { ...order, shippingDetails } : order
      )
    );
  };

  const submitContactForm = async (
    entry: Omit<ContactSubmission, 'id' | 'submittedAt'>
  ): Promise<ContactSubmission> => {
    const baseSubmission: ContactSubmission = {
      ...entry,
      id: `MSG-${Date.now().toString().slice(-6)}`,
      submittedAt: new Date().toISOString(),
    };
    const syncResult = await insertContactToSupabase(baseSubmission);
    const savedSubmission: ContactSubmission = {
      ...baseSubmission,
      syncedToSupabase: syncResult.ok,
      supabaseError: syncResult.ok ? undefined : syncResult.error,
    };
    setContacts((prev) => [savedSubmission, ...prev]);
    return savedSubmission;
  };

  const resetDemoCatalog = () => {
    const {
      products: defaultProducts,
      bundles: defaultBundles,
      categories: defaultCategories,
    } = resetCatalogStorage();
    setProducts(defaultProducts);
    setBundles(defaultBundles);
    setCategories(defaultCategories);
  };

  const cartSubtotal = calculateSubtotal(cart);
  const cartShipping = calculateShipping(cartSubtotal);
  const cartTotal = calculateTotal(cart);
  const cartCount = getCartItemCount(cart);
  const wishlistCount = wishlist.filter((id) => products.some((p) => p.id === id)).length;

  return (
    <StoreContext.Provider
      value={{
        products,
        bundles,
        categories,
        cart,
        orders,
        contacts,
        wishlist,
        users,
        currentUser,
        checkoutDraft,
        cartDrawerOpen,
        lastAddedNotice,
        toast,
        setCartDrawerOpen,
        showToast,
        dismissToast,
        addToCart,
        addBundleToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        signUpDemo,
        signInDemo,
        signOutDemo,
        resetDemoPassword,
        updateProfile,
        changeDemoPassword,
        updatePreferences,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        setCheckoutDraft,
        placeDemoOrder,
        updateProduct,
        addProduct,
        deleteProduct,
        addVariantToProduct,
        addCategory,
        updateBundle,
        updateOrderStatus,
        updateOrderShipping,
        submitContactForm,
        resetDemoCatalog,
        cartCount,
        wishlistCount,
        cartSubtotal,
        cartShipping,
        cartTotal,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used inside StoreProvider');
  }
  return ctx;
}
