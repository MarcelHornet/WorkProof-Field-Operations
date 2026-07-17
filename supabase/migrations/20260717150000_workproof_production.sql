create extension if not exists pgcrypto;

create type public.member_role as enum ('owner','manager','team_lead','worker','viewer');
create type public.task_status as enum ('draft','assigned','accepted','in_progress','blocked','awaiting_review','approved','rework','closed');
create type public.task_priority as enum ('low','normal','high','urgent');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '', phone text, avatar_path text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.organisations (
  id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique,
  created_by uuid references public.profiles(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.organisation_members (
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.member_role not null default 'worker', active boolean not null default true,
  created_at timestamptz not null default now(), primary key (organisation_id,user_id)
);
create table public.businesses (
  id uuid primary key default gen_random_uuid(), organisation_id uuid not null references public.organisations(id) on delete cascade,
  name text not null, active boolean not null default true, created_at timestamptz not null default now(), unique(organisation_id,name)
);
create table public.sites (
  id uuid primary key default gen_random_uuid(), organisation_id uuid not null references public.organisations(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete set null, name text not null, address text,
  active boolean not null default true, created_at timestamptz not null default now(), unique(organisation_id,name), unique(id,organisation_id)
);
create table public.teams (
  id uuid primary key default gen_random_uuid(), organisation_id uuid not null references public.organisations(id) on delete cascade,
  name text not null, description text, active boolean not null default true, created_at timestamptz not null default now(), unique(organisation_id,name), unique(id,organisation_id)
);
create table public.team_members (
  organisation_id uuid not null, team_id uuid not null, user_id uuid not null,
  is_lead boolean not null default false, created_at timestamptz not null default now(), primary key(team_id,user_id),
  foreign key(team_id,organisation_id) references public.teams(id,organisation_id) on delete cascade,
  foreign key(organisation_id,user_id) references public.organisation_members(organisation_id,user_id) on delete cascade
);
create table public.projects (
  id uuid primary key default gen_random_uuid(), organisation_id uuid not null references public.organisations(id) on delete cascade,
  site_id uuid, name text not null, description text, active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,organisation_id),
  foreign key(site_id,organisation_id) references public.sites(id,organisation_id)
);
create table public.tasks (
  id uuid primary key default gen_random_uuid(), organisation_id uuid not null references public.organisations(id) on delete cascade,
  site_id uuid not null, project_id uuid, team_id uuid, assignee_id uuid, manager_id uuid,
  title text not null check(length(title) between 2 and 180), description text not null default '',
  status public.task_status not null default 'draft', priority public.task_priority not null default 'normal',
  evidence_requirement text not null default 'after' check(evidence_requirement in ('none','after','before_after')),
  due_at timestamptz, started_at timestamptz, submitted_at timestamptz, approved_at timestamptz,
  rework_reason text, created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,organisation_id),
  foreign key(site_id,organisation_id) references public.sites(id,organisation_id),
  foreign key(project_id,organisation_id) references public.projects(id,organisation_id),
  foreign key(team_id,organisation_id) references public.teams(id,organisation_id),
  foreign key(organisation_id,assignee_id) references public.organisation_members(organisation_id,user_id),
  foreign key(organisation_id,manager_id) references public.organisation_members(organisation_id,user_id)
);
create table public.task_evidence (
  id uuid primary key default gen_random_uuid(), organisation_id uuid not null, task_id uuid not null,
  evidence_type text not null check(evidence_type in ('before','during','after','document')),
  storage_path text not null unique, note text, uploaded_by uuid not null references public.profiles(id), created_at timestamptz not null default now(),
  foreign key(task_id,organisation_id) references public.tasks(id,organisation_id) on delete cascade
);
create table public.task_events (
  id bigint generated always as identity primary key, organisation_id uuid not null, task_id uuid not null,
  event_type text not null, from_status public.task_status, to_status public.task_status, note text,
  actor_id uuid not null references public.profiles(id), created_at timestamptz not null default now(),
  foreign key(task_id,organisation_id) references public.tasks(id,organisation_id) on delete cascade
);

create index tasks_org_status_idx on public.tasks(organisation_id,status);
create index tasks_assignee_open_idx on public.tasks(assignee_id,status) where status not in ('approved','closed');
create index tasks_team_idx on public.tasks(team_id);
create index tasks_due_idx on public.tasks(due_at) where status not in ('approved','closed');
create index evidence_task_idx on public.task_evidence(task_id,created_at);
create index team_members_user_idx on public.team_members(user_id);

create or replace function public.set_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now(); return new; end $$;
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger organisations_updated before update on public.organisations for each row execute function public.set_updated_at();
create trigger projects_updated before update on public.projects for each row execute function public.set_updated_at();
create trigger tasks_updated before update on public.tasks for each row execute function public.set_updated_at();

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin insert into public.profiles(id,full_name,phone) values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),new.raw_user_meta_data->>'phone'); return new; end $$;
revoke all on function public.handle_new_user() from public,anon,authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_org_member(p_org uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.organisation_members m where m.organisation_id=p_org and m.user_id=(select auth.uid()) and m.active)
$$;
create or replace function public.has_org_role(p_org uuid,p_roles public.member_role[]) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.organisation_members m where m.organisation_id=p_org and m.user_id=(select auth.uid()) and m.active and m.role=any(p_roles))
$$;
create or replace function public.can_access_task(p_task uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.tasks t where t.id=p_task and (public.has_org_role(t.organisation_id,array['owner','manager','viewer']::public.member_role[]) or t.assignee_id=(select auth.uid()) or exists(select 1 from public.team_members tm where tm.team_id=t.team_id and tm.user_id=(select auth.uid()))))
$$;
revoke all on function public.is_org_member(uuid),public.has_org_role(uuid,public.member_role[]),public.can_access_task(uuid) from public,anon;
grant execute on function public.is_org_member(uuid),public.has_org_role(uuid,public.member_role[]),public.can_access_task(uuid) to authenticated;

