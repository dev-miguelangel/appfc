import { Component, effect, inject, signal, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { AuthService } from '../../core/auth/auth.service';
import { NotificacionesService } from '../../core/notificaciones/notificaciones.service';
import { Notificacion } from '../../core/models/notificacion.model';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <!-- ── Header ── -->
      <header class="shell-header">
        <a routerLink="/app/dashboard" class="shell-logo">App<span>FC</span></a>

        <!-- Desktop / Tablet nav -->
        <nav class="shell-nav">
          <a routerLink="/app/dashboard" routerLinkActive="active">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M3 12L12 3l9 9"/><path d="M5 10v9h5v-5h4v5h5v-9"/>
            </svg>
            Dashboard
          </a>
          <a routerLink="/app/equipos" routerLinkActive="active">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Equipos
          </a>
          <a routerLink="/app/partidos" routerLinkActive="active">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
              <path d="M2 12h20"/>
            </svg>
            Partidos
          </a>
          <a routerLink="/app/perfil" routerLinkActive="active">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
            Mi Perfil
          </a>
          @if (auth.isAdmin()) {
            <a routerLink="/app/admin" routerLinkActive="active" class="nav-admin">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
              Admin
            </a>
          }
        </nav>

        <div class="shell-user">
          <!-- Campana -->
          <div class="notif-container">
            <button class="btn-bell" (click)="toggleNotif()" [class.active]="mostrarNotif()" title="Notificaciones">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              @if (notif.noLeidas() > 0) {
                <span class="notif-badge">{{ notif.noLeidas() > 9 ? '9+' : notif.noLeidas() }}</span>
              }
            </button>

            @if (mostrarNotif()) {
              <div class="notif-backdrop" (click)="mostrarNotif.set(false)"></div>
              <div class="notif-panel">
                <div class="notif-panel-header">
                  <span class="notif-panel-title">Notificaciones</span>
                  @if (notif.noLeidas() > 0) {
                    <button class="btn-marcar-leidas" (click)="notif.marcarTodasLeidas()">
                      Marcar todas leídas
                    </button>
                  }
                </div>
                @if (!notif.todas().length) {
                  <p class="notif-empty">Sin notificaciones</p>
                } @else {
                  @for (n of notif.todas(); track n.id) {
                    <div class="notif-item" [class.no-leida]="!n.leida" (click)="abrirNotif(n)">
                      <span class="notif-icon">{{ tipoIcon(n.tipo) }}</span>
                      <div class="notif-body">
                        <p class="notif-msg">{{ n.mensaje }}</p>
                        <time class="notif-time">{{ formatTiempo(n.created_at) }}</time>
                      </div>
                      @if (!n.leida) { <span class="notif-dot"></span> }
                    </div>
                  }
                }
              </div>
            }
          </div>

          @if (auth.perfil(); as p) {
            @if (p.foto_url) {
              <img [src]="p.foto_url" class="user-avatar" alt="avatar" />
            } @else {
              <div class="user-avatar-placeholder">{{ p.nombre?.charAt(0) ?? '?' }}</div>
            }
            <span class="user-name">{{ p.nombre }}</span>
          }
          <button class="btn-logout" (click)="auth.logout()" title="Cerrar sesion">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </header>

      <!-- ── Banner de actualización ── -->
      @if (hayActualizacion()) {
        <div class="update-banner">
          <div class="update-banner-inner">
            <div class="update-icon">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
                <path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
              </svg>
            </div>
            <span class="update-text">
              <strong>Nueva versión disponible</strong>
              <span class="update-sub">Actualiza para obtener las últimas mejoras.</span>
            </span>
            <button class="btn-update" (click)="activarActualizacion()" [disabled]="actualizando()">
              @if (actualizando()) {
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24" class="spin">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                Actualizando...
              } @else {
                Actualizar ahora
              }
            </button>
          </div>
        </div>
      }

      <!-- ── Contenido ── -->
      <main class="shell-main">
        <router-outlet />
      </main>

      <!-- ── Bottom nav (mobile only) ── -->
      <nav class="bottom-nav">
        <a routerLink="/app/dashboard" routerLinkActive="active" class="bottom-nav-item">
          <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M3 12L12 3l9 9"/><path d="M5 10v9h5v-5h4v5h5v-9"/>
          </svg>
          <span>Inicio</span>
        </a>
        <a routerLink="/app/equipos" routerLinkActive="active" class="bottom-nav-item">
          <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span>Equipos</span>
        </a>
        <a routerLink="/app/partidos" routerLinkActive="active" class="bottom-nav-item">
          <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
            <path d="M2 12h20"/>
          </svg>
          <span>Partidos</span>
        </a>
        <a routerLink="/app/perfil" routerLinkActive="active" class="bottom-nav-item">
          <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
          <span>Perfil</span>
          @if (notif.noLeidas() > 0) {
            <span class="bottom-notif-dot"></span>
          }
        </a>
      </nav>
    </div>
  `,
  styles: [`
    .shell {
      min-height: 100vh; display: flex; flex-direction: column;
      background: var(--color-dark);
    }

    /* ── Header ── */
    .shell-header {
      position: sticky; top: 0; z-index: 50;
      display: flex; align-items: center; gap: 2rem;
      padding: 0 2rem; height: 60px;
      background: rgba(8,12,20,.95); border-bottom: 1px solid rgba(255,255,255,.07);
      backdrop-filter: blur(8px);
    }
    .shell-logo {
      font-family: 'Bebas Neue', sans-serif; font-size: 1.7rem;
      letter-spacing: .12em; color: var(--color-gold);
      text-decoration: none; text-shadow: 0 0 16px rgba(240,192,64,.4);
      flex-shrink: 0;
    }
    .shell-logo span { color: #fff; }

    /* ── Desktop/Tablet nav ── */
    .shell-nav { display: flex; gap: 1.5rem; flex: 1; }
    .shell-nav a {
      display: flex; align-items: center; gap: .45rem;
      color: var(--color-light); text-decoration: none;
      font-size: .82rem; font-weight: 600; letter-spacing: .07em; text-transform: uppercase;
      padding: .35rem .6rem; border-radius: 6px;
      transition: color .2s, background .2s;
    }
    .shell-nav a:hover { color: #fff; background: rgba(255,255,255,.05); }
    .shell-nav a.active { color: var(--color-gold); background: rgba(240,192,64,.08); }
    .nav-admin { border: 1px solid rgba(240,192,64,.2) !important; }
    .nav-admin:hover { border-color: rgba(240,192,64,.4) !important; }
    .nav-admin.active { border-color: rgba(240,192,64,.4) !important; }

    /* ── User section ── */
    .shell-user { display: flex; align-items: center; gap: .75rem; margin-left: auto; }
    .user-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1px solid rgba(240,192,64,.3); }
    .user-avatar-placeholder {
      width: 32px; height: 32px; border-radius: 50%;
      background: rgba(240,192,64,.15); border: 1px solid rgba(240,192,64,.3);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Bebas Neue', sans-serif; font-size: 1rem; color: var(--color-gold);
    }
    .user-name { font-size: .85rem; font-weight: 600; color: var(--color-light); }
    .btn-logout {
      background: transparent; border: none; color: rgba(255,255,255,.35);
      cursor: pointer; padding: .35rem; border-radius: 6px;
      transition: color .2s, background .2s; display: flex;
    }
    .btn-logout:hover { color: #ff6b6b; background: rgba(255,107,107,.1); }

    /* ── Notificaciones ── */
    .notif-container { position: relative; }
    .btn-bell {
      position: relative; background: transparent; border: none;
      color: rgba(255,255,255,.45); cursor: pointer; padding: .35rem;
      border-radius: 6px; display: flex; transition: color .2s, background .2s;
    }
    .btn-bell:hover, .btn-bell.active { color: #fff; background: rgba(255,255,255,.08); }
    .notif-badge {
      position: absolute; top: 0; right: 0;
      min-width: 16px; height: 16px; border-radius: 8px;
      background: #ff4d4d; color: #fff;
      font-size: .6rem; font-weight: 700; line-height: 16px;
      text-align: center; padding: 0 3px;
    }
    .notif-backdrop { position: fixed; inset: 0; z-index: 99; }
    .notif-panel {
      position: fixed; top: 64px; right: 1rem; z-index: 100;
      width: min(360px, calc(100vw - 2rem)); max-height: 480px; overflow-y: auto;
      background: #141a24; border: 1px solid rgba(255,255,255,.1);
      border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,.7);
    }
    .notif-panel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: .9rem 1.1rem; border-bottom: 1px solid rgba(255,255,255,.07);
      position: sticky; top: 0; background: #141a24; z-index: 1;
    }
    .notif-panel-title {
      font-size: .75rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: .1em; color: var(--color-light);
    }
    .btn-marcar-leidas {
      background: transparent; border: none; color: var(--color-gold);
      font-size: .72rem; font-weight: 700; cursor: pointer; padding: 0;
      transition: opacity .2s;
    }
    .btn-marcar-leidas:hover { opacity: .75; }
    .notif-empty {
      padding: 2rem; text-align: center; font-size: .82rem; color: rgba(255,255,255,.3);
    }
    .notif-item {
      display: flex; align-items: flex-start; gap: .75rem;
      padding: .85rem 1.1rem; border-bottom: 1px solid rgba(255,255,255,.05);
      cursor: pointer; transition: background .15s; position: relative;
    }
    .notif-item:last-child { border-bottom: none; }
    .notif-item:hover { background: rgba(255,255,255,.04); }
    .notif-item.no-leida { background: rgba(240,192,64,.04); }
    .notif-icon { font-size: 1.2rem; flex-shrink: 0; margin-top: .05rem; }
    .notif-body { flex: 1; min-width: 0; }
    .notif-msg { font-size: .8rem; color: #e0e0e0; margin: 0 0 .25rem; line-height: 1.4; }
    .notif-time { font-size: .68rem; color: rgba(255,255,255,.3); }
    .notif-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: var(--color-gold); flex-shrink: 0; margin-top: .35rem;
    }

    /* ── Banner de actualización ── */
    .update-banner {
      background: linear-gradient(90deg, rgba(240,192,64,.12) 0%, rgba(240,192,64,.06) 100%);
      border-bottom: 1px solid rgba(240,192,64,.25);
      padding: .6rem 2rem;
      animation: slideDown .3s ease;
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-100%); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .update-banner-inner {
      display: flex; align-items: center; gap: .85rem;
      max-width: 1200px; margin: 0 auto;
    }
    .update-icon {
      width: 34px; height: 34px; border-radius: 50%;
      background: rgba(240,192,64,.15); border: 1px solid rgba(240,192,64,.3);
      display: flex; align-items: center; justify-content: center;
      color: var(--color-gold); flex-shrink: 0;
    }
    .update-text {
      flex: 1; display: flex; flex-direction: column; gap: .1rem; min-width: 0;
    }
    .update-text strong {
      font-size: .85rem; font-weight: 700; color: var(--color-gold);
    }
    .update-sub {
      font-size: .75rem; color: rgba(255,255,255,.45);
    }
    .btn-update {
      display: flex; align-items: center; gap: .4rem;
      background: var(--color-gold);
      color: var(--color-dark); border: none;
      padding: .5rem 1.1rem; border-radius: 8px;
      font-size: .8rem; font-weight: 800; letter-spacing: .06em;
      text-transform: uppercase; cursor: pointer; white-space: nowrap;
      transition: filter .2s, transform .1s; flex-shrink: 0;
    }
    .btn-update:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
    .btn-update:disabled { opacity: .7; cursor: not-allowed; transform: none; }
    .spin { animation: spin .8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Main content ── */
    .shell-main {
      flex: 1; padding: 2rem;
      max-width: 1200px; width: 100%; margin: 0 auto;
      box-sizing: border-box;
    }

    /* ── Bottom nav (hidden on desktop) ── */
    .bottom-nav { display: none; }

    /* ════════════════════════════════════════
       TABLET  (641px – 1024px)
    ════════════════════════════════════════ */
    @media (max-width: 1024px) {
      .shell-header { gap: 1.2rem; padding: 0 1.25rem; }
      .shell-nav    { gap: .75rem; }
      .shell-nav a  { font-size: .76rem; padding: .3rem .45rem; gap: .35rem; }
      .user-name    { display: none; }
      .shell-main   { padding: 1.5rem; }
    }

    /* ════════════════════════════════════════
       MOBILE  (≤ 640px)
    ════════════════════════════════════════ */
    @media (max-width: 640px) {
      .update-banner { padding: .55rem 1rem; }
      .update-sub    { display: none; }
      .shell-header { padding: 0 1rem; gap: .75rem; }
      .shell-nav    { display: none; }

      .shell-main {
        padding: 1rem 1rem calc(64px + env(safe-area-inset-bottom, 0px));
      }

      /* Bottom tab bar */
      .bottom-nav {
        display: flex; align-items: stretch;
        position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
        height: calc(56px + env(safe-area-inset-bottom, 0px));
        padding-bottom: env(safe-area-inset-bottom, 0px);
        background: rgba(8,12,20,.97);
        border-top: 1px solid rgba(255,255,255,.09);
        backdrop-filter: blur(12px);
      }
      .bottom-nav-item {
        flex: 1; display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: .2rem;
        color: rgba(255,255,255,.4); text-decoration: none;
        font-size: .6rem; font-weight: 600; text-transform: uppercase;
        letter-spacing: .06em; transition: color .2s;
        position: relative; padding-top: .4rem;
      }
      .bottom-nav-item.active { color: var(--color-gold); }
      .bottom-nav-item svg { transition: transform .15s; }
      .bottom-nav-item.active svg { transform: translateY(-1px); }
      .bottom-notif-dot {
        position: absolute; top: 6px; right: calc(50% - 18px);
        width: 7px; height: 7px; border-radius: 50%; background: #ff4d4d;
      }
    }
  `],
})
export class ShellComponent implements OnDestroy {
  readonly auth  = inject(AuthService);
  readonly notif = inject(NotificacionesService);
  private router = inject(Router);
  private swUpdate = inject(SwUpdate, { optional: true });

  readonly mostrarNotif     = signal(false);
  readonly hayActualizacion = signal(false);
  readonly actualizando     = signal(false);

  private updateSub?: { unsubscribe(): void };
  private checkInterval?: ReturnType<typeof setInterval>;

  constructor() {
    effect(() => {
      if (this.auth.userId()) void this.notif.cargarNotificaciones();
    });

    this.initUpdateCheck();
  }

  private initUpdateCheck(): void {
    const sw = this.swUpdate;
    if (!sw?.isEnabled) return;

    // Escuchar versión lista para activar
    this.updateSub = sw.versionUpdates.subscribe(evt => {
      if (evt.type === 'VERSION_READY') {
        this.hayActualizacion.set(true);
      }
    });

    // Verificar al recuperar foco de pestaña
    document.addEventListener('visibilitychange', this.onVisibilityChange);

    // Verificar cada hora
    this.checkInterval = setInterval(() => void sw.checkForUpdate(), 60 * 60 * 1000);
  }

  private onVisibilityChange = (): void => {
    if (document.visibilityState === 'visible') {
      void this.swUpdate?.checkForUpdate();
    }
  };

  async activarActualizacion(): Promise<void> {
    const sw = this.swUpdate;
    if (!sw) return;
    this.actualizando.set(true);
    await sw.activateUpdate();
    window.location.reload();
  }

  ngOnDestroy(): void {
    this.updateSub?.unsubscribe();
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    if (this.checkInterval) clearInterval(this.checkInterval);
  }

  toggleNotif(): void {
    if (!this.mostrarNotif()) void this.notif.cargarNotificaciones();
    this.mostrarNotif.update(v => !v);
  }

  async abrirNotif(n: Notificacion): Promise<void> {
    if (!n.leida) await this.notif.marcarLeida(n.id);
    this.mostrarNotif.set(false);
    if (n.partido_id) void this.router.navigate(['/app/partidos', n.partido_id]);
  }

  tipoIcon(tipo: string): string {
    const map: Record<string, string> = {
      partido_cancelado:   '❌',
      partido_aceptado:    '✅',
      partido_rechazado:   '⚠️',
      solicitud_nueva:     '📋',
      solicitud_aprobada:  '✅',
      solicitud_rechazada: '❌',
    };
    return map[tipo] ?? '✏️';
  }

  formatTiempo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const min  = Math.floor(diff / 60_000);
    if (min < 1)   return 'ahora';
    if (min < 60)  return `hace ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24)    return `hace ${h} h`;
    const d = Math.floor(h / 24);
    if (d < 7)     return `hace ${d} días`;
    return new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
  }
}
