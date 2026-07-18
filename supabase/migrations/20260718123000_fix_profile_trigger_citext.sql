create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles(
    id,
    full_name,
    phone,
    username,
    title,
    email,
    must_change_password
  )
  values(
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'phone',
    nullif(new.raw_user_meta_data->>'username', '')::public.citext,
    new.raw_user_meta_data->>'title',
    new.email,
    coalesce((new.raw_user_meta_data->>'must_change_password')::boolean, true)
  );
  return new;
end
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
