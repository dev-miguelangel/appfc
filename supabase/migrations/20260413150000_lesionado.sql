-- ═══════════════════════════════════════════════════════════════════════════
-- Lesionado: injury status column on usuarios
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS lesionado BOOLEAN NOT NULL DEFAULT false;

-- Users can update their own lesionado status
CREATE POLICY "user_update_lesionado" ON public.usuarios
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
