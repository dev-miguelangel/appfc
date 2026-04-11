-- ============================================================
-- Etapa 5: Resultado bilateral + reputación
-- ============================================================

-- ─── 1. Nuevo valor en enum ──────────────────────────────────
ALTER TYPE estado_partido ADD VALUE IF NOT EXISTS 'en_disputa';

-- ─── 2. Columnas en partidos ─────────────────────────────────
ALTER TABLE public.partidos
  ADD COLUMN IF NOT EXISTS goles_local        int,
  ADD COLUMN IF NOT EXISTS goles_visitante    int,
  ADD COLUMN IF NOT EXISTS result_conf_local  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS result_conf_visit  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS score_local        jsonb,   -- {"local":N,"visitante":N} según cap. local
  ADD COLUMN IF NOT EXISTS score_visit        jsonb;   -- {"local":N,"visitante":N} según cap. visitante

-- ─── 3. Función: recalcular reputación tras partido completado ─
CREATE OR REPLACE FUNCTION public.recalcular_reputacion_partido(p_partido_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT usuario_id, estado, asistio
    FROM   public.partido_jugadores
    WHERE  partido_id = p_partido_id
  LOOP
    IF r.estado = 'confirmado' AND r.asistio IS TRUE THEN
      UPDATE public.usuarios SET
        rep_asistencia  = LEAST(100, rep_asistencia  + 3),
        rep_puntualidad = LEAST(100, rep_puntualidad + 2),
        rep_compromiso  = LEAST(100, rep_compromiso  + 2)
      WHERE id = r.usuario_id;

    ELSIF r.estado = 'confirmado' AND r.asistio IS FALSE THEN
      UPDATE public.usuarios SET
        rep_asistencia  = GREATEST(0, rep_asistencia  - 6),
        rep_puntualidad = GREATEST(0, rep_puntualidad - 4),
        rep_compromiso  = GREATEST(0, rep_compromiso  - 3)
      WHERE id = r.usuario_id;

    ELSIF r.estado = 'pendiente' AND r.asistio IS TRUE THEN
      UPDATE public.usuarios SET
        rep_asistencia = LEAST(100, rep_asistencia + 1)
      WHERE id = r.usuario_id;
    END IF;
  END LOOP;
END;
$$;

-- ─── 4. Trigger: verificar resultado cuando un capitán confirma ─
CREATE OR REPLACE FUNCTION public.trg_verificar_resultado_fn()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Solo actuar cuando ambas confirmaciones están presentes
  IF NEW.result_conf_local AND NEW.result_conf_visit THEN
    IF (NEW.score_local->>'local')::int  = (NEW.score_visit->>'local')::int
    AND (NEW.score_local->>'visitante')::int = (NEW.score_visit->>'visitante')::int THEN
      -- Marcadores coinciden → completado
      NEW.estado          := 'completado';
      NEW.goles_local     := (NEW.score_local->>'local')::int;
      NEW.goles_visitante := (NEW.score_local->>'visitante')::int;
    ELSE
      -- Marcadores distintos → en disputa
      NEW.estado := 'en_disputa';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_verificar_resultado
  BEFORE UPDATE ON public.partidos
  FOR EACH ROW
  WHEN (
    (OLD.result_conf_local IS DISTINCT FROM NEW.result_conf_local) OR
    (OLD.result_conf_visit IS DISTINCT FROM NEW.result_conf_visit)
  )
  EXECUTE FUNCTION public.trg_verificar_resultado_fn();

-- ─── 5. Trigger: llamar a recalcular_reputacion tras completado ─
CREATE OR REPLACE FUNCTION public.trg_on_completado_fn()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.estado = 'completado' AND (OLD.estado IS DISTINCT FROM 'completado') THEN
    PERFORM public.recalcular_reputacion_partido(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_partido_completado
  AFTER UPDATE ON public.partidos
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_on_completado_fn();

-- ─── 6. RLS: capitanes pueden actualizar score y confirmación ──
CREATE POLICY "Capitan confirma resultado"
  ON public.partidos FOR UPDATE TO authenticated
  USING (
    creador_id = auth.uid() OR
    equipo_local_id IN (
      SELECT id FROM public.equipos WHERE capitan_id = auth.uid()
    ) OR
    equipo_visitante_id IN (
      SELECT id FROM public.equipos WHERE capitan_id = auth.uid()
    )
  );

-- ─── Nota: Edge Function recordatorio (cron 24h) ────────────────
-- Se implementa en supabase/functions/recordatorio_resultado/index.ts
-- Verifica partidos con fecha < now() - interval '24h' cuyo estado
-- sigue siendo 'programado' y notifica a los capitanes sin confirmar.
-- Pendiente de implementación (fuera del scope Etapa 5 MVP).
