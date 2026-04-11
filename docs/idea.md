# AppFC

## Vision general

> Plataforma web para coordinar partidos de futbol amateur en Chile: gestiona equipos, programa partidos y encuentra reemplazos cuando falla un jugador.

**Problema que resuelve:**
Los jugadores amateur pierden partidos por inasistencias de ultimo momento. No existe una forma rapida de encontrar un reemplazo calificado cerca, ni un historial de reputacion que ayude a confiar en jugadores desconocidos.

**Solucion propuesta:**
Cada jugador tiene un perfil con posicion, comuna y reputacion (asistencia, puntualidad, compromiso). Los capitanes organizan partidos con su equipo o invitan jugadores sueltos. Cuando falta alguien, la app propone candidatos compatibles y el capitan acepta o rechaza. Las invitaciones se envian automaticamente.

---

## Usuarios objetivo

Personas que juegan futbol amateur en Chile de forma recurrente o que buscan partidos donde participar.

### Usuario primario — Capitan de equipo
- **Perfil:** hombre, 20-40 anos, Santiago u otra ciudad de Chile, organiza partidos regularmente
- **Pain point principal:** jugadores que fallan a ultimo momento y no hay forma rapida de cubrir el cupo
- **Motivacion:** coordinar partidos sin depender de WhatsApp, tener un historial de confianza de cada jugador

### Usuario secundario — Jugador libre
- **Perfil:** persona que quiere jugar de forma recurrente pero no tiene equipo fijo o quiere mas partidos
- **Pain point principal:** no sabe donde ni como sumarse a un partido
- **Motivacion:** aparecer en la app y recibir invitaciones a partidos cerca de su comuna

---

## Funcionalidades del MVP

> Validar que los capitanes pueden coordinar partidos completos y cubrir bajas usando la app.

### Core (must have)
- [x] Landing page publica con presentacion del producto
- [ ] Login con Google
- [ ] Perfil de jugador (nombre, edad, comuna, posicion, foto)
- [ ] Crear equipo e invitar miembros por busqueda de usuario
- [ ] Un jugador puede pertenecer a multiples equipos
- [ ] Crear partido entre 2 equipos (fecha, hora, lugar desde catalogo, tipo de futbol, cupo maximo por equipo)
- [ ] Confirmar / rechazar asistencia a un partido
- [ ] Confirmacion bilateral del resultado (ambos capitanes deben confirmar)
- [ ] Sistema de reputacion: puntaje por asistencia, puntualidad y compromiso (registrado tras cada partido completado)
- [ ] Busqueda de reemplazos: la app propone jugadores por posicion y comuna, el capitan envia invitaciones
- [ ] Catalogo de lugares / canchas con soporte para patrocinadores
- [ ] Notificaciones in-app para invitaciones y confirmaciones

### Nice to have (post-MVP)
- [ ] Chat de equipo o partido
- [ ] Historial de partidos jugados por jugador
- [ ] Mapa de canchas frecuentes
- [ ] Notificaciones por email o push (PWA)
- [ ] Estadisticas de equipo (partidos jugados, goles, etc.)
- [ ] Reserva de cancha en linea (con comision)

### Fuera de scope (v1)
- Pagos / split de cancha — complejidad regulatoria y de UX
- App movil nativa — se resuelve con PWA si es necesario

---

## Flujos principales

### Flujo 1: Crear y completar un partido
1. El capitan crea un partido: selecciona equipo local y equipo visitante (obligatorio), tipo de futbol, cupo maximo por equipo, fecha, hora y cancha desde el catalogo
2. La app envia invitaciones a los miembros de ambos equipos
3. Cada jugador confirma o rechaza asistencia
4. Si hay cupos sin cubrir, el capitan activa la busqueda de reemplazos
5. La app lista jugadores compatibles (posicion + comuna) ordenados por reputacion
6. El capitan selecciona y envia invitaciones (maximo 5 simultaneas por cupo)
7. El jugador libre acepta o rechaza
8. Al terminar el partido, el capitan de cada equipo registra el resultado de su equipo
9. Cuando ambos capitanes confirman el resultado → estado pasa a `completado` → la reputacion se actualiza

### Flujo 2: Jugador libre recibe invitacion
1. El jugador tiene perfil creado con posicion y comuna
2. Recibe notificacion de invitacion a partido
3. Ve los detalles: fecha, lugar, formato, equipo
4. Acepta o rechaza
5. Si acepta, queda en la lista del partido y su reputacion esta en juego

### Flujo 3: Unirse a un equipo
1. El capitan busca un usuario por nombre
2. Envia invitacion de equipo
3. El jugador acepta → queda como miembro del equipo
4. El jugador aparece disponible en futuros partidos de ese equipo

