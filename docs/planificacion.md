# AppFC — Planificacion del proyecto

> Stack: Angular 21 · Supabase · Tailwind CSS v4 · Vercel  
> Metodologia: entrega incremental por etapas, cada una deployable y funcional de forma independiente.

---

## Resumen de etapas

| # | Etapa | Entregable clave | Estado |
|---|-------|-----------------|--------|
| 1 | Base del proyecto + Landing page | App Angular corriendo, landing publica | ✅ Completada |
| 2 | Autenticacion + Perfil de jugador | Login Google/email, onboarding, perfil editable | ✅ Completada |
| 3 | Equipos | Crear equipo, invitar miembros, vista del club | ✅ Completada |
| 4 | Partidos | Crear partido, convocar, confirmar asistencia | ✅ Completada |
| 5 | Resultado y reputacion | Confirmacion bilateral, calculo de reputacion | ✅ Completada |
| 6 | Busqueda de reemplazos | Candidatos por posicion/comuna, invitaciones | Pendiente |
| 7 | Notificaciones realtime | WebSockets, notificaciones in-app en vivo | Pendiente |
| 8 | Lugares / Canchas | Directorio de canchas, patrocinadores | Pendiente |
| 9 | Pulido y QA | Tests, performance, accesibilidad, PWA | Pendiente |
| 10 | Launch | Deploy produccion, seed usuarios beta | Pendiente |

---

## Etapa 1 — Base del proyecto + Landing page ✅

**Objetivo:** Dejar el proyecto Angular 21 configurado con todas las herramientas del stack y publicar la landing page publica.

### 1.1 Setup del proyecto

- [x] Crear proyecto Angular 21 con `ng new appfc --standalone --routing --style=css`
- [x] Configurar Tailwind CSS v4 via `@tailwindcss/postcss` + `postcss.config.mjs`
- [x] Configurar TypeScript en modo `strict`
- [x] Instalar y configurar `@supabase/supabase-js`
- [x] Crear `supabase.provider.ts` con token de inyeccion `SUPABASE_CLIENT`
- [x] Configurar variables de entorno (`environment.ts` / `environment.prod.ts`)
- [x] Inicializar repositorio Git y conectar con GitHub (`dev-miguelangel/appfc`)

**Estructura de carpetas:**
```
src/
  app/
    core/
      supabase/         ← cliente, provider, token DI
      auth/             ← AuthService, guards
      data/             ← listas estaticas (comunas)
      local-db/         ← mock local para desarrollo sin Supabase
    features/
      landing/          ← landing page y sub-componentes
      auth/             ← login, callback OAuth
      shell/            ← layout autenticado, dashboard, perfil, onboarding
    app.routes.ts
    app.config.ts
```

### 1.2 Routing base

- [x] `app.routes.ts` con rutas lazy: `/` → Landing, `/auth` → Auth, `/app/**` → Shell
- [x] `RouterOutlet` en `AppComponent`
- [x] `withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })`

### 1.3 Landing page

- [x] `LandingComponent` — componente raiz de la landing
- [x] `NavComponent` — barra de navegacion fija con CTA y links a secciones via `[routerLink]+fragment`
- [x] `HeroSectionComponent` — hero con player card animada y particulas flotantes
- [x] `FeaturesSectionComponent` — grid de funcionalidades
- [x] `HowItWorksSectionComponent` — pasos del flujo
- [x] `ReputacionSectionComponent` — barras de reputacion con animacion `IntersectionObserver`
- [x] `CtaSectionComponent` — llamado a la accion final
- [x] `FooterComponent` — pie de pagina
- [x] Fuente Bebas Neue via Google Fonts en `styles.css`
- [x] Paleta de colores como CSS custom properties globales (`--color-gold`, `--color-green`, etc.)
- [x] Responsive mobile/desktop
- [x] Smooth scroll a secciones internas (`anchorScrolling` en router)

