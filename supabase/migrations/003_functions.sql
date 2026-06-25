-- Keep geom in sync with lat/lng on insert/update.
create or replace function set_toilet_geom()
returns trigger as $$
begin
  new.geom := ST_SetSRID(ST_MakePoint(new.lng, new.lat), 4326)::geography;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_toilet_geom on toilets;
create trigger trg_set_toilet_geom
  before insert or update of lat, lng on toilets
  for each row execute function set_toilet_geom();

-- Backfill geom for any existing rows (e.g. seeded before trigger existed).
update toilets
  set geom = ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
  where geom is null;

-- toilets_nearby: returns toilets within radius (meters) ordered by distance.
create or replace function toilets_nearby(
  user_lat double precision,
  user_lng double precision,
  radius_meters double precision default 1000
)
returns table (
  id uuid,
  source toilet_source,
  osm_id bigint,
  name text,
  lat double precision,
  lng double precision,
  type toilet_type,
  price_cents integer,
  currency text,
  wheelchair boolean,
  baby_change boolean,
  opening_hours text,
  partner_id uuid,
  status toilet_status,
  last_confirmed_at timestamptz,
  freshness_score integer,
  created_by uuid,
  created_at timestamptz,
  distance_meters double precision
)
language sql
stable
as $$
  select
    t.id, t.source, t.osm_id, t.name, t.lat, t.lng, t.type, t.price_cents,
    t.currency, t.wheelchair, t.baby_change, t.opening_hours, t.partner_id,
    t.status, t.last_confirmed_at, t.freshness_score, t.created_by, t.created_at,
    ST_Distance(
      t.geom,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) as distance_meters
  from toilets t
  where t.status != 'reported_closed'
    and t.geom is not null
    and ST_DWithin(
      t.geom,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_meters
    )
  order by distance_meters asc
  limit 200;
$$;

-- Freshness: when 'accurate' feedback arrives, mark confirmed + bump score.
-- When 'closed' feedback arrives, decrement score and flag if it crosses threshold.
create or replace function update_freshness()
returns trigger as $$
begin
  if new.vote = 'accurate' then
    update toilets
      set last_confirmed_at = now(),
          freshness_score = least(freshness_score + 1, 100),
          status = case when status = 'unverified' then 'active' else status end
      where id = new.toilet_id;
  elsif new.vote in ('closed', 'not_found') then
    update toilets
      set freshness_score = greatest(freshness_score - 2, -10),
          status = case
            when freshness_score - 2 <= -4 then 'reported_closed'::toilet_status
            else status
          end
      where id = new.toilet_id;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_update_freshness on feedback;
create trigger trg_update_freshness
  after insert on feedback
  for each row execute function update_freshness();
