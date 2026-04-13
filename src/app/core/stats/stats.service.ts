import { inject, Injectable } from '@angular/core';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';

export interface DiaMetrica {
  fecha: string;   // 'YYYY-MM-DD'
  cantidad: number;
}

export interface StatsResumen {
  totalUsuarios: number;
  totalLogins: number;
  registrosPorDia: DiaMetrica[];
  loginsPorDia: DiaMetrica[];
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db = inject<any>(SUPABASE_CLIENT);

  async registrarEvento(tipo: 'login' | 'registro', usuario_id: string): Promise<void> {
    await this.db.from('app_eventos').insert({ tipo, usuario_id });
  }

  async cargarResumen(dias = 30): Promise<StatsResumen> {
    const desde = new Date();
    desde.setDate(desde.getDate() - dias);
    const desdeIso = desde.toISOString();

    const [{ count: totalUsuarios }, { count: totalLogins }, { data: eventos }] =
      await Promise.all([
        this.db.from('usuarios').select('*', { count: 'exact', head: true }),
        this.db.from('app_eventos').select('*', { count: 'exact', head: true }).eq('tipo', 'login'),
        this.db
          .from('app_eventos')
          .select('tipo, created_at')
          .gte('created_at', desdeIso)
          .order('created_at', { ascending: true }),
      ]);

    const rows: { tipo: string; created_at: string }[] = eventos ?? [];

    const agrupar = (tipo: string): DiaMetrica[] => {
      const mapa = new Map<string, number>();
      rows
        .filter(r => r.tipo === tipo)
        .forEach(r => {
          const fecha = r.created_at.slice(0, 10);
          mapa.set(fecha, (mapa.get(fecha) ?? 0) + 1);
        });
      return Array.from(mapa.entries())
        .map(([fecha, cantidad]) => ({ fecha, cantidad }))
        .sort((a, b) => a.fecha.localeCompare(b.fecha));
    };

    return {
      totalUsuarios: totalUsuarios ?? 0,
      totalLogins: totalLogins ?? 0,
      registrosPorDia: agrupar('registro'),
      loginsPorDia: agrupar('login'),
    };
  }
}
