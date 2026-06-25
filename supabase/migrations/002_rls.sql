-- Enable RLS
alter table profiles enable row level security;
alter table toilets enable row level security;
alter table feedback enable row level security;
alter table photos enable row level security;
alter table partner_qr enable row level security;
alter table payments enable row level security;
alter table partner_payout_accounts enable row level security;

-- profiles: user can read/update own profile
create policy "users can read own profile" on profiles for select using (auth.uid() = id);
create policy "users can update own profile" on profiles for update using (auth.uid() = id);
create policy "users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- toilets: everyone can read non-closed toilets; authenticated users can insert; partners can update own
create policy "anyone can read toilets" on toilets for select using (status != 'reported_closed');
create policy "auth users can insert toilets" on toilets for insert with check (auth.uid() is not null);
create policy "partners can update own toilet" on toilets for update using (auth.uid() = partner_id);

-- feedback: authenticated users can insert own; reads open
create policy "auth users can insert feedback" on feedback for insert with check (auth.uid() = user_id);
create policy "users can read feedback" on feedback for select using (true);

-- photos: authenticated users can insert own; reads open
create policy "auth users can insert photos" on photos for insert with check (auth.uid() = user_id);
create policy "anyone can read photos" on photos for select using (true);

-- partner_qr: partners can manage own QR; anyone can read active QRs for scanning
create policy "partners can manage own qr" on partner_qr for all using (auth.uid() = partner_id);
create policy "anyone can read active qr" on partner_qr for select using (active = true);

-- payments: users see/insert own payments; partners see payments on their toilet
create policy "users can insert own payments" on payments for insert with check (auth.uid() = user_id);
create policy "users can read own payments" on payments for select using (auth.uid() = user_id or auth.uid() = partner_id);

-- partner_payout_accounts: partners only
create policy "partners manage own payout" on partner_payout_accounts for all using (auth.uid() = partner_id);
