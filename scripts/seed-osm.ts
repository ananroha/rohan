import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const FRANKFURT_BBOX = '50.0,8.55,50.23,8.80'; // south,west,north,east

async function fetchOsmToilets() {
  const query = `
    [out:json][timeout:60];
    (
      node["amenity"="toilets"](${FRANKFURT_BBOX});
      way["amenity"="toilets"](${FRANKFURT_BBOX});
    );
    out center;
  `;
  const url = 'https://overpass-api.de/api/interpreter';
  const res = await fetch(url, {
    method: 'POST',
    body: query,
    headers: { 'Content-Type': 'text/plain' },
  });
  const data = (await res.json()) as any;
  return data.elements as any[];
}

function mapOsmToToilet(el: any) {
  const tags = el.tags || {};
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (!lat || !lng) return null;

  const fee = tags.fee === 'yes';
  const type = fee ? 'paid' : 'free';
  const price_cents = fee ? parseFloat(tags['fee:amount'] || '0') * 100 : 0;

  return {
    source: 'osm' as const,
    osm_id: el.id,
    name: tags.name || tags['name:en'] || null,
    lat,
    lng,
    type,
    price_cents: Math.round(price_cents),
    wheelchair: tags.wheelchair === 'yes' ? true : tags.wheelchair === 'no' ? false : null,
    baby_change: tags.changing_table === 'yes' ? true : null,
    opening_hours: tags.opening_hours || null,
    status: 'unverified' as const,
  };
}

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

async function main() {
  console.log('Fetching OSM toilets for Frankfurt...');
  const elements = await fetchOsmToilets();
  console.log(`Found ${elements.length} OSM elements`);

  const toilets = elements.map(mapOsmToToilet).filter(Boolean);
  console.log(`Mapped ${toilets.length} valid toilets`);

  let upserted = 0;
  for (const batch of chunk(toilets, 50)) {
    const { error } = await supabase
      .from('toilets')
      .upsert(batch as any, { onConflict: 'osm_id,source', ignoreDuplicates: false });
    if (error) console.error('Upsert error:', error);
    else upserted += batch.length;
  }
  console.log(`Upserted ${upserted} toilets`);
}

main().catch(console.error);
