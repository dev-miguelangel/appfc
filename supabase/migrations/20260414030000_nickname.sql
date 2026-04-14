-- ═══════════════════════════════════════════════════════════════════════════
-- Nickname único de 5 caracteres por usuario
-- Caracteres: a-z (sin ñ) + 1-9
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS nickname CHAR(5) UNIQUE;

-- ── Función generadora ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.generar_nickname_unico()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz123456789';
  nick  TEXT;
BEGIN
  -- Si ya viene con un nickname asignado, respetar
  IF NEW.nickname IS NOT NULL THEN
    RETURN NEW;
  END IF;

  LOOP
    nick := '';
    FOR i IN 1..5 LOOP
      nick := nick || substr(chars, floor(random() * length(chars))::int + 1, 1);
    END LOOP;

    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.usuarios WHERE nickname = nick
    );
  END LOOP;

  NEW.nickname := nick;
  RETURN NEW;
END;
$$;

-- ── Trigger en INSERT ─────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_generar_nickname ON public.usuarios;
CREATE TRIGGER trg_generar_nickname
  BEFORE INSERT ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.generar_nickname_unico();

-- ── Backfill: asignar nickname a usuarios existentes sin uno ──────────────
DO $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz123456789';
  nick  TEXT;
  rec   RECORD;
BEGIN
  FOR rec IN SELECT id FROM public.usuarios WHERE nickname IS NULL LOOP
    LOOP
      nick := '';
      FOR i IN 1..5 LOOP
        nick := nick || substr(chars, floor(random() * length(chars))::int + 1, 1);
      END LOOP;
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.usuarios WHERE nickname = nick);
    END LOOP;
    UPDATE public.usuarios SET nickname = nick WHERE id = rec.id;
  END LOOP;
END;
$$;
