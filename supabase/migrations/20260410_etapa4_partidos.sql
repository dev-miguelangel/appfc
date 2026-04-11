-- ============================================================
-- Etapa 4: Tablas partidos + partido_jugadores + RLS
-- ============================================================

create type tipo_futbol       as enum ('futbol5', 'futbol7', 'futbol8', 'futbol11');
create type estado_partido    as enum ('programado', 'completado', 'cancelado');
create type estado_convocatoria as enum ('pendiente', 'confirmado', 'rechazado');

-- ─── partidos ───────────────────────────────────────────────
create table if not exists public.partidos (
  id                   uuid primary key default gen_random_uuid(),
  equipo_local_id      uuid not null references public.equipos(id) on delete cascade,
  equipo_visitante_id  uuid not null references public.equipos(id) on delete cascade,
  tipo_futbol          tipo_futbol not null,
  max_jugadores_equipo int  not null check (max_jugadores_equipo > 0),
  fecha                timestamptz not null,
  lugar                text,
  estado               estado_partido not null default 'programado',
  creador_id           uuid not null references public.usuarios(id),
  created_at           timestamptz not null default now(),
  constraint chk_equipos_distintos check (equipo_local_id <> equipo_visitante_id)
);

-- ─── partido_jugadores ──────────────────────────────────────
create table if not exists public.partido_jugadores (
  id          uuid primary key default gen_random_uuid(),
  partido_id  uuid not null references public.partidos(id) on delete cascade,
  usuario_id  uuid not null references public.usuarios(id) on delete cascade,
  equipo_id   uuid not null references public.equipos(id)  on delete cascade,
  estado      estado_convocatoria not null default 'pendiente',
  asistio     boolean,
  unique (partido_id, usuario_id)
);

-- ─── Índices ────────────────────────────────────────────────
create index idx_partidos_equipo_local      on public.partidos(equipo_local_id);
create index idx_partidos_equipo_visitante  on public.partidos(equipo_visitante_id);
create index idx_partidos_fecha             on public.partidos(fecha);
create index idx_partido_jugadores_usuario  on public.partido_jugadores(usuario_id);
create index idx_partido_jugadores_partido  on public.partido_jugadores(partido_id);

-- ─── RLS ────────────────────────────────────────────────────
alter table public.partidos          enable row level security;
alter table public.partido_jugadores enable row level security;

-- partidos: convocados y creador pueden ver
create policy "Convocados ven el partido"
  on public.partidos for select to authenticated
  using (
    creador_id = auth.uid() or
    id in (
      select partido_id from public.partido_jugadores where usuario_id = auth.uid()
    )
  );

create policy "Capitan crea partido"
  on public.partidos for insert to authenticated
  with check (creador_id = auth.uid());

create policy "Capitan actualiza su partido"
  on public.partidos for update to authenticated
  using (creador_id = auth.uid());

-- partido_jugadores: convocado ve la suya; creador ve todas
create policy "Jugador ve su convocatoria"
  on public.partido_jugadores for select to authenticated
  using (
    usuario_id = auth.uid() or
    partido_id in (
      select id from public.partidos where creador_id = auth.uid()
    )
  );

create policy "Capitan crea convocatorias"
  on public.partido_jugadores for insert to authenticated
  with check (
    partido_id in (
      select id from public.partidos where creador_id = auth.uid()
    )
  );

create policy "Jugador responde; capitan registra asistencia"
  on public.partido_jugadores for update to authenticated
  using (
    usuario_id = auth.uid() or
    partido_id in (
      select id from public.partidos where creador_id = auth.uid()
    )
  );

-- ─── Nota ───────────────────────────────────────────────────
-- La creación automática de convocatorias para ambos equipos
-- se hace desde el servicio Angular. En producción considerar
-- mover esta lógica a una función RPC o trigger de Supabase.
