-- Fix the default for profile_status: was still 'active' from original migration,
-- but check constraint only allows 'incomplete' or 'complete'
alter table memberships alter column profile_status set default 'incomplete';