### 1.4 Deploy inicial

- [x] `ng build` sin errores
- [x] Repositorio GitHub operativo

### Definicion de terminado — Etapa 1 ✅

- [x] `ng serve` y `ng build` sin errores ni warnings criticos
- [x] Landing page correcta en todas las resoluciones objetivo
- [x] Repositorio con `.gitignore` correcto

---

## Etapa 2 — Autenticacion + Perfil de jugador ✅

**Objetivo:** El usuario puede registrarse (Google u email/password), completar su perfil y acceder al area autenticada. En modo desarrollo se usa una base de datos local sin necesidad de credenciales Supabase.

### 2.1 Feature flag modo local

- [x] Flag `useLocalDb: boolean` en `environment.ts` (dev) y `environment.prod.ts` (prod)
- [x] `LocalStore` — CRUD generico sobre `localStorage` que simula tablas SQL
- [x] `MockSupabaseClient` — implementa la misma API que `@supabase/supabase-js`:
  - Auth: `signUp`, `signInWithPassword`, `signOut`, `getSession`, `onAuthStateChange`
  - QueryBuilder: `.from().select().eq().single()` / `.upsert()`
  - Storage: archivos guardados como base64 en `localStorage`
- [x] `provideSupabase()` elige el cliente real o el mock segun el flag
- [x] Banner visual en `/auth` cuando el modo local esta activo
- [x] `signInWithOAuth` deshabilitado en modo local (Google OAuth requiere redirect real)

### 2.2 AuthService

- [x] `AuthService` con Signals: `session`, `perfil`, `isLoggedIn`, `userId`, `perfilCompleto`, `loading`
- [x] `loginWithGoogle()` — OAuth redirect a `/auth/callback`
- [x] `loginWithEmail(email, password)` — carga sesion y perfil directamente (sin depender del timing de `onAuthStateChange`)
- [x] `registerWithEmail(email, password)` — crea cuenta y carga sesion/perfil
- [x] `logout()` — limpia sesion y navega a `/`
- [x] `savePerfil(data)` — upsert en tabla `usuarios`
- [x] `uploadFoto(file)` — sube a Supabase Storage (o `localStorage` en modo local)
- [x] Persistencia de sesion entre recargas via `getSession()`
- [x] `onAuthStateChange` mantiene el signal actualizado

### 2.3 Proteccion de rutas

- [x] `authGuard` — redirige a `/auth` si no hay sesion; redirige a `/app/onboarding` si perfil incompleto
- [x] `onboardingGuard` — redirige a `/app/dashboard` si perfil ya esta completo
- [x] `publicGuard` — redirige a `/app/dashboard` si ya hay sesion activa

### 2.4 Pantalla de login (`/auth`)

- [x] `AuthComponent` con boton "Continuar con Google" (deshabilitado en modo local)
- [x] Formulario email/password con tabs Ingresar / Registrarse
- [x] Visible siempre en modo local (`useLocalDb`), solo en dev en modo Supabase
- [x] Navegacion post-login: `perfilCompleto` → `/app/dashboard`, incompleto → `/app/onboarding`
- [x] `AuthCallbackComponent` — maneja el redirect OAuth en `/auth/callback`

### 2.5 Onboarding (`/app/onboarding`)

- [x] `OnboardingComponent` — formulario: nombre, edad, posicion, comuna
- [x] Lista de comunas de Chile en `core/data/comunas.ts`
- [x] Guard que redirige al dashboard si el perfil ya esta completo

### 2.6 Shell autenticado

- [x] `ShellComponent` — layout con header sticky, nav con links activos, botones logout
- [x] `DashboardComponent` — bienvenida con stats: partidos jugados, equipos, reputacion promedio
- [x] `PerfilComponent` — ver y editar perfil propio, barras de reputacion, upload de foto

### 2.7 Migracion Supabase

