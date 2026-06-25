-- WeCe schema
-- Requires PostGIS for geo queries.
create extension if not exists postgis;

-- Enums
do $$ begin
  create type user_role as enum ('user', 'partner');
exception when duplicate_object then null; end $$;

do $$ begin
  create type toilet_source as enum ('osm', 'user', 'partner');
exception when duplicate_object then null; end $$;

do $$ begin
  create type toilet_type as enum ('free', 'paid', 'partner');
exception when duplicate_object then null; end $$;

do $$ begin
  create type toilet_status as enum ('active', 'reported_closed', 'unverified');
exception when duplicate_object then null; end $$;

do $$ begin
  create type feedback_vote as enum ('accurate', 'closed', 'wrong_location', 'not_found');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending', 'succeeded', 'failed', 'mock');
exception when duplicate_object then null; end $$;

-- profiles
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'user',
  display_name text,
  credits_cents integer not null default 0,
  created_at timestamptz not null default now()
);

-- toilets
create table if not exists toilets (
  id uuid primary key default gen_random_uuid(),
  source toilet_source not null default 'user',
  osm_id bigint,
  name text,
  lat double precision not null,
  lng double precision not null,
  geom geography(Point, 4326),
  type toilet_type not null default 'free',
  price_cents integer not null default 0,
  currency text not null default 'EUR',
  wheelchair boolean,
  baby_change boolean,
  opening_hours text,
  partner_id uuid references profiles(id) on delete set null,
  status toilet_status not null default 'unverified',
  last_confirmed_at timestamptz,
  freshness_score integer not null default 0,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- unique OSM identity to support idempotent seeding
create unique index if not exists toilets_osm_unique
  on toilets (osm_id, source)
  where osm_id is not null;

-- geo index
create index if not exists toilets_geom_idx on toilets using gist (geom);
create index if not exists toilets_type_idx on toilets (type);
create index if not exists toilets_partner_idx on toilets (partner_id);

-- feedback
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  toilet_id uuid not null references toilets(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  vote feedback_vote not null,
  comment text,
  created_at timestamptz not null default now()
);
create index if not exists feedback_toilet_idx on feedback (toilet_id);

-- photos
create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  toilet_id uuid not null references toilets(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  storage_path text not null,
  created_at timestamptz not null default now()
);
create index if not exists photos_toilet_idx on photos (toilet_id);

-- partner_qr
create table if not exists partner_qr (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references profiles(id) on delete cascade,
  toilet_id uuid not null references toilets(id) on delete cascade,
  qr_token text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists partner_qr_token_idx on partner_qr (qr_token);
create index if not exists partner_qr_partner_idx on partner_qr (partner_id);

-- payments
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  partner_id uuid not null references profiles(id) on delete cascade,
  toilet_id uuid not null references toilets(id) on delete cascade,
  amount_cents integer not null,
  currency text not null default 'EUR',
  status payment_status not null default 'pending',
  provider text,
  provider_ref text,
  created_at timestamptz not null default now()
);
create index if not exists payments_user_idx on payments (user_id);
create index if not exists payments_partner_idx on payments (partner_id);

-- partner_payout_accounts (v2 placeholder)
create table if not exists partner_payout_accounts (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references profiles(id) on delete cascade,
  provider text not null default 'stripe',
  provider_account_id text,
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists payout_partner_idx on partner_payout_accounts (partner_id);