---

## Pantallas / Vistas

| Vista | Descripcion | Ruta |
|-------|-------------|------|
| Landing | Presentacion y CTA de registro | `/` |
| Login | Autenticacion con Google | `/auth` |
| Dashboard | Proximos partidos y actividad reciente | `/dashboard` |
| Perfil propio | Editar datos, ver reputacion e historial | `/perfil` |
| Perfil de otro jugador | Ver datos y reputacion (solo lectura) | `/jugador/:id` |
| Mi equipo | Lista de miembros, invitar, ver partidos del equipo | `/equipo/:id` |
| Crear equipo | Formulario de creacion | `/equipo/nuevo` |
| Partido detalle | Info del partido, lista de jugadores, estado de asistencia | `/partido/:id` |
| Crear partido | Formulario: formato, fecha, lugar, jugadores | `/partido/nuevo` |
| Buscar reemplazos | Lista de candidatos filtrados por posicion y comuna | `/partido/:id/reemplazos` |
| Notificaciones | Invitaciones pendientes y actividad | `/notificaciones` |

---

## Modelo de datos

```
Usuario
- id
- nombre
- edad
- comuna
- posicion: enum (portero, defensa, volante, delantero)
- foto_url
- rep_asistencia: numeric (0-100)
- rep_puntualidad: numeric (0-100)
- rep_compromiso: numeric (0-100)
- google_id
- created_at

Equipo
- id
- nombre
- capitan_id (FK → Usuario)
- escudo_url
- created_at

EquipoMiembro
- id
- equipo_id (FK → Equipo)
- usuario_id (FK → Usuario)
- estado: enum (pendiente, activo, rechazado)
- rol: enum (capitan, jugador)
- joined_at

Lugar
- id
- nombre
- direccion
- comuna
- tipo_superficie: enum (cesped_natural, cesped_sintetico, cemento, parquet)
- precio_hora (nullable)
- lat / lng
- foto_url
- contacto
- es_patrocinador: boolean
- created_at

Partido
- id
- titulo
- tipo_futbol: enum (futbol_11, futbol_7, futbol_5, futsal)
- max_jugadores_equipo: smallint
- fecha_hora
- lugar_id (FK → Lugar)
- equipo_local_id (FK → Equipo, NOT NULL)
- equipo_visitante_id (FK → Equipo, NOT NULL, distinto de local)
- goles_local (nullable hasta cierre)
- goles_visitante (nullable hasta cierre)
- result_conf_local: boolean
- result_conf_visit: boolean
- estado: enum (programado, en_disputa, completado, cancelado)
- created_at

PartidoJugador
- id
- partido_id (FK → Partido)
- usuario_id (FK → Usuario)
- equipo_id (FK → Equipo)
- tipo: enum (titular, reemplazo)
- estado_invitacion: enum (pendiente, aceptado, rechazado)
- asistio: boolean (null hasta registrar)
- invited_at

Notificacion
- id
- usuario_id (FK → Usuario)
- tipo: enum (invitacion_partido, invitacion_equipo, recordatorio, resultado)
- ref_id (uuid del recurso relacionado)
- payload: jsonb
- leida: boolean
- created_at
```

### Relaciones
- Usuario puede ser capitan de muchos Equipos
- Usuario puede pertenecer a muchos Equipos (via EquipoMiembro)
- Partido siempre tiene exactamente 2 equipos distintos (local y visitante)
- Partido referencia un Lugar del catalogo
- Partido tiene muchos Jugadores distribuidos entre los 2 equipos (via PartidoJugador)
- El resultado se confirma bilateralmente: un capitan por equipo

---

## Stack tecnico

| Capa | Tecnologia | Razon |
|------|-----------|-------|
| Frontend | Angular 21 + TypeScript strict | Signals, standalone components, lazy loading |
| Estilos | Tailwind CSS v4 | Utility-first, zero runtime, PostCSS |
| Backend / BaaS | Supabase | PostgreSQL + Auth + Realtime + Storage |
| Auth | Supabase Auth (Google OAuth) | JWT, refresh tokens automaticos |
| Base de datos | PostgreSQL 17 (Supabase) | RLS, funciones, triggers, indices |
| Hosting | Vercel | Deploy automatico desde GitHub |
| Almacenamiento | Supabase Storage | Fotos de perfil y escudos de equipo |

---

## Autenticacion y roles

- [ ] Login con Google (OAuth via Supabase Auth)
- [ ] No hay magic link ni email/password en v1

**Roles:**
| Rol | Permisos |
|-----|----------|
| Jugador | Ver y editar su perfil, unirse a equipos, aceptar/rechazar partidos |
| Capitan | Todo lo anterior + crear equipos, crear partidos, buscar y enviar invitaciones a reemplazos, registrar asistencia post-partido |

