-- Sathi Database Schema
-- Run this in Supabase SQL editor

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- Extended user data on top of Supabase auth.users
-- ============================================================
create table if not exists public.profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  role          text not null check (role in ('nri_child', 'elderly_parent')),
  full_name     text,
  phone         text,
  email         text,
  date_of_birth date,
  -- Health context (for elderly parents)
  conditions    text[],   -- e.g. ['hypertension', 'diabetes']
  medications   jsonb,    -- [{ name, dose, frequency }]
  -- Preferences
  language      text default 'en',
  timezone      text default 'Asia/Kolkata',
  -- Meta
  onboarding_complete boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ============================================================
-- FAMILIES
-- Links NRI children to elderly parents
-- ============================================================
create table if not exists public.families (
  id            uuid default uuid_generate_v4() primary key,
  nri_user_id   uuid references public.profiles(id) on delete cascade not null,
  parent_user_id uuid references public.profiles(id) on delete set null,
  -- Invite state (before parent registers)
  invite_phone  text,
  invite_token  text unique,
  invite_sent_at timestamptz,
  invite_accepted_at timestamptz,
  -- Relationship label
  relationship  text default 'Parent', -- 'Father', 'Mother', 'Parent'
  -- Meta
  created_at    timestamptz default now()
);

alter table public.families enable row level security;

create policy "NRI can manage their family links"
  on public.families for all
  using (auth.uid() = nri_user_id);

create policy "Parents can view their family links"
  on public.families for select
  using (auth.uid() = parent_user_id);

-- ============================================================
-- HEALTH READINGS
-- All health metric readings from elderly parents
-- ============================================================
create table if not exists public.health_readings (
  id              uuid default uuid_generate_v4() primary key,
  parent_user_id  uuid references public.profiles(id) on delete cascade not null,
  -- Metric type
  metric_type     text not null check (metric_type in (
    'blood_pressure', 'blood_glucose', 'spo2', 'weight', 'heart_rate', 'temperature', 'steps'
  )),
  -- Values (flexible for different metric types)
  value_primary   numeric,          -- main value (glucose, spo2, weight, hr)
  value_secondary numeric,          -- diastolic BP
  unit            text,             -- mmHg, mg/dL, %, kg, bpm, °C
  -- For BP specifically
  systolic        numeric,
  diastolic       numeric,
  -- Source
  entry_method    text default 'photo' check (entry_method in ('photo', 'manual', 'device_sync')),
  photo_url       text,             -- Supabase Storage URL of source photo
  ai_confidence   text check (ai_confidence in ('high', 'medium', 'low')),
  -- Status
  is_abnormal     boolean default false,
  notes           text,
  -- Time
  recorded_at     timestamptz default now(),
  created_at      timestamptz default now()
);

alter table public.health_readings enable row level security;

create policy "Parents can insert their own readings"
  on public.health_readings for insert
  with check (auth.uid() = parent_user_id);

create policy "Parents can view their own readings"
  on public.health_readings for select
  using (auth.uid() = parent_user_id);

create policy "NRI children can view linked parent readings"
  on public.health_readings for select
  using (
    exists (
      select 1 from public.families
      where families.nri_user_id = auth.uid()
      and families.parent_user_id = health_readings.parent_user_id
    )
  );

-- Index for fast date-range queries per parent
create index idx_health_readings_parent_date
  on public.health_readings(parent_user_id, recorded_at desc);

-- ============================================================
-- MEDICATIONS
-- Medication list + reminder schedule
-- ============================================================
create table if not exists public.medications (
  id              uuid default uuid_generate_v4() primary key,
  parent_user_id  uuid references public.profiles(id) on delete cascade not null,
  name            text not null,
  dose            text,               -- e.g. "500mg"
  frequency       text,               -- e.g. "twice daily"
  reminder_times  text[],             -- ["08:00", "20:00"]
  is_active       boolean default true,
  created_at      timestamptz default now()
);

alter table public.medications enable row level security;

create policy "Parents manage their own medications"
  on public.medications for all
  using (auth.uid() = parent_user_id);

