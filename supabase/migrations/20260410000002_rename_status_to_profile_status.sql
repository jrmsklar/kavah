-- Rename status → profile_status and update values

-- Rename column (only if old name still exists)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'memberships' and column_name = 'status'
  ) then
    alter table memberships rename column status to profile_status;
  end if;
end $$;

-- Drop old check constraint if it exists
do $$
begin
  if exists (
    select 1 from information_schema.constraint_column_usage
    where table_name = 'memberships' and constraint_name = 'memberships_status_check'
  ) then
    alter table memberships drop constraint memberships_status_check;
  end if;
end $$;

-- Update "active" → "complete"
update memberships set profile_status = 'complete' where profile_status = 'active';

-- Add new check constraint if not already present
do $$
begin
  if not exists (
    select 1 from information_schema.constraint_column_usage
    where table_name = 'memberships' and constraint_name = 'memberships_profile_status_check'
  ) then
    alter table memberships
      add constraint memberships_profile_status_check
      check (profile_status in ('incomplete', 'complete'));
  end if;
end $$;
