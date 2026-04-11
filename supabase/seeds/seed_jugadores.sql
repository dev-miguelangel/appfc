-- ============================================================
-- Seed: Barrabases + La Roja Copa América 2015
-- ============================================================
-- Requisitos:
--   • Ejecutar en Supabase SQL Editor con rol "postgres" (service_role)
--   • Extensión pgcrypto habilitada (viene por defecto en Supabase)
-- Contraseñas:
--   • Los Barrabases : barrabases
--   • La Roja 2015   : laroja2015
-- ============================================================

DO $$
BEGIN

-- Guard: no duplicar si ya existe el seed
IF EXISTS (
  SELECT 1 FROM public.equipos WHERE id = '11111111-1111-1111-1111-000000000001'
) THEN
  RAISE NOTICE 'Seed ya existe — omitiendo.';
  RETURN;
END IF;

-- ────────────────────────────────────────────────────────────
-- 1. AUTH USERS
-- ────────────────────────────────────────────────────────────

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES
  -- ── Los Barrabases ──────────────────────────────────────
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'camotillo@barrabases.cl',  crypt('barrabases',gen_salt('bf',10)), NOW(),NOW(),NOW(),
   '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,'','','',''),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'cabezon@barrabases.cl',    crypt('barrabases',gen_salt('bf',10)), NOW(),NOW(),NOW(),
   '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,'','','',''),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'tronco@barrabases.cl',     crypt('barrabases',gen_salt('bf',10)), NOW(),NOW(),NOW(),
   '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,'','','',''),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'patadepalo@barrabases.cl', crypt('barrabases',gen_salt('bf',10)), NOW(),NOW(),NOW(),
   '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,'','','',''),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000005','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'lechuza@barrabases.cl',    crypt('barrabases',gen_salt('bf',10)), NOW(),NOW(),NOW(),
   '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,'','','',''),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000006','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'flequillo@barrabases.cl',  crypt('barrabases',gen_salt('bf',10)), NOW(),NOW(),NOW(),
   '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,'','','',''),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000007','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'agachado@barrabases.cl',   crypt('barrabases',gen_salt('bf',10)), NOW(),NOW(),NOW(),
   '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,'','','',''),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000008','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'chicharra@barrabases.cl',  crypt('barrabases',gen_salt('bf',10)), NOW(),NOW(),NOW(),
   '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,'','','',''),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000009','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'patillas@barrabases.cl',   crypt('barrabases',gen_salt('bf',10)), NOW(),NOW(),NOW(),
   '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,'','','',''),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000010','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'chompa@barrabases.cl',     crypt('barrabases',gen_salt('bf',10)), NOW(),NOW(),NOW(),
   '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,'','','',''),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000011','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'caracoles@barrabases.cl',  crypt('barrabases',gen_salt('bf',10)), NOW(),NOW(),NOW(),
   '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,'','','',''),
  -- ── La Roja ─────────────────────────────────────────────
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'claudio.bravo@laroja.cl',      crypt('laroja2015',gen_salt('bf',10)), NOW(),NOW(),NOW(),
   '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,'','','',''),
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'gary.medel@laroja.cl',         crypt('laroja2015',gen_salt('bf',10)), NOW(),NOW(),NOW(),
   '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,'','','',''),
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'alexis.sanchez@laroja.cl',     crypt('laroja2015',gen_salt('bf',10)), NOW(),NOW(),NOW(),
   '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,'','','',''),
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'arturo.vidal@laroja.cl',       crypt('laroja2015',gen_salt('bf',10)), NOW(),NOW(),NOW(),
   '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,'','','',''),
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000005','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'charles.aranguiz@laroja.cl',   crypt('laroja2015',gen_salt('bf',10)), NOW(),NOW(),NOW(),
   '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,'','','',''),
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000006','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'eduardo.vargas@laroja.cl',     crypt('laroja2015',gen_salt('bf',10)), NOW(),NOW(),NOW(),
   '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,'','','',''),
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000007','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'mauricio.isla@laroja.cl',      crypt('laroja2015',gen_salt('bf',10)), NOW(),NOW(),NOW(),
   '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,'','','',''),
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000008','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'jean.beausejour@laroja.cl',    crypt('laroja2015',gen_salt('bf',10)), NOW(),NOW(),NOW(),
   '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,'','','',''),
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000009','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'fuenzalida@laroja.cl',         crypt('laroja2015',gen_salt('bf',10)), NOW(),NOW(),NOW(),
   '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,'','','',''),
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000010','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'gonzalo.jara@laroja.cl',       crypt('laroja2015',gen_salt('bf',10)), NOW(),NOW(),NOW(),
   '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,'','','',''),
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000011','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'jorge.valdivia@laroja.cl',     crypt('laroja2015',gen_salt('bf',10)), NOW(),NOW(),NOW(),
   '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,'','','','')
