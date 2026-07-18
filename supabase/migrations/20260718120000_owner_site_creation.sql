drop policy if exists sites_manage on public.sites;
drop policy if exists sites_create_owner on public.sites;
drop policy if exists sites_update_owner_manager on public.sites;

create policy sites_create_owner
on public.sites
for insert
to authenticated
with check (
  public.has_org_role(organisation_id, array['owner']::public.member_role[])
);

create policy sites_update_owner_manager
on public.sites
for update
to authenticated
using (
  public.has_org_role(organisation_id, array['owner','manager']::public.member_role[])
)
with check (
  public.has_org_role(organisation_id, array['owner','manager']::public.member_role[])
);

comment on policy sites_create_owner on public.sites is
'Owners may add sites and properties. No delete policy exists, so sites cannot be removed through the API.';
