-- Add 'admin' to the allowed roles for memberships
alter table memberships drop constraint memberships_role_check;
alter table memberships add constraint memberships_role_check check (role in ('owner', 'member', 'admin'));