alter table public.profiles enable row level security; alter table public.organisations enable row level security;
alter table public.organisation_members enable row level security; alter table public.businesses enable row level security;
alter table public.sites enable row level security; alter table public.teams enable row level security;
alter table public.team_members enable row level security; alter table public.projects enable row level security;
alter table public.tasks enable row level security; alter table public.task_evidence enable row level security; alter table public.task_events enable row level security;

create policy profiles_read on public.profiles for select to authenticated using(id=(select auth.uid()) or exists(select 1 from public.organisation_members mine join public.organisation_members theirs on theirs.organisation_id=mine.organisation_id where mine.user_id=(select auth.uid()) and mine.active and theirs.user_id=profiles.id and theirs.active));
create policy profiles_self_update on public.profiles for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
create policy org_read on public.organisations for select to authenticated using(public.is_org_member(id));
create policy members_read on public.organisation_members for select to authenticated using(public.is_org_member(organisation_id));
create policy members_manage on public.organisation_members for all to authenticated using(public.has_org_role(organisation_id,array['owner']::public.member_role[])) with check(public.has_org_role(organisation_id,array['owner']::public.member_role[]));
create policy businesses_read on public.businesses for select to authenticated using(public.is_org_member(organisation_id));
create policy businesses_manage on public.businesses for all to authenticated using(public.has_org_role(organisation_id,array['owner','manager']::public.member_role[])) with check(public.has_org_role(organisation_id,array['owner','manager']::public.member_role[]));
create policy sites_read on public.sites for select to authenticated using(public.is_org_member(organisation_id));
create policy sites_manage on public.sites for all to authenticated using(public.has_org_role(organisation_id,array['owner','manager']::public.member_role[])) with check(public.has_org_role(organisation_id,array['owner','manager']::public.member_role[]));
create policy teams_read on public.teams for select to authenticated using(public.is_org_member(organisation_id));
create policy teams_manage on public.teams for all to authenticated using(public.has_org_role(organisation_id,array['owner','manager']::public.member_role[])) with check(public.has_org_role(organisation_id,array['owner','manager']::public.member_role[]));
create policy team_members_read on public.team_members for select to authenticated using(public.is_org_member(organisation_id));
create policy team_members_manage on public.team_members for all to authenticated using(public.has_org_role(organisation_id,array['owner','manager']::public.member_role[])) with check(public.has_org_role(organisation_id,array['owner','manager']::public.member_role[]));
create policy projects_read on public.projects for select to authenticated using(public.is_org_member(organisation_id));
create policy projects_manage on public.projects for all to authenticated using(public.has_org_role(organisation_id,array['owner','manager']::public.member_role[])) with check(public.has_org_role(organisation_id,array['owner','manager']::public.member_role[]));
create policy tasks_read on public.tasks for select to authenticated using(public.has_org_role(organisation_id,array['owner','manager','viewer']::public.member_role[]) or assignee_id=(select auth.uid()) or exists(select 1 from public.team_members tm where tm.team_id=tasks.team_id and tm.user_id=(select auth.uid())));
create policy tasks_create on public.tasks for insert to authenticated with check(public.has_org_role(organisation_id,array['owner','manager']::public.member_role[]) and created_by=(select auth.uid()));
create policy tasks_manage on public.tasks for update to authenticated using(public.has_org_role(organisation_id,array['owner','manager']::public.member_role[])) with check(public.has_org_role(organisation_id,array['owner','manager']::public.member_role[]));
create policy evidence_read on public.task_evidence for select to authenticated using(public.can_access_task(task_id));
create policy evidence_add on public.task_evidence for insert to authenticated with check(uploaded_by=(select auth.uid()) and public.can_access_task(task_id));
create policy events_read on public.task_events for select to authenticated using(public.can_access_task(task_id));

