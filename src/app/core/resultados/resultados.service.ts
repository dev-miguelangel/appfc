import { inject, Injectable } from '@angular/core';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';
import { Marcador } from '../models/partido.model';
import { localStore } from '../local-db/local-store';

type DbRow = Record<string, unknown>;

@Injectable({ providedIn: 'root' })
export class ResultadosService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db   = inject<any>(SUPABASE_CLIENT);
  private auth = inject(AuthService);

  /**
   * El capitán envía el marcador completo (goles_local, goles_visitante)
   * desde la perspectiva del partido.
   * rol: 'local' si es capitán del equipo local, 'visitante' si no.
   */
  async confirmarResultado(
    partido_id: string,
    rol: 'local' | 'visitante',
    golesLocal: number,
    golesVisitante: number,
  ): Promise<string | null> {
    const marcador: Marcador = { local: golesLocal, visitante: golesVisitante };
    const fields = rol === 'local'
      ? { score_local: marcador, result_conf_local: true }
      : { score_visit: marcador, result_conf_visit: true };

    const { error } = await this.db
      .from('partidos')
      .update(fields)
      .eq('id', partido_id);

    if (error) return (error as { message: string }).message;

    // El trigger de Supabase no existe en mock → resolver manualmente
    if (environment.useLocalDb) {
      this.resolverBilateralMock(partido_id);
    }
    return null;
  }

  // ─── Resolución bilateral (solo mock) ───────────────────────────────────────

  private resolverBilateralMock(partido_id: string): void {
    const p = localStore.findOne<DbRow>('partidos', 'id', partido_id);
    if (!p) return;

    const confLocal = p['result_conf_local'] as boolean;
    const confVisit = p['result_conf_visit'] as boolean;
    if (!confLocal || !confVisit) return;

    const sL = this.parseMarcador(p['score_local']);
    const sV = this.parseMarcador(p['score_visit']);
    if (!sL || !sV) return;

    if (sL.local === sV.local && sL.visitante === sV.visitante) {
      localStore.upsert('partidos', {
        ...p,
        estado:          'completado',
        goles_local:     sL.local,
        goles_visitante: sL.visitante,
      });
      this.actualizarReputacionesMock(partido_id);
    } else {
      localStore.upsert('partidos', { ...p, estado: 'en_disputa' });
    }
  }

  private actualizarReputacionesMock(partido_id: string): void {
    const jugadores = localStore.findMany<DbRow>('partido_jugadores', 'partido_id', partido_id);
    for (const j of jugadores) {
      const uid     = j['usuario_id'] as string;
      const usuario = localStore.findOne<DbRow>('usuarios', 'id', uid);
      if (!usuario) continue;

      let ra = (usuario['rep_asistencia']  as number) ?? 50;
      let rp = (usuario['rep_puntualidad'] as number) ?? 50;
      let rc = (usuario['rep_compromiso']  as number) ?? 50;

      const estado = j['estado'] as string;
      const asistio = j['asistio'] as boolean | null;

      if (estado === 'confirmado' && asistio === true) {
        ra = Math.min(100, ra + 3);
        rp = Math.min(100, rp + 2);
        rc = Math.min(100, rc + 2);
      } else if (estado === 'confirmado' && asistio === false) {
        ra = Math.max(0, ra - 6);
        rp = Math.max(0, rp - 4);
        rc = Math.max(0, rc - 3);
      } else if (estado === 'pendiente' && asistio === true) {
        ra = Math.min(100, ra + 1);
      }

      localStore.upsert('usuarios', {
        ...usuario,
        rep_asistencia:  ra,
        rep_puntualidad: rp,
        rep_compromiso:  rc,
      });
    }

    // Refrescar perfil reactivo del usuario actual
    const uid = this.auth.userId();
    if (uid) void this.auth.loadPerfil(uid);
  }

  private parseMarcador(raw: unknown): Marcador | null {
    if (!raw || typeof raw !== 'object') return null;
    const m = raw as Record<string, unknown>;
    const local     = typeof m['local']     === 'number' ? m['local']     : parseInt(String(m['local']     ?? ''), 10);
    const visitante = typeof m['visitante'] === 'number' ? m['visitante'] : parseInt(String(m['visitante'] ?? ''), 10);
    if (isNaN(local) || isNaN(visitante)) return null;
    return { local, visitante };
  }
}
