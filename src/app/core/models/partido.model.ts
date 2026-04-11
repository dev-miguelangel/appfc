import { Equipo } from './equipo.model';
import { UsuarioPerfil } from '../auth/auth.service';

export type TipoFutbol          = 'futbol5' | 'futbol7' | 'futbol8' | 'futbol11';
export type EstadoPartido       = 'programado' | 'en_disputa' | 'completado' | 'cancelado';
export type EstadoConvocatoria  = 'pendiente'  | 'confirmado' | 'rechazado';
export type AceptacionVisitante = 'pendiente'  | 'aceptada'  | 'rechazada';

export interface Marcador { local: number; visitante: number; }

export interface Partido {
  id: string;
  equipo_local_id: string;
  equipo_visitante_id: string;
  tipo_futbol: TipoFutbol;
  max_jugadores_equipo: number;
  fecha: string;
  lugar: string | null;
  estado: EstadoPartido;
  creador_id: string;
  created_at: string;
  // Aceptación del partido por el visitante
  aceptacion_visitante: AceptacionVisitante;
  // Etapa 5: resultado bilateral
  goles_local:        number | null;
  goles_visitante:    number | null;
  result_conf_local:  boolean;
  result_conf_visit:  boolean;
  score_local:        Marcador | null;
  score_visit:        Marcador | null;
}

export interface PartidoJugador {
  id: string;
  partido_id: string;
  usuario_id: string;
  equipo_id: string;
  estado: EstadoConvocatoria;
  asistio: boolean | null;
}

export interface PartidoJugadorConPerfil extends PartidoJugador {
  usuario: Pick<UsuarioPerfil, 'id' | 'nombre' | 'posicion' | 'foto_url'>;
}

export interface PartidoConEquipos extends Partido {
  equipo_local: Equipo;
  equipo_visitante: Equipo;
}

export interface PartidoDetalle extends PartidoConEquipos {
  jugadores: PartidoJugadorConPerfil[];
}

export interface CrearPartidoData {
  equipo_local_id: string;
  equipo_visitante_id: string;
  tipo_futbol: TipoFutbol;
  max_jugadores_equipo: number;
  fecha: string;
  lugar?: string;
}

export const TIPO_FUTBOL_LABELS: Record<TipoFutbol, string> = {
  futbol5:  'Fútbol 5',
  futbol7:  'Fútbol 7',
  futbol8:  'Fútbol 8',
  futbol11: 'Fútbol 11',
};

export const TIPO_FUTBOL_MAX: Record<TipoFutbol, number> = {
  futbol5:  5,
  futbol7:  7,
  futbol8:  8,
  futbol11: 11,
};
