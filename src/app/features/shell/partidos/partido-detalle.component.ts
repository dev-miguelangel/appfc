import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { PartidosService } from '../../../core/partidos/partidos.service';
import { ResultadosService } from '../../../core/resultados/resultados.service';
import { NotificacionesService } from '../../../core/notificaciones/notificaciones.service';
import { SolicitudesService } from '../../../core/solicitudes/solicitudes.service';
import {
  PartidoDetalle, PartidoJugadorConPerfil,
  TIPO_FUTBOL_LABELS,
} from '../../../core/models/partido.model';
import { PartidoSolicitud } from '../../../core/models/solicitud.model';

@Component({
  selector: 'app-partido-detalle',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="detalle-page">
      <a routerLink="/app/partidos" class="back-link">← Volver a Partidos</a>

      @if (loading()) {
        <div class="loading">Cargando partido...</div>
      } @else if (!partido()) {
        <div class="not-found">Partido no encontrado.</div>
      } @else {
        <!-- ── Header ── -->
        <div class="partido-header">
          <div class="equipos-vs">
            <div class="equipo-block">
              <div class="escudo-wrap">
                @if (partido()!.equipo_local.escudo_url) {
                  <img [src]="partido()!.equipo_local.escudo_url" class="escudo" alt="escudo" />
                } @else {
                  <div class="escudo-ph">{{ partido()!.equipo_local.nombre.charAt(0) }}</div>
                }
              </div>
              <span class="equipo-name font-display">{{ partido()!.equipo_local.nombre }}</span>
              <span class="equipo-lbl">Local</span>
            </div>

            <div class="vs-center">
              <span class="vs-text font-display">VS</span>
              <span [class]="'badge-estado ' + partido()!.estado">{{ estadoLabel(partido()!.estado) }}</span>
              @if (partido()!.aceptacion_visitante !== 'aceptada' && partido()!.estado === 'programado') {
                <span [class]="'badge-acept ' + partido()!.aceptacion_visitante">
                  {{ aceptacionLabel(partido()!.aceptacion_visitante) }}
                </span>
              }
            </div>

            <div class="equipo-block right">
              <div class="escudo-wrap">
                @if (partido()!.equipo_visitante.escudo_url) {
                  <img [src]="partido()!.equipo_visitante.escudo_url" class="escudo" alt="escudo" />
                } @else {
                  <div class="escudo-ph">{{ partido()!.equipo_visitante.nombre.charAt(0) }}</div>
                }
              </div>
              <span class="equipo-name font-display">{{ partido()!.equipo_visitante.nombre }}</span>
              <span class="equipo-lbl">Visitante</span>
            </div>
          </div>

          <div class="partido-info-row">
            <span class="info-chip">📅 {{ formatFecha(partido()!.fecha) }}</span>
            @if (partido()!.lugar) {
              <span class="info-chip">📍 {{ partido()!.lugar }}</span>
            }
            <span class="info-chip">⚽ {{ tipoLabel(partido()!.tipo_futbol) }}</span>
            <span class="info-chip">👥 Máx. {{ partido()!.max_jugadores_equipo }} por equipo</span>
          </div>
        </div>

        <!-- ── Resultado completado ── -->
        @if (partido()!.estado === 'completado') {
          <div class="resultado-card completado">
            <span class="resultado-label">Resultado final</span>
            <div class="marcador-final">
              <span class="marcador-equipo">{{ partido()!.equipo_local.nombre }}</span>
              <span class="marcador-score font-display">
                {{ partido()!.goles_local }} – {{ partido()!.goles_visitante }}
              </span>
              <span class="marcador-equipo right">{{ partido()!.equipo_visitante.nombre }}</span>
            </div>
          </div>
        }

        <!-- ── Resultado en disputa ── -->
        @if (partido()!.estado === 'en_disputa') {
          <div class="resultado-card disputa">
            <span class="resultado-label disputa-lbl">⚠ Marcadores en disputa — se requiere revisión manual</span>
            <div class="disputa-versiones">
              @if (partido()!.score_local) {
                <div class="version-block">
                  <span class="version-tag">Cap. Local</span>
                  <span class="version-score font-display">
                    {{ partido()!.score_local!.local }} – {{ partido()!.score_local!.visitante }}
                  </span>
                </div>
              }
              @if (partido()!.score_visit) {
                <div class="version-block">
                  <span class="version-tag">Cap. Visitante</span>
                  <span class="version-score font-display">
                    {{ partido()!.score_visit!.local }} – {{ partido()!.score_visit!.visitante }}
                  </span>
                </div>
              }
            </div>
          </div>
        }

        <!-- ── Confirmar resultado (capitán, partido jugado pendiente) ── -->
        @if (partidoPasado() && soyCapitan()) {
          <div class="confirmar-resultado-card">
            @if (!yaConfigure()) {
              <p class="conf-hint">
                El partido ya se jugó. Ingresa el marcador final como lo recuerdas.
              </p>
              <div class="marcador-inputs">
                <div class="marcador-input-group">
                  <label>{{ partido()!.equipo_local.nombre }}</label>
                  <input type="number" min="0" [(ngModel)]="inputGolesLocal"
                         class="goles-input" />
                </div>
                <span class="marcador-sep font-display">–</span>
                <div class="marcador-input-group">
                  <label>{{ partido()!.equipo_visitante.nombre }}</label>
                  <input type="number" min="0" [(ngModel)]="inputGolesVisitante"
                         class="goles-input" />
                </div>
              </div>
              <button class="btn-confirmar-resultado" (click)="confirmarResultado()" [disabled]="saving()">
                {{ saving() ? 'Enviando...' : 'Confirmar resultado' }}
              </button>
            } @else {
              <p class="conf-espera">
                ✓ Tu marcador fue registrado. Esperando confirmación del capitán rival.
              </p>
            }
          </div>
        }

        <!-- ── Editar partido (creador, estado programado) ── -->
        @if (editando() && partido()!.estado === 'programado') {
          <div class="editar-card">
            <h3 class="edit-title font-display">Editar Partido</h3>
            <div class="edit-fields">
              <div class="edit-field">
                <label class="edit-label">Fecha y hora</label>
                <input type="datetime-local" [(ngModel)]="inputFecha" class="edit-input" />
              </div>
              <div class="edit-field">
                <label class="edit-label">Lugar / Cancha</label>
                <input type="text" [(ngModel)]="inputLugar"
                       placeholder="Ej: Cancha Central, Santiago"
                       class="edit-input" />
              </div>
            </div>
            @if (errorEdit()) {
              <p class="edit-error">{{ errorEdit() }}</p>
            }
            <div class="edit-actions">
              <button class="btn-primary" (click)="guardarEdicion()" [disabled]="saving()">
                {{ saving() ? 'Guardando...' : 'Guardar cambios' }}
              </button>
              <button class="btn-secondary" (click)="editando.set(false)" [disabled]="saving()">
                Cancelar
              </button>
            </div>
          </div>
        }

        <!-- ── Aceptación del partido (cap. visitante) ── -->
        @if (esCapitanVisitante() && partido()!.aceptacion_visitante === 'pendiente' && partido()!.estado === 'programado') {
          <div class="aceptacion-banner">
            <div class="aceptacion-info">
              <p class="aceptacion-titulo">{{ partido()!.equipo_local.nombre }} te desafía</p>
              <p class="aceptacion-sub">¿Aceptas disputar este partido con {{ partido()!.equipo_visitante.nombre }}?</p>
            </div>
            <div class="aceptacion-actions">
              <button class="btn-aceptar-partido" (click)="aceptarPartido()" [disabled]="saving()">
                Aceptar partido
              </button>
              <button class="btn-rechazar-partido" (click)="rechazarPartido()" [disabled]="saving()">
                Rechazar
              </button>
            </div>
          </div>
        }

        <!-- ── Partido rechazado por visitante (aviso al local) ── -->
        @if (esCapitanLocal() && partido()!.aceptacion_visitante === 'rechazada' && partido()!.estado === 'programado') {
          <div class="rechazo-aviso">
            <span>⚠</span>
            <p>{{ partido()!.equipo_visitante.nombre }} rechazó este partido. Puedes cancelarlo.</p>
          </div>
        }

        <!-- ── Solicitudes pendientes (cap. local las resuelve) ── -->
        @if (esCapitanLocal() && solicitudesPendientes().length > 0) {
          <div class="solicitudes-card">
            <h4 class="solicitudes-title">Solicitudes del Visitante</h4>
            @for (s of solicitudesPendientes(); track s.id) {
              <div class="solicitud-row">
                <div class="solicitud-info">
                  @if (s.tipo === 'cancelacion') {
                    <p class="solicitud-desc">
                      Solicita <strong>cancelar</strong> el partido.
                    </p>
                  } @else {
                    <p class="solicitud-desc">
                      Solicita <strong>editar</strong> el partido:
                      @if (s.nueva_fecha) { nueva fecha <em>{{ formatFecha(s.nueva_fecha) }}</em>. }
                      @if (s.nuevo_lugar) { Lugar: <em>{{ s.nuevo_lugar }}</em>. }
                      @if (!s.nueva_fecha && !s.nuevo_lugar) { (sin detalles especificados). }
                    </p>
                  }
                  <time class="solicitud-time">{{ formatFechaCorta(s.created_at) }}</time>
                </div>
                <div class="solicitud-actions">
                  <button class="btn-aprobar" (click)="responderSolicitud(s, true)" [disabled]="saving()">
                    Aprobar
                  </button>
                  <button class="btn-rechazar-sol" (click)="responderSolicitud(s, false)" [disabled]="saving()">
                    Rechazar
                  </button>
                </div>
              </div>
            }
          </div>
        }

        <!-- ── Solicitar edición (form del cap. visitante) ── -->
        @if (editandoSolicitud() && partido()!.estado === 'programado') {
          <div class="editar-card sol-card">
            <h3 class="edit-title font-display">Solicitar Edición</h3>
            <p class="sol-hint">Propón los cambios al capitán local. Se aplicarán solo si los aprueba.</p>
            <div class="edit-fields">
              <div class="edit-field">
                <label class="edit-label">Nueva fecha y hora (opcional)</label>
                <input type="datetime-local" [(ngModel)]="inputSolFecha" class="edit-input" />
              </div>
              <div class="edit-field">
                <label class="edit-label">Nuevo lugar (opcional)</label>
                <input type="text" [(ngModel)]="inputSolLugar"
                       placeholder="Ej: Cancha Sur, Maipú"
                       class="edit-input" />
              </div>
            </div>
            @if (errorSol()) {
              <p class="edit-error">{{ errorSol() }}</p>
            }
            <div class="edit-actions">
              <button class="btn-primary" (click)="enviarSolicitudEdicion()" [disabled]="saving()">
                {{ saving() ? 'Enviando...' : 'Enviar solicitud' }}
              </button>
              <button class="btn-secondary" (click)="editandoSolicitud.set(false)" [disabled]="saving()">
                Cancelar
              </button>
            </div>
          </div>
        }

        <!-- ── Mi convocatoria (si pendiente) ── -->
        @if (miConvocatoria()?.estado === 'pendiente' && partido()!.estado === 'programado') {
          <div class="convocatoria-banner">
            <p>Has sido convocado para este partido. ¿Confirmas tu asistencia?</p>
            <div class="conv-actions">
              <button class="btn-confirmar" (click)="responder(true)" [disabled]="saving()">
                Confirmar asistencia
              </button>
              <button class="btn-rechazar" (click)="responder(false)" [disabled]="saving()">
                Rechazar
              </button>
            </div>
          </div>
        }

        <!-- ── Jugadores ── -->
        <div class="jugadores-grid">
          <div class="equipo-section">
            <div class="section-header">
              <h3 class="font-display">{{ partido()!.equipo_local.nombre }}</h3>
              <span class="count-badge">
                {{ confirmados(jugadoresLocal()) }} / {{ partido()!.max_jugadores_equipo }}
              </span>
            </div>
            @for (j of jugadoresLocal(); track j.id) {
              <div class="jugador-row" [class.es-yo]="j.usuario_id === auth.userId()">
                <div class="jugador-avatar">
                  @if (j.usuario.foto_url) {
                    <img [src]="j.usuario.foto_url" alt="foto" />
                  } @else {
                    <span>{{ j.usuario.nombre.charAt(0) }}</span>
                  }
                </div>
                <div class="jugador-info">
                  <span class="jugador-nombre">
                    {{ j.usuario.nombre }}
                    @if (j.usuario_id === auth.userId()) { <em>(tú)</em> }
                  </span>
                  @if (j.usuario.posicion) {
                    <span class="jugador-pos">{{ j.usuario.posicion }}</span>
                  }
                </div>

                @if (registrandoAsistencia() && miEquipoComoCapitan() === partido()!.equipo_local_id) {
                  <label class="asist-label">
                    <input type="checkbox"
                           [checked]="asistentes().has(j.usuario_id)"
                           (change)="toggleAsistente(j.usuario_id)" />
                    Asistió
                  </label>
                } @else {
                  <span [class]="'badge-conv ' + j.estado">{{ convLabel(j.estado) }}</span>
                }
              </div>
            }
            @if (!jugadoresLocal().length) {
              <p class="no-jugadores">Sin convocados aún</p>
            }
          </div>

          <div class="equipo-section">
            <div class="section-header">
              <h3 class="font-display">{{ partido()!.equipo_visitante.nombre }}</h3>
              <span class="count-badge">
                {{ confirmados(jugadoresVisitante()) }} / {{ partido()!.max_jugadores_equipo }}
              </span>
            </div>
            @for (j of jugadoresVisitante(); track j.id) {
              <div class="jugador-row" [class.es-yo]="j.usuario_id === auth.userId()">
                <div class="jugador-avatar">
                  @if (j.usuario.foto_url) {
                    <img [src]="j.usuario.foto_url" alt="foto" />
                  } @else {
                    <span>{{ j.usuario.nombre.charAt(0) }}</span>
                  }
                </div>
                <div class="jugador-info">
                  <span class="jugador-nombre">
                    {{ j.usuario.nombre }}
                    @if (j.usuario_id === auth.userId()) { <em>(tú)</em> }
                  </span>
                  @if (j.usuario.posicion) {
                    <span class="jugador-pos">{{ j.usuario.posicion }}</span>
                  }
                </div>

                @if (registrandoAsistencia() && miEquipoComoCapitan() === partido()!.equipo_visitante_id) {
                  <label class="asist-label">
                    <input type="checkbox"
                           [checked]="asistentes().has(j.usuario_id)"
                           (change)="toggleAsistente(j.usuario_id)" />
                    Asistió
                  </label>
                } @else {
                  <span [class]="'badge-conv ' + j.estado">{{ convLabel(j.estado) }}</span>
                }
              </div>
            }
            @if (!jugadoresVisitante().length) {
              <p class="no-jugadores">Sin convocados aún</p>
            }
          </div>
        </div>

        <!-- ── Acciones del capitán ── -->
        @if (partido()!.estado === 'programado') {
          <div class="capitan-actions">
            @if (soyCapitan() && !editando()) {
              @if (!registrandoAsistencia()) {
                <button class="btn-asistencia" (click)="registrandoAsistencia.set(true)">
                  Registrar asistencia de mi equipo
                </button>
              } @else {
                <p class="asist-hint">
                  Marca los jugadores de
                  <strong>{{ nombreMiEquipo() }}</strong>
                  que efectivamente asistieron.
                </p>
                <div class="asist-actions">
                  <button class="btn-primary" (click)="registrarAsistencia()" [disabled]="saving()">
                    {{ saving() ? 'Guardando...' : 'Guardar asistencia' }}
                  </button>
                  <button class="btn-secondary" (click)="registrandoAsistencia.set(false)">
                    Cancelar
                  </button>
                </div>
              }
            }
            @if (esCapitanLocal() && !registrandoAsistencia() && !editando()) {
              <button class="btn-editar-partido" (click)="iniciarEdicion()">
                ✏ Editar partido
              </button>
              <button class="btn-cancelar-partido" (click)="cancelar()" [disabled]="saving()">
                Cancelar partido
              </button>
            }
            @if (esCapitanVisitante() && partido()!.aceptacion_visitante === 'aceptada' && !registrandoAsistencia() && !editandoSolicitud()) {
              @if (miSolicitudPendiente()) {
                <p class="solicitud-espera">
                  Solicitud de {{ miSolicitudPendiente()!.tipo === 'edicion' ? 'edición' : 'cancelación' }} enviada — pendiente de aprobación.
                </p>
              } @else {
                <button class="btn-solicitar-edicion" (click)="iniciarSolicitudEdicion()">
                  Solicitar edición
                </button>
                <button class="btn-solicitar-cancelacion" (click)="solicitarCancelacion()" [disabled]="saving()">
                  Solicitar cancelación
                </button>
              }
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .detalle-page { max-width: 900px; }

    .back-link {
      display: inline-block; font-size: .8rem; font-weight: 600;
      text-transform: uppercase; letter-spacing: .08em;
      color: var(--color-light); text-decoration: none; margin-bottom: 1.25rem;
      transition: color .2s;
    }
    .back-link:hover { color: var(--color-gold); }

    .loading, .not-found {
      color: var(--color-light); text-align: center; padding: 3rem;
    }

    /* ── Header ── */
    .partido-header {
      background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
      border-radius: 16px; padding: 2rem; margin-bottom: 1.5rem;
    }
    .equipos-vs {
      display: flex; align-items: center; gap: 1.5rem;
      margin-bottom: 1.25rem;
    }
    .equipo-block {
      display: flex; flex-direction: column; align-items: center; gap: .4rem; flex: 1;
    }
    .equipo-block.right { align-items: center; }
    .escudo-wrap { width: 56px; height: 56px; }
    .escudo { width: 100%; height: 100%; object-fit: contain; border-radius: 8px; }
    .escudo-ph {
      width: 56px; height: 56px; border-radius: 8px;
      background: rgba(240,192,64,.1); border: 1px solid rgba(240,192,64,.2);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; color: var(--color-gold);
    }
    .equipo-name { font-size: 1.6rem; color: #fff; text-align: center; }
    .equipo-lbl  { font-size: .65rem; text-transform: uppercase; letter-spacing: .1em; color: var(--color-light); }
    .vs-center   { display: flex; flex-direction: column; align-items: center; gap: .5rem; flex-shrink: 0; }
    .vs-text     { font-size: 2rem; color: var(--color-gold); }

    .badge-estado {
      font-size: .65rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: .09em; padding: .25rem .7rem; border-radius: 20px;
    }
    .badge-estado.programado  { background: rgba(64,196,240,.12);  color: #40c4f0; }
    .badge-estado.completado  { background: rgba(72,199,142,.12);  color: #48c78e; }
    .badge-estado.cancelado   { background: rgba(255,107,107,.12); color: #ff6b6b; }
    .badge-estado.en_disputa  { background: rgba(255,140,0,.12);   color: #ff8c00; }

    .badge-acept {
      font-size: .6rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: .08em; padding: .2rem .6rem; border-radius: 20px;
    }
    .badge-acept.pendiente { background: rgba(255,200,0,.1);   color: #ffc800; }
    .badge-acept.rechazada { background: rgba(255,107,107,.1); color: #ff6b6b; }

    .partido-info-row {
      display: flex; flex-wrap: wrap; gap: .5rem; justify-content: center;
    }
    .info-chip {
      font-size: .75rem; color: var(--color-light);
      background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
      border-radius: 6px; padding: .3rem .7rem;
    }

    /* ── Aceptación / rechazo / solicitudes ── */
    .aceptacion-banner {
      background: rgba(240,192,64,.06); border: 1px solid rgba(240,192,64,.25);
      border-radius: 12px; padding: 1.25rem 1.5rem; margin-bottom: 1.5rem;
      display: flex; align-items: center; justify-content: space-between;
      gap: 1rem; flex-wrap: wrap;
    }
    .aceptacion-titulo {
      color: #fff; font-weight: 700; font-size: .95rem; margin: 0 0 .2rem;
    }
    .aceptacion-sub { color: var(--color-light); font-size: .82rem; margin: 0; }
    .aceptacion-actions { display: flex; gap: .6rem; flex-shrink: 0; }
    .btn-aceptar-partido {
      background: var(--color-green); color: #000; font-weight: 700;
      border: none; border-radius: 8px; padding: .6rem 1.2rem;
      cursor: pointer; font-size: .82rem; letter-spacing: .05em; text-transform: uppercase;
      transition: opacity .2s;
    }
    .btn-aceptar-partido:hover:not(:disabled) { opacity: .85; }
    .btn-aceptar-partido:disabled { opacity: .4; cursor: not-allowed; }
    .btn-rechazar-partido {
      background: transparent; color: #ff6b6b; font-weight: 700;
      border: 1px solid rgba(255,107,107,.4); border-radius: 8px; padding: .6rem 1.1rem;
      cursor: pointer; font-size: .82rem; letter-spacing: .05em; text-transform: uppercase;
      transition: background .2s;
    }
    .btn-rechazar-partido:hover:not(:disabled) { background: rgba(255,107,107,.1); }
    .btn-rechazar-partido:disabled { opacity: .4; cursor: not-allowed; }

    .rechazo-aviso {
      background: rgba(255,107,107,.06); border: 1px solid rgba(255,107,107,.2);
      border-radius: 10px; padding: 1rem 1.25rem; margin-bottom: 1.5rem;
      display: flex; align-items: center; gap: .75rem;
    }
    .rechazo-aviso span { font-size: 1.2rem; flex-shrink: 0; }
    .rechazo-aviso p { color: rgba(255,107,107,.9); font-size: .85rem; margin: 0; }

    .solicitudes-card {
      background: rgba(240,192,64,.04); border: 1px solid rgba(240,192,64,.2);
      border-radius: 12px; overflow: hidden; margin-bottom: 1.5rem;
    }
    .solicitudes-title {
      font-size: .7rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: .1em; color: var(--color-gold);
      padding: .8rem 1.25rem; border-bottom: 1px solid rgba(240,192,64,.1);
      background: rgba(240,192,64,.06); margin: 0;
    }
    .solicitud-row {
      display: flex; align-items: center; gap: 1rem;
      padding: 1rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,.05);
      flex-wrap: wrap;
    }
    .solicitud-row:last-child { border-bottom: none; }
    .solicitud-info { flex: 1; min-width: 200px; }
    .solicitud-desc { color: #ddd; font-size: .85rem; margin: 0 0 .2rem; }
    .solicitud-desc strong { color: var(--color-gold); }
    .solicitud-desc em { color: #fff; font-style: normal; }
    .solicitud-time { font-size: .68rem; color: rgba(255,255,255,.3); }
    .solicitud-actions { display: flex; gap: .5rem; flex-shrink: 0; }
    .btn-aprobar {
      background: rgba(72,199,142,.1); color: #48c78e; font-weight: 700;
      border: 1px solid rgba(72,199,142,.3); border-radius: 6px;
      padding: .4rem .9rem; cursor: pointer; font-size: .78rem;
      letter-spacing: .05em; text-transform: uppercase; transition: background .2s;
    }
    .btn-aprobar:hover:not(:disabled) { background: rgba(72,199,142,.2); }
    .btn-aprobar:disabled { opacity: .4; cursor: not-allowed; }
    .btn-rechazar-sol {
      background: transparent; color: #ff6b6b; font-weight: 700;
      border: 1px solid rgba(255,107,107,.3); border-radius: 6px;
      padding: .4rem .9rem; cursor: pointer; font-size: .78rem;
      letter-spacing: .05em; text-transform: uppercase; transition: background .2s;
    }
    .btn-rechazar-sol:hover:not(:disabled) { background: rgba(255,107,107,.08); }
    .btn-rechazar-sol:disabled { opacity: .4; cursor: not-allowed; }

    .sol-card { border-color: rgba(240,192,64,.2); background: rgba(240,192,64,.03); }
    .sol-hint { color: var(--color-light); font-size: .82rem; margin: -.75rem 0 1rem; }

    .btn-solicitar-edicion {
      background: rgba(64,196,240,.1); color: #40c4f0; font-weight: 700;
      border: 1px solid rgba(64,196,240,.3); border-radius: 8px;
      padding: .55rem 1.1rem; cursor: pointer; font-size: .82rem;
      letter-spacing: .05em; text-transform: uppercase; transition: background .2s;
    }
    .btn-solicitar-edicion:hover { background: rgba(64,196,240,.18); }
    .btn-solicitar-cancelacion {
      background: transparent; color: #ff6b6b; font-weight: 700;
      border: 1px solid rgba(255,107,107,.3); border-radius: 8px;
      padding: .55rem 1.1rem; cursor: pointer; font-size: .82rem;
      letter-spacing: .05em; text-transform: uppercase; transition: background .2s;
    }
    .btn-solicitar-cancelacion:hover:not(:disabled) { background: rgba(255,107,107,.08); }
    .btn-solicitar-cancelacion:disabled { opacity: .4; cursor: not-allowed; }
    .solicitud-espera {
      color: var(--color-gold); font-size: .82rem; font-style: italic; margin: 0;
    }

    /* ── Resultado cards ── */
    .resultado-card {
      border-radius: 12px; padding: 1.25rem 1.5rem; margin-bottom: 1.5rem;
      display: flex; flex-direction: column; align-items: center; gap: .75rem;
    }
    .resultado-card.completado {
      background: rgba(72,199,142,.06); border: 1px solid rgba(72,199,142,.25);
    }
    .resultado-card.disputa {
      background: rgba(255,140,0,.06); border: 1px solid rgba(255,140,0,.25);
    }
    .resultado-label {
      font-size: .68rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: .1em; color: #48c78e;
    }
    .disputa-lbl { color: #ff8c00; }
    .marcador-final {
      display: flex; align-items: center; gap: 1.5rem;
    }
    .marcador-equipo {
      font-family: 'Bebas Neue', sans-serif; font-size: 1.1rem;
      color: rgba(255,255,255,.6); max-width: 120px; text-align: center;
    }
    .marcador-equipo.right { text-align: center; }
    .marcador-score {
      font-size: 3rem; color: #48c78e; letter-spacing: .06em;
    }
    .disputa-versiones {
      display: flex; gap: 2rem; justify-content: center; flex-wrap: wrap;
    }
    .version-block {
      display: flex; flex-direction: column; align-items: center; gap: .3rem;
    }
    .version-tag {
      font-size: .65rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: .08em; color: rgba(255,255,255,.4);
    }
    .version-score {
      font-size: 2rem; color: #ff8c00;
    }

    /* ── Confirmar resultado ── */
    .confirmar-resultado-card {
      background: rgba(240,192,64,.04); border: 1px solid rgba(240,192,64,.2);
      border-radius: 12px; padding: 1.25rem 1.5rem; margin-bottom: 1.5rem;
      display: flex; flex-direction: column; align-items: center; gap: 1rem;
    }
    .conf-hint {
      color: var(--color-light); font-size: .85rem; margin: 0; text-align: center;
    }
    .conf-espera {
      color: #48c78e; font-size: .85rem; margin: 0; text-align: center;
    }
    .marcador-inputs {
      display: flex; align-items: center; gap: 1rem;
    }
    .marcador-input-group {
      display: flex; flex-direction: column; align-items: center; gap: .35rem;
    }
    .marcador-input-group label {
      font-size: .7rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: .07em; color: var(--color-light); max-width: 100px;
      text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .goles-input {
      width: 64px; text-align: center; padding: .6rem .4rem;
      background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.15);
      border-radius: 8px; color: #fff; font-family: 'Bebas Neue', sans-serif;
      font-size: 1.8rem; outline: none; transition: border-color .2s;
    }
    .goles-input:focus { border-color: var(--color-gold); }
    .marcador-sep { font-size: 2rem; color: rgba(255,255,255,.3); }
    .btn-confirmar-resultado {
      background: linear-gradient(135deg, var(--color-gold), var(--color-gold2));
      color: var(--color-dark); font-family: 'Bebas Neue', sans-serif;
      font-size: 1.1rem; letter-spacing: .1em; border: none; border-radius: 8px;
      padding: .6rem 1.6rem; cursor: pointer; transition: opacity .2s;
    }
    .btn-confirmar-resultado:hover:not(:disabled) { opacity: .85; }
    .btn-confirmar-resultado:disabled { opacity: .45; cursor: not-allowed; }

    /* ── Convocatoria banner ── */
    .convocatoria-banner {
      background: rgba(240,192,64,.06); border: 1px solid rgba(240,192,64,.25);
      border-radius: 12px; padding: 1.25rem 1.5rem; margin-bottom: 1.5rem;
      display: flex; align-items: center; justify-content: space-between;
      gap: 1rem; flex-wrap: wrap;
    }
    .convocatoria-banner p { color: #fff; font-size: .9rem; margin: 0; }
    .conv-actions { display: flex; gap: .6rem; }
    .btn-confirmar {
      background: var(--color-green); color: #000; font-weight: 700;
      border: none; border-radius: 8px; padding: .55rem 1.1rem;
      cursor: pointer; font-size: .82rem; letter-spacing: .05em; text-transform: uppercase;
      transition: opacity .2s;
    }
    .btn-confirmar:hover:not(:disabled) { opacity: .85; }
    .btn-confirmar:disabled { opacity: .4; cursor: not-allowed; }
    .btn-rechazar {
      background: transparent; color: #ff6b6b; font-weight: 700;
      border: 1px solid rgba(255,107,107,.4); border-radius: 8px; padding: .55rem 1.1rem;
      cursor: pointer; font-size: .82rem; letter-spacing: .05em; text-transform: uppercase;
      transition: background .2s;
    }
    .btn-rechazar:hover:not(:disabled) { background: rgba(255,107,107,.1); }
    .btn-rechazar:disabled { opacity: .4; cursor: not-allowed; }

    /* ── Jugadores ── */
    .jugadores-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;
    }
    @media (max-width: 640px) { .jugadores-grid { grid-template-columns: 1fr; } }

    .equipo-section {
      background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07);
      border-radius: 12px; overflow: hidden;
    }
    .section-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: .85rem 1.1rem; border-bottom: 1px solid rgba(255,255,255,.07);
      background: rgba(255,255,255,.04);
    }
    .section-header h3 { font-size: 1.1rem; color: var(--color-gold); margin: 0; }
    .count-badge {
      font-size: .72rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: .07em; color: var(--color-light);
    }

    .jugador-row {
      display: flex; align-items: center; gap: .75rem;
      padding: .75rem 1.1rem; border-bottom: 1px solid rgba(255,255,255,.04);
    }
    .jugador-row:last-child { border-bottom: none; }
    .jugador-row.es-yo { background: rgba(240,192,64,.04); }

    .jugador-avatar {
      width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
      background: rgba(255,255,255,.08); overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Bebas Neue', sans-serif; font-size: 1rem; color: var(--color-gold);
    }
    .jugador-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .jugador-info { flex: 1; min-width: 0; }
    .jugador-nombre { font-size: .85rem; font-weight: 600; color: #fff; display: block; }
    .jugador-nombre em { font-style: normal; color: var(--color-gold); margin-left: .3rem; font-size: .75rem; }
    .jugador-pos { font-size: .7rem; color: var(--color-light); text-transform: capitalize; }

    .badge-conv {
      font-size: .65rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: .07em; padding: .2rem .55rem; border-radius: 4px; flex-shrink: 0;
    }
    .badge-conv.pendiente  { background: rgba(255,200,0,.1);   color: #ffc800; }
    .badge-conv.confirmado { background: rgba(72,199,142,.12); color: #48c78e; }
    .badge-conv.rechazado  { background: rgba(255,107,107,.1); color: #ff6b6b; }

    .asist-label {
      display: flex; align-items: center; gap: .4rem; font-size: .78rem;
      color: var(--color-light); cursor: pointer; flex-shrink: 0;
    }
    .asist-label input { cursor: pointer; accent-color: var(--color-gold); }

    .no-jugadores {
      padding: 1.5rem; text-align: center; font-size: .82rem; color: rgba(255,255,255,.3);
    }

    /* ── Acciones capitán ── */
    .capitan-actions {
      background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07);
      border-radius: 12px; padding: 1.25rem 1.5rem;
      display: flex; align-items: center; gap: .75rem; flex-wrap: wrap;
    }
    .asist-hint {
      width: 100%; color: var(--color-light); font-size: .85rem; margin: 0 0 .5rem;
    }
    .asist-actions { display: flex; gap: .75rem; }

    .btn-editar-partido {
      background: rgba(64,196,240,.1); color: #40c4f0; font-weight: 700;
      border: 1px solid rgba(64,196,240,.3); border-radius: 8px;
      padding: .55rem 1.1rem; cursor: pointer; font-size: .82rem;
      letter-spacing: .05em; text-transform: uppercase; transition: background .2s;
    }
    .btn-editar-partido:hover { background: rgba(64,196,240,.18); }

    /* ── Editar partido ── */
    .editar-card {
      background: rgba(64,196,240,.04); border: 1px solid rgba(64,196,240,.2);
      border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;
    }
    .edit-title { font-size: 1.3rem; color: #40c4f0; margin-bottom: 1.25rem; }
    .edit-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem; }
    @media (max-width: 540px) { .edit-fields { grid-template-columns: 1fr; } }
    .edit-field { display: flex; flex-direction: column; gap: .4rem; }
    .edit-label {
      font-size: .72rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: .08em; color: var(--color-light);
    }
    .edit-input {
      padding: .65rem 1rem; border-radius: 8px;
      background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12);
      color: #fff; font-size: .9rem; outline: none; transition: border-color .2s;
      color-scheme: dark;
    }
    .edit-input:focus { border-color: #40c4f0; }
    .edit-actions { display: flex; gap: .75rem; }
    .edit-error { color: #ff6b6b; font-size: .8rem; margin: -.25rem 0 .75rem; }

    .btn-asistencia {
      background: rgba(72,199,142,.1); color: #48c78e; font-weight: 700;
      border: 1px solid rgba(72,199,142,.3); border-radius: 8px;
      padding: .55rem 1.1rem; cursor: pointer; font-size: .82rem;
      letter-spacing: .05em; text-transform: uppercase; transition: background .2s;
    }
    .btn-asistencia:hover { background: rgba(72,199,142,.2); }

    .btn-cancelar-partido {
      background: transparent; color: #ff6b6b; font-weight: 700;
      border: 1px solid rgba(255,107,107,.3); border-radius: 8px;
      padding: .55rem 1.1rem; cursor: pointer; font-size: .82rem;
      letter-spacing: .05em; text-transform: uppercase; transition: background .2s;
    }
    .btn-cancelar-partido:hover:not(:disabled) { background: rgba(255,107,107,.08); }
    .btn-cancelar-partido:disabled { opacity: .4; cursor: not-allowed; }

    .btn-primary {
      background: var(--color-gold); color: #000; font-weight: 700;
      border: none; border-radius: 8px; padding: .6rem 1.3rem;
      cursor: pointer; font-size: .82rem; letter-spacing: .06em;
      text-transform: uppercase; transition: opacity .2s;
    }
    .btn-primary:hover:not(:disabled) { opacity: .85; }
    .btn-primary:disabled { opacity: .45; cursor: not-allowed; }

    .btn-secondary {
      background: rgba(255,255,255,.06); color: var(--color-light);
      border: 1px solid rgba(255,255,255,.12); border-radius: 8px;
      padding: .6rem 1.1rem; font-size: .82rem; font-weight: 600;
      letter-spacing: .06em; text-transform: uppercase; cursor: pointer;
      transition: background .2s;
    }
    .btn-secondary:hover { background: rgba(255,255,255,.1); }
  `],
})
export class PartidoDetalleComponent implements OnInit {
  private route      = inject(ActivatedRoute);
  readonly auth      = inject(AuthService);
  private service    = inject(PartidosService);
  private resultados = inject(ResultadosService);
  private notif      = inject(NotificacionesService);
  private solService = inject(SolicitudesService);

  readonly partido               = signal<PartidoDetalle | null>(null);
  readonly solicitudes           = signal<PartidoSolicitud[]>([]);
  readonly loading               = signal(true);
  readonly saving                = signal(false);
  readonly registrandoAsistencia = signal(false);
  readonly asistentes            = signal<Set<string>>(new Set());
  readonly editando              = signal(false);
  readonly editandoSolicitud     = signal(false);
  readonly errorEdit             = signal('');
  readonly errorSol              = signal('');

  // Inputs para confirmar resultado
  inputGolesLocal     = 0;
  inputGolesVisitante = 0;

  // Inputs para editar partido (local) / solicitar edición (visitante)
  inputFecha         = '';
  inputLugar         = '';
  inputSolFecha      = '';
  inputSolLugar      = '';

  readonly miConvocatoria = computed(() =>
    this.partido()?.jugadores.find(j => j.usuario_id === this.auth.userId()) ?? null,
  );

  /** 'local' | 'visitante' según qué equipo capitanea el usuario actual. */
  readonly rolCapitan = computed((): 'local' | 'visitante' | null => {
    const p   = this.partido();
    const uid = this.auth.userId();
    if (!p || !uid) return null;
    if (p.equipo_local.capitan_id     === uid) return 'local';
    if (p.equipo_visitante.capitan_id === uid) return 'visitante';
    return null;
  });

  /** ID del equipo que el usuario actual capitanea en este partido (null si no es capitán). */
  readonly miEquipoComoCapitan = computed((): string | null => {
    const p   = this.partido();
    const rol = this.rolCapitan();
    if (!p || !rol) return null;
    return rol === 'local' ? p.equipo_local_id : p.equipo_visitante_id;
  });

  readonly soyCapitan = computed(() => this.rolCapitan() !== null);

  /** Solo el creador del partido puede cancelarlo. */
  readonly soyCreador = computed(() =>
    this.partido()?.creador_id === this.auth.userId(),
  );

  /** Partido jugado pero aún en estado 'programado' (fecha pasó, no confirmado ni cancelado). */
  readonly partidoPasado = computed(() => {
    const p = this.partido();
    return p ? p.estado === 'programado' && new Date(p.fecha) < new Date() : false;
  });

  /** El capitán ya envió su versión del marcador. */
  readonly yaConfigure = computed((): boolean => {
    const p   = this.partido();
    const rol = this.rolCapitan();
    if (!p || !rol) return false;
    return rol === 'local' ? p.result_conf_local : p.result_conf_visit;
  });

  readonly esCapitanLocal     = computed(() => this.rolCapitan() === 'local');
  readonly esCapitanVisitante = computed(() => this.rolCapitan() === 'visitante');

  /** Solicitudes pendientes para que el capitán local resuelva. */
  readonly solicitudesPendientes = computed(() =>
    this.solicitudes().filter(s => s.estado === 'pendiente'),
  );

  /** La solicitud pendiente del usuario actual (visitante), si existe. */
  readonly miSolicitudPendiente = computed(() => {
    const uid = this.auth.userId();
    return this.solicitudes().find(s => s.solicitante_id === uid && s.estado === 'pendiente') ?? null;
  });

  readonly jugadoresLocal = computed(() =>
    this.partido()?.jugadores.filter(j => j.equipo_id === this.partido()!.equipo_local_id) ?? [],
  );

  readonly jugadoresVisitante = computed(() =>
    this.partido()?.jugadores.filter(j => j.equipo_id === this.partido()!.equipo_visitante_id) ?? [],
  );

  async ngOnInit(): Promise<void> {
    await this.loadPartido();
  }

  async loadPartido(): Promise<void> {
    this.loading.set(true);
    const id = this.route.snapshot.paramMap.get('id')!;
    const [p, solicitudes] = await Promise.all([
      this.service.getPartido(id),
      this.solService.cargar(id),
    ]);
    this.partido.set(p);
    this.solicitudes.set(solicitudes);
    if (p) {
      // Pre-marcar solo los confirmados del equipo que este usuario capitanea
      const uid      = this.auth.userId();
      const miEquipo = p.equipo_local.capitan_id     === uid ? p.equipo_local_id
                     : p.equipo_visitante.capitan_id === uid ? p.equipo_visitante_id
                     : null;
      const confirmadosIds = p.jugadores
        .filter(j => j.estado === 'confirmado' && (!miEquipo || j.equipo_id === miEquipo))
        .map(j => j.usuario_id);
      this.asistentes.set(new Set(confirmadosIds));
    }
    this.loading.set(false);
  }

  async responder(aceptar: boolean): Promise<void> {
    const conv = this.miConvocatoria();
    if (!conv) return;
    this.saving.set(true);
    await this.service.responderConvocatoria(conv.id, aceptar);
    await this.loadPartido();
    this.saving.set(false);
  }

  toggleAsistente(userId: string): void {
    const s = new Set(this.asistentes());
    if (s.has(userId)) s.delete(userId);
    else s.add(userId);
    this.asistentes.set(s);
  }

  async registrarAsistencia(): Promise<void> {
    const equipo_id = this.miEquipoComoCapitan();
    if (!this.partido() || !equipo_id) return;
    this.saving.set(true);
    await this.service.registrarAsistencia(
      this.partido()!.id,
      Array.from(this.asistentes()),
      equipo_id,
    );
    this.registrandoAsistencia.set(false);
    await this.loadPartido();
    this.saving.set(false);
  }

  // ─── Aceptación / rechazo del partido ───────────────────────────────────────

  async aceptarPartido(): Promise<void> {
    const p = this.partido();
    if (!p) return;
    this.saving.set(true);
    await this.service.aceptarPartido(p.id);
    await this.notif.notificarJugadores(
      p.id,
      'partido_aceptado',
      `${p.equipo_visitante.nombre} aceptó el partido vs ${p.equipo_local.nombre}.`,
    );
    await this.loadPartido();
    this.saving.set(false);
  }

  async rechazarPartido(): Promise<void> {
    const p = this.partido();
    if (!p) return;
    this.saving.set(true);
    await this.service.rechazarPartido(p.id);
    await this.notif.notificarJugadores(
      p.id,
      'partido_rechazado',
      `${p.equipo_visitante.nombre} rechazó el partido del ${this.formatFechaCorta(p.fecha)}.`,
    );
    await this.loadPartido();
    this.saving.set(false);
  }

  // ─── Solicitudes del visitante ───────────────────────────────────────────────

  iniciarSolicitudEdicion(): void {
    const p = this.partido();
    if (!p) return;
    this.inputSolFecha = p.fecha.slice(0, 16);
    this.inputSolLugar = p.lugar ?? '';
    this.errorSol.set('');
    this.editandoSolicitud.set(true);
  }

  async enviarSolicitudEdicion(): Promise<void> {
    const p = this.partido();
    if (!p) return;
    this.saving.set(true);
    this.errorSol.set('');
    const error = await this.solService.crear(
      p.id,
      'edicion',
      this.inputSolFecha || undefined,
      this.inputSolLugar.trim() || null,
    );
    if (error) {
      this.errorSol.set(error);
      this.saving.set(false);
      return;
    }
    await this.notif.notificarJugadores(
      p.id,
      'solicitud_nueva',
      `${p.equipo_visitante.nombre} solicita editar el partido del ${this.formatFechaCorta(p.fecha)}.`,
    );
    this.editandoSolicitud.set(false);
    await this.loadPartido();
    this.saving.set(false);
  }

  async solicitarCancelacion(): Promise<void> {
    const p = this.partido();
    if (!p) return;
    // eslint-disable-next-line no-alert
    if (!confirm('¿Enviar solicitud de cancelación al capitán local?')) return;
    this.saving.set(true);
    const error = await this.solService.crear(p.id, 'cancelacion');
    if (!error) {
      await this.notif.notificarJugadores(
        p.id,
        'solicitud_nueva',
        `${p.equipo_visitante.nombre} solicita cancelar el partido del ${this.formatFechaCorta(p.fecha)}.`,
      );
    }
    await this.loadPartido();
    this.saving.set(false);
  }

  // ─── Responder solicitud (cap. local) ────────────────────────────────────────

  async responderSolicitud(s: PartidoSolicitud, aprobar: boolean): Promise<void> {
    const p = this.partido();
    if (!p) return;
    this.saving.set(true);

    await this.solService.responder(s.id, aprobar);

    if (aprobar) {
      if (s.tipo === 'cancelacion') {
        await this.service.cancelarPartido(p.id);
        await this.notif.notificarJugadores(p.id, 'partido_cancelado',
          `El partido ${p.equipo_local.nombre} vs ${p.equipo_visitante.nombre} fue cancelado (solicitud aprobada).`);
      } else {
        const cambios: { fecha?: string; lugar?: string | null } = {};
        if (s.nueva_fecha) cambios.fecha = s.nueva_fecha;
        if (s.nuevo_lugar !== undefined) cambios.lugar = s.nuevo_lugar;
        if (Object.keys(cambios).length) await this.service.editarPartido(p.id, cambios);
        await this.notif.notificarJugadores(p.id, 'solicitud_aprobada',
          `Tu solicitud de edición para el partido ${p.equipo_local.nombre} vs ${p.equipo_visitante.nombre} fue aprobada.`);
      }
    } else {
      await this.notif.notificarJugadores(p.id, 'solicitud_rechazada',
        `Tu solicitud de ${s.tipo === 'edicion' ? 'edición' : 'cancelación'} para el partido ${p.equipo_local.nombre} vs ${p.equipo_visitante.nombre} fue rechazada.`);
    }

    await this.loadPartido();
    this.saving.set(false);
  }

  iniciarEdicion(): void {
    const p = this.partido();
    if (!p) return;
    // Convertir ISO a formato datetime-local (YYYY-MM-DDTHH:MM)
    this.inputFecha = p.fecha.slice(0, 16);
    this.inputLugar = p.lugar ?? '';
    this.errorEdit.set('');
    this.editando.set(true);
  }

  async guardarEdicion(): Promise<void> {
    const p = this.partido();
    if (!p || !this.inputFecha) return;
    this.saving.set(true);
    this.errorEdit.set('');

    const cambios: { fecha?: string; lugar?: string | null } = {};
    if (this.inputFecha !== p.fecha.slice(0, 16)) cambios.fecha = this.inputFecha;
    const lugarNuevo = this.inputLugar.trim() || null;
    if (lugarNuevo !== p.lugar) cambios.lugar = lugarNuevo;

    if (!Object.keys(cambios).length) {
      this.editando.set(false);
      this.saving.set(false);
      return;
    }

    const error = await this.service.editarPartido(p.id, cambios);
    if (error) {
      this.errorEdit.set(error);
      this.saving.set(false);
      return;
    }

    const partes: string[] = [];
    if (cambios.fecha) partes.push(`nueva fecha: ${new Date(cambios.fecha).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`);
    if ('lugar' in cambios) partes.push(cambios.lugar ? `lugar: ${cambios.lugar}` : 'lugar eliminado');
    const msg = `El partido ${p.equipo_local.nombre} vs ${p.equipo_visitante.nombre} fue editado (${partes.join(', ')}).`;
    await this.notif.notificarJugadores(p.id, 'partido_editado', msg);

    this.editando.set(false);
    await this.loadPartido();
    this.saving.set(false);
  }

  async confirmarResultado(): Promise<void> {
    const rol = this.rolCapitan();
    if (!this.partido() || !rol) return;
    this.saving.set(true);
    await this.resultados.confirmarResultado(
      this.partido()!.id,
      rol,
      this.inputGolesLocal,
      this.inputGolesVisitante,
    );
    await this.loadPartido();
    this.saving.set(false);
  }

  async cancelar(): Promise<void> {
    const p = this.partido();
    if (!p) return;
    // eslint-disable-next-line no-alert
    if (!confirm('¿Cancelar este partido? Esta acción no se puede deshacer.')) return;
    this.saving.set(true);
    const error = await this.service.cancelarPartido(p.id);
    if (!error) {
      await this.notif.notificarJugadores(
        p.id,
        'partido_cancelado',
        `El partido ${p.equipo_local.nombre} vs ${p.equipo_visitante.nombre} del ${new Date(p.fecha).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })} ha sido cancelado.`,
      );
    }
    await this.loadPartido();
    this.saving.set(false);
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CL', {
      weekday: 'long', day: 'numeric', month: 'long',
      year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  tipoLabel(tipo: string): string {
    return TIPO_FUTBOL_LABELS[tipo as keyof typeof TIPO_FUTBOL_LABELS] ?? tipo;
  }

  estadoLabel(estado: string): string {
    const map: Record<string, string> = {
      programado: 'Programado', completado: 'Completado',
      cancelado: 'Cancelado', en_disputa: 'En Disputa',
    };
    return map[estado] ?? estado;
  }

  aceptacionLabel(estado: string): string {
    const map: Record<string, string> = {
      pendiente: 'Pendiente de aceptación', rechazada: 'Visitante rechazó',
    };
    return map[estado] ?? estado;
  }

  formatFechaCorta(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CL', {
      weekday: 'short', day: 'numeric', month: 'short',
    });
  }

  convLabel(estado: string): string {
    const map: Record<string, string> = {
      pendiente: 'Pendiente', confirmado: 'Confirmado', rechazado: 'Rechazado',
    };
    return map[estado] ?? estado;
  }

  nombreMiEquipo(): string {
    const p  = this.partido();
    const id = this.miEquipoComoCapitan();
    if (!p || !id) return '';
    return id === p.equipo_local_id ? p.equipo_local.nombre : p.equipo_visitante.nombre;
  }

  confirmados(jugadores: PartidoJugadorConPerfil[]): number {
    return jugadores.filter(j => j.estado === 'confirmado').length;
  }
}
