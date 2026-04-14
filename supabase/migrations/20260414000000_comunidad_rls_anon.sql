-- ═══════════════════════════════════════════════════════════════════════════
-- Comunidad: acceso público (rol anon) a datos de partidos, equipos y stats
-- ═══════════════════════════════════════════════════════════════════════════

-- Partidos: visibles públicamente (excepto cancelados opcionales)
CREATE POLICY "anon_select_partidos" ON public.partidos
  FOR SELECT TO anon
  USING (true);

-- Equipos: visibles públicamente (no bloqueados)
CREATE POLICY "anon_select_equipos" ON public.equipos
  FOR SELECT TO anon
  USING (bloqueado = false);

-- Usuarios: visibles públicamente (no bloqueados, solo campos seguros)
-- La restricción de columnas se aplica en las funciones y queries del servicio
CREATE POLICY "anon_select_usuarios" ON public.usuarios
  FOR SELECT TO anon
  USING (bloqueado = false);

-- Partido jugadores: visibles para calcular estadísticas públicas
CREATE POLICY "anon_select_partido_jugadores" ON public.partido_jugadores
  FOR SELECT TO anon
  USING (true);
