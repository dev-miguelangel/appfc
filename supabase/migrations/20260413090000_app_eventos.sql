-- ============================================================
-- App eventos: tracking de logins y registros
-- ============================================================

CREATE TABLE public.app_eventos (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo       text        NOT NULL CHECK (tipo IN ('login', 'registro')),
  usuario_id uuid        REFERENCES public.usuarios(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX app_eventos_tipo_fecha ON public.app_eventos (tipo, created_at);

ALTER TABLE public.app_eventos ENABLE ROW LEVEL SECURITY;

-- Solo service_role puede insertar (lo hacemos via trigger o RPC)
-- Los usuarios autenticados no pueden leer eventos de otros
CREATE POLICY "Admin lee todos los eventos"
  ON public.app_eventos FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Autenticado inserta su propio evento"
  ON public.app_eventos FOR INSERT TO authenticated
  WITH CHECK (usuario_id = auth.uid());
