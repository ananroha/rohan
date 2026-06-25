export type UserRole = 'user' | 'partner';
export type ToiletSource = 'osm' | 'user' | 'partner';
export type ToiletType = 'free' | 'paid' | 'partner';
export type ToiletStatus = 'active' | 'reported_closed' | 'unverified';
export type FeedbackVote = 'accurate' | 'closed' | 'wrong_location' | 'not_found';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'mock';

export interface Profile {
  id: string;
  role: UserRole;
  display_name: string | null;
  credits_cents: number;
  created_at: string;
}

export interface Toilet {
  id: string;
  source: ToiletSource;
  osm_id: number | null;
  name: string | null;
  lat: number;
  lng: number;
  type: ToiletType;
  price_cents: number;
  currency: string;
  wheelchair: boolean | null;
  baby_change: boolean | null;
  opening_hours: string | null;
  partner_id: string | null;
  status: ToiletStatus;
  last_confirmed_at: string | null;
  freshness_score: number;
  created_by: string | null;
  created_at: string;
  distance_meters?: number;
}

export interface Feedback {
  id: string;
  toilet_id: string;
  user_id: string;
  vote: FeedbackVote;
  comment: string | null;
  created_at: string;
}

export interface Photo {
  id: string;
  toilet_id: string;
  user_id: string;
  storage_path: string;
  created_at: string;
}

export interface PartnerQR {
  id: string;
  partner_id: string;
  toilet_id: string;
  qr_token: string;
  active: boolean;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  partner_id: string;
  toilet_id: string;
  amount_cents: number;
  currency: string;
  status: PaymentStatus;
  provider: string | null;
  provider_ref: string | null;
  created_at: string;
}

export type FilterType = 'all' | 'free' | 'paid' | 'partner' | 'accessible';
