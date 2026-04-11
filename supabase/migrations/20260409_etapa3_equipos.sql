-- ============================================================
-- Etapa 3: Tablas equipos + equipo_miembros + RLS
-- ============================================================

create type estado_miembro as enum ('pendiente', 'activo', 'rechazado');
create type rol_equipo     as enum ('capitan', 'jugador');

create table if not exists public.equipos (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  capitan_id  uuid not null references public.usuarios(id) on delete cascade,
  escudo_url  text,
  created_at  timestamptz not null default now()
);

create table if not exists public.equipo_miembros (
  id          uuid primary key default gen_random_uuid(),
  equipo_id   uuid not null references public.equipos(id) on delete cascade,
  usuario_id  uuid not null references public.usuarios(id) on delete cascade,
  rol         rol_equipo   not null default 'jugador',
  estado      estado_miembro not null default 'pendiente',
  joined_at   timestamptz,
  unique (equipo_id, usuario_id)
);

-- Indices
create index idx_equipo_miembros_usuario  on public.equipo_miembros(usuario_id);
create index idx_equipo_miembros_equipo   on public.equipo_miembros(equipo_id);
create index idx_equipos_capitan          on public.equipos(capitan_id);

-- RLS
alter table public.equipos          enable row level security;
alter table public.equipo_miembros  enable row level security;

-- equipos: cualquier autenticado puede leer; solo miembro activo puede ver el suyo
create policy "Equipos visibles para autenticados"
  on public.equipos for select to authenticated using (true);

create policy "Capitan crea su equipo"
  on public.equipos for insert to authenticated
  with check (capitan_id = auth.uid());

create policy "Capitan actualiza su equipo"
  on public.equipos for update to authenticated
  using (capitan_id = auth.uid());

-- equipo_miembros: lectura para miembros del equipo
create policy "Miembros ven su equipo"
  on public.equipo_miembros for select to authenticated
  using (
    usuario_id = auth.uid() or
    equipo_id in (
      select equipo_id from public.equipo_miembros
      where usuario_id = auth.uid() and estado = 'activo'
    )
  );

create policy "Capitan invita miembros"
  on public.equipo_miembros for insert to authenticated
  with check (
    equipo_id in (
      select id from public.equipos where capitan_id = auth.uid()
    )
  );

create policy "Usuario responde su propia invitacion"
  on public.equipo_miembros for update to authenticated
  using (usuario_id = auth.uid());