- [x] `supabase/migrations/20260407_etapa2_usuarios.sql`:
  - Tipo ENUM `posicion_jugador`
  - Tabla `usuarios` con campos de reputacion (default 50)
  - RLS: SELECT para autenticados, INSERT/UPDATE solo al propio usuario
  - Trigger `on_auth_user_created` → auto-inserta fila en `usuarios` al crear `auth.user`
  - Notas para bucket Storage `fotos` con politicas

### Definicion de terminado — Etapa 2 ✅

- [x] Login con email/password funcional en modo local (localStorage)
- [x] Registro crea cuenta y redirige a onboarding
- [x] Onboarding guarda perfil y redirige al dashboard
- [x] Perfil editable con barras de reputacion
- [x] Rutas protegidas redirigen correctamente segun estado de sesion y perfil
- [x] `ng build` sin errores ni warnings
- [ ] Login con Google funcional end-to-end (requiere credenciales Supabase — pendiente para deploy)
- [ ] Foto de perfil subida a Supabase Storage (funciona en local via base64)

---

## Etapa 3 — Equipos

**Objetivo:** Un usuario puede crear su equipo, invitar jugadores y gestionar su plantilla.

### 3.1 Base de datos

- [ ] Migration `002_equipos.sql`: tablas `equipos` y `equipo_miembros`
- [ ] ENUMs: `estado_miembro_enum` (pendiente, activo, rechazado), `rol_equipo_enum` (capitan, jugador)
- [ ] RLS policies para `equipos` y `equipo_miembros`
- [ ] Funcion RPC `get_mis_equipos(user_id)` que retorna equipos donde el usuario es miembro activo
- [ ] Soporte en `MockSupabaseClient` para las nuevas tablas

### 3.2 Servicio Angular

- [ ] `EquiposService` con metodos:
  - `crearEquipo(nombre, escudo_url?)`
  - `getMisEquipos()` — signal con lista reactiva
  - `getEquipo(id)` — signal con detalle
  - `invitarMiembro(equipo_id, usuario_id)`
  - `responderInvitacion(equipo_id, aceptar: boolean)`
  - `buscarUsuario(query: string)` — para el buscador de invitaciones

### 3.3 Vistas

- [ ] `/app/equipos` — lista de equipos del usuario
- [ ] `/app/equipos/nuevo` — formulario crear equipo
- [ ] `/app/equipos/:id` — detalle del equipo
  - Lista de miembros con estado e invitaciones pendientes
  - Buscador para invitar nuevos jugadores (solo si eres capitan)
  - Subir escudo del equipo

### Definicion de terminado — Etapa 3

- [ ] Crear equipo, invitar jugador, aceptar invitacion funciona end-to-end
- [ ] RLS impide ver o modificar equipos ajenos
- [ ] Un usuario puede pertenecer a multiples equipos
- [ ] Funciona en modo local (`useLocalDb: true`)

---

## Etapa 4 — Partidos

**Objetivo:** El capitan puede crear un partido entre dos equipos, convocar jugadores y registrar asistencia.

### 4.1 Base de datos

- [ ] Migration `003_partidos.sql`
- [ ] ENUMs: `tipo_futbol_enum`, `estado_partido_enum`, `invitacion_enum`
- [ ] Tabla `partidos` con `equipo_local_id`, `equipo_visitante_id` (NOT NULL), `tipo_futbol`, `max_jugadores_equipo`, `lugar_id`
- [ ] CHECK constraint `equipo_local_id != equipo_visitante_id`
- [ ] Tabla `partido_jugadores` con `equipo_id`
- [ ] RLS policies para ambas tablas

### 4.2 Servicio Angular

- [ ] `PartidosService`:
  - `crearPartido(data)` — valida que haya 2 equipos distintos
  - `getPartidosProximos()` — partidos del usuario ordenados por fecha
  - `getPartido(id)`
  - `responderConvocatoria(partido_jugador_id, aceptar: boolean)`
  - `registrarAsistencia(partido_id, jugadores_asistentes[])` — solo capitan

