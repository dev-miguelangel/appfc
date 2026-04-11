-- ============================================================
-- Etapa 2: Tabla usuarios + RLS + trigger auto-insert
-- ============================================================

-- Tipo posicion
create type posicion_jugador as enum ('portero', 'defensa', 'volante', 'delantero');

-- Tabla usuarios
create table if not exists public.usuarios (
  id          uuid primary key references auth.users(id) on delete cascade,
  nombre      text,
  edad        smallint check (edad >= 13 and edad <= 80),
  comuna      text,
  posicion    posicion_jugador,
  foto_url    text,
  rep_asistencia  numeric(5,2) not null default 50,
  rep_puntualidad numeric(5,2) not null default 50,
  rep_compromiso  numeric(5,2) not null default 50,
  google_id   text,
  created_at  timestamptz not null default now()
);

-- RLS
alter table public.usuarios enable row level security;

-- Cualquier usuario autenticado puede leer perfiles
create policy "Perfiles publicos para usuarios autenticados"
  on public.usuarios for select
  to authenticated
  using (true);

-- Cada usuario solo puede modificar su propio perfil
create policy "Cada usuario modifica su perfil"
  on public.usuarios for insert
  to authenticated
  with check (id = auth.uid());

create policy "Cada usuario actualiza su perfil"
  on public.usuarios for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Trigger: insertar fila en usuarios cuando se crea un auth.user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.usuarios (id, google_id)
  values (
    new.id,
    new.raw_user_meta_data->>'provider_id'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Bucket para fotos de perfil (ejecutar en Supabase dashboard si no existe)
-- insert into storage.buckets (id, name, public) values ('fotos', 'fotos', true);

-- Politica de storage: solo el propietario puede subir/actualizar su foto
-- create policy "Avatar upload" on storage.objects for insert to authenticated
--   with check (bucket_id = 'fotos' and name like 'avatars/' || auth.uid() || '%');
-- create policy "Avatar update" on storage.objects for update to authenticated
--   using (bucket_id = 'fotos' and name like 'avatars/' || auth.uid() || '%');
-- create policy "Avatar public read" on storage.objects for select to public
--   using (bucket_id = 'fotos');