ON CONFLICT (id) DO NOTHING;

-- Identidades de email (necesarias para login con email/password en Supabase)
INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
SELECT
  id::text,
  id,
  json_build_object('sub', id::text, 'email', email)::jsonb,
  'email',
  NOW(), NOW(), NOW()
FROM auth.users
WHERE id IN (
  'aaaaaaaa-aaaa-aaaa-aaaa-000000000001','aaaaaaaa-aaaa-aaaa-aaaa-000000000002',
  'aaaaaaaa-aaaa-aaaa-aaaa-000000000003','aaaaaaaa-aaaa-aaaa-aaaa-000000000004',
  'aaaaaaaa-aaaa-aaaa-aaaa-000000000005','aaaaaaaa-aaaa-aaaa-aaaa-000000000006',
  'aaaaaaaa-aaaa-aaaa-aaaa-000000000007','aaaaaaaa-aaaa-aaaa-aaaa-000000000008',
  'aaaaaaaa-aaaa-aaaa-aaaa-000000000009','aaaaaaaa-aaaa-aaaa-aaaa-000000000010',
  'aaaaaaaa-aaaa-aaaa-aaaa-000000000011',
  'bbbbbbbb-bbbb-bbbb-bbbb-000000000001','bbbbbbbb-bbbb-bbbb-bbbb-000000000002',
  'bbbbbbbb-bbbb-bbbb-bbbb-000000000003','bbbbbbbb-bbbb-bbbb-bbbb-000000000004',
  'bbbbbbbb-bbbb-bbbb-bbbb-000000000005','bbbbbbbb-bbbb-bbbb-bbbb-000000000006',
  'bbbbbbbb-bbbb-bbbb-bbbb-000000000007','bbbbbbbb-bbbb-bbbb-bbbb-000000000008',
  'bbbbbbbb-bbbb-bbbb-bbbb-000000000009','bbbbbbbb-bbbb-bbbb-bbbb-000000000010',
  'bbbbbbbb-bbbb-bbbb-bbbb-000000000011'
)
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 2. PERFILES (public.usuarios)
-- ────────────────────────────────────────────────────────────

INSERT INTO public.usuarios
  (id, nombre, edad, comuna, posicion, foto_url, rep_asistencia, rep_puntualidad, rep_compromiso, created_at)
