import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { EquiposService } from '../../../core/equipos/equipos.service';
import { PartidosService } from '../../../core/partidos/partidos.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="dashboard">
      @if (auth.perfil(); as p) {
        <div class="welcome">
          <h1 class="font-display">Hola, <span>{{ p.nombre }}</span> 👋</h1>
          <p>Tu plataforma de futbol amateur en Chile.</p>
        </div>

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
          <div class="stat-card rep-card desktop-only">
            <div class="stat-icon">⭐</div>
            <div class="stat-info">
              <div class="stat-num font-display">{{ avgRep(p) }}</div>
              <div class="stat-lbl">Reputacion promedio</div>
            </div>
          </div>
          <a routerLink="/app/perfil" class="stat-card stat-link perfil-card mobile-only">
            <div class="stat-icon">👤</div>
            <div class="stat-info">
              <div class="stat-lbl perfil-lbl">Mi Perfil</div>
              <div class="perfil-name">{{ p.nombre }}</div>
            </div>
          </a>
        </div>

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
    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
    @media (max-width: 600px) { .stats-row { grid-template-columns: 1fr; } }
    .stat-card {
      background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
      border-radius: 12px; padding: 1.25rem 1.5rem;
      display: flex; align-items: center; gap: 1rem;
    }
    .rep-card { border-color: rgba(240,192,64,.2); background: rgba(240,192,64,.04); }
    .stat-icon { font-size: 2rem; }
    .stat-num { font-size: 2rem; color: var(--color-gold); line-height: 1; }
    .stat-lbl { font-size: .72rem; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; color: var(--color-light); margin-top: .2rem; }
    .empty-state {
      background: rgba(255,255,255,.02); border: 1px dashed rgba(255,255,255,.1);
      border-radius: 16px; padding: 3.5rem 2rem; text-align: center;
    }
    .empty-icon { font-size: 4rem; margin-bottom: 1rem; }
    .empty-state h2 { font-size: 1.8rem; color: var(--color-gold); margin-bottom: .75rem; }
    .empty-state p { color: var(--color-light); font-size: .95rem; }
    .stat-link { text-decoration: none; transition: border-color .2s; }
    .stat-link:hover { border-color: rgba(240,192,64,.3); }
    .perfil-card { border-color: rgba(240,192,64,.15); }
    .perfil-lbl { font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--color-light); }
    .perfil-name { font-family: 'Bebas Neue', sans-serif; font-size: 1.4rem; color: var(--color-gold); line-height: 1.1; margin-top: .2rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .desktop-only { display: flex; }
    .mobile-only  { display: none; }
    @media (max-width: 600px) {
      .desktop-only { display: none !important; }
      .mobile-only  { display: flex !important; }
    }
    .section-label { font-size: 1.2rem; color: #fff; margin-bottom: 1rem; }
    .quick-actions { margin-top: .5rem; display: block !important; }
    .actions-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    @media (max-width: 600px) { .actions-grid { grid-template-columns: 1fr; } }
    .action-card {
      display: flex; flex-direction: column; gap: .35rem;
      background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
      border-radius: 12px; padding: 1.25rem; text-decoration: none;
      transition: border-color .2s, background .2s;
    }
    .action-card:hover { border-color: rgba(240,192,64,.3); background: rgba(240,192,64,.04); }
    .action-icon { font-size: 1.8rem; }
    .action-title { font-family: 'Bebas Neue', sans-serif; font-size: 1.1rem; color: var(--color-gold); }
    .action-desc  { font-size: .75rem; color: var(--color-light); }
  `],
})
export class DashboardComponent implements OnInit {
  readonly auth     = inject(AuthService);
  readonly equipos  = inject(EquiposService);
  readonly partidos = inject(PartidosService);

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.equipos.cargarMisEquipos(),
      this.partidos.cargarMisPartidos(),
    ]);
  }

  avgRep(p: { rep_asistencia: number; rep_puntualidad: number; rep_compromiso: number }): number {
    return Math.round((p.rep_asistencia + p.rep_puntualidad + p.rep_compromiso) / 3);
  }
}
