# AppFC — Planificacion del proyecto

> Stack: Angular 20 · Supabase · Tailwind CSS v4 · Vercel  
> Metodologia: entrega incremental por etapas, cada una deployable y funcional de forma independiente.

---

## Resumen de etapas

| # | Etapa | Entregable clave | Estado |
|---|-------|-----------------|--------|
| 1 | Base del proyecto + Landing page | App Angular corriendo, landing publica | Pendiente |
| 2 | Autenticacion + Perfil de jugador | Login Google, onboarding, perfil editable | Pendiente |
| 3 | Equipos | Crear equipo, invitar miembros, vista del club | Pendiente |
| 4 | Partidos | Crear partido, convocar, confirmar asistencia | Pendiente |
| 5 | Resultado y reputacion | Confirmacion bilateral, calculo de reputacion | Pendiente |
| 6 | Busqueda de reemplazos | Candidatos por posicion/comuna, invitaciones | Pendiente |
| 7 | Notificaciones realtime | WebSockets, notificaciones in-app en vivo | Pendiente |
| 8 | Lugares / Canchas | Directorio de canchas, patrocinadores | Pendiente |
| 9 | Pulido y QA | Tests, performance, accesibilidad, PWA | Pendiente |
| 10 | Launch | Deploy produccion, seed usuarios beta | Pendiente |

---

## Etapa 1 — Base del proyecto + Landing page

**Objetivo:** Dejar el proyecto Angular 20 configurado con todas las herramientas del stack y publicar la landing page publica.

### 1.1 Setup del proyecto

- [ ] Crear proyecto Angular 20 con `ng new appfc --standalone --routing --style=css`
- [ ] Configurar Tailwind CSS v4 con el plugin oficial para Angular
- [ ] Configurar TypeScript en modo `strict`
- [ ] Instalar y configurar `@supabase/supabase-js`
- [ ] Crear `supabase.provider.ts` con token de inyeccion `SUPABASE_CLIENT`
- [ ] Configurar variables de entorno (`environment.ts` y `.env` para Supabase URL + anon key)
- [ ] Instalar Supabase CLI y levantar instancia local con Docker
- [ ] Configurar ESLint + Prettier
- [ ] Inicializar repositorio Git y conectar con GitHub
- [ ] Configurar proyecto en Vercel (deploy automatico desde `main`)

**Estructura de carpetas objetivo:**
```
src/
  app/
    core/
      supabase/         ← cliente y tipos generados
      auth/             ← servicio de auth (vacio por ahora)
    features/
      landing/          ← componente landing page
      shell/            ← layout autenticado (vacio)
    shared/
      components/       ← botones, badges, cards reutilizables
      pipes/
    app.routes.ts
    app.config.ts
```

### 1.2 Routing base

- [ ] Definir `app.routes.ts` con rutas lazy:
  - `/` → `LandingComponent`
  - `/auth` → `AuthComponent` (placeholder)
  - `/app/**` → `ShellComponent` (placeholder, sin guard todavia)
- [ ] Configurar `RouterOutlet` en `AppComponent`
- [ ] Agregar `scrollPositionRestoration: 'enabled'` en el router

### 1.3 Landing page

Traducir el diseño HTML estatico (`index.html`) a componentes Angular standalone.

- [ ] `LandingComponent` — componente raiz de la landing
- [ ] `NavComponent` — barra de navegacion fija con CTA
- [ ] `HeroSectionComponent` — seccion hero con player card animada
- [ ] `FeaturesSectionComponent` — grid de funcionalidades
- [ ] `HowItWorksSectionComponent` — pasos del flujo
- [ ] `ReputacionSectionComponent` — barras de reputacion con animacion on-scroll
- [ ] `CtaSectionComponent` — llamado a la accion final
- [ ] `FooterComponent` — pie de pagina

**Criterios de la landing:**
- [ ] Fuente Bebas Neue cargada via `@font-face` o Google Fonts en `styles.css`
- [ ] Paleta de colores definida como CSS custom properties globales
- [ ] Animacion de particulas funcionando (convertir JS a servicio Angular)
- [ ] Animacion de barras de reputacion via `IntersectionObserver` en directiva
- [ ] Smooth scroll a secciones internas
- [ ] Responsive: funciona en movil (375px) y desktop (1280px+)
- [ ] Boton "Registrarse" navega a `/auth`

