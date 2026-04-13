-- ============================================================
-- Notificaciones: cambios en partidos (edición / cancelación)
-- ============================================================

CREATE TABLE public.notificaciones (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid        NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  tipo       text        NOT NULL CHECK (tipo IN ('partido_editado', 'partido_cancelado')),
  mensaje    text        NOT NULL,
  partido_id uuid        REFERENCES public.partidos(id) ON DELETE SET NULL,
  leida      boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX notificaciones_usuario_leida ON public.notificaciones (usuario_id, leida);
CREATE INDEX notificaciones_created      ON public.notificaciones (created_at DESC);

ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- Cada usuario solo ve sus propias notificaciones
CREATE POLICY "Usuario ve sus notificaciones"
  ON public.notificaciones FOR SELECT TO authenticated
  USING (usuario_id = auth.uid());

-- Puede marcarlas como leídas
CREATE POLICY "Usuario marca leidas"
  ON public.notificaciones FOR UPDATE TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

-- Cualquier usuario autenticado puede crear notificaciones
-- (el servicio solo crea para otros jugadores del partido)
CREATE POLICY "Autenticado puede insertar"
  ON public.notificaciones FOR INSERT TO authenticated
  WITH CHECK (true);
