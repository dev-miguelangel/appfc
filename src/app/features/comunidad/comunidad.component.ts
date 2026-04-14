import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ComunidadService } from '../../core/comunidad/comunidad.service';
import { PartidoPublico, BoletinData } from '../../core/models/comunidad.model';
import { PartidoPublicoCardComponent } from './components/partido-publico-card.component';
import { BoletinComponent } from './components/boletin.component';

type Tab = 'en-vivo' | 'proximos' | 'resultados' | 'boletin';

@Component({
  selector: 'app-comunidad',
  standalone: true,
  imports: [RouterLink, PartidoPublicoCardComponent, BoletinComponent],
  template: `
    <div class="comunidad-page">
      <!-- ── Topbar ── -->
      <header class="com-header">
        <a routerLink="/" class="com-logo">App<span>FC</span></a>
        <div class="com-header-right">
          <a routerLink="/auth" class="btn-join">Únete gratis</a>
        </div>
      </header>

      <!-- ── Hero banner ── -->
      <div class="hero-banner">
        <div class="hero-content">
          <h1 class="hero-title font-display">Comunidad</h1>
          <p class="hero-sub">Partidos en tiempo real, rankings y estadísticas semanales.</p>
        </div>
      </div>

      <!-- ── Tabs ── -->
      <div class="tabs-wrap">
        <nav class="tabs">
          <button class="tab" [class.active]="tab() === 'en-vivo'" (click)="setTab('en-vivo')">
            <span class="live-dot-sm" [class.hidden]="enVivo().length === 0"></span>
            En Vivo
            @if (enVivo().length) {
              <span class="tab-badge">{{ enVivo().length }}</span>
            }
          </button>
          <button class="tab" [class.active]="tab() === 'proximos'" (click)="setTab('proximos')">Próximos</button>
          <button class="tab" [class.active]="tab() === 'resultados'" (click)="setTab('resultados')">Resultados</button>
          <button class="tab" [class.active]="tab() === 'boletin'" (click)="setTab('boletin')">📰 Boletín</button>
        </nav>
      </div>

      <!-- ── Contenido ── -->
      <div class="com-content">

        <!-- En Vivo -->
        @if (tab() === 'en-vivo') {
          @if (loading()) {
            <div class="spinner-wrap"><div class="spinner"></div></div>
          } @else if (!enVivo().length) {
            <div class="empty-state">
              <div class="empty-icon">⚽</div>
              <p>No hay partidos en curso ahora mismo.</p>
              <span>Vuelve más tarde o revisa los próximos partidos.</span>
            </div>
          } @else {
            <div class="cards-grid">
              @for (p of enVivo(); track p.id) {
                <app-partido-publico-card [partido]="p" />
              }
            </div>
          }
        }

        <!-- Próximos -->
        @if (tab() === 'proximos') {
          @if (loading()) {
            <div class="spinner-wrap"><div class="spinner"></div></div>
          } @else if (!proximos().length) {
            <div class="empty-state">
              <div class="empty-icon">📅</div>
              <p>Sin partidos próximos programados.</p>
            </div>
          } @else {
            <div class="cards-grid">
              @for (p of proximos(); track p.id) {
                <app-partido-publico-card [partido]="p" />
              }
            </div>
          }
        }

        <!-- Resultados -->
        @if (tab() === 'resultados') {
          @if (loading()) {
            <div class="spinner-wrap"><div class="spinner"></div></div>
          } @else if (!resultados().length) {
            <div class="empty-state">
              <div class="empty-icon">🏁</div>
              <p>Sin resultados recientes.</p>
            </div>
          } @else {
            <div class="cards-grid">
              @for (p of resultados(); track p.id) {
                <app-partido-publico-card [partido]="p" />
              }
            </div>
          }
        }

        <!-- Boletín -->
        @if (tab() === 'boletin') {
          @if (loading()) {
            <div class="spinner-wrap"><div class="spinner"></div></div>
          } @else if (boletin()) {
            <app-boletin [data]="boletin()!" />
          }
        }

      </div>

      <!-- ── CTA footer ── -->
      <div class="cta-banner">
        <div class="cta-content">
          <div class="cta-text">
            <strong>¿Quieres jugar?</strong>
            <span>Registra tu equipo, programa partidos y sube tus estadísticas.</span>
          </div>
          <a routerLink="/auth" class="btn-cta">Crear cuenta gratis</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .comunidad-page {
      min-height: 100vh; background: var(--color-dark); display: flex; flex-direction: column;
    }

    /* ── Header ── */
    .com-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: env(safe-area-inset-top, 0px) 2rem 0;
      height: calc(60px + env(safe-area-inset-top, 0px));
      background: rgba(8,12,20,.95); border-bottom: 1px solid rgba(255,255,255,.07);
      position: sticky; top: 0; z-index: 50; backdrop-filter: blur(8px);
    }
    .com-logo {
      font-family: 'Bebas Neue', sans-serif; font-size: 1.7rem;
      letter-spacing: .12em; color: var(--color-gold); text-decoration: none;
      text-shadow: 0 0 16px rgba(240,192,64,.4);
    }
    .com-logo span { color: #fff; }
    .btn-join {
      background: var(--color-gold); color: var(--color-dark);
      border-radius: 8px; padding: .45rem 1.1rem;
      font-size: .8rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase;
      text-decoration: none; transition: filter .2s;
    }
    .btn-join:hover { filter: brightness(1.1); }

    /* ── Hero ── */
    .hero-banner {
      background: linear-gradient(135deg, rgba(240,192,64,.08) 0%, rgba(0,0,0,0) 60%);
      border-bottom: 1px solid rgba(255,255,255,.05);
      padding: 2.5rem 2rem 2rem;
    }
    .hero-title { font-size: 3.5rem; color: var(--color-gold); margin: 0; line-height: 1; }
    .hero-sub { color: rgba(255,255,255,.5); margin: .5rem 0 0; font-size: .92rem; }

    /* ── Tabs ── */
    .tabs-wrap {
      background: rgba(0,0,0,.3); border-bottom: 1px solid rgba(255,255,255,.07);
      padding: 0 2rem; overflow-x: auto;
    }
    .tabs { display: flex; gap: .25rem; }
    .tab {
      background: transparent; border: none; border-bottom: 2px solid transparent;
      color: rgba(255,255,255,.45); cursor: pointer;
      font-size: .8rem; font-weight: 700; letter-spacing: .07em; text-transform: uppercase;
      padding: .85rem .9rem; display: flex; align-items: center; gap: .4rem;
      white-space: nowrap; transition: color .2s, border-color .2s;
    }
    .tab:hover { color: rgba(255,255,255,.7); }
    .tab.active { color: var(--color-gold); border-bottom-color: var(--color-gold); }
    .tab-badge {
      background: rgba(0,210,80,.2); color: #00d250;
      font-size: .6rem; font-weight: 800; border-radius: 10px; padding: .1rem .4rem;
    }
    .live-dot-sm {
      width: 6px; height: 6px; border-radius: 50%; background: #00d250;
      animation: blink 1s ease-in-out infinite;
    }
    .live-dot-sm.hidden { display: none; }
    @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: .2; } }

    /* ── Content ── */
    .com-content {
      flex: 1; padding: 1.75rem 2rem; max-width: 1200px; width: 100%; margin: 0 auto;
      box-sizing: border-box;
    }
    .cards-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem;
    }

    /* ── States ── */
    .spinner-wrap { display: flex; justify-content: center; padding: 4rem 0; }
    .spinner {
      width: 36px; height: 36px; border-radius: 50%;
      border: 3px solid rgba(255,255,255,.1); border-top-color: var(--color-gold);
      animation: spin .7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state { text-align: center; padding: 4rem 2rem; }
    .empty-icon { font-size: 3.5rem; margin-bottom: 1rem; }
    .empty-state p { font-size: 1.1rem; color: rgba(255,255,255,.6); margin: 0 0 .5rem; font-weight: 600; }
    .empty-state span { font-size: .82rem; color: rgba(255,255,255,.3); }

    /* ── CTA ── */
    .cta-banner {
      background: linear-gradient(90deg, rgba(240,192,64,.1) 0%, rgba(0,0,0,0) 100%);
      border-top: 1px solid rgba(240,192,64,.15);
      padding: 1.5rem 2rem;
    }
    .cta-content {
      max-width: 1200px; margin: 0 auto;
      display: flex; align-items: center; justify-content: space-between; gap: 1rem;
    }
    .cta-text { display: flex; flex-direction: column; gap: .2rem; }
    .cta-text strong { font-size: 1rem; font-weight: 800; color: var(--color-gold); }
    .cta-text span  { font-size: .8rem; color: rgba(255,255,255,.4); }
    .btn-cta {
      background: var(--color-gold); color: var(--color-dark);
      border-radius: 10px; padding: .65rem 1.5rem;
      font-size: .85rem; font-weight: 800; letter-spacing: .07em; text-transform: uppercase;
      text-decoration: none; white-space: nowrap; transition: filter .2s;
    }
    .btn-cta:hover { filter: brightness(1.1); }

    @media (max-width: 640px) {
      .hero-banner { padding: 1.75rem 1rem 1.5rem; }
      .hero-title  { font-size: 2.5rem; }
      .tabs-wrap   { padding: 0 .75rem; }
      .com-content { padding: 1rem; }
      .cards-grid  { grid-template-columns: 1fr; }
      .cta-content { flex-direction: column; align-items: flex-start; }
    }
  `],
})
export class ComunidadComponent implements OnInit, OnDestroy {
  private svc = inject(ComunidadService);