### 4.3 Vistas

- [ ] `/app/partidos` — proximos y pasados
- [ ] `/app/partidos/nuevo` — formulario crear partido
  - Selector de equipo local y visitante
  - Selector de tipo de futbol y cupo maximo
  - Selector de lugar (desde tabla `lugares`)
  - Fecha y hora
- [ ] `/app/partidos/:id` — detalle del partido
  - Lista de convocados por equipo con estado de confirmacion
  - Acciones: confirmar/rechazar asistencia (jugador)
  - Registrar asistencia real (capitan, post-partido)

### Definicion de terminado — Etapa 4 ✅

- [x] Flujo completo: crear partido → convocar → confirmar → registrar asistencia
- [x] Validacion de cupo maximo por equipo
- [x] Solo el capitan puede crear y gestionar el partido

---

## Etapa 5 — Resultado y reputacion ✅

**Objetivo:** Ambos capitanes confirman el resultado. La reputacion de los jugadores se actualiza automaticamente.

### 5.1 Base de datos

- [x] Agregar campos a `partidos`: `goles_local`, `goles_visitante`, `result_conf_local`, `result_conf_visit`, `score_local`, `score_visit`
- [x] Estado `en_disputa` en `estado_partido_enum`
- [x] Trigger `trg_verificar_resultado`: cambia estado a `completado` (marcadores iguales) o `en_disputa` (distintos)
- [x] Trigger `trg_on_partido_completado`: llama a `recalcular_reputacion_partido` al quedar `completado`
- [x] Funcion `recalcular_reputacion_partido(p_partido_id)` — penaliza no-shows, premia asistentes
- [ ] Edge Function `recordatorio_resultado`: cron 24h (pendiente, fuera del scope MVP)

### 5.2 Servicio Angular

- [x] `ResultadosService.confirmarResultado(partido_id, rol, golesLocal, golesVisitante)`
- [x] Resolucion bilateral en mock (client-side, equivalente al trigger SQL)
- [x] `actualizarReputacionesMock` — espeja la logica del trigger en localStorage

### 5.3 Vistas

- [x] Seccion "Confirmar resultado" en detalle del partido (solo capitanes, solo post-partido)
- [x] Tarjeta "Resultado final" cuando `completado` con marcador grande
- [x] Tarjeta "En disputa" con ambas versiones del marcador
- [x] Badge `en_disputa` (naranja) en lista y detalle de partidos

### Definicion de terminado — Etapa 5

- [x] Confirmacion bilateral funciona; estado cambia a `completado` solo con ambas confirmaciones
- [x] Deteccion de resultado en disputa visible con ambas versiones
- [x] Reputacion calculada correctamente en mock y en Supabase (via trigger)

---

## Etapa 6 — Busqueda de reemplazos

**Objetivo:** Cuando falta un jugador, el capitan encuentra y convoca un reemplazo en segundos.

### 6.1 Base de datos

- [ ] Funcion RPC `buscar_candidatos(partido_id, posicion, comuna)`:
  - Excluye jugadores ya convocados al partido
  - Filtra por posicion y comuna
  - Ordena por reputacion desc
  - Limita a 20 resultados
- [ ] Indice `idx_usuarios_comuna_posicion`

### 6.2 Servicio Angular

- [ ] `ReemplazosService`:
  - `buscarCandidatos(partido_id, posicion, comuna)`
  - `enviarInvitaciones(partido_id, usuario_ids[])` — maximo 5 por vez

### 6.3 Vistas

- [ ] `/app/partidos/:id/reemplazos` — lista de candidatos con card de jugador (nombre, posicion, comuna, reputacion)
- [ ] Boton "Invitar" por candidato con feedback visual
- [ ] Contador de cupos disponibles por equipo en el header de la vista
- [ ] Notificacion in-app al jugador invitado como reemplazo

