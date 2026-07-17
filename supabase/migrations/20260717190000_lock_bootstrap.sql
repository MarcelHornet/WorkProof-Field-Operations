-- The production organisation has been initialised. Keep the bootstrap
-- function in migration history, but remove runtime access to it.
revoke all on function public.bootstrap_first_owner(text) from authenticated;
