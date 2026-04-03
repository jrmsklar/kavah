-- Kavah initial schema

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================
-- Users (synced from Clerk)
-- ============================================
create table users (
  id uuid primary key default uuid_generate_v4(),
  clerk_id text unique not null,
  phone text unique not null,
  first_name text not null,
  last_name text not null,
  birthday date,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- Communities
-- ============================================
create table communities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  icon_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- Memberships
-- ============================================
create table memberships (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  community_id uuid not null references communities(id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, community_id)
);

-- ============================================
-- Prompt Sections
-- ============================================
create table prompt_sections (
  id uuid primary key default uuid_generate_v4(),
  community_id uuid not null references communities(id) on delete cascade,
  title text not null,
  step text not null check (step in ('basics', 'videos', 'profile')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- Prompts
-- ============================================
create table prompts (
  id uuid primary key default uuid_generate_v4(),
  section_id uuid not null references prompt_sections(id) on delete cascade,
  label text not null,
  type text not null check (type in ('text_input', 'single_select', 'multi_select', 'video', 'textarea')),
  sort_order int not null default 0,
  required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- Prompt Options
-- ============================================
create table prompt_options (
  id uuid primary key default uuid_generate_v4(),
  prompt_id uuid not null references prompts(id) on delete cascade,
  label text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- Responses
-- ============================================
create table responses (
  id uuid primary key default uuid_generate_v4(),
  prompt_id uuid not null references prompts(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (prompt_id, user_id)
);

-- ============================================
-- Tags
-- ============================================
create table tags (
  id uuid primary key default uuid_generate_v4(),
  response_id uuid not null references responses(id) on delete cascade,
  label text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- Matches
-- ============================================
create table matches (
  id uuid primary key default uuid_generate_v4(),
  community_id uuid not null references communities(id) on delete cascade,
  member1_id uuid not null references users(id) on delete cascade,
  member2_id uuid not null references users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'notified', 'viewed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (member1_id < member2_id)
);

-- ============================================
-- Indexes
-- ============================================
create index idx_memberships_user on memberships(user_id);
create index idx_memberships_community on memberships(community_id);
create index idx_prompt_sections_community on prompt_sections(community_id);
create index idx_prompts_section on prompts(section_id);
create index idx_prompt_options_prompt on prompt_options(prompt_id);
create index idx_responses_prompt on responses(prompt_id);
create index idx_responses_user on responses(user_id);
create index idx_tags_response on tags(response_id);
create index idx_matches_community on matches(community_id);
create index idx_matches_member1 on matches(member1_id);
create index idx_matches_member2 on matches(member2_id);

-- ============================================
-- Updated_at trigger function
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at trigger to all tables
create trigger set_updated_at before update on users for each row execute function update_updated_at();
create trigger set_updated_at before update on communities for each row execute function update_updated_at();
create trigger set_updated_at before update on memberships for each row execute function update_updated_at();
create trigger set_updated_at before update on prompt_sections for each row execute function update_updated_at();
create trigger set_updated_at before update on prompts for each row execute function update_updated_at();
create trigger set_updated_at before update on prompt_options for each row execute function update_updated_at();
create trigger set_updated_at before update on responses for each row execute function update_updated_at();
create trigger set_updated_at before update on tags for each row execute function update_updated_at();
create trigger set_updated_at before update on matches for each row execute function update_updated_at();
