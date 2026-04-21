-- ============================================================
-- MAMI'S ANGELS — Initial Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ============================================================
-- TABLES
-- ============================================================

-- service_types: property_type × bedroom_count → base_price
create table service_types (
  id             uuid primary key default gen_random_uuid(),
  property_type  text not null check (property_type in ('condo','house')),
  bedroom_count  text not null check (bedroom_count in ('studio','1br','2br','3br','4br')),
  base_price     numeric(10,2) not null
);

-- addons
create table addons (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  price        numeric(10,2) not null,
  unit         text not null,
  has_quantity boolean not null default false,
  is_active    boolean not null default true
);

-- users: extends auth.users
create table users (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text not null default '',
  phone      text,
  created_at timestamptz not null default now()
);

-- admins: separate table for role check
create table admins (
  id         uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- cleaners
create table cleaners (
  id        uuid primary key default gen_random_uuid(),
  full_name text not null,
  email     text,
  phone     text,
  is_active boolean not null default true
);

-- availability: specific date-based slots
create table availability (
  id         uuid primary key default gen_random_uuid(),
  cleaner_id uuid not null references cleaners(id) on delete cascade,
  date       date not null,
  start_time time not null,
  end_time   time not null,
  is_booked  boolean not null default false
);

create index idx_availability_cleaner on availability(cleaner_id);
create index idx_availability_date on availability(date);

-- bookings
create table bookings (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users(id),
  cleaner_id      uuid references cleaners(id),
  service_type_id uuid not null references service_types(id),
  booking_date    date not null,
  booking_time    time not null,
  status          text not null default 'pending'
                    check (status in ('pending','confirmed','completed','cancelled')),
  address         text not null,
  notes           text,
  total_price     numeric(10,2) not null,
  created_at      timestamptz not null default now()
);

create index idx_bookings_user on bookings(user_id);
create index idx_bookings_cleaner on bookings(cleaner_id);
create index idx_bookings_status on bookings(status);
create index idx_bookings_date on bookings(booking_date);

-- booking_addons
create table booking_addons (
  id         uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  addon_id   uuid not null references addons(id),
  quantity   integer not null default 1,
  unique(booking_id, addon_id)
);

-- notifications log
create table notifications (
  id         uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  type       text not null check (type in ('confirmation','reminder')),
  channel    text not null check (channel in ('sms','email')),
  status     text not null check (status in ('sent','failed')),
  sent_at    timestamptz not null default now()
);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create users row when auth user registers
create or replace function handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_auth_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Helper: is current user an admin?
create or replace function is_admin()
returns boolean language sql security definer stable as $$
  select exists (select 1 from public.admins where id = auth.uid());
$$;

-- service_types: public read, admin write
alter table service_types enable row level security;
create policy "public read" on service_types for select using (true);
create policy "admin write" on service_types for all to authenticated
  using (is_admin()) with check (is_admin());

-- addons: public read of active, admin write
alter table addons enable row level security;
create policy "public read" on addons for select using (is_active = true);
create policy "admin write" on addons for all to authenticated
  using (is_admin()) with check (is_admin());

-- users: own row + admins
alter table users enable row level security;
create policy "own read" on users for select to authenticated
  using (auth.uid() = id);
create policy "own update" on users for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);
create policy "admin all" on users for all to authenticated
  using (is_admin()) with check (is_admin());

-- admins: admins only
alter table admins enable row level security;
create policy "admin read" on admins for select to authenticated
  using (is_admin());

-- cleaners: authenticated read active, admin write
alter table cleaners enable row level security;
create policy "auth read" on cleaners for select to authenticated
  using (is_active = true);
create policy "admin write" on cleaners for all to authenticated
  using (is_admin()) with check (is_admin());

-- availability: authenticated read, admin write
alter table availability enable row level security;
create policy "auth read" on availability for select to authenticated
  using (true);
create policy "admin write" on availability for all to authenticated
  using (is_admin()) with check (is_admin());

-- bookings: own + admin
alter table bookings enable row level security;
create policy "own read" on bookings for select to authenticated
  using (auth.uid() = user_id);
create policy "own insert" on bookings for insert to authenticated
  with check (auth.uid() = user_id);
create policy "admin all" on bookings for all to authenticated
  using (is_admin()) with check (is_admin());

-- booking_addons: via booking ownership + admin
alter table booking_addons enable row level security;
create policy "own read" on booking_addons for select to authenticated
  using (exists (
    select 1 from bookings where id = booking_id and user_id = auth.uid()
  ));
create policy "own insert" on booking_addons for insert to authenticated
  with check (exists (
    select 1 from bookings where id = booking_id and user_id = auth.uid()
  ));
create policy "admin all" on booking_addons for all to authenticated
  using (is_admin()) with check (is_admin());

-- notifications: server writes via service role; admins can read
alter table notifications enable row level security;
create policy "admin all" on notifications for all to authenticated
  using (is_admin()) with check (is_admin());

-- ============================================================
-- SEED DATA
-- ============================================================

-- service_types: condo prices
insert into service_types (property_type, bedroom_count, base_price) values
  ('condo', 'studio', 649),
  ('condo', '1br',    749),
  ('condo', '2br',    949),
  ('condo', '3br',    1149),
  ('condo', '4br',    1399);

-- service_types: house prices
insert into service_types (property_type, bedroom_count, base_price) values
  ('house', 'studio', 1049),
  ('house', '1br',    1149),
  ('house', '2br',    1399),
  ('house', '3br',    1549),
  ('house', '4br',    1749);

-- addons
insert into addons (name, price, unit, has_quantity) values
  ('Extra bathroom',      100,  'bathroom', true),
  ('Disinfectant spray',  329,  'order',    false),
  ('Disinfectant fogging',329,  'order',    false),
  ('Dishwashing',         108,  '30 min',   true),
  ('Electric fan clean',  108,  '30 min',   true),
  ('Clothes folding',     118,  '30 min',   true),
  ('Fridge clean',        278,  'unit',     true),
  ('Car disinfectant',    328,  'vehicle',  true),
  ('Balcony clean',       218,  'balcony',  true),
  ('Cabinet cleaning',    168,  '30 min',   true),
  ('Storage room clean',  328,  '45 min',   true),
  ('Pet area cleaning',   168,  'order',    false),
  ('Sofa shampoo',        1298, 'order',    false);
