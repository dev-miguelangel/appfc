-- ═══════════════════════════════════════════════════════════════════════════
-- Visibilidad del jugador: tres flags independientes
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS visible_equipos    BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS visible_reemplazos BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS visible_partidos   BOOLEAN NOT NULL DEFAULT true;

-- Usuarios pueden actualizar su propia visibilidad
CREATE POLICY "usuario_update_visibilidad" ON public.usuarios
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
