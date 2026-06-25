import { supabase } from '../lib/supabase';
import { Payment } from '../types';

export async function mockPayment(
  userId: string,
  partnerId: string,
  toiletId: string,
  amountCents: number
) {
  // TODO v2: Stripe Connect
  const { data, error } = await supabase
    .from('payments')
    .insert({
      user_id: userId,
      partner_id: partnerId,
      toilet_id: toiletId,
      amount_cents: amountCents,
      status: 'mock',
    })
    .select()
    .single();
  if (error) throw error;
  return data as Payment;
}

export async function getUserPayments(userId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*, toilets(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getPartnerPayments(partnerId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('partner_id', partnerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Payment[];
}
