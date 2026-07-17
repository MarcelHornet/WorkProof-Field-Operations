alter table public.tasks add column if not exists task_number bigint;

with numbered as (
  select id, row_number() over (partition by organisation_id order by created_at, id) as task_number
  from public.tasks
)
update public.tasks t
set task_number = n.task_number
from numbered n
where n.id = t.id and t.task_number is null;

create table if not exists public.task_counters (
  organisation_id uuid primary key references public.organisations(id) on delete cascade,
  next_number bigint not null check (next_number > 0)
);

insert into public.task_counters(organisation_id, next_number)
select o.id, coalesce(max(t.task_number), 0) + 1
from public.organisations o
left join public.tasks t on t.organisation_id = o.id
group by o.id
on conflict (organisation_id) do update
set next_number = greatest(public.task_counters.next_number, excluded.next_number);

create or replace function public.assign_task_number()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.task_number is null then
    insert into public.task_counters(organisation_id, next_number)
    values (new.organisation_id, 2)
    on conflict (organisation_id) do update
      set next_number = public.task_counters.next_number + 1
    returning next_number - 1 into new.task_number;
  end if;
  return new;
end;
$$;

drop trigger if exists tasks_assign_number on public.tasks;
create trigger tasks_assign_number
before insert on public.tasks
for each row execute function public.assign_task_number();

alter table public.tasks alter column task_number set not null;
create unique index if not exists tasks_org_number_unique
  on public.tasks(organisation_id, task_number);

alter table public.task_counters enable row level security;
revoke all on public.task_counters from public, anon, authenticated;
revoke all on function public.assign_task_number() from public, anon, authenticated;
