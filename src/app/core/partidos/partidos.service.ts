import { inject, Injectable, signal } from '@angular/core';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';
import { AuthService } from '../auth/auth.service';
import {
  CrearPartidoData, EstadoConvocatoria,
  Partido, PartidoConEquipos, PartidoDetalle, PartidoJugador, PartidoJugadorConPerfil,
} from '../models/partido.model';
import { Equipo } from '../models/equipo.model';
import { UsuarioPerfil } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class PartidosService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db   = inject<any>(SUPABASE_CLIENT);
  private auth = inject(AuthService);

  readonly misPartidos = signal<PartidoConEquipos[]>([]);
  readonly loading     = signal(false);

  // ─── Listado ─────────────────────────────────────────────────────────────────

  async cargarMisPartidos(): Promise<void> {
    const uid = this.auth.userId();
    if (!uid) return;
    this.loading.set(true);

    const { data: convs } = await this.db
      .from('partido_jugadores')
      .select('*')
      .eq('usuario_id', uid);

    const ids: string[] = (convs ?? []).map((c: PartidoJugador) => c.partido_id);

    if (!ids.length) {
      this.misPartidos.set([]);
      this.loading.set(false);
      return;
    }

    const partidos: PartidoConEquipos[] = [];
    for (const id of ids) {
      const { data: p } = await this.db.from('partidos').select('*').eq('id', id).single();
      if (p) {
        const [{ data: local }, { data: visitante }] = await Promise.all([
          this.db.from('equipos').select('*').eq('id', (p as Partido).equipo_local_id).single(),
          this.db.from('equipos').select('*').eq('id', (p as Partido).equipo_visitante_id).single(),
        ]);
        if (local && visitante) {
          partidos.push({
            ...(p as Partido),
            equipo_local: local as Equipo,
            equipo_visitante: visitante as Equipo,
          });
        }
      }
    }

    // Próximos primero (asc), luego completados/cancelados (desc)
    partidos.sort((a, b) => {
      if (a.estado === 'programado' && b.estado !== 'programado') return -1;
      if (a.estado !== 'programado' && b.estado === 'programado') return  1;
      if (a.estado === 'programado') {
        return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
      }
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    });

    this.misPartidos.set(partidos);
    this.loading.set(false);
  }

  // ─── Detalle ──────────────────────────────────────────────────────────────────

  async getPartido(id: string): Promise<PartidoDetalle | null> {
    const { data: p } = await this.db.from('partidos').select('*').eq('id', id).single();
    if (!p) return null;

    const [{ data: local }, { data: visitante }] = await Promise.all([
      this.db.from('equipos').select('*').eq('id', (p as Partido).equipo_local_id).single(),
      this.db.from('equipos').select('*').eq('id', (p as Partido).equipo_visitante_id).single(),
    ]);
    if (!local || !visitante) return null;

    const { data: convs } = await this.db
      .from('partido_jugadores').select('*').eq('partido_id', id);

    const jugadores: PartidoJugadorConPerfil[] = [];
    for (const c of (convs ?? []) as PartidoJugador[]) {
      const { data: usuario } = await this.db
        .from('usuarios').select('*').eq('id', c.usuario_id).single();
      if (usuario) {
        jugadores.push({ ...c, usuario: usuario as UsuarioPerfil });
      }
    }

    return {
      ...(p as Partido),
      equipo_local: local as Equipo,
      equipo_visitante: visitante as Equipo,
      jugadores,
    };
  }

  // ─── Crear partido ────────────────────────────────────────────────────────────

  async crearPartido(data: CrearPartidoData): Promise<{ id: string } | null> {
    const uid = this.auth.userId();
    if (!uid) return null;

    const id = crypto.randomUUID();
    const { error } = await this.db.from('partidos').insert({
      id,
      equipo_local_id:       data.equipo_local_id,
      equipo_visitante_id:   data.equipo_visitante_id,
      tipo_futbol:           data.tipo_futbol,
      max_jugadores_equipo:  data.max_jugadores_equipo,
      fecha:                 data.fecha,
      lugar:                 data.lugar ?? null,
      estado:                'programado',
      aceptacion_visitante:  'pendiente',
      creador_id:            uid,
      created_at:            new Date().toISOString(),
    });
    if (error) return null;

    await this.autoConvocar(id, [data.equipo_local_id, data.equipo_visitante_id]);
    await this.cargarMisPartidos();
    return { id };
  }

  private async autoConvocar(partido_id: string, equipo_ids: string[]): Promise<void> {
    const seen = new Set<string>();
    for (const equipo_id of equipo_ids) {
      const { data: miembros } = await this.db
        .from('equipo_miembros').select('*')
        .eq('equipo_id', equipo_id)
        .eq('estado', 'activo');
      for (const m of (miembros ?? []) as { usuario_id: string }[]) {
        if (!seen.has(m.usuario_id)) {
          seen.add(m.usuario_id);
          await this.db.from('partido_jugadores').insert({
            id:         crypto.randomUUID(),
            partido_id,
            usuario_id: m.usuario_id,
            equipo_id,
            estado:     'pendiente',
            asistio:    null,
          });
        }
      }
    }
  }

  // ─── Responder convocatoria ───────────────────────────────────────────────────

  async responderConvocatoria(partido_jugador_id: string, aceptar: boolean): Promise<string | null> {
    const estado: EstadoConvocatoria = aceptar ? 'confirmado' : 'rechazado';
    const { error } = await this.db
      .from('partido_jugadores')
      .update({ estado })
      .eq('id', partido_jugador_id);
    return (error as { message: string } | null)?.message ?? null;
  }

  // ─── Registrar asistencia ────────────────────────────────────────────────────
  // Solo actualiza los jugadores del equipo indicado.
  // La confirmación bilateral del resultado es Etapa 5.

  async registrarAsistencia(partido_id: string, asistentes: string[], equipo_id: string): Promise<string | null> {
    const { data: jugadores } = await this.db
      .from('partido_jugadores')
      .select('*')
      .eq('partido_id', partido_id)
      .eq('equipo_id', equipo_id);

    for (const j of (jugadores ?? []) as PartidoJugador[]) {
      await this.db
        .from('partido_jugadores')
        .update({ asistio: asistentes.includes(j.usuario_id) })
        .eq('id', j.id);
    }

    await this.cargarMisPartidos();
    return null;
  }

  // ─── Editar partido ──────────────────────────────────────────────────────────

  async editarPartido(
    partido_id: string,
    cambios: { fecha?: string; lugar?: string | null },
  ): Promise<string | null> {
    const { error } = await this.db
      .from('partidos')
      .update(cambios)
      .eq('id', partido_id);
    if (error) return (error as { message: string }).message;
    await this.cargarMisPartidos();
    return null;
  }

  // ─── Aceptación / rechazo del visitante ─────────────────────────────────────

  async aceptarPartido(partido_id: string): Promise<string | null> {
    const { error } = await this.db
      .from('partidos')
      .update({ aceptacion_visitante: 'aceptada' })
      .eq('id', partido_id);
    if (error) return (error as { message: string }).message;
    await this.cargarMisPartidos();
    return null;
  }

  async rechazarPartido(partido_id: string): Promise<string | null> {
    const { error } = await this.db
      .from('partidos')
      .update({ aceptacion_visitante: 'rechazada' })
      .eq('id', partido_id);
    if (error) return (error as { message: string }).message;
    await this.cargarMisPartidos();
    return null;
  }

  // ─── Cancelar partido ────────────────────────────────────────────────────────

  async cancelarPartido(partido_id: string): Promise<string | null> {
    const { error } = await this.db
      .from('partidos')
      .update({ estado: 'cancelado' })
      .eq('id', partido_id);
    await this.cargarMisPartidos();
    return (error as { message: string } | null)?.message ?? null;
  }
}