### 1.4 Componentes shared base

- [ ] `ButtonComponent` — variantes: primary, secondary, ghost
- [ ] `BadgeComponent` — variantes de color para estado/tipo
- [ ] `CardComponent` — contenedor con borde y fondo dark

### 1.5 Tipos TypeScript

- [ ] Generar tipos desde schema Supabase: `supabase gen types typescript > src/app/core/supabase/database.types.ts`
- [ ] Crear interfaces de dominio iniciales:
  - `Usuario`, `Equipo`, `Partido`, `Lugar`

### 1.6 Deploy inicial

- [ ] Verificar build de produccion sin errores: `ng build`
- [ ] Deploy automatico en Vercel funcionando desde push a `main`
- [ ] URL publica accesible y landing renderizando correctamente
- [ ] Lighthouse score: Performance > 85, Accessibility > 90

### Definicion de terminado — Etapa 1

- [ ] `ng serve` y `ng build` sin errores ni warnings criticos
- [ ] Landing page identica al diseño en todas las resoluciones objetivo
- [ ] Deploy automatico en Vercel operativo
- [ ] Supabase CLI corriendo localmente
- [ ] Repositorio con `.gitignore` correcto (sin `.env` commiteado)

---

## Etapa 2 — Autenticacion + Perfil de jugador

**Objetivo:** El usuario puede registrarse con Google, completar su perfil y acceder al area autenticada.

### 2.1 Supabase Auth

- [ ] Configurar OAuth de Google en Supabase (client ID + secret)
- [ ] Crear `AuthService` con Signals: `session`, `isLoggedIn`, `userId`
- [ ] Implementar `loginWithGoogle()` con redirect a `/app/dashboard`
- [ ] Implementar `logout()`
- [ ] Persistir sesion entre recargas via `supabase.auth.getSession()`
- [ ] Escuchar `onAuthStateChange` para mantener el signal actualizado

### 2.2 Proteccion de rutas

- [ ] Crear `authGuard` funcional que redirige a `/auth` si no hay sesion
- [ ] Crear `publicGuard` que redirige a `/app/dashboard` si ya hay sesion
- [ ] Aplicar guards a las rutas correspondientes

### 2.3 Pantalla de login

- [ ] `AuthComponent` con boton "Continuar con Google"
- [ ] Manejo del callback OAuth (ruta `/auth/callback`)
- [ ] Estado de carga durante el proceso OAuth

### 2.4 Onboarding / completar perfil

- [ ] Crear tabla `usuarios` en Supabase (migration `001_usuarios.sql`)
- [ ] Activar RLS en tabla `usuarios`
- [ ] Trigger PostgreSQL: al crear usuario en `auth.users`, insertar fila en `public.usuarios`
- [ ] `OnboardingComponent` — formulario: nombre, edad, comuna, posicion
- [ ] Guard que detecta si el perfil esta incompleto y redirige al onboarding
- [ ] Subida de foto de perfil a Supabase Storage

### 2.5 Shell autenticado

- [ ] `ShellComponent` — layout con sidebar o nav lateral
- [ ] `DashboardComponent` — placeholder "Bienvenido, {nombre}"
- [ ] `HeaderComponent` — muestra nombre, foto y boton logout
- [ ] Ruta `/app/perfil` — `PerfilComponent` (ver y editar perfil propio)

### Definicion de terminado — Etapa 2

- [ ] Login con Google funcional end-to-end
- [ ] Perfil guardado en Supabase y editable
- [ ] Rutas protegidas redirigen correctamente
- [ ] Foto de perfil subida a Storage y visible

---

## Etapa 3 — Equipos

**Objetivo:** Un usuario puede crear su equipo, invitar jugadores y gestionar su plantilla.

### 3.1 Base de datos

- [ ] Migration `002_equipos.sql`: tablas `equipos` y `equipo_miembros`
- [ ] ENUMs: `estado_miembro_enum` (pendiente, activo, rechazado), `rol_equipo_enum` (capitan, jugador)
- [ ] RLS policies para `equipos` y `equipo_miembros`
- [ ] Funcion RPC `get_mis_equipos(user_id)` que retorna equipos donde el usuario es miembro activo

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

