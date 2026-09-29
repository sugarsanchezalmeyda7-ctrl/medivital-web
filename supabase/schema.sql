create table if not exists public.medivital_poll_responses (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  tried text not null check (tried in ('Sí', 'No')),
  product text not null check (product in ('Menta', 'Jengibre', 'Manzanilla', 'Todos')),
  store_interest text not null check (store_interest in ('Sí', 'No', 'Quiero más información')),
  discovery text not null check (discovery in ('Redes sociales', 'Recomendación', 'Feria o evento', 'Otro medio')),
  catalog text not null check (catalog in ('Sí', 'No', 'Tal vez'))
);

alter table public.medivital_poll_responses enable row level security;

revoke all on table public.medivital_poll_responses from anon, authenticated;
grant insert (tried, product, store_interest, discovery, catalog)
  on table public.medivital_poll_responses
  to anon, authenticated;

drop policy if exists "Anonymous visitors can submit poll responses" on public.medivital_poll_responses;
create policy "Anonymous visitors can submit poll responses"
  on public.medivital_poll_responses
  for insert
  to anon, authenticated
  with check (true);

create or replace function public.medivital_poll_results()
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'participants', count(*)::integer,
    'counts', jsonb_build_object(
      'tried', jsonb_build_object(
        'Sí', count(*) filter (where tried = 'Sí'),
        'No', count(*) filter (where tried = 'No')
      ),
      'product', jsonb_build_object(
        'Menta', count(*) filter (where product = 'Menta'),
        'Jengibre', count(*) filter (where product = 'Jengibre'),
        'Manzanilla', count(*) filter (where product = 'Manzanilla'),
        'Todos', count(*) filter (where product = 'Todos')
      ),
      'store', jsonb_build_object(
        'Sí', count(*) filter (where store_interest = 'Sí'),
        'No', count(*) filter (where store_interest = 'No'),
        'Quiero más información', count(*) filter (where store_interest = 'Quiero más información')
      ),
      'discovery', jsonb_build_object(
        'Redes sociales', count(*) filter (where discovery = 'Redes sociales'),
        'Recomendación', count(*) filter (where discovery = 'Recomendación'),
        'Feria o evento', count(*) filter (where discovery = 'Feria o evento'),
        'Otro medio', count(*) filter (where discovery = 'Otro medio')
      ),
      'catalog', jsonb_build_object(
        'Sí', count(*) filter (where catalog = 'Sí'),
        'No', count(*) filter (where catalog = 'No'),
        'Tal vez', count(*) filter (where catalog = 'Tal vez')
      )
    )
  )
  from public.medivital_poll_responses;
$$;

revoke all on function public.medivital_poll_results() from public;
grant execute on function public.medivital_poll_results() to anon, authenticated;
