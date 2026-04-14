-- ═══════════════════════════════════════════════════════════════════════════
-- Goles por jugador: columna en partido_jugadores para ranking de goleadores
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.partido_jugadores
  ADD COLUMN IF NOT EXISTS goles INT NOT NULL DEFAULT 0
  CHECK (goles >= 0);

-- Capitanes pueden actualizar goles de jugadores de su equipo
CREATE POLICY "capitan_update_goles" ON public.partido_jugadores
  FOR UPDATE TO authenticated
  USING (
    equipo_id IN (
      SELECT id FROM public.equipos WHERE capitan_id = auth.uid()
    )
  )
  WITH CHECK (
    equipo_id IN (
      SELECT id FROM public.equipos WHERE capitan_id = auth.uid()
    )
  );
