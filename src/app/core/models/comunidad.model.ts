import { EstadoPartido, TipoFutbol } from './partido.model';

export interface EquipoPublico {
  id: string;
  nombre: string;
  escudo_url: string | null;
}

export interface PartidoPublico {
  id: string;
  estado: EstadoPartido;
  fecha: string;
  lugar: string | null;
  tipo_futbol: TipoFutbol;
  equipo_local: EquipoPublico;
  equipo_visitante: EquipoPublico;
  goles_local: number | null;
  goles_visitante: number | null;
}

export interface StatsJugadorSemanal {
  usuario_id: string;
  nombre: string;
  foto_url: string | null;
  posicion: string | null;
  goles_semana: number;
  partidos_semana: number;
  racha_actual?: number;
}

export interface StatsEquipoSemanal {
  equipo_id: string;
  nombre: string;
  escudo_url: string | null;
  victorias: number;
  empates: number;
  derrotas: number;
  goles_favor: number;
  goles_contra: number;
}

export interface SemanaHistorial {
  semana: string;
  jugado: boolean;
}

export interface BoletinData {
  semana: string;
  goleadores: StatsJugadorSemanal[];
  masActivos: StatsJugadorSemanal[];
  mejorRacha: StatsJugadorSemanal[];
  equiposDestacados: StatsEquipoSemanal[];
  partidoSemana: PartidoPublico | null;
}
