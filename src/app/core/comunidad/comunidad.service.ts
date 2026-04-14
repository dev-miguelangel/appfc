import { inject, Injectable } from '@angular/core';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';
import {
  BoletinData,
  PartidoPublico,
  SemanaHistorial,
  StatsEquipoSemanal,
  StatsJugadorSemanal,
} from '../models/comunidad.model';
import { TipoFutbol, EstadoPartido } from '../models/partido.model';
import { getISOWeekLabel } from './semana.util';

@Injectable({ providedIn: 'root' })
export class ComunidadService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db = inject<any>(SUPABASE_CLIENT);

  // ── Partidos públicos ──────────────────────────────────────────────────────

  async getPartidosEnVivo(): Promise<PartidoPublico[]> {
    const { data } = await this.db
      .from('partidos')
      .select(`
        id, estado, fecha, lugar, tipo_futbol, goles_local, goles_visitante,
        equipo_local:equipo_local_id(id, nombre, escudo_url),
        equipo_visitante:equipo_visitante_id(id, nombre, escudo_url)
      `)
      .eq('estado', 'en_disputa')
      .order('fecha', { ascending: true });

    return this.mapPartidos(data ?? []);
  }

  async getPartidosProximos(limit = 20): Promise<PartidoPublico[]> {
    const { data } = await this.db
      .from('partidos')
      .select(`
        id, estado, fecha, lugar, tipo_futbol, goles_local, goles_visitante,
        equipo_local:equipo_local_id(id, nombre, escudo_url),
        equipo_visitante:equipo_visitante_id(id, nombre, escudo_url)
      `)
      .eq('estado', 'programado')
      .gte('fecha', new Date().toISOString())
      .order('fecha', { ascending: true })
      .limit(limit);

    return this.mapPartidos(data ?? []);
  }

  async getResultados(limit = 20): Promise<PartidoPublico[]> {
    const { data } = await this.db
      .from('partidos')
      .select(`
        id, estado, fecha, lugar, tipo_futbol, goles_local, goles_visitante,
        equipo_local:equipo_local_id(id, nombre, escudo_url),
        equipo_visitante:equipo_visitante_id(id, nombre, escudo_url)
      `)
      .eq('estado', 'completado')
      .order('fecha', { ascending: false })
      .limit(limit);

    return this.mapPartidos(data ?? []);
  }

  // ── Boletín semanal ────────────────────────────────────────────────────────

  async getBoletinSemanal(): Promise<BoletinData> {
    const [goleadores, masActivos, mejorRacha, equiposDestacados, partidoSemana] =
      await Promise.all([
        this.getRankingGoleadores(),
        this.getRankingActivos(),
        this.getRankingRachas(),
        this.getStatsEquipos(),
        this.getPartidoSemana(),
      ]);

    return {
      semana: getISOWeekLabel(new Date()),
      goleadores,
      masActivos,
      mejorRacha,
      equiposDestacados,
      partidoSemana,
    };
  }

  async getRacha(userId: string): Promise<number> {
    const { data } = await this.db.rpc('calcular_racha', { p_usuario_id: userId });
    return (data as number) ?? 0;
  }

  async getHistorialSemanas(userId: string, semanas = 8): Promise<SemanaHistorial[]> {
    const { data } = await this.db.rpc('get_historial_semanas', {
      p_usuario_id: userId,
      p_semanas: semanas,
    });
    return (data as SemanaHistorial[]) ?? [];
  }

  // ── Helpers privados ───────────────────────────────────────────────────────

  private async getRankingGoleadores(limit = 10): Promise<StatsJugadorSemanal[]> {
    const { data } = await this.db.rpc('get_ranking_goleadores', { p_limit: limit });
    return this.mapJugadores(data ?? []);
  }

  private async getRankingActivos(limit = 10): Promise<StatsJugadorSemanal[]> {
    const { data } = await this.db.rpc('get_ranking_activos', { p_limit: limit });
    return this.mapJugadores(data ?? []);
  }

  private async getRankingRachas(limit = 10): Promise<StatsJugadorSemanal[]> {
    const { data } = await this.db.rpc('get_ranking_rachas', { p_limit: limit });
    return (data ?? []).map((r: Record<string, unknown>) => ({
      usuario_id:     String(r['usuario_id']),
      nombre:         String(r['nombre']),
      foto_url:       r['foto_url'] ? String(r['foto_url']) : null,
      posicion:       r['posicion'] ? String(r['posicion']) : null,
      goles_semana:   Number(r['goles_semana']) || 0,
      partidos_semana:Number(r['partidos_semana']) || 0,
      racha_actual:   Number(r['racha_actual']) || 0,
    }));
  }

  private async getStatsEquipos(limit = 10): Promise<StatsEquipoSemanal[]> {
    const { data } = await this.db.rpc('get_stats_equipos_semana', { p_limit: limit });
    return (data ?? []).map((e: Record<string, unknown>) => ({
      equipo_id:    String(e['equipo_id']),
      nombre:       String(e['nombre']),
      escudo_url:   e['escudo_url'] ? String(e['escudo_url']) : null,
      victorias:    Number(e['victorias']) || 0,
      empates:      Number(e['empates'])   || 0,
      derrotas:     Number(e['derrotas'])  || 0,
      goles_favor:  Number(e['goles_favor'])  || 0,
      goles_contra: Number(e['goles_contra']) || 0,
    }));
  }

  private async getPartidoSemana(): Promise<PartidoPublico | null> {
    const { data } = await this.db.rpc('get_partido_semana');
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    const r = data[0] as Record<string, unknown>;
    return {
      id:              String(r['id']),
      estado:          String(r['estado']) as EstadoPartido,
      fecha:           String(r['fecha']),
      lugar:           r['lugar'] ? String(r['lugar']) : null,
      tipo_futbol:     String(r['tipo_futbol']) as TipoFutbol,
      goles_local:     Number(r['goles_local'])     || 0,
      goles_visitante: Number(r['goles_visitante']) || 0,
      equipo_local:    { id: String(r['local_id']),     nombre: String(r['local_nombre']),     escudo_url: r['local_escudo']     ? String(r['local_escudo'])     : null },
      equipo_visitante:{ id: String(r['visitante_id']), nombre: String(r['visitante_nombre']), escudo_url: r['visitante_escudo'] ? String(r['visitante_escudo']) : null },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapPartidos(rows: any[]): PartidoPublico[] {
    return rows.map(r => ({
      id:              r.id,
      estado:          r.estado as EstadoPartido,
      fecha:           r.fecha,
      lugar:           r.lugar ?? null,
      tipo_futbol:     r.tipo_futbol as TipoFutbol,
      goles_local:     r.goles_local  ?? null,
      goles_visitante: r.goles_visitante ?? null,
      equipo_local:    { id: r.equipo_local?.id ?? '', nombre: r.equipo_local?.nombre ?? '', escudo_url: r.equipo_local?.escudo_url ?? null },
      equipo_visitante:{ id: r.equipo_visitante?.id ?? '', nombre: r.equipo_visitante?.nombre ?? '', escudo_url: r.equipo_visitante?.escudo_url ?? null },
    }));
  }

  private mapJugadores(rows: Record<string, unknown>[]): StatsJugadorSemanal[] {
    return rows.map(r => ({
      usuario_id:      String(r['usuario_id']),
      nombre:          String(r['nombre']),
      foto_url:        r['foto_url'] ? String(r['foto_url']) : null,
      posicion:        r['posicion'] ? String(r['posicion']) : null,
      goles_semana:    Number(r['goles_semana'])    || 0,
      partidos_semana: Number(r['partidos_semana']) || 0,
    }));
  }
}
