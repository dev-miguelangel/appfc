-- ═══════════════════════════════════════════════════════════════════════════
-- Sincronizar email desde auth.users → public.usuarios
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS email TEXT;

-- ── Función de sincronización ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.sync_usuario_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.usuarios (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

-- ── Trigger en auth.users ─────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_sync_usuario_email ON auth.users;
CREATE TRIGGER trg_sync_usuario_email
  AFTER INSERT OR UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_usuario_email();

-- ── Backfill: copiar email a usuarios existentes ──────────────────────────
UPDATE public.usuarios u
SET email = au.email
FROM auth.users au
WHERE u.id = au.id;