### Definicion de terminado — Etapa 4

- [ ] Flujo completo: crear partido → convocar → confirmar → registrar asistencia
- [ ] Validacion de cupo maximo por equipo
- [ ] Solo el capitan puede crear y gestionar el partido

---

## Etapa 5 — Resultado y reputacion

**Objetivo:** Ambos capitanes confirman el resultado. La reputacion de los jugadores se actualiza automaticamente.

### 5.1 Base de datos

- [ ] Agregar campos a `partidos`: `goles_local`, `goles_visitante`, `result_conf_local`, `result_conf_visit`
- [ ] Estado `en_disputa` en `estado_partido_enum`
- [ ] Trigger `trg_resultado_confirmado`: cambia estado a `completado` cuando ambos booleanos son `true`
- [ ] Trigger `trg_resultado_disputa`: detecta marcadores distintos y pone estado `en_disputa`
- [ ] Edge Function `recordatorio_resultado`: cron que ejecuta a las 24h post-partido y notifica a capitanes sin confirmar
- [ ] Funcion `recalcular_reputacion(usuario_id)` ejecutada tras `completado`

### 5.2 Servicio Angular

- [ ] `ResultadosService`:
  - `confirmarResultado(partido_id, goles_mi_equipo)` — solo el capitan del equipo correspondiente
  - `getResultado(partido_id)`

### 5.3 Vistas

- [ ] Seccion "Confirmar resultado" en detalle del partido (visible solo a capitanes y solo post-partido)
- [ ] Estado visual del partido: programado / en disputa / completado / cancelado
- [ ] Vista de reputacion en perfil con barras animadas (datos reales de Supabase)

### Definicion de terminado — Etapa 5

- [ ] Confirmacion bilateral funciona; estado cambia a `completado` solo con ambas confirmaciones
- [ ] Deteccion de resultado en disputa con notificacion a ambos capitanes
- [ ] Reputacion calculada correctamente y visible en perfil

---

## Etapa 6 — Busqueda de reemplazos

**Objetivo:** Cuando falta un jugador, el capitan encuentra y convoca un reemplazo en segundos.

### 6.1 Base de datos

- [ ] Funcion RPC `buscar_candidatos(partido_id, posicion, comuna)`:
  - Excluye jugadores ya convocados al partido
  - Filtra por posicion y comuna
  - Ordena por reputacion desc
  - Limita a 20 resultados
- [ ] Indice `idx_usuarios_comuna_posicion` (ya definido en migraciones)

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
- [ ] Setup Playwright para tests E2E contra Supabase local
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
- [ ] Dominio personalizado configurado en Vercel (si aplica)
- [ ] Supabase proyecto de produccion separado del de desarrollo
- [ ] Migraciones aplicadas al proyecto de produccion
- [ ] Backup automatico habilitado en Supabase

### 10.2 Seed y datos iniciales

- [ ] Seed de comunas de Chile (lista para autocompletado)
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

## Decisiones tecnicas pendientes

| Decision | Opciones | Fecha limite |
|----------|---------|-------------|
| Manejo de estado global | Signals puros vs NgRx SignalStore | Antes de Etapa 3 |
| Libreria de UI | Tailwind puro vs Angular Material vs PrimeNG | Antes de Etapa 2 |
| Sistema de notificaciones push | Supabase Realtime + WebSocket vs Web Push API | Antes de Etapa 7 |
| Internacionalizacion | Solo espanol (MVP) vs i18n desde el inicio | Antes de Etapa 1 |
| Reserva de canchas (futuro) | Stripe + calendario vs integracion externa | Post-MVP |

---

## Notas

- Cada etapa debe quedar en una rama `feature/etapa-N` y mergearse a `main` con PR
- El schema de base de datos se versiona con migraciones numeradas en `supabase/migrations/`
- No iniciar la Etapa N+1 sin que la Etapa N tenga todos sus criterios de terminado cumplidos
- Los tipos TypeScript de Supabase se regeneran cada vez que cambia el schema: `supabase gen types typescript`
