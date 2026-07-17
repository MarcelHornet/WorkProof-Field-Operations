create or replace function public.can_access_task(p_task uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(
  select 1 from public.tasks t
  where t.id=p_task and public.is_org_member(t.organisation_id) and (
    public.has_org_role(t.organisation_id,array['owner','viewer']::public.member_role[])
    or (public.has_org_role(t.organisation_id,array['manager']::public.member_role[]) and (t.manager_id=(select auth.uid()) or t.created_by=(select auth.uid())))
    or t.assignee_id=(select auth.uid())
    or exists(select 1 from public.team_members tm where tm.team_id=t.team_id and tm.user_id=(select auth.uid()))
  )
 )
$$;

drop policy if exists tasks_read on public.tasks;
create policy tasks_read on public.tasks for select to authenticated using(public.can_access_task(id));

drop policy if exists tasks_create on public.tasks;
create policy tasks_create on public.tasks for insert to authenticated with check(
 created_by=(select auth.uid()) and (
  public.has_org_role(organisation_id,array['owner']::public.member_role[])
  or (public.has_org_role(organisation_id,array['manager']::public.member_role[]) and manager_id=(select auth.uid()))
 )
);

drop policy if exists tasks_manage on public.tasks;
create policy tasks_manage on public.tasks for update to authenticated
using(public.has_org_role(organisation_id,array['owner']::public.member_role[]) or (public.has_org_role(organisation_id,array['manager']::public.member_role[]) and manager_id=(select auth.uid())))
with check(public.has_org_role(organisation_id,array['owner']::public.member_role[]) or (public.has_org_role(organisation_id,array['manager']::public.member_role[]) and manager_id=(select auth.uid())));

create or replace function public.change_task_status(p_task_id uuid,p_from public.task_status[],p_to public.task_status,p_note text default null,p_manager_only boolean default false) returns void language plpgsql security definer set search_path='' as $$
declare v public.tasks; v_evidence int;
begin
 select * into v from public.tasks where id=p_task_id for update; if not found then raise exception 'Task not found'; end if;
 if p_manager_only then
  if not (public.has_org_role(v.organisation_id,array['owner']::public.member_role[]) or (public.has_org_role(v.organisation_id,array['manager']::public.member_role[]) and v.manager_id=(select auth.uid()))) then raise exception 'Only the responsible manager or an owner may review this task'; end if;
 elsif not public.can_access_task(v.id) then raise exception 'Task access denied'; end if;
 if not(v.status=any(p_from)) then raise exception 'Task cannot move from % to %',v.status,p_to; end if;
 if p_to='awaiting_review' and v.evidence_requirement<>'none' then select count(*) into v_evidence from public.task_evidence where task_id=v.id; if v_evidence=0 then raise exception 'Required photo evidence is missing'; end if; end if;
 update public.tasks set status=p_to,started_at=case when p_to='in_progress' then coalesce(started_at,now()) else started_at end,submitted_at=case when p_to='awaiting_review' then now() else submitted_at end,approved_at=case when p_to='approved' then now() else approved_at end,rework_reason=case when p_to='rework' then p_note else rework_reason end where id=v.id;
 insert into public.task_events(organisation_id,task_id,event_type,from_status,to_status,note,actor_id) values(v.organisation_id,v.id,'status_changed',v.status,p_to,p_note,(select auth.uid()));
end $$;
revoke all on function public.change_task_status(uuid,public.task_status[],public.task_status,text,boolean) from public,anon,authenticated;