VALUES
  -- ── Los Barrabases ──────────────────────────────────────
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000001','Camotillo',    22,'La Florida',         'delantero', NULL, 88, 80, 92, NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000002','Cabezón',      19,'Pudahuel',            'portero',   NULL, 72, 68, 75, NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000003','Tronco',       25,'Maipu',               'defensa',   NULL, 65, 55, 70, NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000004','Pata de Palo', 23,'Lo Espejo',           'volante',   NULL, 78, 70, 82, NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000005','Lechuza',      21,'Nunoa',               'volante',   NULL, 85, 88, 80, NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000006','Flequillo',    20,'Penalolen',           'delantero', NULL, 60, 55, 65, NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000007','Agachado',     24,'Cerro Navia',         'defensa',   NULL, 70, 72, 75, NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000008','Chicharra',    22,'Recoleta',            'volante',   NULL, 74, 71, 73, NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000009','Patillas',     26,'Puente Alto',         'defensa',   NULL, 52, 48, 55, NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000010','Chompa',       18,'San Bernardo',        'portero',   NULL, 80, 78, 82, NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000011','Caracoles',    23,'Pedro Aguirre Cerda', 'volante',   NULL, 45, 60, 50, NOW()),
  -- ── La Roja ─────────────────────────────────────────────
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000001','Claudio Bravo',         32,'San Bernardo','portero',   NULL, 95, 94, 96, NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000002','Gary Medel',            28,'Santiago',    'defensa',   NULL, 90, 85, 92, NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000003','Alexis Sánchez',        26,'Antofagasta', 'delantero', NULL, 92, 88, 95, NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000004','Arturo Vidal',          28,'San Joaquin', 'volante',   NULL, 89, 82, 93, NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000005','Charles Aránguiz',      26,'San Ramon',   'volante',   NULL, 93, 92, 91, NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000006','Eduardo Vargas',        25,'La Pintana',  'delantero', NULL, 88, 86, 87, NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000007','Mauricio Isla',         27,'San Bernardo','defensa',   NULL, 87, 85, 88, NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000008','Jean Beausejour',       30,'Santiago',    'defensa',   NULL, 85, 84, 86, NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000009','José Pedro Fuenzalida', 28,'Rancagua',    'defensa',   NULL, 86, 88, 85, NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000010','Gonzalo Jara',          31,'Hualpén',     'defensa',   NULL, 82, 78, 80, NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000011','Jorge Valdivia',        31,'Temuco',      'volante',   NULL, 80, 76, 82, NOW())
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 3. EQUIPOS
-- ────────────────────────────────────────────────────────────

INSERT INTO public.equipos (id, nombre, capitan_id, escudo_url, created_at)
VALUES
  ('11111111-1111-1111-1111-000000000001',
   'Los Barrabases',
   'aaaaaaaa-aaaa-aaaa-aaaa-000000000001', -- Camotillo
   NULL, NOW()),
  ('22222222-2222-2222-2222-000000000001',
   'La Roja (Copa América 2015)',
   'bbbbbbbb-bbbb-bbbb-bbbb-000000000001', -- Claudio Bravo
   NULL, NOW())
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 4. EQUIPO_MIEMBROS
-- ────────────────────────────────────────────────────────────