> El rol de Capitan se asigna automaticamente al crear un equipo o partido. No es un rol global.

---

## Reglas de negocio

1. Todo partido requiere exactamente 2 equipos distintos (equipo_local y equipo_visitante, ambos obligatorios)
2. El tipo de futbol y el cupo maximo por equipo son campos requeridos al crear el partido
3. Solo el capitan de un equipo puede crear partidos y gestionar la convocatoria de su equipo
4. El resultado se confirma bilateralmente: cada capitan confirma el marcador de su propio equipo
5. El partido pasa a `completado` solo cuando ambos capitanes confirman; si los marcadores no coinciden queda en `en_disputa`
6. Los capitanes tienen 24 horas post-partido para confirmar el resultado
7. La reputacion se actualiza solo cuando el partido alcanza el estado `completado`
8. Un jugador puede pertenecer a multiples equipos simultaneamente
9. Los candidatos a reemplazo se filtran por: misma posicion y misma comuna, ordenados por reputacion desc
10. Las canchas con `es_patrocinador = true` aparecen primero en el selector de lugar al crear un partido

---

## Metricas de exito (MVP)

- Al menos 3 partidos completados end-to-end (creacion → asistencia registrada) en las primeras 2 semanas de prueba
- Al menos 1 reemplazo cubierto exitosamente usando el flujo de busqueda
- 10 usuarios con perfil completo creado
- 0 bugs criticos en flujos core durante la primera semana en produccion

---

## Riesgos y supuestos

| Riesgo / Supuesto | Probabilidad | Mitigacion |
|-------------------|-------------|------------|
| Pocos jugadores libres disponibles hace inutil la busqueda de reemplazos | Alta (early stage) | Seed manual de usuarios en comunas piloto |
| Los capitanes no registran la asistencia post-partido | Media | Recordatorio automatico 2h despues del partido |
| La reputacion se percibe como punitiva y frena el registro | Media | Reputacion visible solo para el capitan al buscar reemplazos |
| Usuarios usan WhatsApp en paralelo y no adoptan la app | Alta | Reducir friccion: cada accion debe ser mas rapida que un mensaje de WhatsApp |

---

## Alcance del MVP

**Criterios de "listo":**
- [ ] Login con Google funcional
- [ ] Flujo completo: crear equipo → crear partido → invitar jugadores → confirmar asistencia → registrar resultado
- [ ] Flujo de reemplazo: detectar cupo vacio → ver candidatos → enviar invitacion → jugador acepta
- [ ] Reputacion calculada y visible en el perfil
- [ ] Deploy en produccion (Vercel) accesible publicamente
- [ ] Probado con al menos 5 usuarios reales en Chile

---

## Referencias y competencia

| App / Producto | Lo que hace bien | Lo que falta |
|---------------|-----------------|--------------|
| GoalFive | Reserva de canchas | Gestion de equipos y reemplazos |
| Meetup | Eventos deportivos abiertos | Especificidad del futbol, reputacion |
| WhatsApp grupos | Ubicuo, sin friccion | Historial, reputacion, busqueda de reemplazos |

---

## Monetizacion

- **B2C freemium:** plan gratis (1 equipo, 5 partidos/mes) + Jugador Pro $2.990/mes + Club $7.990/mes + Liga $19.990/mes
- **B2B canchas:** recintos deportivos pagan $19.990/mes para aparecer destacados en el selector de lugar (`es_patrocinador = true`)
- Monetizacion se activa en mes 4-6, cuando el NPS supere 40

---

## Estado del proyecto

| Etapa | Descripcion | Estado |
|-------|-------------|--------|
| 1 | Base Angular 21 + landing page | ✅ Completada |
| 2 | Auth Google + perfil de jugador | ✅ Completada |
| 3 | Equipos y miembros | Pendiente |
| 4 | Partidos (2 equipos, tipo, lugar) | Pendiente |
| 5 | Resultado bilateral + reputacion | Pendiente |
| 6 | Busqueda de reemplazos | Pendiente |
| 7 | Notificaciones realtime | Pendiente |
| 8 | Catalogo de lugares / canchas | Pendiente |
| 9 | QA + PWA | Pendiente |
| 10 | Launch produccion | Pendiente |

---

## Notas adicionales

- El nombre AppFC es provisional
- La busqueda de reemplazos es el diferenciador clave — priorizar que ese flujo sea rapido y confiable
- Chile primero: nomenclatura local (comuna, no barrio), RUT no requerido en v1
- PWA desde el inicio para uso movil sin app store
- Repositorio: https://github.com/dev-miguelangel/appfc
