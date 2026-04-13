-- ============================================================
-- Fix: RLS infinite recursion en equipo_miembros y partidos
-- ============================================================
-- Problema 1: equipo_miembros SELECT se consultaba a sí misma
-- Problema 2: partidos ↔ partido_jugadores se consultaban mutuamente

-- ─── equipo_miembros ────────────────────────────────────────
DROP POLICY IF EXISTS "Miembros ven su equipo" ON public.equipo_miembros;

-- Simplificado: cada usuario solo ve sus propias filas de membresía.
-- El servicio siempre filtra por usuario_id = uid de todas formas.
CREATE POLICY "Miembros ven sus propias filas"
  ON public.equipo_miembros FOR SELECT TO authenticated
  USING (usuario_id = auth.uid());

-- ─── partido_jugadores ──────────────────────────────────────
DROP POLICY IF EXISTS "Jugador ve su convocatoria" ON public.partido_jugadores;

-- Simplificado: cada usuario ve solo sus propias convocatorias.
-- El capitán verá las de su partido a través de la query directa con equipo_id.
CREATE POLICY "Jugador ve su propia convocatoria"
  ON public.partido_jugadores FOR SELECT TO authenticated
  USING (usuario_id = auth.uid());

-- ─── partidos ───────────────────────────────────────────────
DROP POLICY IF EXISTS "Convocados ven el partido" ON public.partidos;

-- Reemplazado: no referencia partido_jugadores (evita el loop).
-- Visible si eres creador, capitán del equipo local o visitante,
-- o miembro activo de alguno de los dos equipos.
CREATE POLICY "Participantes ven el partido"
  ON public.partidos FOR SELECT TO authenticated
  USING (
    creador_id = auth.uid()
    OR equipo_local_id IN (
      SELECT id FROM public.equipos WHERE capitan_id = auth.uid()
    )
    OR equipo_visitante_id IN (
      SELECT id FROM public.equipos WHERE capitan_id = auth.uid()
    )
    OR equipo_local_id IN (
      SELECT equipo_id FROM public.equipo_miembros
      WHERE usuario_id = auth.uid() AND estado = 'activo'
    )
    OR equipo_visitante_id IN (
      SELECT equipo_id FROM public.equipo_miembros
      WHERE usuario_id = auth.uid() AND estado = 'activo'
    )
  );
