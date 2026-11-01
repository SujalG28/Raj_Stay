-- ==============================================================================
-- RAJ STAY - SUPABASE SCHEMA SETUP SCRIPT (STEP 1)
-- ==============================================================================

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  email text,
  phone text,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now()
);

-- 2. ROOMS TABLE
create table if not exists public.rooms (
  id uuid default gen_random_uuid() primary key,
  type text not null check (type in ('single', 'double', 'triple')),
  capacity integer not null check (capacity in (1, 2, 3)),
  occupied integer not null default 0 check (occupied >= 0 and occupied <= capacity),
  price numeric(10, 2) not null,
  description text,
  created_at timestamptz not null default now()
);

-- 3. BOOKING REQUESTS TABLE
create table if not exists public.booking_requests (
  id uuid default gen_random_uuid() primary key,
  student_id uuid not null references public.profiles(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete restrict,
  id_proof text not null,
  permanent_address text not null,
  move_in_date date not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled', 'moved_out')),
  reject_reason text,
  created_at timestamptz not null default now()
);

-- 4. FEEDBACK TABLE
create table if not exists public.feedback (
  id uuid default gen_random_uuid() primary key,
  student_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  rating integer check (rating between 1 and 5),
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- SEED DATA (EXACTLY 3 ROOMS)
-- ==============================================================================
delete from public.rooms;

insert into public.rooms (type, capacity, occupied, price, description)
values
  (
    'single',
    1,
    0,
    8500.00,
    'Single occupancy room with personal study desk, wooden wardrobe, attached bathroom, and dedicated ventilation.'
  ),
  (
    'double',
    2,
    0,
    6000.00,
    'Double sharing room equipped with two separate beds, individual wardrobes, study desks, and attached bathroom.'
  ),
  (
    'triple',
    3,
    0,
    4500.00,
    'Triple sharing room with three single beds, personal storage lockers, spacious layout, and attached bathroom.'
  );

-- ==============================================================================
-- AUTH TRIGGER: AUTO-CREATE PROFILE ON SIGNUP
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'student'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Helper function to check if the current user is an admin
-- Uses security definer to avoid recursive RLS lookup on the profiles table
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.booking_requests enable row level security;
alter table public.feedback enable row level security;

-- PROFILES POLICIES
-- Students can read their own profile; Admin can read all profiles
create policy "Users can read own profile or admin reads all"
  on public.profiles
  for select
  using (auth.uid() = id or public.is_admin());

-- Students can update only their own profile; Admin can update any profile
create policy "Users can update own profile or admin updates all"
  on public.profiles
  for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- Admin full access to profiles
create policy "Admin can insert profiles"
  on public.profiles
  for insert
  with check (public.is_admin() or auth.uid() = id);

create policy "Admin can delete profiles"
  on public.profiles
  for delete
  using (public.is_admin());

-- ROOMS POLICIES
-- Anyone authenticated or student can read rooms
create policy "Anyone can read rooms"
  on public.rooms
  for select
  using (true);

-- Only admin can insert, update, or delete rooms
create policy "Admin can update rooms"
  on public.rooms
  for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admin can insert rooms"
  on public.rooms
  for insert
  with check (public.is_admin());

create policy "Admin can delete rooms"
  on public.rooms
  for delete
  using (public.is_admin());

-- BOOKING REQUESTS POLICIES
-- Students can read their own booking requests; Admin can read all
create policy "Students read own bookings or admin reads all"
  on public.booking_requests
  for select
  using (auth.uid() = student_id or public.is_admin());

-- Students can create booking requests for themselves
create policy "Students can insert own booking requests"
  on public.booking_requests
  for insert
  with check (auth.uid() = student_id);

-- Admin can update any booking request (approve, reject, etc.)
create policy "Admin can update booking requests"
  on public.booking_requests
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- Admin can delete booking requests
create policy "Admin can delete booking requests"
  on public.booking_requests
  for delete
  using (public.is_admin());

-- FEEDBACK POLICIES
-- Students can read own feedback, admin can read all feedback
create policy "Users read own feedback or admin reads all"
  on public.feedback
  for select
  using (auth.uid() = student_id or public.is_admin());

-- Students can create feedback
create policy "Students can insert feedback"
  on public.feedback
  for insert
  with check (auth.uid() = student_id);

-- Admin can update or delete feedback
create policy "Admin can update feedback"
  on public.feedback
  for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admin can delete feedback"
  on public.feedback
  for delete
  using (public.is_admin());
