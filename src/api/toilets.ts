import { supabase } from '../lib/supabase';
import { Toilet, ToiletType, Photo } from '../types';

export async function getNearbyToilets(lat: number, lng: number, radiusMeters = 1000) {
  const { data, error } = await supabase.rpc('toilets_nearby', {
    user_lat: lat,
    user_lng: lng,
    radius_meters: radiusMeters,
  });
  if (error) throw error;
  return data as Toilet[];
}

export async function getToiletById(id: string) {
  const { data, error } = await supabase
    .from('toilets')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Toilet;
}

export async function reportToilet(toilet: {
  name?: string;
  lat: number;
  lng: number;
  type: ToiletType;
  wheelchair?: boolean;
  baby_change?: boolean;
  opening_hours?: string;
  created_by: string;
}) {
  const { data, error } = await supabase
    .from('toilets')
    .insert({ ...toilet, source: 'user', status: 'unverified' })
    .select()
    .single();
  if (error) throw error;
  return data as Toilet;
}

export async function getToiletPhotos(toiletId: string) {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('toilet_id', toiletId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Photo[];
}

export async function getToiletsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from('toilets')
    .select('*')
    .in('id', ids);
  if (error) throw error;
  return data as Toilet[];
}
