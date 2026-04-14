-- ═══════════════════════════════════════════════════════════════════════════
-- Postulación de usuarios a equipos
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Origen de la membresía ────────────────────────────────────────────
ALTER TABLE public.equipo_miembros
  ADD COLUMN IF NOT EXISTS origen TEXT NOT NULL DEFAULT 'invitacion'
  CHECK (origen IN ('invitacion', 'postulacion'));

-- ── 2. equipo_id en notificaciones ───────────────────────────────────────
ALTER TABLE public.notificaciones
  ADD COLUMN IF NOT EXISTS equipo_id UUID REFERENCES public.equipos(id) ON DELETE CASCADE;

-- ── 3. RLS: usuario puede insertar su propia postulación ─────────────────
-- (las invitaciones las inserta el capitán; las postulaciones, el propio usuario)
CREATE POLICY "usuario_insertar_postulacion" ON public.equipo_miembros
  FOR INSERT TO authenticated
  WITH CHECK (
    usuario_id = auth.uid()
    AND origen = 'postulacion'
  );
