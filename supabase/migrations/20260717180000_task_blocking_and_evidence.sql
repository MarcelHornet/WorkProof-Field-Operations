alter table public.task_evidence drop constraint if exists task_evidence_evidence_type_check;
alter table public.task_evidence add constraint task_evidence_evidence_type_check check(evidence_type in ('before','during','after','document','checklist','sign-off'));

create or replace function public.block_task(p_task_id uuid,p_reason text) returns void language sql security definer set search_path='' as $$
 select public.change_task_status(p_task_id,array['assigned','accepted','in_progress','rework']::public.task_status[],'blocked',p_reason,false)
$$;
create or replace function public.resume_task(p_task_id uuid) returns void language sql security definer set search_path='' as $$
 select public.change_task_status(p_task_id,array['blocked']::public.task_status[],'in_progress','Task resumed',false)
$$;
revoke all on function public.block_task(uuid,text),public.resume_task(uuid) from public,anon;
grant execute on function public.block_task(uuid,text),public.resume_task(uuid) to authenticated;
