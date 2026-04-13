-- ============================================================
-- Permite al capitán actual cambiar el rol de miembros
-- ============================================================

-- El capitán necesita poder actualizar el rol (no solo el propio)
DROP POLICY IF EXISTS "Usuario responde su propia invitacion" ON public.equipo_miembros;

CREATE POLICY "Miembro o capitan puede actualizar membresía"
  ON public.equipo_miembros FOR UPDATE TO authenticated
  USING (
    -- El propio usuario acepta/rechaza su invitación
    usuario_id = auth.uid()
    OR
    -- El capitán del equipo puede actualizar roles
    equipo_id IN (
      SELECT id FROM public.equipos WHERE capitan_id = auth.uid()
    )
  );