### Definicion de terminado — Etapa 6

- [ ] Busqueda retorna candidatos correctos filtrados por posicion y comuna
- [ ] Invitacion enviada y visible para el jugador libre
- [ ] Maximo 5 invitaciones simultaneas por cupo respetado

---

## Etapa 7 — Notificaciones realtime

**Objetivo:** Los usuarios reciben notificaciones en vivo sin recargar la pagina.

### 7.1 Base de datos

- [ ] Migration `004_notificaciones.sql`
- [ ] Tabla `notificaciones` con campo `payload jsonb`
- [ ] Habilitar Realtime en la tabla `notificaciones` en Supabase

### 7.2 Servicio Angular

- [ ] `NotificacionesService`:
  - Signal `notifs` con lista reactiva
  - Signal `unread` con contador de no leidas
  - `subscribeToRealtime()` — canal WebSocket filtrado por `usuario_id`
  - `marcarLeida(id)`
  - `marcarTodasLeidas()`
- [ ] Suscripcion activa durante toda la sesion (iniciada en `ShellComponent`)
- [ ] Edge Function o trigger que inserta notificaciones ante eventos: invitacion a partido, invitacion a equipo, resultado confirmado por el otro capitan

### 7.3 Vistas

- [ ] Icono de campana en el header con badge de contador
- [ ] `/app/notificaciones` — lista completa
- [ ] Toast en pantalla para notificaciones nuevas en tiempo real

### Definicion de terminado — Etapa 7

- [ ] Notificacion aparece en pantalla sin recargar cuando llega un evento nuevo
- [ ] Contador de no leidas actualizado en tiempo real
- [ ] Marcado como leida funciona

---

## Etapa 8 — Lugares / Canchas

**Objetivo:** Los jugadores eligen la cancha desde un catalogo. Las canchas patrocinadoras tienen visibilidad destacada.

### 8.1 Base de datos

- [ ] Migration `005_lugares.sql`
- [ ] Tabla `lugares` completa con `es_patrocinador`
- [ ] RLS: SELECT publica para autenticados, INSERT/UPDATE solo service role
- [ ] Indice `idx_lugares_comuna` e `idx_lugares_patrocinador`
- [ ] Seed inicial con canchas de Santiago (al menos 20 registros)

### 8.2 Servicio Angular

- [ ] `LugaresService`:
  - `getLugaresPorComuna(comuna)` — patrocinadores primero, luego resto
  - `getLugar(id)`
  - `sugerirLugar(nombre, direccion, comuna)` — crea solicitud pendiente

### 8.3 Vistas

- [ ] Selector de lugar en formulario de crear partido (dropdown con busqueda)
- [ ] `/app/lugares` — directorio publico de canchas (opcional MVP, prioridad baja)
- [ ] Card de lugar: nombre, direccion, tipo superficie, precio referencial, badge "Patrocinador" si aplica

### Definicion de terminado — Etapa 8

- [ ] Al crear un partido, el capitan selecciona la cancha desde el catalogo
- [ ] Canchas patrocinadoras aparecen primero en el selector
- [ ] Sugerencia de nueva cancha funciona (queda pendiente de aprobacion)

---

## Etapa 9 — Pulido y QA

**Objetivo:** La app esta lista para usuarios reales. Sin bugs criticos, buena performance y accesible.

### 9.1 Testing

- [ ] Setup Vitest para unit tests
- [ ] Setup Playwright para tests E2E
- [ ] Tests unitarios para: `AuthService`, `PartidosService`, `ReputacionService`, `buscar_candidatos RPC`
- [ ] Tests E2E para flujos criticos:
  - Login → onboarding → crear equipo → crear partido → confirmar → resultado
  - Busqueda de reemplazo end-to-end
- [ ] Cobertura minima: 60% en servicios core

### 9.2 Performance

