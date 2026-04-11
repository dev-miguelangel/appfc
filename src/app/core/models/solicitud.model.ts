export type TipoSolicitud   = 'edicion' | 'cancelacion';
export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada';

export interface PartidoSolicitud {
  id: string;
  partido_id: string;
  solicitante_id: string;
  tipo: TipoSolicitud;
  estado: EstadoSolicitud;
  nueva_fecha: string | null;
  nuevo_lugar: string | null;
  created_at: string;
}
