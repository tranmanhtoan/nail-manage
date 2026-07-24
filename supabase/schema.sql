-- MCC Nail & Spa Database Schema
-- Run this in Supabase SQL Editor to set up your database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (linked to Supabase Auth users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null,
  role text not null default 'employee' check (role in ('owner', 'employee', 'kiosk')),
  phone text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Employees
create table public.employees (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id),
  name text not null,
  phone text,
  email text,
  pay_type text not null default 'commission' check (pay_type in ('commission', 'fixed', 'split')),
  commission_rate numeric,
  fixed_salary numeric,
  split_rate numeric,
  rotation_order integer not null default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Services
create table public.services (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  category text not null default 'other',
  price numeric not null default 0,
  duration_minutes integer not null default 30,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Customers
create table public.customers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  phone text,
  email text,
  notes text,
  created_at timestamptz default now()
);

-- Appointments
create table public.appointments (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references public.customers(id),
  employee_id uuid references public.employees(id),
  service_id uuid references public.services(id) not null,
  status text not null default 'booked' check (status in ('booked', 'in_progress', 'completed', 'cancelled', 'no_show')),
  date date not null,
  time time not null,
  price numeric not null default 0,
  tip numeric not null default 0,
  notes text,
  source text not null default 'walk_in' check (source in ('walk_in', 'online')),
  payment_method text not null default 'cash' check (payment_method in ('cash', 'card')),
  created_at timestamptz default now()
);

-- Indexes for common queries
create index idx_appointments_date on public.appointments(date);
create index idx_appointments_employee on public.appointments(employee_id);
create index idx_appointments_status on public.appointments(status);
create index idx_employees_active on public.employees(is_active);
create index idx_customers_phone on public.customers(phone);

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.employees enable row level security;
alter table public.services enable row level security;
alter table public.customers enable row level security;
alter table public.appointments enable row level security;

-- Policies: Owner can do everything
create policy "Owner full access" on public.employees for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'owner'));

create policy "Owner full access" on public.services for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'owner'));

create policy "Owner full access" on public.customers for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'owner'));

create policy "Owner full access" on public.appointments for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'owner'));

-- Policies: Employee can read services, own appointments, own employee record
create policy "Employee read services" on public.services for select
  using (auth.uid() is not null);

create policy "Employee own data" on public.employees for select
  using (profile_id = auth.uid());

create policy "Employee own appointments" on public.appointments for select
  using (employee_id in (select id from public.employees where profile_id = auth.uid()));

create policy "Employee create appointments" on public.appointments for insert
  with check (
    employee_id in (select id from public.employees where profile_id = auth.uid())
  );

create policy "Employee update own appointments" on public.appointments for update
  using (employee_id in (select id from public.employees where profile_id = auth.uid()));

create policy "Employee read customers" on public.customers for select
  using (auth.uid() is not null);

create policy "Employee create customers" on public.customers for insert
  with check (auth.uid() is not null);

-- Kiosk mode: kiosk role can read active employees and insert walk-in appointments
create policy "Kiosk read employees" on public.employees for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'kiosk') and is_active = true);

create policy "Kiosk insert appointments" on public.appointments for insert
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'kiosk') and source = 'walk_in');

create policy "Kiosk read appointments" on public.appointments for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'kiosk'));

create policy "Kiosk read services" on public.services for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'kiosk') and is_active = true);

-- Public booking: anyone can insert appointments (for online booking page)
create policy "Public booking insert" on public.appointments for insert
  with check (source = 'online' and status = 'booked');

create policy "Public read services" on public.services for select
  using (is_active = true);

create policy "Public create customer" on public.customers for insert
  with check (true);

-- Profile policies
create policy "Users read own profile" on public.profiles for select
  using (id = auth.uid());

create policy "Owner read all profiles" on public.profiles for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'owner'));

-- Secure view for login screen (only exposes id, full_name, role — no email)
create view public.login_profiles as
  select id, full_name, role
  from public.profiles
  where role in ('owner', 'employee');

-- Grant anonymous and authenticated access to the view
grant select on public.login_profiles to anon, authenticated;

-- RPC function to get email by profile ID (used internally during login)
create or replace function public.get_login_email(profile_id uuid)
returns text as $$
  select email from public.profiles where id = profile_id and role in ('owner', 'employee');
$$ language sql security definer;

grant execute on function public.get_login_email(uuid) to anon, authenticated;

-- Function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''), 
          coalesce(new.raw_user_meta_data->>'role', 'employee'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Shop Settings (key-value store for feature toggles and config)
create table public.shop_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

alter table public.shop_settings enable row level security;

create policy "Owner full access" on public.shop_settings for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'owner'));

create policy "All authenticated read" on public.shop_settings for select
  using (auth.uid() is not null);

-- Allow anonymous read of kiosk_pin only (for PIN gate before login)
create policy "Public read kiosk_pin" on public.shop_settings for select
  using (key = 'kiosk_pin');

-- Default feature toggles
insert into public.shop_settings (key, value) values
  ('quick_entry_enabled', 'true'),
  ('appointments_enabled', 'true'),
  ('reports_enabled', 'true'),
  ('kiosk_pin', '1234');
