export type CategoryName =
  | 'Terracotta Cooling'
  | 'Khus Cooling'
  | 'Matka Cooling'
  | 'Lime Roof Solutions'
  | 'Jali Architecture'
  | 'Courtyard Design'
  | 'Bamboo and Chick Blinds'
  | (string & {});

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  dimensionsOrCoverage: string;
  stock: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: CategoryName;
  tags?: string[];
  shortDescription: string;
  description: string;
  image: string;
  gallery?: string[];
  featured: boolean;
  bestSeller: boolean;
  demoRating: number;
  demoReviewCount: number;
  variants: ProductVariant[];
  materialOptions?: string[];
  specifications: {
    material: string;
    dimensions: string;
    waterRequirement: string;
    installation: string;
    maintenance: string;
    climateSuitability: string;
    coverageOrCapacity?: string;
    coatsOrCycle?: string;
  };
  benefits: string[];
  limitations: string[];
  safetyNotes: string;
  shippingInfo: string;
  serviceOption?: string;
}

export interface CoolingBundle {
  id: string;
  name: string;
  price: number;
  originalEstimate?: number;
  summary: string;
  items: string[];
  image: string;
  recommendedFor: string;
  stock: number;
}

export interface CartItem {
  cartItemId: string;
  itemType: 'product' | 'bundle';
  productId: string;
  variantId?: string;
  variantName?: string;
  materialOption?: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: string;
}

export type OrderStatus =
  | 'Order Placed'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export type PaymentMethod =
  | 'Cash on Delivery'
  | 'UPI (Demo)'
  | 'Card Payment (Demo)'
  | 'Net Banking (Demo)';

export interface DeliveryAddress {
  id: string;
  fullName: string;
  phone: string;
  houseBuilding: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pinCode: string;
  isDefault: boolean;
}

export interface DemoUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  demoPassHash: string;
  createdAt: string;
  addresses: DeliveryAddress[];
  preferences: {
    climateZone: 'Hot & Dry' | 'Warm & Humid' | 'Composite' | 'Temperate';
    orderUpdates: boolean;
  };
}

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  notes?: string;
}

export interface ShippingDetails {
  carrier: string;
  trackingId: string;
  estimatedDelivery: string;
}

export interface DemoOrder {
  orderId: string;
  userId?: string;
  createdAt: string;
  customer: CustomerDetails;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount?: number;
  promoCode?: string;
  total: number;
  paymentMethod: PaymentMethod;
  paymentNote?: string;
  shippingDetails?: ShippingDetails;
  status: OrderStatus;
  isDemo: true;
  syncedToSupabase?: boolean;
  supabaseError?: string;
}

export interface CheckoutDraft {
  addressId?: string;
  customer: CustomerDetails;
  promoCode?: string;
  discount: number;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
  syncedToSupabase?: boolean;
  supabaseError?: string;
}

export type SpaceOption =
  | 'Bedroom'
  | 'Living room'
  | 'Rooftop'
  | 'Balcony'
  | 'Courtyard'
  | 'Shop'
  | 'Office'
  | 'Outdoor waiting area';

export type ProblemOption =
  | 'Direct sunlight'
  | 'Hot roof'
  | 'Poor airflow'
  | 'Hot outdoor waiting area'
  | 'Need cooler water'
  | 'Need natural shade';

export type BudgetOption =
  | 'Under ₹500'
  | '₹500–₹1,500'
  | '₹1,500–₹3,000'
  | '₹3,000+';

export type PreferenceOption =
  | 'Traditional natural materials'
  | 'Low electricity usage'
  | 'Home architecture solution'
  | 'Outdoor cooling'
  | 'Affordable solution';

export interface FinderAnswers {
  space: SpaceOption;
  problem: ProblemOption;
  budget: BudgetOption;
  preference: PreferenceOption;
}

export interface RecommendationResult {
  product: Product;
  recommendedVariant: ProductVariant;
  reason: string;
  matchScore: number;
}
