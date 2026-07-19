drop policy if exists teams_manage on public.teams;
drop policy if exists projects_manage on public.projects;

drop policy if exists teams_insert_owner on public.teams;
drop policy if exists teams_update_owner_manager on public.teams;
drop policy if exists teams_delete_owner_manager on public.teams;
drop policy if exists projects_insert_owner on public.projects;
drop policy if exists projects_update_owner_manager on public.projects;
drop policy if exists projects_delete_owner_manager on public.projects;

create policy teams_insert_owner
on public.teams
for insert
to authenticated
with check (
  public.has_org_role(organisation_id, array['owner']::public.member_role[])
);

create policy teams_update_owner_manager
on public.teams
for update
to authenticated
using (
  public.has_org_role(organisation_id, array['owner','manager']::public.member_role[])
)
with check (
  public.has_org_role(organisation_id, array['owner','manager']::public.member_role[])
);

create policy teams_delete_owner_manager
on public.teams
for delete
to authenticated
using (
  public.has_org_role(organisation_id, array['owner','manager']::public.member_role[])
);

create policy projects_insert_owner
on public.projects
for insert
to authenticated
with check (
  public.has_org_role(organisation_id, array['owner']::public.member_role[])
);

create policy projects_update_owner_manager
on public.projects
for update
to authenticated
using (
  public.has_org_role(organisation_id, array['owner','manager']::public.member_role[])
)
with check (
  public.has_org_role(organisation_id, array['owner','manager']::public.member_role[])
);

create policy projects_delete_owner_manager
on public.projects
for delete
to authenticated
using (
  public.has_org_role(organisation_id, array['owner','manager']::public.member_role[])
);

comment on policy teams_insert_owner on public.teams is
'Only organisation owners may create teams.';

comment on policy projects_insert_owner on public.projects is
'Only organisation owners may create projects.';
