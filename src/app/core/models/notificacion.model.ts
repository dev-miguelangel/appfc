export type TipoNotificacion =
  | 'partido_editado'
  | 'partido_cancelado'
  | 'partido_aceptado'
  | 'partido_rechazado'
  | 'solicitud_nueva'
  | 'solicitud_aprobada'
  | 'solicitud_rechazada'
  | 'postulacion_nueva';

export interface Notificacion {
  id: string;
  usuario_id: string;
  tipo: TipoNotificacion;
  mensaje: string;
  partido_id: string | null;
  equipo_id:  string | null;
  leida: boolean;
  created_at: string;
}
