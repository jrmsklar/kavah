-- User profiles (extended user attributes)
create table user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references users(id) on delete cascade,
  birthday date,
  height_inches integer,
  city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_user_profiles_user_id on user_profiles(user_id);
