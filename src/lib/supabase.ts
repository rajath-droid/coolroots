import { createClient } from '@supabase/supabase-js';
import { ContactSubmission, DemoOrder, OrderStatus, PaymentMethod } from '../types';

const DEFAULT_SUPABASE_URL = 'https://yktzorxnislqvpeqpmer.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_7C34WM3MbbLnkoSKeAzpqA_01j2AbcO';

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || DEFAULT_SUPABASE_URL;
const supabasePublishableKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)?.trim() ||
  DEFAULT_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabasePublishableKey);

interface SupabaseOrderRow {
  order_id: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  city: string;
  state: string;
  pin_code: string;
  notes: string | null;
  items: DemoOrder['items'];
  subtotal: number;
  shipping: number;
  discount: number | null;
  promo_code: string | null;
  total: number;
  payment_method: string;
  payment_note: string | null;
  shipping_details: DemoOrder['shippingDetails'] | null;
  status: string;
  created_at: string;
}

export async function insertOrderToSupabase(
  order: DemoOrder
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const payload: SupabaseOrderRow = {
      order_id: order.orderId,
      user_id: order.userId || null,
      customer_name: order.customer.fullName,
      customer_email: order.customer.email,
      customer_phone: order.customer.phone,
      delivery_address: order.customer.address,
      city: order.customer.city,
      state: order.customer.state,
      pin_code: order.customer.pinCode,
      notes: order.customer.notes || null,
      items: order.items,
      subtotal: order.subtotal,
      shipping: order.shipping,
      discount: order.discount ?? 0,
      promo_code: order.promoCode || null,
      total: order.total,
      payment_method: order.paymentMethod,
      payment_note: order.paymentNote || null,
      shipping_details: order.shippingDetails || null,
      status: order.status,
      created_at: order.createdAt,
    };

    const { error } = await supabase.from('orders').insert(payload);

    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unable to reach Supabase backend.',
    };
  }
}

export async function fetchOrdersFromSupabase(email?: string): Promise<DemoOrder[]> {
  try {
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (email && email.trim()) {
      query = query.eq('customer_email', email.trim().toLowerCase());
    }

    const { data, error } = await query;
    if (error || !Array.isArray(data)) {
      return [];
    }

    return (data as SupabaseOrderRow[]).map((row) => ({
      orderId: row.order_id,
      userId: row.user_id || undefined,
      createdAt: row.created_at,
      customer: {
        fullName: row.customer_name,
        email: row.customer_email,
        phone: row.customer_phone,
        address: row.delivery_address,
        city: row.city,
        state: row.state,
        pinCode: row.pin_code,
        notes: row.notes || undefined,
      },
      items: Array.isArray(row.items) ? row.items : [],
      subtotal: Number(row.subtotal) || 0,
      shipping: Number(row.shipping) || 0,
      discount: Number(row.discount) || 0,
      promoCode: row.promo_code || undefined,
      total: Number(row.total) || 0,
      paymentMethod: (row.payment_method as PaymentMethod) || 'Cash on Delivery',
      paymentNote: row.payment_note || undefined,
      shippingDetails: row.shipping_details || undefined,
      status: (row.status as OrderStatus) || 'Order Placed',
      isDemo: true,
      syncedToSupabase: true,
    }));
  } catch {
    return [];
  }
}

export async function insertContactToSupabase(
  entry: ContactSubmission
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { error } = await supabase.from('contact_inquiries').insert({
      inquiry_id: entry.id,
      name: entry.name,
      email: entry.email,
      subject: entry.subject,
      message: entry.message,
      submitted_at: entry.submittedAt,
    });

    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unable to reach Supabase backend.',
    };
  }
}
