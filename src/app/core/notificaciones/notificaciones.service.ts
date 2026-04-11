import { computed, inject, Injectable, signal } from '@angular/core';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';
import { AuthService } from '../auth/auth.service';
import { Notificacion, TipoNotificacion } from '../models/notificacion.model';

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db   = inject<any>(SUPABASE_CLIENT);
  private auth = inject(AuthService);

  readonly todas    = signal<Notificacion[]>([]);
  readonly noLeidas = computed(() => this.todas().filter(n => !n.leida).length);

  async cargarNotificaciones(): Promise<void> {
    const uid = this.auth.userId();
    if (!uid) return;
    const { data } = await this.db
      .from('notificaciones')
      .select('*')
      .eq('usuario_id', uid)
      .order('created_at', { ascending: false })
      .limit(40);
    this.todas.set((data ?? []) as Notificacion[]);
  }

  async marcarLeida(id: string): Promise<void> {
    await this.db.from('notificaciones').update({ leida: true }).eq('id', id);
    this.todas.update(ns => ns.map(n => n.id === id ? { ...n, leida: true } : n));
  }

  async marcarTodasLeidas(): Promise<void> {
    const uid = this.auth.userId();
    if (!uid) return;
    await this.db
      .from('notificaciones')
      .update({ leida: true })
      .eq('usuario_id', uid);
    this.todas.update(ns => ns.map(n => ({ ...n, leida: true })));
  }

  /**
   * Crea notificaciones para todos los jugadores convocados al partido,
   * excepto el usuario que disparó el cambio.
   */
  async notificarJugadores(
    partido_id: string,
    tipo: TipoNotificacion,
    mensaje: string,
  ): Promise<void> {
    const uid = this.auth.userId();
    const { data: convs } = await this.db
      .from('partido_jugadores')
      .select('usuario_id')
      .eq('partido_id', partido_id);

    for (const c of (convs ?? []) as { usuario_id: string }[]) {
      if (c.usuario_id === uid) continue;
      await this.db.from('notificaciones').insert({
        id:         crypto.randomUUID(),
        usuario_id: c.usuario_id,
        tipo,
        mensaje,
        partido_id,
        leida:      false,
        created_at: new Date().toISOString(),
      });
    }
  }
}
