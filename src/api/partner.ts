import { supabase } from '../lib/supabase';
import { nanoid } from 'nanoid/non-secure';
import { Toilet, PartnerQR } from '../types';

export async function registerPartnerBusiness(
  partnerId: string,
  business: {
    name: string;
    lat: number;
    lng: number;
    price_cents: number;
    wheelchair?: boolean;
    baby_change?: boolean;
    opening_hours?: string;
  }
) {
  const { data: toilet, error: toiletErr } = await supabase
    .from('toilets')
    .insert({
      ...business,
      source: 'partner',
      type: 'partner',
      partner_id: partnerId,
      status: 'active',
    })
    .select()
    .single();
  if (toiletErr) throw toiletErr;

  const qrToken = nanoid(16);
  const { data: qr, error: qrErr } = await supabase
    .from('partner_qr')
    .insert({ partner_id: partnerId, toilet_id: toilet.id, qr_token: qrToken })
    .select()
    .single();
  if (qrErr) throw qrErr;

  return { toilet: toilet as Toilet, qr: qr as PartnerQR };
}

export async function getPartnerToilet(partnerId: string) {
  const { data, error } = await supabase
    .from('toilets')
    .select('*')
    .eq('partner_id', partnerId)
    .eq('type', 'partner')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as Toilet | null;
}

export async function updatePartnerToilet(
  toiletId: string,
  updates: Partial<{
    name: string;
    price_cents: number;
    wheelchair: boolean;
    baby_change: boolean;
    opening_hours: string;
  }>
) {
  const { data, error } = await supabase
    .from('toilets')
    .update(updates)
    .eq('id', toiletId)
    .select()
    .single();
  if (error) throw error;
  return data as Toilet;
}

export async function getPartnerQR(partnerId: string) {
  const { data, error } = await supabase
    .from('partner_qr')
    .select('*, toilets(*)')
    .eq('partner_id', partnerId)
    .eq('active', true)
    .single();
  if (error) throw error;
  return data;
}

export async function resolveQRToken(token: string) {
  const { data, error } = await supabase
    .from('partner_qr')
    .select('*, profiles(*), toilets(*)')
    .eq('qr_token', token)
    .eq('active', true)
    .single();
  if (error) throw error;
  return data;
}
