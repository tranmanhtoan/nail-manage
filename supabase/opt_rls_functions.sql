-- 1. Helper functions with security definer and stable attributes
-- Using STABLE allows PostgreSQL to cache the function result for the lifetime of a query statement,
-- completely avoiding the N+1 query performance bottleneck.

create or replace function public.is_owner()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'owner'
  );
$$ language sql security definer stable;

create or replace function public.is_employee()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'employee'
  );
$$ language sql security definer stable;

create or replace function public.is_kiosk()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'kiosk'
  );
$$ language sql security definer stable;

-- Grant permissions so the helper functions can be executed by everyone
grant execute on function public.is_owner() to anon, authenticated;
grant execute on function public.is_employee() to anon, authenticated;
grant execute on function public.is_kiosk() to anon, authenticated;

-- 2. Re-create RLS Policies to use the optimized functions

-- Table: employees
drop policy if exists "Owner full access" on public.employees;
create policy "Owner full access" on public.employees for all
  using (public.is_owner());

drop policy if exists "Employee read active employees" on public.employees;
create policy "Employee read active employees" on public.employees for select
  using (public.is_employee() and is_active = true);

drop policy if exists "Kiosk read employees" on public.employees;
create policy "Kiosk read employees" on public.employees for select
  using (public.is_kiosk() and is_active = true);

-- Table: services
drop policy if exists "Owner full access" on public.services;
create policy "Owner full access" on public.services for all
  using (public.is_owner());

drop policy if exists "Kiosk read services" on public.services;
create policy "Kiosk read services" on public.services for select
  using (public.is_kiosk() and is_active = true);

-- Table: customers
drop policy if exists "Owner full access" on public.customers;
create policy "Owner full access" on public.customers for all
  using (public.is_owner());

-- Table: appointments
drop policy if exists "Owner full access" on public.appointments;
create policy "Owner full access" on public.appointments for all
  using (public.is_owner());

drop policy if exists "Kiosk insert appointments" on public.appointments;
create policy "Kiosk insert appointments" on public.appointments for insert
  with check (public.is_kiosk() and source = 'walk_in');

drop policy if exists "Kiosk read appointments" on public.appointments;
create policy "Kiosk read appointments" on public.appointments for select
  using (public.is_kiosk());

-- Table: profiles
drop policy if exists "Owner read all profiles" on public.profiles;
create policy "Owner read all profiles" on public.profiles for select
  using (public.is_owner());
