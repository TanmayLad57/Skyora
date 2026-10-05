-- =========================================
-- SKYORA SUPABASE DATABASE SCHEMA
-- =========================================

-- 1. USER PREFERENCES
create table public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activities text[] default '{}',
  preferred_units text default 'metric',
  morning_or_evening text,
  commute_start time,
  commute_end time,
  notifications_enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);


-- 2. LOCATIONS
create table public.locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text,
  city_name text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz default now()
);


-- 3. FEEDBACK
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recommendation_id text,
  feedback_type text check (feedback_type in ('positive', 'negative')),
  created_at timestamptz default now()
);


-- 4. RECOMMENDATIONS
create table public.recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recommendation_type text,
  content jsonb,
  created_at timestamptz default now()
);


-- 5. INTERACTIONS
create table public.interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  screen_viewed text,
  created_at timestamptz default now()
);


-- =========================================
-- ENABLE ROW LEVEL SECURITY
-- =========================================

alter table public.user_preferences enable row level security;
alter table public.locations enable row level security;
alter table public.feedback enable row level security;
alter table public.recommendations enable row level security;
alter table public.interactions enable row level security;


-- =========================================
-- RLS POLICIES
-- =========================================

-- USER PREFERENCES

create policy "Users can view own preferences"
on public.user_preferences
for select
using (auth.uid() = user_id);

create policy "Users can insert own preferences"
on public.user_preferences
for insert
with check (auth.uid() = user_id);

create policy "Users can update own preferences"
on public.user_preferences
for update
using (auth.uid() = user_id);


-- LOCATIONS

create policy "Users can manage own locations"
on public.locations
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


-- FEEDBACK

create policy "Users can manage own feedback"
on public.feedback
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


-- RECOMMENDATIONS

create policy "Users can manage own recommendations"
on public.recommendations
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


-- INTERACTIONS

create policy "Users can manage own interactions"
on public.interactions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


-- =========================================
-- TABLE PERMISSIONS
-- =========================================

grant select, insert, update, delete
on table public.user_preferences
to authenticated;

grant select, insert, update, delete
on table public.locations
to authenticated;

grant select, insert, update, delete
on table public.feedback
to authenticated;

grant select, insert, update, delete
on table public.recommendations
to authenticated;

grant select, insert, update, delete
on table public.interactions
to authenticated;