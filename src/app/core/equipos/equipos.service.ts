import { inject, Injectable, signal } from '@angular/core';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';
import { AuthService, UsuarioPerfil } from '../auth/auth.service';
import {
  Equipo, EquipoDetalle, EquipoMiembro, EquipoMiembroConPerfil,
} from '../models/equipo.model';

@Injectable({ providedIn: 'root' })
export class EquiposService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db  = inject<any>(SUPABASE_CLIENT);
  private auth = inject(AuthService);

  readonly misEquipos   = signal<Equipo[]>([]);
  readonly loadingLista = signal(false);

  // ─── Listado ─────────────────────────────────────────────────────────────────

  async cargarMisEquipos(): Promise<void> {
    const uid = this.auth.userId();
    if (!uid) return;
    this.loadingLista.set(true);

    // 1. IDs de equipos donde soy miembro activo
    const { data: memberships } = await this.db
      .from('equipo_miembros')
      .select('equipo_id')
      .eq('usuario_id', uid)
      .eq('estado', 'activo');

    const ids: string[] = (memberships ?? []).map((m: { equipo_id: string }) => m.equipo_id);

    if (!ids.length) {
      this.misEquipos.set([]);
      this.loadingLista.set(false);
      return;
    }

    // 2. Datos de cada equipo
    const equipos: Equipo[] = [];
    for (const id of ids) {
      const { data } = await this.db.from('equipos').select('*').eq('id', id).single();
      if (data) equipos.push(data as Equipo);
    }

    this.misEquipos.set(equipos);
    this.loadingLista.set(false);
  }

  // ─── Detalle ─────────────────────────────────────────────────────────────────

  async getEquipo(id: string): Promise<EquipoDetalle | null> {
    const { data: equipo } = await this.db
      .from('equipos').select('*').eq('id', id).single();
    if (!equipo) return null;

    const { data: miembros } = await this.db
      .from('equipo_miembros').select('*').eq('equipo_id', id);

    const miembrosConPerfil: EquipoMiembroConPerfil[] = [];
    for (const m of (miembros ?? []) as EquipoMiembro[]) {
      const { data: usuario } = await this.db
        .from('usuarios').select('*').eq('id', m.usuario_id).single();
      if (usuario) {
        miembrosConPerfil.push({ ...m, usuario: usuario as UsuarioPerfil });
      }
    }

    return { ...(equipo as Equipo), miembros: miembrosConPerfil };
  }

  // ─── Crear equipo ─────────────────────────────────────────────────────────────

  async crearEquipo(nombre: string, escudo_url?: string): Promise<{ id: string } | null> {
    const uid = this.auth.userId();
    if (!uid) return null;

    const id = crypto.randomUUID();
    const { error } = await this.db.from('equipos').insert({
      id,
      nombre: nombre.trim(),
      capitan_id: uid,
      escudo_url: escudo_url ?? null,
      created_at: new Date().toISOString(),
    });
    if (error) return null;

    // Insertar capitan como miembro activo
    await this.db.from('equipo_miembros').insert({
      id: crypto.randomUUID(),
      equipo_id: id,
      usuario_id: uid,
      rol: 'capitan',
      estado: 'activo',
      joined_at: new Date().toISOString(),
    });

    await this.cargarMisEquipos();
    return { id };
  }

  // ─── Invitar miembro ──────────────────────────────────────────────────────────

  async invitarMiembro(equipo_id: string, usuario_id: string): Promise<string | null> {
    const { error } = await this.db.from('equipo_miembros').insert({
      id: crypto.randomUUID(),
      equipo_id,
      usuario_id,
      rol: 'jugador',
      estado: 'pendiente',
      joined_at: null,
    });
    return (error as { message: string } | null)?.message ?? null;
  }

  // ─── Responder invitacion ────────────────────────────────────────────────────

  async responderInvitacion(
    equipo_id: string,
    aceptar: boolean,
  ): Promise<string | null> {
    const uid = this.auth.userId();
    if (!uid) return 'No autenticado';

    const estado = aceptar ? 'activo' : 'rechazado';
    const { error } = await this.db
      .from('equipo_miembros')
      .update({
        estado,
        joined_at: aceptar ? new Date().toISOString() : null,
      })
      .eq('equipo_id', equipo_id)
      .eq('usuario_id', uid);

    if (!error && aceptar) await this.cargarMisEquipos();
    return (error as { message: string } | null)?.message ?? null;
  }

  // ─── Buscar usuarios ─────────────────────────────────────────────────────────

  async buscarUsuarios(
    query: string,
    excluirEquipoId?: string,
  ): Promise<UsuarioPerfil[]> {
    const uid = this.auth.userId();
    if (query.trim().length < 2) return [];

    const { data } = await this.db
      .from('usuarios')
      .select('*')
      .ilike('nombre', `%${query}%`)
      .neq('id', uid)
      .limit(10);

    let resultados = (data ?? []) as UsuarioPerfil[];

    // Excluir los que ya son miembros (activos o pendientes) del equipo
    if (excluirEquipoId) {
      const { data: existentes } = await this.db
        .from('equipo_miembros')
        .select('usuario_id')
        .eq('equipo_id', excluirEquipoId)
        .neq('estado', 'rechazado');

      const yaEnEquipo = new Set(
        ((existentes ?? []) as { usuario_id: string }[]).map(m => m.usuario_id),
      );
      resultados = resultados.filter(u => !yaEnEquipo.has(u.id));
    }

    return resultados;
  }

  // ─── Subir escudo ─────────────────────────────────────────────────────────────

  async uploadEscudo(equipo_id: string, file: File): Promise<string | null> {
    const ext  = file.name.split('.').pop();
    const path = `escudos/${equipo_id}.${ext}`;

    const { error } = await this.db.storage
      .from('fotos')
      .upload(path, file, { upsert: true });
    if (error) return null;

    const { data } = this.db.storage.from('fotos').getPublicUrl(path);
    const url = (data as { publicUrl: string }).publicUrl;

    await this.db.from('equipos').update({ escudo_url: url }).eq('id', equipo_id);
    return url;
  }

  // ─── Todos los equipos ───────────────────────────────────────────────────────

  async getAllEquipos(): Promise<Equipo[]> {
    const { data } = await this.db.from('equipos').select('*').order('nombre', { ascending: true });
    return (data ?? []) as Equipo[];
  }

  // ─── Invitaciones pendientes del usuario ────────────────────────────────────

  async getInvitacionesPendientes(): Promise<
    Array<{ equipo: Equipo; miembro: EquipoMiembro }>
  > {
    const uid = this.auth.userId();
    if (!uid) return [];

    const { data: pendientes } = await this.db
      .from('equipo_miembros')
      .select('*')
      .eq('usuario_id', uid)
      .eq('estado', 'pendiente');

    const result: Array<{ equipo: Equipo; miembro: EquipoMiembro }> = [];
    for (const m of (pendientes ?? []) as EquipoMiembro[]) {
      const { data: equipo } = await this.db
        .from('equipos').select('*').eq('id', m.equipo_id).single();
      if (equipo) result.push({ equipo: equipo as Equipo, miembro: m });
    }
    return result;
  }
}
