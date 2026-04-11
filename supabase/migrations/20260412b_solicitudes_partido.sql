-- ============================================================
-- Aceptación del visitante + solicitudes de cambio bilateral
-- ============================================================

-- ─── 1. Campo aceptacion en partidos ────────────────────────
ALTER TABLE public.partidos
  ADD COLUMN IF NOT EXISTS aceptacion_visitante text NOT NULL DEFAULT 'pendiente'
  CHECK (aceptacion_visitante IN ('pendiente', 'aceptada', 'rechazada'));

-- ─── 2. Tabla de solicitudes ────────────────────────────────
-- El capitán visitante puede proponer ediciones o pedir cancelación.
-- El capitán local aprueba o rechaza antes de que surta efecto.
CREATE TABLE public.partido_solicitudes (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  partido_id     uuid        NOT NULL REFERENCES public.partidos(id) ON DELETE CASCADE,
  solicitante_id uuid        NOT NULL REFERENCES public.usuarios(id),
  tipo           text        NOT NULL CHECK (tipo IN ('edicion', 'cancelacion')),
  estado         text        NOT NULL DEFAULT 'pendiente'
                             CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
  nueva_fecha    text,       -- datetime-local string, solo para tipo='edicion'
  nuevo_lugar    text,       -- nullable
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX partido_solicitudes_partido ON public.partido_solicitudes (partido_id, estado);

ALTER TABLE public.partido_solicitudes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Capitanes del partido ven solicitudes"
  ON public.partido_solicitudes FOR SELECT TO authenticated
  USING (
    partido_id IN (
      SELECT id FROM public.partidos
      WHERE equipo_local_id     IN (SELECT id FROM public.equipos WHERE capitan_id = auth.uid())
         OR equipo_visitante_id IN (SELECT id FROM public.equipos WHERE capitan_id = auth.uid())
    )
  );

CREATE POLICY "Capitan visitante crea solicitudes"
  ON public.partido_solicitudes FOR INSERT TO authenticated
  WITH CHECK (solicitante_id = auth.uid());

CREATE POLICY "Capitan local responde solicitudes"
  ON public.partido_solicitudes FOR UPDATE TO authenticated
  USING (
    partido_id IN (
      SELECT id FROM public.partidos
      WHERE equipo_local_id IN (SELECT id FROM public.equipos WHERE capitan_id = auth.uid())
    )
  );

-- ─── 3. Ampliar tipos de notificación ───────────────────────
ALTER TABLE public.notificaciones
  DROP CONSTRAINT IF EXISTS notificaciones_tipo_check;

ALTER TABLE public.notificaciones
  ADD CONSTRAINT notificaciones_tipo_check CHECK (
    tipo IN (
      'partido_editado', 'partido_cancelado',
      'partido_aceptado', 'partido_rechazado',
      'solicitud_nueva', 'solicitud_aprobada', 'solicitud_rechazada'
    )
  );
