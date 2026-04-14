-- ═══════════════════════════════════════════════════════════════════════════
-- Rachas y rankings semanales
-- Zona horaria: America/Santiago (Chile)
-- Semana ISO: lunes → domingo
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Racha individual ───────────────────────────────────────────────────
-- Devuelve el número de semanas consecutivas que el jugador ha participado
-- (con asistio=true). La racha sigue vigente si jugó esta semana O la pasada.

CREATE OR REPLACE FUNCTION public.calcular_racha(p_usuario_id uuid)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_semana_actual   date;
  v_semana_anterior date;
  v_semana_ref      date := NULL;
  v_racha           int  := 0;
  v_semana_check    date;
BEGIN
  v_semana_actual   := DATE_TRUNC('week', NOW() AT TIME ZONE 'America/Santiago')::date;
  v_semana_anterior := v_semana_actual - 7;

  -- Determinar semana de referencia (inicio del conteo)
  IF EXISTS (
    SELECT 1 FROM partido_jugadores pj
    JOIN partidos p ON p.id = pj.partido_id
    WHERE pj.usuario_id = p_usuario_id
      AND pj.asistio = true
      AND p.estado = 'completado'
      AND DATE_TRUNC('week', p.fecha AT TIME ZONE 'America/Santiago')::date = v_semana_actual
  ) THEN
    v_semana_ref := v_semana_actual;
  ELSIF EXISTS (
    SELECT 1 FROM partido_jugadores pj
    JOIN partidos p ON p.id = pj.partido_id
    WHERE pj.usuario_id = p_usuario_id
      AND pj.asistio = true
      AND p.estado = 'completado'
      AND DATE_TRUNC('week', p.fecha AT TIME ZONE 'America/Santiago')::date = v_semana_anterior
  ) THEN
    v_semana_ref := v_semana_anterior;
  ELSE
    RETURN 0;
  END IF;

  -- Contar semanas consecutivas hacia atrás desde la referencia
  v_semana_check := v_semana_ref;
  LOOP
    IF EXISTS (
      SELECT 1 FROM partido_jugadores pj
      JOIN partidos p ON p.id = pj.partido_id
      WHERE pj.usuario_id = p_usuario_id
        AND pj.asistio = true
        AND p.estado = 'completado'
        AND DATE_TRUNC('week', p.fecha AT TIME ZONE 'America/Santiago')::date = v_semana_check
    ) THEN
      v_racha        := v_racha + 1;
      v_semana_check := v_semana_check - 7;
    ELSE
      EXIT;
    END IF;
    EXIT WHEN v_racha >= 52;
  END LOOP;

  RETURN v_racha;
END;
$$;

-- ── 2. Historial de semanas (para heatmap en perfil) ──────────────────────
-- Devuelve las últimas N semanas con flag si el jugador participó

CREATE OR REPLACE FUNCTION public.get_historial_semanas(
  p_usuario_id uuid,
  p_semanas    int DEFAULT 8
)
RETURNS TABLE(semana date, jugado boolean)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  WITH semanas_gen AS (
    SELECT
      (DATE_TRUNC('week', NOW() AT TIME ZONE 'America/Santiago')
        - (gs * interval '7 days'))::date AS semana
    FROM generate_series(0, p_semanas - 1) gs
  ),
  semanas_jugadas AS (
    SELECT DISTINCT
      DATE_TRUNC('week', p.fecha AT TIME ZONE 'America/Santiago')::date AS semana
    FROM partido_jugadores pj
    JOIN partidos p ON p.id = pj.partido_id
    WHERE pj.usuario_id = p_usuario_id
      AND pj.asistio = true
      AND p.estado = 'completado'
  )
  SELECT
    sg.semana,
    (sj.semana IS NOT NULL) AS jugado
  FROM semanas_gen sg
  LEFT JOIN semanas_jugadas sj ON sj.semana = sg.semana
  ORDER BY sg.semana DESC;
$$;

