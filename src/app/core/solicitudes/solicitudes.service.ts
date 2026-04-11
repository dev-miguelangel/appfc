import { inject, Injectable } from '@angular/core';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';
import { AuthService } from '../auth/auth.service';
import { PartidoSolicitud, TipoSolicitud } from '../models/solicitud.model';

@Injectable({ providedIn: 'root' })
export class SolicitudesService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db   = inject<any>(SUPABASE_CLIENT);
  private auth = inject(AuthService);

  /** Carga todas las solicitudes de un partido (pendientes e históricas). */
  async cargar(partido_id: string): Promise<PartidoSolicitud[]> {
    const { data } = await this.db
      .from('partido_solicitudes')
      .select('*')
      .eq('partido_id', partido_id)
      .order('created_at', { ascending: false });
    return (data ?? []) as PartidoSolicitud[];
  }

  /** Crea una solicitud de cambio (llamado por el capitán visitante). */
  async crear(
    partido_id: string,
    tipo: TipoSolicitud,
    nueva_fecha?: string,
    nuevo_lugar?: string | null,
  ): Promise<string | null> {
    const uid = this.auth.userId();
    if (!uid) return 'No autenticado';
    const { error } = await this.db.from('partido_solicitudes').insert({
      id:             crypto.randomUUID(),
      partido_id,
      solicitante_id: uid,
      tipo,
      estado:         'pendiente',
      nueva_fecha:    nueva_fecha ?? null,
      nuevo_lugar:    nuevo_lugar ?? null,
      created_at:     new Date().toISOString(),
    });
    return (error as { message: string } | null)?.message ?? null;
  }

  /**
   * Actualiza el estado de la solicitud.
   * La lógica de aplicar los cambios (editarPartido / cancelarPartido)
   * es responsabilidad del componente que llama a este método.
   */
  async responder(solicitud_id: string, aprobar: boolean): Promise<string | null> {
    const estado = aprobar ? 'aprobada' : 'rechazada';
    const { error } = await this.db
      .from('partido_solicitudes')
      .update({ estado })
      .eq('id', solicitud_id);
    return (error as { message: string } | null)?.message ?? null;
  }
}
