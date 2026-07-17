create extension if not exists citext;

alter table public.profiles
  add column if not exists username citext,
  add column if not exists title text,
  add column if not exists email text,
  add column if not exists active boolean not null default true,
  add column if not exists must_change_password boolean not null default true,
  add column if not exists revoked_at timestamptz;

create unique index if not exists profiles_username_unique on public.profiles(username) where username is not null;
create index if not exists profiles_phone_idx on public.profiles(phone) where phone is not null;

alter table public.businesses add column if not exists code text, add column if not exists business_type text;
alter table public.sites add column if not exists manager_id uuid references public.profiles(id);
alter table public.teams add column if not exists manager_id uuid references public.profiles(id), add column if not exists trade text;
alter table public.projects
  add column if not exists business_id uuid references public.businesses(id),
  add column if not exists manager_id uuid references public.profiles(id),
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists budget numeric(14,2) not null default 0;

create index if not exists sites_manager_idx on public.sites(manager_id);
create index if not exists teams_manager_idx on public.teams(manager_id);
create index if not exists projects_business_idx on public.projects(business_id);
create index if not exists projects_manager_idx on public.projects(manager_id);

update public.profiles p set
  username = coalesce(p.username, regexp_replace(lower(trim(p.full_name)), '[^a-z0-9]+', '.', 'g')),
  email = coalesce(p.email, u.email),
  title = coalesce(p.title, 'Owner'),
  must_change_password = false
from auth.users u where u.id=p.id;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,full_name,phone,username,title,email,must_change_password)
 values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),new.raw_user_meta_data->>'phone',nullif(new.raw_user_meta_data->>'username','')::citext,new.raw_user_meta_data->>'title',new.email,coalesce((new.raw_user_meta_data->>'must_change_password')::boolean,true));
 return new;
end $$;
revoke all on function public.handle_new_user() from public,anon,authenticated;

create or replace function public.reporting_snapshot(p_period text default 'daily') returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v_uid uuid=(select auth.uid()); v_org uuid; v_role public.member_role; v_start timestamptz;
begin
 select organisation_id,role into v_org,v_role from public.organisation_members where user_id=v_uid and active limit 1;
 if v_org is null or v_role not in ('owner','manager') then raise exception 'Reporting access denied'; end if;
 v_start=case p_period when 'monthly' then date_trunc('month',now()) when 'weekly' then date_trunc('week',now()) else date_trunc('day',now()) end;
 return jsonb_build_object(
  'period',p_period,
  'generated_at',now(),
  'open_tasks',(select count(*) from public.tasks t where t.organisation_id=v_org and t.status not in ('approved','closed') and (v_role='owner' or t.manager_id=v_uid)),
  'overdue_tasks',(select count(*) from public.tasks t where t.organisation_id=v_org and t.status not in ('approved','closed') and t.due_at<now() and (v_role='owner' or t.manager_id=v_uid)),
  'awaiting_review',(select count(*) from public.tasks t where t.organisation_id=v_org and t.status='awaiting_review' and (v_role='owner' or t.manager_id=v_uid)),
  'blocked_tasks',(select count(*) from public.tasks t where t.organisation_id=v_org and t.status='blocked' and (v_role='owner' or t.manager_id=v_uid)),
  'approved_in_period',(select count(*) from public.tasks t where t.organisation_id=v_org and t.status in ('approved','closed') and t.approved_at>=v_start and (v_role='owner' or t.manager_id=v_uid)),
  'rework_tasks',(select count(*) from public.tasks t where t.organisation_id=v_org and t.status='rework' and (v_role='owner' or t.manager_id=v_uid)),
  'managers',(select coalesce(jsonb_agg(row_to_json(x)),'[]'::jsonb) from (select p.id,p.full_name,count(t.id) filter(where t.status not in ('approved','closed')) open_tasks,count(t.id) filter(where t.due_at<now() and t.status not in ('approved','closed')) overdue_tasks,count(t.id) filter(where t.status='awaiting_review') awaiting_review,count(t.id) filter(where t.approved_at>=v_start) approved_in_period from public.organisation_members m join public.profiles p on p.id=m.user_id left join public.tasks t on t.manager_id=p.id and t.organisation_id=m.organisation_id where m.organisation_id=v_org and m.role='manager' and m.active group by p.id,p.full_name order by p.full_name)x)
 );
end $$;
revoke all on function public.reporting_snapshot(text) from public,anon;
grant execute on function public.reporting_snapshot(text) to authenticated;

update public.profiles set username='marcel.horne',title='Product owner',must_change_password=false where email ilike 'marcel.horne@gmail.com';
