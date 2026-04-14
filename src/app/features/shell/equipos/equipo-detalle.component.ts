import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EquiposService } from '../../../core/equipos/equipos.service';
import { AuthService } from '../../../core/auth/auth.service';
import { EquipoDetalle, EquipoMiembroConPerfil } from '../../../core/models/equipo.model';
import { UsuarioPerfil } from '../../../core/auth/auth.service';

const POSICION_LABEL: Record<string, string> = {
  portero: 'POR', defensa: 'DEF', volante: 'VOL', delantero: 'DEL',
};

@Component({
  selector: 'app-equipo-detalle',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="page">
      <a routerLink="/app/equipos" class="back-link">← Mis equipos</a>

      @if (loading()) {
        <div class="loading">Cargando...</div>
      } @else if (equipo()) {
        <div class="equipo-header">
          <div class="escudo-wrap">
            @if (equipo()!.escudo_url) {
              <img [src]="equipo()!.escudo_url!" [alt]="equipo()!.nombre" class="escudo-img" />
            } @else {
              <span class="font-display escudo-letter">{{ equipo()!.nombre.charAt(0) }}</span>
            }
            @if (esCapitan()) {
              <label class="escudo-edit" title="Cambiar escudo">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/>
                </svg>
                <input type="file" accept="image/*" (change)="cambiarEscudo($event)" hidden />
              </label>
            }
          </div>
          <div>
            <h1 class="font-display equipo-nombre">{{ equipo()!.nombre }}</h1>
            <div class="equipo-meta">
              <span class="badge-count">{{ activosCount() }} jugadores</span>
              @if (esCapitan()) { <span class="badge-capitan">Capitan</span> }
            </div>
          </div>
        </div>

        <!-- Buscador de invitaciones (solo capitan) -->
        @if (esCapitan()) {
          <div class="invite-section">
            <h2 class="section-title">Invitar jugador</h2>
            <div class="search-wrap">
              <input
                type="text" [(ngModel)]="searchQuery"
                (input)="buscar()"
                placeholder="Buscar por nombre, nickname o correo..."
                class="form-input"
              />
            </div>

            @if (buscando()) {
              <p class="search-hint">Buscando...</p>
            } @else if (resultados().length) {
              <div class="resultados">
                @for (u of resultados(); track u.id) {
                  <div class="resultado-card">
                    <div class="result-avatar">
                      @if (u.foto_url) {
                        <img [src]="u.foto_url" [alt]="u.nombre" />
                      } @else {
                        <span class="font-display">{{ u.nombre.charAt(0) }}</span>
                      }
                    </div>
                    <div class="result-info">
                      <div class="result-nombre">{{ u.nombre }}</div>
                      <div class="result-meta">
                        {{ posLabel(u.posicion) }} · {{ u.comuna }}
                      </div>
                    </div>
                    <button
                      class="btn-invitar"
                      (click)="invitar(u)"
                      [disabled]="invitando() === u.id"
                    >
                      {{ invitando() === u.id ? '...' : 'Invitar' }}
                    </button>
                  </div>
                }
              </div>
            } @else if (searchQuery.length >= 2) {
              <p class="search-hint">Sin resultados para "{{ searchQuery }}"</p>
            }
          </div>
        }

        <!-- Lista de miembros -->
        <div class="miembros-section">
          <h2 class="section-title">Plantilla ({{ activosCount() }})</h2>
          <div class="miembros-list">
            @for (m of miembrosActivos(); track m.id) {
              <div class="miembro-row" [class.capitan-row]="m.rol === 'capitan'" [class.lesion-row]="m.usuario.lesionado">
                <div class="m-avatar-wrap">
                  <div class="m-avatar">
                    @if (m.usuario.foto_url) {
                      <img [src]="m.usuario.foto_url" [alt]="m.usuario.nombre" />
                    } @else {
                      <span class="font-display">{{ m.usuario.nombre.charAt(0) }}</span>
                    }
                  </div>
                  @if (m.usuario.lesionado) {
                    <div class="lesion-badge">
                      <svg width="9" height="9" fill="white" viewBox="0 0 24 24">
                        <rect x="9" y="2" width="6" height="20" rx="2"/>
                        <rect x="2" y="9" width="20" height="6" rx="2"/>
                      </svg>
                    </div>
                  }
                </div>
                <div class="m-info">
                  <div class="m-nombre">
                    {{ m.usuario.nombre }}
                    @if (m.rol === 'capitan') { <span class="badge-capitan-sm">C</span> }
                    @if (m.usuario.lesionado) {
                      <span class="lesion-chip">
                        <svg width="8" height="8" fill="currentColor" viewBox="0 0 24 24">
                          <rect x="9" y="2" width="6" height="20" rx="2"/>
                          <rect x="2" y="9" width="20" height="6" rx="2"/>
                        </svg>
                        LESIONADO
                      </span>
                    }
                  </div>
                  <div class="m-meta">{{ posLabel(m.usuario.posicion) }} · {{ m.usuario.comuna }}</div>
                </div>
                <div class="m-rep">
                  <div class="rep-num font-display">{{ avgRep(m.usuario) }}</div>
                  <div class="rep-lbl">REP</div>
                </div>
                <!-- Botón hacer capitán (solo capitán actual, solo para no-capitanes) -->
                @if (esCapitan() && m.rol !== 'capitan') {
                  @if (confirmandoCapitan() === m.usuario_id) {
                    <div class="capitan-confirm">
                      <span class="capitan-confirm-txt">¿Nombrar capitán?</span>
                      <button class="btn-confirm-cap" (click)="confirmarCambioCapitan(m.usuario_id)" [disabled]="cambiandoCapitan()">
                        {{ cambiandoCapitan() ? '...' : 'Sí' }}
                      </button>
                      <button class="btn-cancel-cap" (click)="confirmandoCapitan.set(null)" [disabled]="cambiandoCapitan()">No</button>
                    </div>
                  } @else {
                    <button class="btn-hacer-capitan" (click)="confirmandoCapitan.set(m.usuario_id)" title="Nombrar capitán">
                      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="8" r="4"/><path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6"/>
                        <path d="M12 2v2M4.2 4.2l1.4 1.4M2 12H4M4.2 19.8l1.4-1.4" stroke-width="1.5"/>
                      </svg>
                      Capitán
                    </button>
                  }
                }
              </div>
            }
          </div>

          <!-- Pendientes -->
          @if (miembrosPendientes().length) {
            <h2 class="section-title" style="margin-top:1.5rem">Invitaciones enviadas ({{ miembrosPendientes().length }})</h2>
            <div class="miembros-list">
              @for (m of miembrosPendientes(); track m.id) {
                <div class="miembro-row pending">
                  <div class="m-avatar">
                    @if (m.usuario.foto_url) {
                      <img [src]="m.usuario.foto_url" [alt]="m.usuario.nombre" />
                    } @else {
                      <span class="font-display">{{ m.usuario.nombre.charAt(0) }}</span>
                    }
                  </div>
                  <div class="m-info">
                    <div class="m-nombre">{{ m.usuario.nombre }}</div>
                    <div class="m-meta pending-badge">Pendiente</div>
                  </div>
                </div>
              }
            </div>
          }
        </div><!-- /miembros-section -->

        <!-- Zona peligrosa (solo capitán) -->
        @if (esCapitan()) {
          <div class="danger-zone">
            @if (!confirmandoEliminar()) {
              <button class="btn-eliminar" (click)="confirmandoEliminar.set(true)">
                <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
                Eliminar equipo
              </button>
            } @else {
              <div class="confirm-panel">
                <p class="confirm-msg">
                  ¿Eliminar <strong>{{ equipo()!.nombre }}</strong>? Esta acción no se puede deshacer.
                </p>
                <div class="confirm-actions">
                  <button class="btn-cancel-confirm" (click)="confirmandoEliminar.set(false)" [disabled]="eliminando()">
                    Cancelar
                  </button>
                  <button class="btn-confirm-delete" (click)="eliminar()" [disabled]="eliminando()">
                    {{ eliminando() ? 'Eliminando...' : 'Sí, eliminar' }}
                  </button>
                </div>
                @if (errorEliminar()) {
                  <p class="error-msg-sm">{{ errorEliminar() }}</p>
                }
              </div>
            }
          </div>
        }

      } @else {
        <p class="error-msg">Equipo no encontrado.</p>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 680px; }
    .back-link { color: var(--color-light); font-size: .82rem; text-decoration: none; display: inline-block; margin-bottom: 1.25rem; transition: color .2s; }
    .back-link:hover { color: #fff; }
    .loading { color: var(--color-light); padding: 2rem 0; }
    .equipo-header { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; }
    .escudo-wrap {
      position: relative; width: 80px; height: 80px; border-radius: 14px;
      background: rgba(240,192,64,.1); border: 1px solid rgba(240,192,64,.25);
      display: flex; align-items: center; justify-content: center; overflow: visible; flex-shrink: 0;
    }
    .escudo-img { width: 80px; height: 80px; border-radius: 14px; object-fit: cover; }
    .escudo-letter { font-size: 2.8rem; color: var(--color-gold); }
    .escudo-edit {
      position: absolute; bottom: -6px; right: -6px;
      background: var(--color-gold); color: var(--color-dark);
      border-radius: 50%; width: 24px; height: 24px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,.4);
    }
    .equipo-nombre { font-size: 2.2rem; color: #fff; margin-bottom: .4rem; }
    .equipo-meta { display: flex; gap: .6rem; align-items: center; flex-wrap: wrap; }
    .badge-count { font-size: .75rem; color: var(--color-light); }
    .badge-capitan {
      background: rgba(240,192,64,.12); border: 1px solid rgba(240,192,64,.3);
      color: var(--color-gold); font-size: .65rem; font-weight: 800;
      letter-spacing: .08em; text-transform: uppercase; padding: .15rem .5rem; border-radius: 4px;
    }
    .invite-section, .miembros-section {
      background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07);
      border-radius: 12px; padding: 1.25rem; margin-bottom: 1.25rem;
    }
    .section-title { font-size: .72rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: var(--color-light); margin-bottom: 1rem; }
    .search-wrap { margin-bottom: .75rem; }
    .form-input {
      width: 100%; padding: .7rem .9rem; border-radius: 8px; box-sizing: border-box;
      background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12);
      color: #fff; font-size: .92rem; outline: none; transition: border-color .2s;
    }
    .form-input:focus { border-color: var(--color-gold); }
    .search-hint { color: rgba(255,255,255,.3); font-size: .82rem; }
    .resultados { display: flex; flex-direction: column; gap: .6rem; }
    .resultado-card {
      display: flex; align-items: center; gap: .85rem;
      background: rgba(255,255,255,.04); border-radius: 8px; padding: .75rem;
    }
    .result-avatar {
      width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
      background: rgba(255,255,255,.08); display: flex; align-items: center; justify-content: center; overflow: hidden;
    }
    .result-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .result-avatar span { font-size: 1rem; color: var(--color-gold); }
    .result-info { flex: 1; }
    .result-nombre { font-weight: 600; color: #fff; font-size: .9rem; }
    .result-meta { font-size: .75rem; color: var(--color-light); margin-top: .1rem; }
    .btn-invitar {
      background: rgba(0,208,104,.12); border: 1px solid rgba(0,208,104,.3);
      color: var(--color-green); padding: .4rem .9rem; border-radius: 6px;
      font-size: .78rem; font-weight: 700; cursor: pointer; transition: background .2s;
      white-space: nowrap;
    }
    .btn-invitar:hover { background: rgba(0,208,104,.2); }
    .btn-invitar:disabled { opacity: .5; cursor: not-allowed; }
    .miembros-list { display: flex; flex-direction: column; gap: .6rem; }
    .miembro-row {
      display: flex; align-items: center; gap: .85rem;
      padding: .75rem; border-radius: 8px; background: rgba(255,255,255,.03);
      border-left: 3px solid transparent; transition: border-color .2s, background .2s;
    }
    .miembro-row.capitan-row { background: rgba(240,192,64,.04); }
    .miembro-row.pending { opacity: .6; }
    .miembro-row.lesion-row {
      background: rgba(220,30,30,.05);
      border-left-color: rgba(220,30,30,.5);
    }
    .m-avatar-wrap { position: relative; flex-shrink: 0; }
    .m-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: rgba(255,255,255,.08); display: flex; align-items: center; justify-content: center; overflow: hidden;
    }
    .m-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .m-avatar span { font-size: 1.1rem; color: var(--color-gold); }
    .lesion-badge {
      position: absolute; bottom: -2px; right: -2px;
      width: 18px; height: 18px; border-radius: 50%;
      background: #dc1e1e; border: 2px solid #0d1520;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 8px rgba(220,30,30,.7);
      animation: pulse-badge 1.8s ease-in-out infinite;
    }
    @keyframes pulse-badge {
      0%, 100% { box-shadow: 0 0 8px rgba(220,30,30,.7); }
      50%       { box-shadow: 0 0 14px rgba(220,30,30,1); }
    }
    .lesion-chip {
      display: inline-flex; align-items: center; gap: .25rem;
      background: rgba(220,30,30,.18); border: 1px solid rgba(220,30,30,.4);
      color: #ff4444; font-size: .58rem; font-weight: 900;
      letter-spacing: .1em; padding: .1rem .4rem; border-radius: 3px;
    }
    .m-info { flex: 1; }
    .m-nombre { font-weight: 600; color: #fff; font-size: .92rem; display: flex; align-items: center; gap: .4rem; }
    .m-meta { font-size: .75rem; color: var(--color-light); margin-top: .1rem; }
    .badge-capitan-sm {
      background: var(--color-gold); color: var(--color-dark);
      font-size: .6rem; font-weight: 900; padding: .1rem .35rem; border-radius: 3px;
    }
    .pending-badge { color: rgba(240,192,64,.6); }
    .m-rep { text-align: center; flex-shrink: 0; }
    .btn-hacer-capitan {
      display: flex; align-items: center; gap: .3rem; flex-shrink: 0;
      background: rgba(240,192,64,.08); border: 1px solid rgba(240,192,64,.25);
      color: var(--color-gold); padding: .35rem .7rem; border-radius: 6px;
      font-size: .72rem; font-weight: 700; cursor: pointer;
      transition: background .2s; white-space: nowrap;
    }
    .btn-hacer-capitan:hover { background: rgba(240,192,64,.18); }
    .capitan-confirm {
      display: flex; align-items: center; gap: .4rem; flex-shrink: 0;
    }
    .capitan-confirm-txt { font-size: .72rem; color: var(--color-light); white-space: nowrap; }
    .btn-confirm-cap {
      background: var(--color-gold); color: var(--color-dark); border: none;
      padding: .3rem .65rem; border-radius: 5px; font-size: .72rem; font-weight: 800;
      cursor: pointer; transition: filter .2s;
    }
    .btn-confirm-cap:hover:not(:disabled) { filter: brightness(1.1); }
    .btn-confirm-cap:disabled { opacity: .5; cursor: not-allowed; }
    .btn-cancel-cap {
      background: transparent; border: 1px solid rgba(255,255,255,.15);
      color: rgba(255,255,255,.5); padding: .3rem .65rem; border-radius: 5px;
      font-size: .72rem; font-weight: 600; cursor: pointer;
    }
    .btn-cancel-cap:hover:not(:disabled) { border-color: rgba(255,255,255,.35); }
    .rep-num { font-size: 1.3rem; color: var(--color-gold); line-height: 1; }
    .rep-lbl { font-size: .58rem; font-weight: 700; letter-spacing: .06em; color: rgba(255,255,255,.3); text-transform: uppercase; }
    .error-msg { color: #ff6b6b; }

    /* ── Zona peligrosa ── */
    .danger-zone {
      border: 1px solid rgba(255,80,80,.2); border-radius: 12px;
      padding: 1.25rem; margin-top: .5rem;
    }
    .btn-eliminar {
      display: flex; align-items: center; gap: .5rem;
      background: transparent; border: 1px solid rgba(255,80,80,.35);
      color: #ff6b6b; padding: .55rem 1.1rem; border-radius: 8px;
      font-size: .82rem; font-weight: 700; cursor: pointer;
      transition: background .2s, border-color .2s;
    }
    .btn-eliminar:hover { background: rgba(255,80,80,.08); border-color: rgba(255,80,80,.6); }
    .confirm-panel { display: flex; flex-direction: column; gap: .85rem; }
    .confirm-msg { font-size: .88rem; color: var(--color-light); line-height: 1.5; }
    .confirm-msg strong { color: #fff; }
    .confirm-actions { display: flex; gap: .75rem; }
    .btn-cancel-confirm {
      padding: .55rem 1.2rem; border-radius: 8px;
      background: transparent; border: 1px solid rgba(255,255,255,.15);
      color: var(--color-light); font-size: .85rem; font-weight: 600;
      cursor: pointer; transition: border-color .2s;
    }
    .btn-cancel-confirm:hover:not(:disabled) { border-color: rgba(255,255,255,.35); }
    .btn-cancel-confirm:disabled { opacity: .5; cursor: not-allowed; }
    .btn-confirm-delete {
      padding: .55rem 1.4rem; border-radius: 8px; border: none;
      background: #c0392b; color: #fff;
      font-size: .85rem; font-weight: 700; cursor: pointer;
      transition: filter .2s;
    }
    .btn-confirm-delete:hover:not(:disabled) { filter: brightness(1.15); }
    .btn-confirm-delete:disabled { opacity: .5; cursor: not-allowed; }
    .error-msg-sm { color: #ff6b6b; font-size: .78rem; }
  `],
})
export class EquipoDetalleComponent implements OnInit {
  private route  = inject(ActivatedRoute);
  private svc    = inject(EquiposService);
  private router = inject(Router);
  readonly auth  = inject(AuthService);

  readonly equipo              = signal<EquipoDetalle | null>(null);
  readonly loading             = signal(true);
  readonly buscando            = signal(false);
  readonly resultados          = signal<UsuarioPerfil[]>([]);
  readonly invitando           = signal<string | null>(null);
  readonly confirmandoEliminar  = signal(false);
  readonly eliminando           = signal(false);
  readonly errorEliminar        = signal('');
  readonly confirmandoCapitan   = signal<string | null>(null);
  readonly cambiandoCapitan     = signal(false);

  searchQuery = '';
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  readonly esCapitan = () =>
    this.equipo()?.capitan_id === this.auth.userId();

  readonly miembrosActivos = (): EquipoMiembroConPerfil[] =>
    this.equipo()?.miembros.filter(m => m.estado === 'activo') ?? [];

  readonly miembrosPendientes = (): EquipoMiembroConPerfil[] =>
    this.equipo()?.miembros.filter(m => m.estado === 'pendiente') ?? [];

  readonly activosCount = () => this.miembrosActivos().length;

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id')!;
    const data = await this.svc.getEquipo(id);
    this.equipo.set(data);
    this.loading.set(false);
  }

  buscar(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    if (this.searchQuery.length < 2) { this.resultados.set([]); return; }
    this.buscando.set(true);
    this.searchTimer = setTimeout(async () => {
      const usuarios = await this.svc.buscarUsuarios(
        this.searchQuery,
        this.equipo()?.id,
      );
      this.resultados.set(usuarios);
      this.buscando.set(false);
    }, 300);
  }

  async invitar(u: UsuarioPerfil): Promise<void> {
    const eq = this.equipo();
    if (!eq) return;
    this.invitando.set(u.id);
    await this.svc.invitarMiembro(eq.id, u.id);
    // Recargar para mostrar pendiente
    const updated = await this.svc.getEquipo(eq.id);
    this.equipo.set(updated);
    this.resultados.set(this.resultados().filter(r => r.id !== u.id));
    this.invitando.set(null);
  }

  async confirmarCambioCapitan(nuevo_capitan_id: string): Promise<void> {
    const eq = this.equipo();
    if (!eq) return;
    this.cambiandoCapitan.set(true);
    const error = await this.svc.cambiarCapitan(eq.id, nuevo_capitan_id);
    if (error) {
      this.cambiandoCapitan.set(false);
      this.confirmandoCapitan.set(null);
      return;
    }
    // Recargar para reflejar nuevo capitán
    const updated = await this.svc.getEquipo(eq.id);
    this.equipo.set(updated);
    this.cambiandoCapitan.set(false);
    this.confirmandoCapitan.set(null);
  }

  async eliminar(): Promise<void> {
    const eq = this.equipo();
    if (!eq) return;
    this.eliminando.set(true);
    this.errorEliminar.set('');
    const error = await this.svc.eliminarEquipo(eq.id);
    if (error) {
      this.errorEliminar.set('No se pudo eliminar el equipo. Intenta de nuevo.');
      this.eliminando.set(false);
      return;
    }
    this.router.navigate(['/app/equipos']);
  }

  async cambiarEscudo(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    const eq = this.equipo();
    if (!file || !eq) return;
    const url = await this.svc.uploadEscudo(eq.id, file);
    if (url) this.equipo.set({ ...eq, escudo_url: url });
  }

  posLabel(pos: string | null | undefined): string {
    return pos ? (POSICION_LABEL[pos] ?? pos) : '—';
  }

  avgRep(u: { rep_asistencia: number; rep_puntualidad: number; rep_compromiso: number }): number {
    return Math.round((u.rep_asistencia + u.rep_puntualidad + u.rep_compromiso) / 3);
  }
}
