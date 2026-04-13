-- ═══════════════════════════════════════════════════════════════════════════
-- Admin Panel: is_admin + bloqueado columns + RLS policies
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Columnas de administración ──────────────────────────────────────────

ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS is_admin  BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS bloqueado BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.equipos
  ADD COLUMN IF NOT EXISTS bloqueado BOOLEAN NOT NULL DEFAULT false;

-- ── 2. Función helper (SECURITY DEFINER para evitar recursión en RLS) ──────

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM usuarios WHERE id = auth.uid()),
    false
  );
$$;

-- ── 3. Políticas RLS para administradores ──────────────────────────────────

-- Usuarios: admin puede leer y actualizar todos
CREATE POLICY "admin_select_usuarios" ON public.usuarios
  FOR SELECT USING (public.is_admin());

CREATE POLICY "admin_update_usuarios" ON public.usuarios
  FOR UPDATE USING (public.is_admin());

-- Equipos: admin puede leer, actualizar y eliminar todos
CREATE POLICY "admin_select_equipos" ON public.equipos
  FOR SELECT USING (public.is_admin());

CREATE POLICY "admin_update_equipos" ON public.equipos
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "admin_delete_equipos" ON public.equipos
  FOR DELETE USING (public.is_admin());

-- Partidos: admin puede leer, actualizar y eliminar todos
CREATE POLICY "admin_select_partidos" ON public.partidos
  FOR SELECT USING (public.is_admin());

CREATE POLICY "admin_update_partidos" ON public.partidos
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "admin_delete_partidos" ON public.partidos
  FOR DELETE USING (public.is_admin());

-- Equipo miembros: admin puede leer todos
CREATE POLICY "admin_select_equipo_miembros" ON public.equipo_miembros
  FOR SELECT USING (public.is_admin());

-- App eventos: admin puede leer todos (para stats)
CREATE POLICY "admin_select_app_eventos" ON public.app_eventos
  FOR SELECT USING (public.is_admin());
