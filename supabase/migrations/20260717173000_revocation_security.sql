create or replace function public.can_access_task(p_task uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(
  select 1 from public.tasks t
  where t.id=p_task
    and public.is_org_member(t.organisation_id)
    and (
      public.has_org_role(t.organisation_id,array['owner','manager','viewer']::public.member_role[])
      or t.assignee_id=(select auth.uid())
      or exists(select 1 from public.team_members tm where tm.team_id=t.team_id and tm.user_id=(select auth.uid()))
    )
 )
$$;

drop policy if exists tasks_read on public.tasks;
create policy tasks_read on public.tasks for select to authenticated using(
 public.is_org_member(organisation_id) and (
  public.has_org_role(organisation_id,array['owner','manager','viewer']::public.member_role[])
  or assignee_id=(select auth.uid())
  or exists(select 1 from public.team_members tm where tm.team_id=tasks.team_id and tm.user_id=(select auth.uid()))
 )
);
