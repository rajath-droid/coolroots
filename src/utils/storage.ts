import { CATEGORIES, INITIAL_BUNDLES, INITIAL_PRODUCTS } from '../data/products';
import {
  CartItem,
  CategoryName,
  CheckoutDraft,
  ContactSubmission,
  CoolingBundle,
  DemoOrder,
  DemoUser,
  OrderStatus,
  Product,
} from '../types';

const KEYS = {
  PRODUCTS: 'coolroots_products_v1',
  BUNDLES: 'coolroots_bundles_v1',
  CATEGORIES: 'coolroots_categories_v1',
  CART: 'coolroots_cart_v1',
  ORDERS: 'coolroots_demo_orders_v1',
  CONTACTS: 'coolroots_demo_contacts_v1',
  WISHLIST: 'coolroots_wishlist_v1',
  USERS: 'coolroots_demo_users_v1',
  SESSION_USER_ID: 'coolroots_demo_session_v1',
  CHECKOUT_DRAFT: 'coolroots_checkout_draft_v1',
};

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors in restricted environments
  }
}

export function loadProducts(): Product[] {
  const stored = safeRead<Product[]>(KEYS.PRODUCTS, INITIAL_PRODUCTS);
  // Ensure existing locally stored items inherit new lifestyle galleries & tags if missing
  return stored.map((item) => {
    const seed = INITIAL_PRODUCTS.find((p) => p.id === item.id);
    if (!seed) return item;
    return {
      ...item,
      tags: item.tags && item.tags.length > 0 ? item.tags : seed.tags,
      gallery: item.gallery && item.gallery.length > 1 ? item.gallery : seed.gallery,
    };
  });
}

export function saveProducts(products: Product[]): void {
  safeWrite(KEYS.PRODUCTS, products);
}

export function loadBundles(): CoolingBundle[] {
  return safeRead<CoolingBundle[]>(KEYS.BUNDLES, INITIAL_BUNDLES);
}

export function saveBundles(bundles: CoolingBundle[]): void {
  safeWrite(KEYS.BUNDLES, bundles);
}

export function loadCategories(): CategoryName[] {
  return safeRead<CategoryName[]>(KEYS.CATEGORIES, CATEGORIES);
}

export function saveCategories(categories: CategoryName[]): void {
  safeWrite(KEYS.CATEGORIES, categories);
}

export function loadCart(): CartItem[] {
  return safeRead<CartItem[]>(KEYS.CART, []);
}

export function saveCart(cart: CartItem[]): void {
  safeWrite(KEYS.CART, cart);
}

function normalizeLegacyOrderStatus(status: string): OrderStatus {
  if (status === 'Placed (Demo)') return 'Order Placed';
  if (status === 'Preparing Shipment') return 'Processing';
  if (status === 'Dispatched') return 'Shipped';
  return status as OrderStatus;
}

export function loadOrders(): DemoOrder[] {
  const raw = safeRead<DemoOrder[]>(KEYS.ORDERS, []);
  return raw.map((order) => ({
    ...order,
    status: normalizeLegacyOrderStatus(order.status),
    paymentMethod: order.paymentMethod || 'Cash on Delivery',
  }));
}

export function saveOrders(orders: DemoOrder[]): void {
  safeWrite(KEYS.ORDERS, orders);
}

export function loadContacts(): ContactSubmission[] {
  return safeRead<ContactSubmission[]>(KEYS.CONTACTS, []);
}

export function saveContacts(contacts: ContactSubmission[]): void {
  safeWrite(KEYS.CONTACTS, contacts);
}

export function loadWishlist(): string[] {
  return safeRead<string[]>(KEYS.WISHLIST, []);
}

export function saveWishlist(productIds: string[]): void {
  safeWrite(KEYS.WISHLIST, productIds);
}

export function loadUsers(): DemoUser[] {
  return safeRead<DemoUser[]>(KEYS.USERS, []);
}

export function saveUsers(users: DemoUser[]): void {
  safeWrite(KEYS.USERS, users);
}

export function loadSessionUserId(): string | null {
  try {
    return localStorage.getItem(KEYS.SESSION_USER_ID) || sessionStorage.getItem(KEYS.SESSION_USER_ID);
  } catch {
    return null;
  }
}

export function saveSessionUserId(userId: string | null, rememberMe = true): void {
  try {
    localStorage.removeItem(KEYS.SESSION_USER_ID);
    sessionStorage.removeItem(KEYS.SESSION_USER_ID);
    if (userId) {
      if (rememberMe) {
        localStorage.setItem(KEYS.SESSION_USER_ID, userId);
      } else {
        sessionStorage.setItem(KEYS.SESSION_USER_ID, userId);
      }
    }
  } catch {
    // Ignore storage restriction errors
  }
}

export function loadCheckoutDraft(): CheckoutDraft | null {
  return safeRead<CheckoutDraft | null>(KEYS.CHECKOUT_DRAFT, null);
}

export function saveCheckoutDraft(draft: CheckoutDraft | null): void {
  if (!draft) {
    try {
      localStorage.removeItem(KEYS.CHECKOUT_DRAFT);
    } catch {
      // Ignore
    }
    return;
  }
  safeWrite(KEYS.CHECKOUT_DRAFT, draft);
}

export function resetCatalogStorage(): {
  products: Product[];
  bundles: CoolingBundle[];
  categories: CategoryName[];
} {
  saveProducts(INITIAL_PRODUCTS);
  saveBundles(INITIAL_BUNDLES);
  saveCategories(CATEGORIES);
  return { products: INITIAL_PRODUCTS, bundles: INITIAL_BUNDLES, categories: CATEGORIES };
}