  readonly tab       = signal<Tab>('en-vivo');
  readonly loading   = signal(false);
  readonly enVivo    = signal<PartidoPublico[]>([]);
  readonly proximos  = signal<PartidoPublico[]>([]);
  readonly resultados= signal<PartidoPublico[]>([]);
  readonly boletin   = signal<BoletinData | null>(null);

  private pollInterval?: ReturnType<typeof setInterval>;
  private onVisibility = (): void => {
    if (document.visibilityState === 'visible' && this.tab() === 'en-vivo') {
      void this.cargarEnVivo();
    }
  };

  async ngOnInit(): Promise<void> {
    await this.cargarTab(this.tab());
    // Polling en vivo cada 60s
    this.pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible' && this.tab() === 'en-vivo') {
        void this.cargarEnVivo();
      }
    }, 60_000);
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  ngOnDestroy(): void {
    if (this.pollInterval) clearInterval(this.pollInterval);
    document.removeEventListener('visibilitychange', this.onVisibility);
  }

  async setTab(t: Tab): Promise<void> {
    this.tab.set(t);
    await this.cargarTab(t);
  }

  private async cargarTab(t: Tab): Promise<void> {
    this.loading.set(true);
    try {
      if (t === 'en-vivo')    await this.cargarEnVivo();
      if (t === 'proximos')   this.proximos.set(await this.svc.getPartidosProximos());
      if (t === 'resultados') this.resultados.set(await this.svc.getResultados());
      if (t === 'boletin')    this.boletin.set(await this.svc.getBoletinSemanal());
    } finally {
      this.loading.set(false);
    }
  }

  private async cargarEnVivo(): Promise<void> {
    this.enVivo.set(await this.svc.getPartidosEnVivo());
  }
}
