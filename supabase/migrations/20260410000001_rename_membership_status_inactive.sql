-- Rename membership status "inactive" to "incomplete"
-- Drop the old check constraint and add an updated one

alter table memberships drop constraint memberships_status_check;
alter table memberships
  add constraint memberships_status_check
  check (status in ('incomplete', 'active'));
