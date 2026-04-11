/**
 * seed.ts — Datos de prueba para modo local (useLocalDb: true)
 *
 * Incluye:
 *  • Los Barrabases — equipo de la revista Barrabases (personajes de Guillo)
 *  • La Roja — selección chilena campeona Copa América 2015
 *
 * Uso:
 *  import { seedLocalDb, clearSeedLocalDb } from './seed';
 *  seedLocalDb();    // inserta datos (idempotente)
 *  clearSeedLocalDb(); // elimina los datos del seed
 */

import { localStore } from './local-store';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Posicion = 'portero' | 'defensa' | 'volante' | 'delantero';

interface SeedPlayer {
  id: string;
  email: string;
  password: string;
  nombre: string;
  edad: number;
  comuna: string;
  posicion: Posicion;
  rep_asistencia: number;
  rep_puntualidad: number;
  rep_compromiso: number;
}

// ─── IDs fijos ────────────────────────────────────────────────────────────────

export const SEED_IDS = {
  equipoBarrabases: '11111111-1111-1111-1111-000000000001',
  equipoRoja:       '22222222-2222-2222-2222-000000000001',
} as const;

// ─── Barrabases ───────────────────────────────────────────────────────────────
// Personajes de "Barrabases", historieta de Guillo (Guillermo Tejeda)

const BARRABASES: SeedPlayer[] = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-000000000001',
    email: 'camotillo@barrabases.cl',   password: 'barrabases',
    nombre: 'Camotillo',   edad: 22, comuna: 'La Florida',
    posicion: 'delantero',
    rep_asistencia: 88, rep_puntualidad: 80, rep_compromiso: 92,
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-000000000002',
    email: 'cabezon@barrabases.cl',     password: 'barrabases',
    nombre: 'Cabezón',     edad: 19, comuna: 'Pudahuel',
    posicion: 'portero',
    rep_asistencia: 72, rep_puntualidad: 68, rep_compromiso: 75,
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-000000000003',
    email: 'tronco@barrabases.cl',      password: 'barrabases',
    nombre: 'Tronco',      edad: 25, comuna: 'Maipu',
    posicion: 'defensa',
    rep_asistencia: 65, rep_puntualidad: 55, rep_compromiso: 70,
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-000000000004',
    email: 'patadepalo@barrabases.cl',  password: 'barrabases',
    nombre: 'Pata de Palo', edad: 23, comuna: 'Lo Espejo',
    posicion: 'volante',
    rep_asistencia: 78, rep_puntualidad: 70, rep_compromiso: 82,
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-000000000005',
    email: 'lechuza@barrabases.cl',     password: 'barrabases',
    nombre: 'Lechuza',     edad: 21, comuna: 'Nunoa',
    posicion: 'volante',
    rep_asistencia: 85, rep_puntualidad: 88, rep_compromiso: 80,
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-000000000006',
    email: 'flequillo@barrabases.cl',   password: 'barrabases',
    nombre: 'Flequillo',   edad: 20, comuna: 'Penalolen',
    posicion: 'delantero',
    rep_asistencia: 60, rep_puntualidad: 55, rep_compromiso: 65,
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-000000000007',
    email: 'agachado@barrabases.cl',    password: 'barrabases',
    nombre: 'Agachado',    edad: 24, comuna: 'Cerro Navia',
    posicion: 'defensa',
    rep_asistencia: 70, rep_puntualidad: 72, rep_compromiso: 75,
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-000000000008',
    email: 'chicharra@barrabases.cl',   password: 'barrabases',
    nombre: 'Chicharra',   edad: 22, comuna: 'Recoleta',
    posicion: 'volante',
    rep_asistencia: 74, rep_puntualidad: 71, rep_compromiso: 73,
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-000000000009',
    email: 'patillas@barrabases.cl',    password: 'barrabases',
    nombre: 'Patillas',    edad: 26, comuna: 'Puente Alto',
    posicion: 'defensa',
    rep_asistencia: 52, rep_puntualidad: 48, rep_compromiso: 55,
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-000000000010',
    email: 'chompa@barrabases.cl',      password: 'barrabases',
    nombre: 'Chompa',      edad: 18, comuna: 'San Bernardo',
    posicion: 'portero',
    rep_asistencia: 80, rep_puntualidad: 78, rep_compromiso: 82,
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-000000000011',
    email: 'caracoles@barrabases.cl',   password: 'barrabases',
    nombre: 'Caracoles',   edad: 23, comuna: 'Pedro Aguirre Cerda',
    posicion: 'volante',
    rep_asistencia: 45, rep_puntualidad: 60, rep_compromiso: 50,
  },
];

