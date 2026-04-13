import { inject, Injectable } from '@angular/core';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';
import { UsuarioPerfil } from '../auth/auth.service';
import { Equipo } from '../models/equipo.model';
import { Partido } from '../models/partido.model';

export interface AdminEquipo extends Equipo {
  capitan_nombre: string;
  total_miembros: number;
}

export interface AdminPartido extends Partido {
  equipo_local_nombre: string;
  equipo_visitante_nombre: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db = inject<any>(SUPABASE_CLIENT);

  // ── Usuarios ──────────────────────────────────────────────────────────────

  async cargarTodosUsuarios(): Promise<UsuarioPerfil[]> {
    const { data } = await this.db
      .from('usuarios')
      .select('*')
      .order('nombre', { ascending: true });
    return (data ?? []) as UsuarioPerfil[];
  }

  async setUserBloqueado(id: string, bloqueado: boolean): Promise<string | null> {
    const { error } = await this.db
      .from('usuarios')
      .update({ bloqueado })
      .eq('id', id);
    return (error as { message: string } | null)?.message ?? null;
  }

  // ── Equipos ───────────────────────────────────────────────────────────────

  async cargarTodosEquipos(): Promise<AdminEquipo[]> {
    const { data: equipos } = await this.db
      .from('equipos')
      .select('*')
      .order('nombre', { ascending: true });

    if (!equipos?.length) return [];

    const equiposData = equipos as Equipo[];
    const capitanIds = [...new Set(equiposData.map((e: Equipo) => e.capitan_id))];

    // Cargar todos los capitanes en un solo query
    const { data: capitanes } = await this.db
      .from('usuarios')
      .select('id, nombre')
      .in('id', capitanIds);

    const capitanMap = new Map<string, string>(
      ((capitanes ?? []) as { id: string; nombre: string }[]).map(u => [u.id, u.nombre]),
    );

    // Contar miembros activos por equipo
    const { data: miembros } = await this.db
      .from('equipo_miembros')
      .select('equipo_id')
      .eq('estado', 'activo')
      .in('equipo_id', equiposData.map((e: Equipo) => e.id));

    const miembrosCount = new Map<string, number>();
    for (const m of (miembros ?? []) as { equipo_id: string }[]) {
      miembrosCount.set(m.equipo_id, (miembrosCount.get(m.equipo_id) ?? 0) + 1);
    }

    return equiposData.map(e => ({
      ...e,
      capitan_nombre: capitanMap.get(e.capitan_id) ?? '—',
      total_miembros: miembrosCount.get(e.id) ?? 0,
    }));
  }

  async setEquipoBloqueado(id: string, bloqueado: boolean): Promise<string | null> {
    const { error } = await this.db
      .from('equipos')
      .update({ bloqueado })
      .eq('id', id);
    return (error as { message: string } | null)?.message ?? null;
  }

  // ── Partidos ──────────────────────────────────────────────────────────────

  async cargarTodosPartidos(): Promise<AdminPartido[]> {
    const { data: partidos } = await this.db
      .from('partidos')
      .select('*')
      .order('fecha', { ascending: false });

    if (!partidos?.length) return [];

    const partidosData = partidos as Partido[];
    const equipoIds = [
      ...new Set([
        ...partidosData.map(p => p.equipo_local_id),
        ...partidosData.map(p => p.equipo_visitante_id),
      ]),
    ];

    const { data: equipos } = await this.db
      .from('equipos')
      .select('id, nombre')
      .in('id', equipoIds);

    const equipoMap = new Map<string, string>(
      ((equipos ?? []) as { id: string; nombre: string }[]).map(e => [e.id, e.nombre]),
    );

    return partidosData.map(p => ({
      ...p,
      equipo_local_nombre:    equipoMap.get(p.equipo_local_id)    ?? '—',
      equipo_visitante_nombre: equipoMap.get(p.equipo_visitante_id) ?? '—',
    }));
  }

  async cancelarPartido(id: string): Promise<string | null> {
    const { error } = await this.db
      .from('partidos')
      .update({ estado: 'cancelado' })
      .eq('id', id);
    return (error as { message: string } | null)?.message ?? null;
  }

  // ── Stats extra ───────────────────────────────────────────────────────────

  async contarEquipos(): Promise<number> {
    const { count } = await this.db
      .from('equipos')
      .select('*', { count: 'exact', head: true });
    return count ?? 0;
  }

  async contarPartidos(): Promise<number> {
    const { count } = await this.db
      .from('partidos')
      .select('*', { count: 'exact', head: true });
    return count ?? 0;
  }
}