create policy "NRI can view linked parent medications"
  on public.medications for select
  using (
    exists (
      select 1 from public.families
      where families.nri_user_id = auth.uid()
      and families.parent_user_id = medications.parent_user_id
    )
  );

-- ============================================================
-- DAILY SUMMARIES
-- AI-generated daily health summaries
-- ============================================================
create table if not exists public.daily_summaries (
  id              uuid default uuid_generate_v4() primary key,
  parent_user_id  uuid references public.profiles(id) on delete cascade not null,
  summary_date    date not null,
  -- AI content
  summary_text    text,               -- Full AI text summary
  summary_short   text,               -- 1-sentence teaser
  health_score    integer,            -- 0–100 overall health score for the day
  -- Status flags
  has_concerns    boolean default false,
  concern_level   text check (concern_level in ('normal', 'watch', 'alert', 'urgent')),
  -- Delivery
  sms_sent        boolean default false,
  email_sent      boolean default false,
  whatsapp_sent   boolean default false,
  -- Meta
  generated_at    timestamptz default now(),
  unique(parent_user_id, summary_date)
);

alter table public.daily_summaries enable row level security;

create policy "Parents can view their own summaries"
  on public.daily_summaries for select
  using (auth.uid() = parent_user_id);

create policy "NRI can view linked parent summaries"
  on public.daily_summaries for select
  using (
    exists (
      select 1 from public.families
      where families.nri_user_id = auth.uid()
      and families.parent_user_id = daily_summaries.parent_user_id
    )
  );

create policy "Service role can insert/update summaries"
  on public.daily_summaries for all
  using (true);

-- ============================================================
-- ALERTS
-- Real-time health alerts sent to NRI children
-- ============================================================
create table if not exists public.alerts (
  id              uuid default uuid_generate_v4() primary key,
  parent_user_id  uuid references public.profiles(id) on delete cascade not null,
  nri_user_id     uuid references public.profiles(id) on delete cascade not null,
  alert_type      text not null check (alert_type in (
    'high_bp', 'low_spo2', 'high_glucose', 'low_glucose',
    'missed_checkin', 'sos', 'medication_missed', 'abnormal_reading'
  )),
  message         text not null,
  metric_type     text,
  metric_value    text,
  severity        text default 'medium' check (severity in ('low', 'medium', 'high', 'critical')),
  is_read         boolean default false,
  created_at      timestamptz default now()
);

alter table public.alerts enable row level security;

create policy "NRI can view their alerts"
  on public.alerts for select
  using (auth.uid() = nri_user_id);

create policy "NRI can update (mark read) their alerts"
  on public.alerts for update
  using (auth.uid() = nri_user_id);

-- ============================================================
-- SUBSCRIPTIONS
-- Razorpay subscription tracking
-- ============================================================
create table if not exists public.subscriptions (
  id                    uuid default uuid_generate_v4() primary key,
  nri_user_id           uuid references public.profiles(id) on delete cascade not null unique,
  plan                  text not null check (plan in ('base', 'standard', 'premium')),
  status                text default 'trial' check (status in ('trial', 'active', 'past_due', 'cancelled', 'expired')),
  -- Razorpay identifiers
  razorpay_customer_id  text,
  razorpay_sub_id       text,
  razorpay_payment_id   text,
  -- Billing
  amount_inr            integer,      -- in paise
  billing_cycle         text default 'monthly',
  current_period_start  timestamptz,
  current_period_end    timestamptz,
  -- Trial
  trial_ends_at         timestamptz default (now() + interval '14 days'),
  -- Meta
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

alter table public.subscriptions enable row level security;

create policy "NRI can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = nri_user_id);

-- ============================================================
-- HELPER FUNCTION: auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, phone, role)
  values (
    new.id,
    new.email,
    new.phone,
    coalesce(new.raw_user_meta_data->>'role', 'nri_child')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- HELPER FUNCTION: updated_at trigger
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure update_updated_at();

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure update_updated_at();
