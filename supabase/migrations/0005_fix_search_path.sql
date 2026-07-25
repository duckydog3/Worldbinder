-- Security hardening: set_updated_at (0001) was missing `set search_path`,
-- unlike every other function in this project. Found by Supabase's security
-- advisor. A mutable search_path on a function is a known privilege-escalation
-- vector if a malicious schema/object could ever shadow an unqualified name
-- the function references — low risk here since the function body is trivial,
-- but cheap and correct to close.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