INSERT INTO public.equipo_miembros (id, equipo_id, usuario_id, rol, estado, joined_at)
VALUES
  -- ── Los Barrabases ──────────────────────────────────────
  ('cccccccc-cccc-cccc-cccc-000000000001','11111111-1111-1111-1111-000000000001','aaaaaaaa-aaaa-aaaa-aaaa-000000000001','capitan','activo',NOW()),
  ('cccccccc-cccc-cccc-cccc-000000000002','11111111-1111-1111-1111-000000000001','aaaaaaaa-aaaa-aaaa-aaaa-000000000002','jugador','activo',NOW()),
  ('cccccccc-cccc-cccc-cccc-000000000003','11111111-1111-1111-1111-000000000001','aaaaaaaa-aaaa-aaaa-aaaa-000000000003','jugador','activo',NOW()),
  ('cccccccc-cccc-cccc-cccc-000000000004','11111111-1111-1111-1111-000000000001','aaaaaaaa-aaaa-aaaa-aaaa-000000000004','jugador','activo',NOW()),
  ('cccccccc-cccc-cccc-cccc-000000000005','11111111-1111-1111-1111-000000000001','aaaaaaaa-aaaa-aaaa-aaaa-000000000005','jugador','activo',NOW()),
  ('cccccccc-cccc-cccc-cccc-000000000006','11111111-1111-1111-1111-000000000001','aaaaaaaa-aaaa-aaaa-aaaa-000000000006','jugador','activo',NOW()),
  ('cccccccc-cccc-cccc-cccc-000000000007','11111111-1111-1111-1111-000000000001','aaaaaaaa-aaaa-aaaa-aaaa-000000000007','jugador','activo',NOW()),
  ('cccccccc-cccc-cccc-cccc-000000000008','11111111-1111-1111-1111-000000000001','aaaaaaaa-aaaa-aaaa-aaaa-000000000008','jugador','activo',NOW()),
  ('cccccccc-cccc-cccc-cccc-000000000009','11111111-1111-1111-1111-000000000001','aaaaaaaa-aaaa-aaaa-aaaa-000000000009','jugador','activo',NOW()),
  ('cccccccc-cccc-cccc-cccc-000000000010','11111111-1111-1111-1111-000000000001','aaaaaaaa-aaaa-aaaa-aaaa-000000000010','jugador','activo',NOW()),
  ('cccccccc-cccc-cccc-cccc-000000000011','11111111-1111-1111-1111-000000000001','aaaaaaaa-aaaa-aaaa-aaaa-000000000011','jugador','activo',NOW()),
  -- ── La Roja ─────────────────────────────────────────────
  ('dddddddd-dddd-dddd-dddd-000000000001','22222222-2222-2222-2222-000000000001','bbbbbbbb-bbbb-bbbb-bbbb-000000000001','capitan','activo',NOW()),
  ('dddddddd-dddd-dddd-dddd-000000000002','22222222-2222-2222-2222-000000000001','bbbbbbbb-bbbb-bbbb-bbbb-000000000002','jugador','activo',NOW()),
  ('dddddddd-dddd-dddd-dddd-000000000003','22222222-2222-2222-2222-000000000001','bbbbbbbb-bbbb-bbbb-bbbb-000000000003','jugador','activo',NOW()),
  ('dddddddd-dddd-dddd-dddd-000000000004','22222222-2222-2222-2222-000000000001','bbbbbbbb-bbbb-bbbb-bbbb-000000000004','jugador','activo',NOW()),
  ('dddddddd-dddd-dddd-dddd-000000000005','22222222-2222-2222-2222-000000000001','bbbbbbbb-bbbb-bbbb-bbbb-000000000005','jugador','activo',NOW()),
  ('dddddddd-dddd-dddd-dddd-000000000006','22222222-2222-2222-2222-000000000001','bbbbbbbb-bbbb-bbbb-bbbb-000000000006','jugador','activo',NOW()),
  ('dddddddd-dddd-dddd-dddd-000000000007','22222222-2222-2222-2222-000000000001','bbbbbbbb-bbbb-bbbb-bbbb-000000000007','jugador','activo',NOW()),
  ('dddddddd-dddd-dddd-dddd-000000000008','22222222-2222-2222-2222-000000000001','bbbbbbbb-bbbb-bbbb-bbbb-000000000008','jugador','activo',NOW()),
  ('dddddddd-dddd-dddd-dddd-000000000009','22222222-2222-2222-2222-000000000001','bbbbbbbb-bbbb-bbbb-bbbb-000000000009','jugador','activo',NOW()),
  ('dddddddd-dddd-dddd-dddd-000000000010','22222222-2222-2222-2222-000000000001','bbbbbbbb-bbbb-bbbb-bbbb-000000000010','jugador','activo',NOW()),
  ('dddddddd-dddd-dddd-dddd-000000000011','22222222-2222-2222-2222-000000000001','bbbbbbbb-bbbb-bbbb-bbbb-000000000011','jugador','activo',NOW())
ON CONFLICT (id) DO NOTHING;

RAISE NOTICE 'Seed completado: 22 jugadores, 2 equipos.';

END $$;
