-- ═══════════════════════════════════════════════════════════════════════════
-- Código único de equipo: "fc" + 5 chars (a-z sin ñ + 1-9)
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.equipos
  ADD COLUMN IF NOT EXISTS codigo VARCHAR(7) UNIQUE;

-- ── Función generadora ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.generar_codigo_equipo()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz123456789';
  sufijo TEXT;
BEGIN
  IF NEW.codigo IS NOT NULL THEN
    RETURN NEW;
  END IF;

  LOOP
    sufijo := '';
    FOR i IN 1..5 LOOP
      sufijo := sufijo || substr(chars, floor(random() * length(chars))::int + 1, 1);
    END LOOP;

    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.equipos WHERE codigo = 'fc' || sufijo
    );
  END LOOP;

  NEW.codigo := 'fc' || sufijo;
  RETURN NEW;
END;
$$;

-- ── Trigger en INSERT ─────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_generar_codigo_equipo ON public.equipos;
CREATE TRIGGER trg_generar_codigo_equipo
  BEFORE INSERT ON public.equipos
  FOR EACH ROW
  EXECUTE FUNCTION public.generar_codigo_equipo();

-- ── Backfill: asignar código a equipos existentes ─────────────────────────
DO $$
DECLARE
  chars  TEXT := 'abcdefghijklmnopqrstuvwxyz123456789';
  sufijo TEXT;
  rec    RECORD;
BEGIN
  FOR rec IN SELECT id FROM public.equipos WHERE codigo IS NULL LOOP
    LOOP
      sufijo := '';
      FOR i IN 1..5 LOOP
        sufijo := sufijo || substr(chars, floor(random() * length(chars))::int + 1, 1);
      END LOOP;
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.equipos WHERE codigo = 'fc' || sufijo);
    END LOOP;
    UPDATE public.equipos SET codigo = 'fc' || sufijo WHERE id = rec.id;
  END LOOP;
END;
$$;