// ─── La Roja — Copa América 2015 ─────────────────────────────────────────────
// Plantel titular de la selección chilena, primer título en Copa América

const ROJA: SeedPlayer[] = [
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-000000000001',
    email: 'claudio.bravo@laroja.cl',       password: 'laroja2015',
    nombre: 'Claudio Bravo',          edad: 32, comuna: 'San Bernardo',
    posicion: 'portero',
    rep_asistencia: 95, rep_puntualidad: 94, rep_compromiso: 96,
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-000000000002',
    email: 'gary.medel@laroja.cl',          password: 'laroja2015',
    nombre: 'Gary Medel',             edad: 28, comuna: 'Santiago',
    posicion: 'defensa',
    rep_asistencia: 90, rep_puntualidad: 85, rep_compromiso: 92,
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-000000000003',
    email: 'alexis.sanchez@laroja.cl',      password: 'laroja2015',
    nombre: 'Alexis Sánchez',         edad: 26, comuna: 'Antofagasta',
    posicion: 'delantero',
    rep_asistencia: 92, rep_puntualidad: 88, rep_compromiso: 95,
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-000000000004',
    email: 'arturo.vidal@laroja.cl',        password: 'laroja2015',
    nombre: 'Arturo Vidal',           edad: 28, comuna: 'San Joaquin',
    posicion: 'volante',
    rep_asistencia: 89, rep_puntualidad: 82, rep_compromiso: 93,
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-000000000005',
    email: 'charles.aranguiz@laroja.cl',    password: 'laroja2015',
    nombre: 'Charles Aránguiz',       edad: 26, comuna: 'San Ramon',
    posicion: 'volante',
    rep_asistencia: 93, rep_puntualidad: 92, rep_compromiso: 91,
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-000000000006',
    email: 'eduardo.vargas@laroja.cl',      password: 'laroja2015',
    nombre: 'Eduardo Vargas',         edad: 25, comuna: 'La Pintana',
    posicion: 'delantero',
    rep_asistencia: 88, rep_puntualidad: 86, rep_compromiso: 87,
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-000000000007',
    email: 'mauricio.isla@laroja.cl',       password: 'laroja2015',
    nombre: 'Mauricio Isla',          edad: 27, comuna: 'San Bernardo',
    posicion: 'defensa',
    rep_asistencia: 87, rep_puntualidad: 85, rep_compromiso: 88,
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-000000000008',
    email: 'jean.beausejour@laroja.cl',     password: 'laroja2015',
    nombre: 'Jean Beausejour',        edad: 30, comuna: 'Santiago',
    posicion: 'defensa',
    rep_asistencia: 85, rep_puntualidad: 84, rep_compromiso: 86,
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-000000000009',
    email: 'fuenzalida@laroja.cl',          password: 'laroja2015',
    nombre: 'José Pedro Fuenzalida',  edad: 28, comuna: 'Rancagua',
    posicion: 'defensa',
    rep_asistencia: 86, rep_puntualidad: 88, rep_compromiso: 85,
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-000000000010',
    email: 'gonzalo.jara@laroja.cl',        password: 'laroja2015',
    nombre: 'Gonzalo Jara',           edad: 31, comuna: 'Hualpén',
    posicion: 'defensa',
    rep_asistencia: 82, rep_puntualidad: 78, rep_compromiso: 80,
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-000000000011',
    email: 'jorge.valdivia@laroja.cl',      password: 'laroja2015',
    nombre: 'Jorge Valdivia',         edad: 31, comuna: 'Temuco',
    posicion: 'volante',
    rep_asistencia: 80, rep_puntualidad: 76, rep_compromiso: 82,
  },
];

// ─── Función principal ────────────────────────────────────────────────────────

