-- Add status column to memberships table
-- "inactive" = user signed up but hasn't completed their profile yet
-- "active"  = user has completed their profile

alter table memberships
  add column status text not null default 'active'
  check (status in ('inactive', 'active'));

-- Backfill: all existing memberships are completed profiles
update memberships set status = 'active';
