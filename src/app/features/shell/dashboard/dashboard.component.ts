import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { EquiposService } from '../../../core/equipos/equipos.service';
import { PartidosService } from '../../../core/partidos/partidos.service';
import { ComunidadService } from '../../../core/comunidad/comunidad.service';
import { PartidoConEquipos } from '../../../core/models/partido.model';
import { TIPO_FUTBOL_LABELS } from '../../../core/models/partido.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="dashboard">
      @if (auth.perfil(); as p) {
        <div class="welcome">
          <h1 class="font-display">Hola, <span>{{ p.nombre }}</span> 👋</h1>
          <p>Tu plataforma de futbol amateur en Chile.</p>
        </div>

        <!-- ── Stats row ── -->
        <div class="stats-row">
          <a routerLink="/app/partidos" class="stat-card stat-link">
            <div class="stat-icon">⚽</div>
            <div class="stat-info">
              <div class="stat-num font-display">{{ partidos.misPartidos().length }}</div>
              <div class="stat-lbl">Partidos</div>
            </div>
          </a>

          <a routerLink="/app/equipos" class="stat-card stat-link">
            <div class="stat-icon">🏃</div>
            <div class="stat-info">
              <div class="stat-num font-display">{{ equipos.misEquipos().length }}</div>
              <div class="stat-lbl">Equipos</div>
            </div>
          </a>

          <!-- Reputacion: solo desktop -->
          <div class="stat-card rep-card desktop-only">
            <div class="stat-icon">⭐</div>
            <div class="stat-info">
              <div class="stat-num font-display">{{ avgRep(p) }}</div>
              <div class="stat-lbl">Reputacion promedio</div>
            </div>
          </div>

          <!-- Racha: desktop + mobile -->
          <div class="stat-card racha-card" [class.racha-active]="racha() > 0">
            <div class="stat-icon racha-icon">
              @if (racha() >= 8) { 🔥 }
              @else if (racha() >= 4) { 🔥 }
              @else if (racha() > 0) { 🔥 }
              @else { ❄️ }
            </div>
            <div class="stat-info">
              <div class="stat-num font-display racha-num">
                {{ racha() }}
                @if (racha() > 0) { <span class="racha-unit">sem.</span> }
              </div>
              <div class="stat-lbl">Racha actual</div>
            </div>
          </div>
        </div>

        <!-- ── Próximos partidos ── -->
        <div class="section-block">
          <h2 class="section-label font-display">Próximos partidos</h2>
          @if (proximosPartidos().length === 0) {
            <div class="proximos-empty">
              <span class="proximos-empty-icon">📅</span>
              <span>Sin partidos programados. <a routerLink="/app/partidos/nuevo">Programa uno →</a></span>
            </div>
          } @else {
            <div class="proximos-list">
              @for (partido of proximosPartidos(); track partido.id) {
                <a [routerLink]="['/app/partidos', partido.id]" class="proximo-card">
                  <div class="proximo-fecha">
                    <span class="proximo-dia font-display">{{ partido.fecha | date:'d' }}</span>
                    <span class="proximo-mes">{{ partido.fecha | date:'MMM' }}</span>
                  </div>
                  <div class="proximo-vs">
                    <div class="proximo-equipos">
                      <span class="proximo-equipo">{{ partido.equipo_local.nombre }}</span>
                      <span class="proximo-sep">vs</span>
                      <span class="proximo-equipo">{{ partido.equipo_visitante.nombre }}</span>
                    </div>
                    <div class="proximo-meta">
                      <span class="proximo-hora">{{ partido.fecha | date:'HH:mm' }}</span>
                      <span class="proximo-tipo">{{ tipoLabel(partido) }}</span>
                      @if (partido.lugar) {
                        <span class="proximo-lugar">📍 {{ partido.lugar }}</span>
                      }
                    </div>
                  </div>
                  <div class="proximo-arrow">→</div>
                </a>
              }
            </div>
            @if (partidos.misPartidos().length > 3) {
              <a routerLink="/app/partidos" class="ver-todos">Ver todos los partidos →</a>
            }
          }
        </div>

        <!-- ── Acciones rápidas (desktop) ── -->
        <div class="quick-actions desktop-only">
          <h2 class="section-label font-display">Acciones rápidas</h2>
          <div class="actions-grid">
            <a routerLink="/app/partidos/nuevo" class="action-card">
              <span class="action-icon">⚽</span>
              <span class="action-title">Nuevo Partido</span>
              <span class="action-desc">Programa un encuentro entre equipos</span>
            </a>
            <a routerLink="/app/equipos/nuevo" class="action-card">
              <span class="action-icon">🏃</span>
              <span class="action-title">Crear Equipo</span>
              <span class="action-desc">Arma tu plantilla e invita jugadores</span>
            </a>
            <a routerLink="/app/perfil" class="action-card">
              <span class="action-icon">⭐</span>
              <span class="action-title">Mi Perfil</span>
              <span class="action-desc">Actualiza tus datos y foto</span>
            </a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard { max-width: 900px; }
    .welcome { margin-bottom: 2rem; }
    .welcome h1 { font-size: 2.8rem; color: #fff; }
    .welcome h1 span { color: var(--color-gold); }
    .welcome p { color: var(--color-light); margin-top: .25rem; }

    /* ── Stats row ── */
    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
    @media (max-width: 900px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 600px)  { .stats-row { grid-template-columns: repeat(2, 1fr); } }

    .stat-card {
      background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
      border-radius: 12px; padding: 1.25rem 1.5rem;
      display: flex; align-items: center; gap: 1rem;
    }
    .rep-card  { border-color: rgba(240,192,64,.2); background: rgba(240,192,64,.04); }
    .racha-card { border-color: rgba(255,140,0,.15); background: rgba(255,140,0,.03); }
    .racha-card.racha-active { border-color: rgba(255,140,0,.35); background: rgba(255,140,0,.07); }

    .stat-icon { font-size: 2rem; }
    .racha-icon { filter: none; }
    .stat-num  { font-size: 2rem; color: var(--color-gold); line-height: 1; }
    .racha-num { color: #ff8c00; display: flex; align-items: baseline; gap: .25rem; }
    .racha-unit { font-family: 'Bebas Neue', sans-serif; font-size: .9rem; color: rgba(255,140,0,.6); }
    .stat-lbl  { font-size: .72rem; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; color: var(--color-light); margin-top: .2rem; }

    .stat-link { text-decoration: none; transition: border-color .2s; }
    .stat-link:hover { border-color: rgba(240,192,64,.3); }

    /* ── Próximos ── */
    .section-block { margin-bottom: 2rem; }
    .section-label { font-size: 1.2rem; color: #fff; margin: 0 0 1rem; }

    .proximos-empty {
      display: flex; align-items: center; gap: .75rem;
      background: rgba(255,255,255,.02); border: 1px dashed rgba(255,255,255,.1);
      border-radius: 12px; padding: 1.25rem 1.5rem;
      font-size: .85rem; color: rgba(255,255,255,.4);
    }
    .proximos-empty-icon { font-size: 1.5rem; }
    .proximos-empty a { color: var(--color-gold); text-decoration: none; }
    .proximos-empty a:hover { text-decoration: underline; }

    .proximos-list { display: flex; flex-direction: column; gap: .6rem; }
    .proximo-card {
      display: flex; align-items: center; gap: 1rem;
      background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
      border-radius: 12px; padding: 1rem 1.25rem;
      text-decoration: none; transition: border-color .2s, background .2s;
    }
    .proximo-card:hover { border-color: rgba(240,192,64,.3); background: rgba(240,192,64,.04); }

    .proximo-fecha {
      display: flex; flex-direction: column; align-items: center;
      min-width: 44px; border-right: 1px solid rgba(255,255,255,.08); padding-right: 1rem;
    }
    .proximo-dia  { font-size: 1.8rem; color: var(--color-gold); line-height: 1; }
    .proximo-mes  { font-size: .65rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: rgba(255,255,255,.4); margin-top: .1rem; }

    .proximo-vs   { flex: 1; min-width: 0; }
    .proximo-equipos {
      display: flex; align-items: center; gap: .5rem;
      font-weight: 700; font-size: .9rem; color: #e0e0e0; flex-wrap: wrap;
    }
    .proximo-sep  { font-size: .7rem; color: rgba(255,255,255,.3); text-transform: uppercase; letter-spacing: .08em; }
    .proximo-meta {
      display: flex; align-items: center; gap: .6rem; margin-top: .3rem; flex-wrap: wrap;
    }
    .proximo-hora  { font-family: 'Bebas Neue', sans-serif; font-size: .9rem; color: var(--color-gold); }
    .proximo-tipo  { font-size: .65rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em;
                     color: var(--color-gold); background: rgba(240,192,64,.1); border-radius: 4px; padding: .1rem .4rem; }
    .proximo-lugar { font-size: .7rem; color: rgba(255,255,255,.35); }
    .proximo-arrow { color: rgba(255,255,255,.2); font-size: 1.1rem; flex-shrink: 0; }

    .ver-todos {
      display: inline-block; margin-top: .75rem;
      font-size: .78rem; font-weight: 700; color: var(--color-gold);
      text-decoration: none; opacity: .8;
    }
    .ver-todos:hover { opacity: 1; }

    /* ── Responsive helpers ── */
    .desktop-only { display: flex; }
    @media (max-width: 600px) { .desktop-only { display: none !important; } }

    /* ── Acciones rápidas ── */
    .quick-actions { margin-top: .5rem; display: block !important; }
    .actions-grid  { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    @media (max-width: 600px) { .actions-grid { grid-template-columns: 1fr; } }
    .action-card {
      display: flex; flex-direction: column; gap: .35rem;
      background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
      border-radius: 12px; padding: 1.25rem; text-decoration: none;
      transition: border-color .2s, background .2s;
    }
    .action-card:hover { border-color: rgba(240,192,64,.3); background: rgba(240,192,64,.04); }
    .action-icon  { font-size: 1.8rem; }
    .action-title { font-family: 'Bebas Neue', sans-serif; font-size: 1.1rem; color: var(--color-gold); }
    .action-desc  { font-size: .75rem; color: var(--color-light); }
  `],
})
export class DashboardComponent implements OnInit {
  readonly auth     = inject(AuthService);
  readonly equipos  = inject(EquiposService);
  readonly partidos = inject(PartidosService);
  private  svc      = inject(ComunidadService);

  readonly racha = signal<number>(0);

  readonly proximosPartidos = computed<PartidoConEquipos[]>(() => {
    const ahora = Date.now();
    return this.partidos.misPartidos()
      .filter(p => p.estado === 'programado' && new Date(p.fecha).getTime() > ahora)
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      .slice(0, 3);
  });

  async ngOnInit(): Promise<void> {
    const uid = this.auth.userId();
    await Promise.all([
      this.equipos.cargarMisEquipos(),
      this.partidos.cargarMisPartidos(),
      uid ? this.svc.getRacha(uid).then(r => this.racha.set(r)) : Promise.resolve(),
    ]);
  }

  avgRep(p: { rep_asistencia: number; rep_puntualidad: number; rep_compromiso: number }): number {
    return Math.round((p.rep_asistencia + p.rep_puntualidad + p.rep_compromiso) / 3);
  }

  tipoLabel(p: PartidoConEquipos): string {
    return TIPO_FUTBOL_LABELS[p.tipo_futbol] ?? p.tipo_futbol;
  }
}