- [ ] Verificar que el bundle inicial es < 150kb (gzip)
- [ ] Lazy loading funcionando para todos los feature modules
- [ ] Imagenes optimizadas (WebP, tamanio adecuado)
- [ ] Lighthouse Performance > 85 en mobile

### 9.3 PWA

- [ ] Agregar `@angular/pwa` al proyecto
- [ ] Configurar `ngsw-config.json` para cacheo de assets
- [ ] Manifest con iconos de la app
- [ ] Verificar instalacion en pantalla de inicio en iOS y Android

### 9.4 Accesibilidad y UX

- [ ] Lighthouse Accessibility > 90
- [ ] Navegacion por teclado funcional en flujos core
- [ ] Estados de carga (skeleton screens o spinners) en todas las queries
- [ ] Estados de error con mensajes claros y accion de reintento
- [ ] Confirmacion antes de acciones destructivas (cancelar partido, abandonar equipo)

### Definicion de terminado — Etapa 9

- [ ] 0 bugs criticos conocidos
- [ ] Todos los tests E2E de flujos core pasando
- [ ] Lighthouse: Performance > 85, Accessibility > 90, PWA > 70

---

## Etapa 10 — Launch

**Objetivo:** La app esta en produccion y se prueban los flujos con usuarios reales.

### 10.1 Infraestructura produccion

- [ ] Variables de entorno de produccion configuradas en Vercel (Supabase prod URL + anon key)
- [ ] `useLocalDb: false` verificado en `environment.prod.ts`
- [ ] Dominio personalizado configurado en Vercel (si aplica)
- [ ] Supabase proyecto de produccion separado del de desarrollo
- [ ] Migraciones aplicadas al proyecto de produccion
- [ ] Backup automatico habilitado en Supabase

### 10.2 Seed y datos iniciales

- [ ] Seed de canchas iniciales en Santiago (minimo 20)
- [ ] Cuenta admin para gestionar altas de lugares

### 10.3 Monitoreo

- [ ] Sentry configurado para captura de errores en frontend
- [ ] Alertas de Supabase para uso de DB y Auth
- [ ] Google Analytics o Plausible para metricas de uso

### 10.4 Beta cerrada

- [ ] Invitar a 10-20 usuarios reales (amigos, conocidos que juegan futbol)
- [ ] Crear al menos 2 equipos y 3 partidos de prueba con datos reales
- [ ] Recolectar feedback en formulario simple (Google Forms)
- [ ] Definir iteracion post-lanzamiento basada en feedback

### Definicion de terminado — Etapa 10

- [ ] App accesible en URL de produccion
- [ ] Al menos 1 partido completado end-to-end con usuarios reales
- [ ] Monitoreo de errores activo
- [ ] Feedback inicial recolectado

---

## Decisiones tecnicas

| Decision | Resolucion |
|----------|-----------|
| Manejo de estado global | Signals puros (Angular 21) — sin NgRx |
| Libreria de UI | Tailwind CSS v4 puro — sin Angular Material ni PrimeNG |
| Sistema de notificaciones push | Supabase Realtime + WebSocket (Etapa 7) |
| Internacionalizacion | Solo espanol (MVP) |
| Modo desarrollo sin Supabase | Feature flag `useLocalDb` + `MockSupabaseClient` en `localStorage` |
| Reserva de canchas (futuro) | Post-MVP |

---

## Notas

- Cada etapa debe quedar en una rama `feature/etapa-N` y mergearse a `main` con PR
- El schema de base de datos se versiona con migraciones numeradas en `supabase/migrations/`
- No iniciar la Etapa N+1 sin que la Etapa N tenga todos sus criterios de terminado cumplidos
- Los tipos TypeScript de Supabase se regeneran cada vez que cambia el schema: `supabase gen types typescript`
- Para conectar Supabase real: cambiar `useLocalDb: false` en `environment.ts` y completar `supabaseUrl` + `supabaseAnonKey`
