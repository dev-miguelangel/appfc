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
- [ ] Login con Google
- [ ] Perfil de jugador (nombre, edad, comuna, posicion, foto)
- [ ] Crear equipo e invitar miembros por busqueda de usuario
- [ ] Un jugador puede pertenecer a multiples equipos
- [ ] Crear partido (fecha, hora, lugar, formato 5v5 / 7v7 / 11v11, equipos o jugadores sueltos)
- [ ] Confirmar / rechazar asistencia a un partido
- [ ] Sistema de reputacion: puntaje por asistencia, puntualidad y compromiso (registrado tras cada partido)
- [ ] Busqueda de reemplazos: la app propone jugadores por posicion y comuna, el capitan envia invitaciones
- [ ] Notificaciones in-app para invitaciones y confirmaciones

### Nice to have (post-MVP)
- [ ] Chat de equipo o partido
- [ ] Historial de partidos jugados por jugador
- [ ] Mapa de canchas frecuentes
- [ ] Notificaciones por email o push (PWA)
- [ ] Estadisticas de equipo (partidos jugados, goles, etc.)

### Fuera de scope (v1)
- Pagos / split de cancha — complejidad regulatoria y de UX
- Resultados y marcadores — no es el dolor principal a resolver
- App movil nativa — se resuelve con PWA si es necesario

---

## Flujos principales

### Flujo 1: Crear y completar un partido
1. El capitan crea un partido: formato, fecha, hora, cancha (texto libre), jugadores del equipo
2. La app envia invitaciones a los miembros del equipo
3. Cada jugador confirma o rechaza asistencia
4. Si hay cupos sin cubrir, el capitan activa la busqueda de reemplazos
5. La app lista jugadores compatibles (posicion + comuna) ordenados por reputacion
6. El capitan selecciona y envia invitaciones
7. El jugador libre acepta o rechaza
8. Al terminar el partido, el capitan registra la asistencia real → la reputacion se actualiza

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
- reputacion_asistencia: float (0-5)
- reputacion_puntualidad: float (0-5)
- reputacion_compromiso: float (0-5)
- google_id
- created_at

Equipo
- id
- nombre
- capitan_id (FK → Usuario)
- created_at

EquipoMiembro
- id
- equipo_id (FK → Equipo)
- usuario_id (FK → Usuario)
- estado: enum (pendiente, activo, rechazado)
- joined_at

Partido
- id
- titulo
- formato: enum (5v5, 7v7, 11v11)
- fecha_hora
- lugar (texto libre)
- capitan_id (FK → Usuario)
- equipo_id (FK → Equipo, nullable — puede ser partido abierto)
- estado: enum (programado, completado, cancelado)
- created_at

PartidoJugador
- id
- partido_id (FK → Partido)
- usuario_id (FK → Usuario)
- tipo: enum (titular, reemplazo)
- estado_invitacion: enum (pendiente, aceptado, rechazado)
- asistio: boolean (null hasta registrar)

Notificacion
- id
- usuario_id (FK → Usuario)
- tipo: enum (invitacion_partido, invitacion_equipo, recordatorio)
- referencia_id
- leida: boolean
- created_at
```

### Relaciones
- Usuario puede ser capitan de muchos Equipos
- Usuario puede pertenecer a muchos Equipos (via EquipoMiembro)
- Partido pertenece a un Equipo (opcional) y tiene un Capitan
- Partido tiene muchos Jugadores (via PartidoJugador)

---

## Stack tecnico

| Capa | Tecnologia | Razon |
|------|-----------|-------|
| Frontend | Next.js (App Router) + TypeScript | SSR, routing, DX solido |
| Estilos | Tailwind CSS | Velocidad de prototipado |
| Backend / API | Next.js API Routes o Route Handlers | Monorepo simple para MVP |
| Base de datos | PostgreSQL (Supabase) | Relacional, gratuito en tier inicial |
| ORM | Prisma | Type-safe, migraciones simples |
| Auth | NextAuth.js con Google Provider | Login con Google rapido de implementar |
| Hosting | Vercel | Deploy automatico, integrado con Next.js |
| Almacenamiento | Supabase Storage | Fotos de perfil |

---

## Autenticacion y roles

- [x] Login con Google (OAuth via NextAuth.js)
- [ ] No hay magic link ni email/password en v1

**Roles:**
| Rol | Permisos |
|-----|----------|
| Jugador | Ver y editar su perfil, unirse a equipos, aceptar/rechazar partidos |
| Capitan | Todo lo anterior + crear equipos, crear partidos, buscar y enviar invitaciones a reemplazos, registrar asistencia post-partido |

> El rol de Capitan se asigna automaticamente al crear un equipo o partido. No es un rol global.

---

## Reglas de negocio

1. Solo el capitan de un equipo puede crear partidos para ese equipo
2. Solo el capitan puede iniciar la busqueda de reemplazos y enviar invitaciones
3. Un jugador puede pertenecer a multiples equipos simultaneamente
4. La reputacion se actualiza unicamente cuando el capitan registra la asistencia al cerrar un partido
5. Los candidatos a reemplazo se filtran por: misma posicion y misma comuna (en v1, sin radio geografico)
6. Un jugador invitado a un partido no necesita pertenecer al equipo organizador
7. Un partido puede existir sin equipo asociado (jugadores sueltos convocados individualmente)

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

## Notas adicionales

- El nombre AppFC es provisional
- La busqueda de reemplazos es el diferenciador clave — priorizar que ese flujo sea rapido y confiable
- Chile primero: nomenclatura local (comuna, no barrio), RUT no requerido en v1
- Considerar PWA desde el inicio para uso movil sin app store