-- ── 3. Ranking de goleadores semanales ───────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_ranking_goleadores(p_limit int DEFAULT 10)
RETURNS TABLE(
  usuario_id    uuid,
  nombre        text,
  foto_url      text,
  posicion      text,
  goles_semana  bigint,
  partidos_semana bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  WITH semana AS (
    SELECT DATE_TRUNC('week', NOW() AT TIME ZONE 'America/Santiago') AS inicio
  )
  SELECT
    pj.usuario_id,
    u.nombre::text,
    u.foto_url::text,
    u.posicion::text,
    SUM(pj.goles)::bigint                                  AS goles_semana,
    COUNT(*) FILTER (WHERE pj.asistio = true)::bigint      AS partidos_semana
  FROM partido_jugadores pj
  JOIN partidos p  ON p.id  = pj.partido_id
  JOIN usuarios u  ON u.id  = pj.usuario_id
  CROSS JOIN semana
  WHERE p.estado = 'completado'
    AND DATE_TRUNC('week', p.fecha AT TIME ZONE 'America/Santiago') = semana.inicio
    AND pj.goles > 0
    AND u.bloqueado = false
  GROUP BY pj.usuario_id, u.nombre, u.foto_url, u.posicion
  ORDER BY goles_semana DESC, partidos_semana DESC
  LIMIT p_limit;
$$;

-- ── 4. Ranking de jugadores más activos semanales ────────────────────────

CREATE OR REPLACE FUNCTION public.get_ranking_activos(p_limit int DEFAULT 10)
RETURNS TABLE(
  usuario_id      uuid,
  nombre          text,
  foto_url        text,
  posicion        text,
  goles_semana    bigint,
  partidos_semana bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  WITH semana AS (
    SELECT DATE_TRUNC('week', NOW() AT TIME ZONE 'America/Santiago') AS inicio
  )
  SELECT
    pj.usuario_id,
    u.nombre::text,
    u.foto_url::text,
    u.posicion::text,
    SUM(pj.goles)::bigint                                  AS goles_semana,
    COUNT(*) FILTER (WHERE pj.asistio = true)::bigint      AS partidos_semana
  FROM partido_jugadores pj
  JOIN partidos p  ON p.id  = pj.partido_id
  JOIN usuarios u  ON u.id  = pj.usuario_id
  CROSS JOIN semana
  WHERE p.estado = 'completado'
    AND DATE_TRUNC('week', p.fecha AT TIME ZONE 'America/Santiago') = semana.inicio
    AND pj.asistio = true
    AND u.bloqueado = false
  GROUP BY pj.usuario_id, u.nombre, u.foto_url, u.posicion
  ORDER BY partidos_semana DESC, goles_semana DESC
  LIMIT p_limit;
$$;

-- ── 5. Ranking de rachas (calculado en bulk con window functions) ─────────

CREATE OR REPLACE FUNCTION public.get_ranking_rachas(p_limit int DEFAULT 10)
RETURNS TABLE(
  usuario_id      uuid,
  nombre          text,
  foto_url        text,
  posicion        text,
  goles_semana    bigint,
  partidos_semana bigint,
  racha_actual    int
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  WITH
  semana AS (
    SELECT
      DATE_TRUNC('week', NOW() AT TIME ZONE 'America/Santiago') AS inicio,
      DATE_TRUNC('week', NOW() AT TIME ZONE 'America/Santiago')::date AS actual,
      (DATE_TRUNC('week', NOW() AT TIME ZONE 'America/Santiago') - interval '7 days')::date AS anterior
  ),
  -- Todas las semanas jugadas por cada usuario
  semanas_jugadas AS (
    SELECT DISTINCT
      pj.usuario_id,
      DATE_TRUNC('week', p.fecha AT TIME ZONE 'America/Santiago')::date AS semana
    FROM partido_jugadores pj
    JOIN partidos p ON p.id = pj.partido_id
    WHERE pj.asistio = true AND p.estado = 'completado'
  ),
  -- Semana de referencia por usuario (la más reciente entre actual y anterior)
  usuario_refs AS (
    SELECT sj.usuario_id, MAX(sj.semana) AS semana_ref
    FROM semanas_jugadas sj
    CROSS JOIN semana
    WHERE sj.semana IN (semana.actual, semana.anterior)
    GROUP BY sj.usuario_id
  ),
  -- Numerar semanas hacia atrás desde la referencia
  numbered AS (
    SELECT
      sj.usuario_id,
      ((ur.semana_ref - sj.semana) / 7)::int   AS semanas_desde_ref,
      (ROW_NUMBER() OVER (PARTITION BY sj.usuario_id ORDER BY sj.semana DESC) - 1)::int AS rn
    FROM semanas_jugadas sj
    JOIN usuario_refs ur ON ur.usuario_id = sj.usuario_id
    WHERE sj.semana <= ur.semana_ref
  ),
  -- Contar semanas consecutivas (semanas_desde_ref == rn)
  rachas AS (
    SELECT usuario_id, COUNT(*)::int AS racha
    FROM numbered
    WHERE semanas_desde_ref = rn
    GROUP BY usuario_id
  ),
  -- Stats de la semana actual
  stats_semana AS (
    SELECT
      pj.usuario_id,
      SUM(pj.goles)::bigint                             AS goles_semana,
      COUNT(*) FILTER (WHERE pj.asistio = true)::bigint AS partidos_semana
    FROM partido_jugadores pj
    JOIN partidos p ON p.id = pj.partido_id
    CROSS JOIN semana
    WHERE p.estado = 'completado'
      AND DATE_TRUNC('week', p.fecha AT TIME ZONE 'America/Santiago') = semana.inicio
    GROUP BY pj.usuario_id
  )
  SELECT
    r.usuario_id,
    u.nombre::text,
    u.foto_url::text,
    u.posicion::text,
    COALESCE(ss.goles_semana,    0) AS goles_semana,
    COALESCE(ss.partidos_semana, 0) AS partidos_semana,
    r.racha                          AS racha_actual
  FROM rachas r
  JOIN usuarios u ON u.id = r.usuario_id
  LEFT JOIN stats_semana ss ON ss.usuario_id = r.usuario_id
  WHERE u.bloqueado = false
  ORDER BY r.racha DESC, COALESCE(ss.partidos_semana, 0) DESC
  LIMIT p_limit;
$$;

-- ── 6. Stats de equipos semanales ────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_stats_equipos_semana(p_limit int DEFAULT 10)
RETURNS TABLE(
  equipo_id    uuid,
  nombre       text,
  escudo_url   text,
  victorias    bigint,
  empates      bigint,
  derrotas     bigint,
  goles_favor  bigint,
  goles_contra bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  WITH semana AS (
    SELECT DATE_TRUNC('week', NOW() AT TIME ZONE 'America/Santiago') AS inicio
  ),
  partidos_semana AS (
    SELECT
      id,
      equipo_local_id,
      equipo_visitante_id,
      COALESCE(goles_local,    0) AS gl,
      COALESCE(goles_visitante, 0) AS gv
    FROM partidos
    CROSS JOIN semana
    WHERE estado = 'completado'
      AND DATE_TRUNC('week', fecha AT TIME ZONE 'America/Santiago') = semana.inicio
  ),
  local AS (
    SELECT
      equipo_local_id AS equipo_id,
      COUNT(*) FILTER (WHERE gl > gv) AS victorias,
      COUNT(*) FILTER (WHERE gl = gv) AS empates,
      COUNT(*) FILTER (WHERE gl < gv) AS derrotas,
      SUM(gl) AS goles_favor,
      SUM(gv) AS goles_contra
    FROM partidos_semana
    GROUP BY equipo_local_id
  ),
  visitante AS (
    SELECT
      equipo_visitante_id AS equipo_id,
      COUNT(*) FILTER (WHERE gv > gl) AS victorias,
      COUNT(*) FILTER (WHERE gv = gl) AS empates,
      COUNT(*) FILTER (WHERE gv < gl) AS derrotas,
      SUM(gv) AS goles_favor,
      SUM(gl) AS goles_contra
    FROM partidos_semana
    GROUP BY equipo_visitante_id
  ),
  totales AS (
    SELECT equipo_id, victorias, empates, derrotas, goles_favor, goles_contra FROM local
    UNION ALL
    SELECT equipo_id, victorias, empates, derrotas, goles_favor, goles_contra FROM visitante
  ),
  resumen AS (
    SELECT
      equipo_id,
      SUM(victorias)    AS victorias,
      SUM(empates)      AS empates,
      SUM(derrotas)     AS derrotas,
      SUM(goles_favor)  AS goles_favor,
      SUM(goles_contra) AS goles_contra
    FROM totales
    GROUP BY equipo_id
  )
  SELECT
    r.equipo_id,
    e.nombre::text,
    e.escudo_url::text,
    r.victorias, r.empates, r.derrotas,
    r.goles_favor, r.goles_contra
  FROM resumen r
  JOIN equipos e ON e.id = r.equipo_id
  WHERE e.bloqueado = false
  ORDER BY r.victorias DESC, (r.goles_favor - r.goles_contra) DESC
  LIMIT p_limit;
$$;

-- ── 7. Partido de la semana (más goles totales) ───────────────────────────

CREATE OR REPLACE FUNCTION public.get_partido_semana()
RETURNS TABLE(
  id                   uuid,
  estado               text,
  fecha                timestamptz,
  lugar                text,
  tipo_futbol          text,
  goles_local          int,
  goles_visitante      int,
  local_id             uuid,
  local_nombre         text,
  local_escudo         text,
  visitante_id         uuid,
  visitante_nombre     text,
  visitante_escudo     text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  WITH semana AS (
    SELECT DATE_TRUNC('week', NOW() AT TIME ZONE 'America/Santiago') AS inicio
  )
  SELECT
    p.id,
    p.estado::text,
    p.fecha,
    p.lugar::text,
    p.tipo_futbol::text,
    COALESCE(p.goles_local,    0),
    COALESCE(p.goles_visitante, 0),
    el.id,   el.nombre::text, el.escudo_url::text,
    ev.id,   ev.nombre::text, ev.escudo_url::text
  FROM partidos p
  JOIN equipos el ON el.id = p.equipo_local_id
  JOIN equipos ev ON ev.id = p.equipo_visitante_id
  CROSS JOIN semana
  WHERE p.estado = 'completado'
    AND DATE_TRUNC('week', p.fecha AT TIME ZONE 'America/Santiago') = semana.inicio
    AND el.bloqueado = false
    AND ev.bloqueado = false
  ORDER BY (COALESCE(p.goles_local, 0) + COALESCE(p.goles_visitante, 0)) DESC
  LIMIT 1;
$$;
