import { CartItem } from '../types';

export const FREE_SHIPPING_THRESHOLD = 2000;
export const STANDARD_SHIPPING_FEE = 120;

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function calculateShipping(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
}

export function calculateDiscount(subtotal: number, promoCode?: string): number {
  if (!promoCode) return 0;
  const normalized = promoCode.trim().toUpperCase();
  if (normalized === 'COOL10') {
    return Math.round(subtotal * 0.1);
  }
  if (normalized === 'ROOTS100' && subtotal >= 1000) {
    return 100;
  }
  return 0;
}

export function calculateTotal(items: CartItem[], discount = 0): number {
  const subtotal = calculateSubtotal(items);
  const shipping = calculateShipping(subtotal);
  return Math.max(0, subtotal + shipping - discount);
}

export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}