create or replace function public.change_task_status(p_task_id uuid,p_from public.task_status[],p_to public.task_status,p_note text default null,p_manager_only boolean default false) returns void language plpgsql security definer set search_path='' as $$
declare v public.tasks; v_evidence int;
begin
 select * into v from public.tasks where id=p_task_id for update; if not found then raise exception 'Task not found'; end if;
 if p_manager_only then if not public.has_org_role(v.organisation_id,array['owner','manager']::public.member_role[]) then raise exception 'Manager access required'; end if;
 elsif not public.can_access_task(v.id) then raise exception 'Task access denied'; end if;
 if not(v.status=any(p_from)) then raise exception 'Task cannot move from % to %',v.status,p_to; end if;
 if p_to='awaiting_review' and v.evidence_requirement<>'none' then select count(*) into v_evidence from public.task_evidence where task_id=v.id; if v_evidence=0 then raise exception 'Required photo evidence is missing'; end if; end if;
 update public.tasks set status=p_to,started_at=case when p_to='in_progress' then coalesce(started_at,now()) else started_at end,submitted_at=case when p_to='awaiting_review' then now() else submitted_at end,approved_at=case when p_to='approved' then now() else approved_at end,rework_reason=case when p_to='rework' then p_note else rework_reason end where id=v.id;
 insert into public.task_events(organisation_id,task_id,event_type,from_status,to_status,note,actor_id) values(v.organisation_id,v.id,'status_changed',v.status,p_to,p_note,(select auth.uid()));
end $$;
revoke all on function public.change_task_status(uuid,public.task_status[],public.task_status,text,boolean) from public,anon,authenticated;
create or replace function public.start_task(p_task_id uuid) returns void language sql security definer set search_path='' as $$ select public.change_task_status(p_task_id,array['assigned','accepted','rework']::public.task_status[],'in_progress',null,false) $$;
create or replace function public.submit_task(p_task_id uuid) returns void language sql security definer set search_path='' as $$ select public.change_task_status(p_task_id,array['in_progress','rework']::public.task_status[],'awaiting_review',null,false) $$;
create or replace function public.approve_task(p_task_id uuid) returns void language sql security definer set search_path='' as $$ select public.change_task_status(p_task_id,array['awaiting_review']::public.task_status[],'approved',null,true) $$;
create or replace function public.reject_task(p_task_id uuid,p_reason text) returns void language sql security definer set search_path='' as $$ select public.change_task_status(p_task_id,array['awaiting_review']::public.task_status[],'rework',p_reason,true) $$;
revoke all on function public.start_task(uuid),public.submit_task(uuid),public.approve_task(uuid),public.reject_task(uuid,text) from public,anon;
grant execute on function public.start_task(uuid),public.submit_task(uuid),public.approve_task(uuid),public.reject_task(uuid,text) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('task-evidence','task-evidence',false,10485760,array['image/jpeg','image/png','image/webp','application/pdf']) on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy evidence_storage_read on storage.objects for select to authenticated using(bucket_id='task-evidence' and public.can_access_task(((storage.foldername(name))[2])::uuid));
create policy evidence_storage_insert on storage.objects for insert to authenticated with check(bucket_id='task-evidence' and public.is_org_member(((storage.foldername(name))[1])::uuid) and public.can_access_task(((storage.foldername(name))[2])::uuid));

grant usage on schema public to authenticated;
grant select on public.profiles,public.organisations,public.organisation_members,public.businesses,public.sites,public.teams,public.team_members,public.projects,public.tasks,public.task_evidence,public.task_events to authenticated;
grant insert on public.tasks,public.task_evidence to authenticated;
grant update on public.profiles,public.organisation_members,public.businesses,public.sites,public.teams,public.team_members,public.projects,public.tasks to authenticated;
grant insert,delete on public.organisation_members,public.businesses,public.sites,public.teams,public.team_members,public.projects to authenticated;
