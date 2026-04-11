import { UsuarioPerfil } from '../auth/auth.service';

export interface Equipo {
  id: string;
  nombre: string;
  capitan_id: string;
  escudo_url: string | null;
  created_at: string;
}

export type EstadoMiembro = 'pendiente' | 'activo' | 'rechazado';
export type RolEquipo     = 'capitan'   | 'jugador';

export interface EquipoMiembro {
  id: string;
  equipo_id: string;
  usuario_id: string;
  rol: RolEquipo;
  estado: EstadoMiembro;
  joined_at: string | null;
}

export interface EquipoMiembroConPerfil extends EquipoMiembro {
  usuario: Pick<UsuarioPerfil, 'id' | 'nombre' | 'posicion' | 'comuna' | 'foto_url' | 'rep_asistencia' | 'rep_puntualidad' | 'rep_compromiso'>;
}

export interface EquipoDetalle extends Equipo {
  miembros: EquipoMiembroConPerfil[];
}
