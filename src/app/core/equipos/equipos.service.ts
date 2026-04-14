import { inject, Injectable, signal } from '@angular/core';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';
import { AuthService, UsuarioPerfil } from '../auth/auth.service';
import {
  Equipo, EquipoBusquedaResult, EquipoDetalle, EquipoMiembro, EquipoMiembroConPerfil,
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

  async crearEquipo(nombre: string, escudo_url?: string): Promise<{ id: string; error?: string } | null> {
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
    if (error) {
      const msg = (error as { message: string }).message ?? '';
      if (msg.includes('equipos_nombre_unico') || msg.includes('unique')) {
        return { id: '', error: 'Ya existe un equipo con ese nombre. Elige otro.' };
      }
      return null;
    }

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
    // Upsert: si ya existe (rechazado, etc.) lo resetea a pendiente
    const { error } = await this.db.from('equipo_miembros').upsert(
      {
        equipo_id,
        usuario_id,
        rol: 'jugador',
        estado: 'pendiente',
        joined_at: null,
      },
      { onConflict: 'equipo_id,usuario_id' },
    );
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
      .or(`nombre.ilike.%${query}%,nickname.ilike.%${query}%,email.ilike.%${query}%`)
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

  // ─── Buscar equipos (para postular) ──────────────────────────────────────────

  readonly PAGE_SIZE = 5;

  async buscarEquipos(
    query: string,
    page: number,
  ): Promise<{ resultados: EquipoBusquedaResult[]; total: number }> {
    const uid  = this.auth.userId();
    const from = page * this.PAGE_SIZE;
    const to   = from + this.PAGE_SIZE - 1;

    const { data, count } = await this.db
      .from('equipos')
      .select('*', { count: 'exact' })
      .or(`nombre.ilike.%${query}%,codigo.ilike.%${query}%`)
      .eq('bloqueado', false)
      .order('nombre', { ascending: true })
      .range(from, to);

    const equipos: Equipo[] = data ?? [];

    if (!equipos.length) return { resultados: [], total: 0 };

    const ids = equipos.map(e => e.id);

    // Contar miembros activos por equipo
    const { data: activosData } = await this.db
      .from('equipo_miembros')
      .select('equipo_id')
      .in('equipo_id', ids)
      .eq('estado', 'activo');

    const activosPorEquipo = new Map<string, number>();
    for (const m of (activosData ?? []) as { equipo_id: string }[]) {
      activosPorEquipo.set(m.equipo_id, (activosPorEquipo.get(m.equipo_id) ?? 0) + 1);
    }

    // Estado del usuario en cada equipo
    const miEstadoMap = new Map<string, 'activo' | 'pendiente'>();
    if (uid) {
      const { data: myData } = await this.db
        .from('equipo_miembros')
        .select('equipo_id, estado')
        .eq('usuario_id', uid)
        .in('equipo_id', ids)
        .in('estado', ['activo', 'pendiente']);

      for (const m of (myData ?? []) as { equipo_id: string; estado: string }[]) {
        miEstadoMap.set(m.equipo_id, m.estado as 'activo' | 'pendiente');
      }
    }

    const resultados: EquipoBusquedaResult[] = equipos.map(e => ({
      equipo:          e,
      miembrosActivos: activosPorEquipo.get(e.id) ?? 0,
      miEstado:        miEstadoMap.get(e.id) ?? null,
    }));

    return { resultados, total: count ?? 0 };
  }

  // ─── Postular a un equipo ────────────────────────────────────────────────────

  async postularAEquipo(equipoId: string): Promise<string | null> {
    const uid = this.auth.userId();
    if (!uid) return 'No autenticado';

    // Verificar que no sea el capitán ni ya miembro/pendiente
    const { data: equipo } = await this.db
      .from('equipos').select('capitan_id, nombre').eq('id', equipoId).single();
    if (!equipo) return 'Equipo no encontrado';
    if ((equipo as { capitan_id: string }).capitan_id === uid) return 'Eres el capitán de este equipo';

    const { data: existe } = await this.db
      .from('equipo_miembros')
      .select('id, estado')
      .eq('equipo_id', equipoId)
      .eq('usuario_id', uid)
      .maybeSingle();

    if (existe) {
      const e = existe as { estado: string };
      if (e.estado === 'activo')   return 'Ya eres miembro de este equipo';
      if (e.estado === 'pendiente') return 'Ya tienes una solicitud pendiente';
    }

    const { error } = await this.db.from('equipo_miembros').insert({
      equipo_id:  equipoId,
      usuario_id: uid,
      rol:        'jugador',
      estado:     'pendiente',
      origen:     'postulacion',
      joined_at:  null,
    });
    if (error) return (error as { message: string }).message;

    // Notificar al capitán
    const { data: perfil } = await this.db
      .from('usuarios').select('nombre').eq('id', uid).single();
    const nombreSolicitante = (perfil as { nombre: string } | null)?.nombre ?? 'Un jugador';
    const nombreEquipo      = (equipo as { nombre: string }).nombre;

    await this.db.from('notificaciones').insert({
      id:         crypto.randomUUID(),
      usuario_id: (equipo as { capitan_id: string }).capitan_id,
      tipo:       'postulacion_nueva',
      mensaje:    `${nombreSolicitante} quiere unirse a tu equipo "${nombreEquipo}"`,
      equipo_id:  equipoId,
      partido_id: null,
      leida:      false,
      created_at: new Date().toISOString(),
    });

    return null;
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

  // ─── Cambiar capitán ─────────────────────────────────────────────────────────

  async cambiarCapitan(equipo_id: string, nuevo_capitan_id: string): Promise<string | null> {
    const uid = this.auth.userId();
    if (!uid) return 'No autenticado';

    // 1. Bajar rol del capitán actual a jugador
    const { error: e1 } = await this.db
      .from('equipo_miembros')
      .update({ rol: 'jugador' })
      .eq('equipo_id', equipo_id)
      .eq('usuario_id', uid);
    if (e1) return (e1 as { message: string }).message;

    // 2. Subir al nuevo capitán
    const { error: e2 } = await this.db
      .from('equipo_miembros')
      .update({ rol: 'capitan' })
      .eq('equipo_id', equipo_id)
      .eq('usuario_id', nuevo_capitan_id);
    if (e2) return (e2 as { message: string }).message;

    // 3. Actualizar capitan_id en equipos
    const { error: e3 } = await this.db
      .from('equipos')
      .update({ capitan_id: nuevo_capitan_id })
      .eq('id', equipo_id);
    if (e3) return (e3 as { message: string }).message;

    return null;
  }

  // ─── Eliminar equipo ─────────────────────────────────────────────────────────

  async eliminarEquipo(equipo_id: string): Promise<string | null> {
    const { error } = await this.db
      .from('equipos')
      .delete()
      .eq('id', equipo_id);
    if (!error) await this.cargarMisEquipos();
    return (error as { message: string } | null)?.message ?? null;
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