export function seedLocalDb(): { ok: boolean; msg: string } {
  // Idempotente: no duplicar si ya existe
  const existente = localStore.findOne('equipos', 'id', SEED_IDS.equipoBarrabases);
  if (existente) {
    return { ok: false, msg: 'Los datos de prueba ya están cargados.' };
  }

  const now = new Date().toISOString();
  const allPlayers = [...BARRABASES, ...ROJA];

  // 1. Cuentas de auth + perfiles de usuario
  for (const p of allPlayers) {
    localStore.upsert('auth_accounts', { id: p.id, email: p.email, password: p.password });
    localStore.upsert('usuarios', {
      id:              p.id,
      nombre:          p.nombre,
      edad:            p.edad,
      comuna:          p.comuna,
      posicion:        p.posicion,
      foto_url:        null,
      google_id:       null,
      rep_asistencia:  p.rep_asistencia,
      rep_puntualidad: p.rep_puntualidad,
      rep_compromiso:  p.rep_compromiso,
      created_at:      now,
    });
  }

  // 2. Equipos
  localStore.upsert('equipos', {
    id:         SEED_IDS.equipoBarrabases,
    nombre:     'Los Barrabases',
    capitan_id: BARRABASES[0].id, // Camotillo
    escudo_url: null,
    created_at: now,
  });

  localStore.upsert('equipos', {
    id:         SEED_IDS.equipoRoja,
    nombre:     'La Roja (Copa América 2015)',
    capitan_id: ROJA[0].id, // Claudio Bravo
    escudo_url: null,
    created_at: now,
  });

  // 3. Membresías
  BARRABASES.forEach((p, i) => {
    localStore.upsert('equipo_miembros', {
      id:         `cccccccc-cccc-cccc-cccc-${String(i + 1).padStart(12, '0')}`,
      equipo_id:  SEED_IDS.equipoBarrabases,
      usuario_id: p.id,
      rol:        i === 0 ? 'capitan' : 'jugador',
      estado:     'activo',
      joined_at:  now,
    });
  });

  ROJA.forEach((p, i) => {
    localStore.upsert('equipo_miembros', {
      id:         `dddddddd-dddd-dddd-dddd-${String(i + 1).padStart(12, '0')}`,
      equipo_id:  SEED_IDS.equipoRoja,
      usuario_id: p.id,
      rol:        i === 0 ? 'capitan' : 'jugador',
      estado:     'activo',
      joined_at:  now,
    });
  });

  const msg =
    '22 jugadores y 2 equipos cargados.\n' +
    '• Los Barrabases → camotillo@barrabases.cl / barrabases\n' +
    '• La Roja 2015   → claudio.bravo@laroja.cl / laroja2015\n' +
    '(Cualquier jugador del equipo funciona con la misma contraseña)';

  console.info('[Seed]', msg);
  return { ok: true, msg };
}

// ─── Limpiar seed ─────────────────────────────────────────────────────────────

export function clearSeedLocalDb(): void {
  const allIds = [...BARRABASES, ...ROJA].map(p => p.id);

  // Eliminar convocatorias de partidos seed
  const allPJs = localStore.all<{ id: string; usuario_id: string }>('partido_jugadores');
  for (const pj of allPJs.filter(pj => allIds.includes(pj.usuario_id))) {
    localStore.delete('partido_jugadores', pj.id);
  }

  // Eliminar membresías
  BARRABASES.forEach((_, i) => localStore.delete('equipo_miembros', `cccccccc-cccc-cccc-cccc-${String(i + 1).padStart(12, '0')}`));
  ROJA.forEach((_, i)       => localStore.delete('equipo_miembros', `dddddddd-dddd-dddd-dddd-${String(i + 1).padStart(12, '0')}`));

  // Eliminar equipos
  localStore.delete('equipos', SEED_IDS.equipoBarrabases);
  localStore.delete('equipos', SEED_IDS.equipoRoja);

  // Eliminar usuarios y cuentas
  for (const id of allIds) {
    localStore.delete('usuarios', id);
    localStore.delete('auth_accounts', id);
  }

  console.info('[Seed] Datos de prueba eliminados.');
}
