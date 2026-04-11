import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EquiposService } from '../../../core/equipos/equipos.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Equipo, EquipoMiembro } from '../../../core/models/equipo.model';

@Component({
  selector: 'app-equipos-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <h1 class="font-display page-title">Mis Equipos</h1>
        <a routerLink="/app/equipos/nuevo" class="btn-new font-display">+ Crear equipo</a>
      </div>

      <!-- Invitaciones pendientes -->
      @if (invitaciones().length) {
        <section class="invitaciones">
          <h2 class="section-title">Invitaciones pendientes</h2>
          <div class="inv-list">
            @for (inv of invitaciones(); track inv.miembro.id) {
              <div class="inv-card">
                <div class="inv-info">
                  <div class="equipo-escudo small">
                    @if (inv.equipo.escudo_url) {
                      <img [src]="inv.equipo.escudo_url" [alt]="inv.equipo.nombre" />
                    } @else {
                      <span class="font-display">{{ inv.equipo.nombre.charAt(0) }}</span>
                    }
                  </div>
                  <div>
                    <div class="inv-nombre">{{ inv.equipo.nombre }}</div>
                    <div class="inv-sub">Te han invitado a unirte</div>
                  </div>
                </div>
                <div class="inv-actions">
                  <button class="btn-aceptar" (click)="responder(inv.equipo.id, true)" [disabled]="responding()">Aceptar</button>
                  <button class="btn-rechazar" (click)="responder(inv.equipo.id, false)" [disabled]="responding()">Rechazar</button>
                </div>
              </div>
            }
          </div>
        </section>
      }

      <!-- Lista equipos -->
      @if (svc.loadingLista()) {
        <div class="loading">Cargando equipos...</div>
      } @else if (svc.misEquipos().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">🏆</div>
          <h2 class="font-display">Sin equipos todavia</h2>
          <p>Crea tu primer equipo o espera que alguien te invite.</p>
          <a routerLink="/app/equipos/nuevo" class="btn-new-lg font-display">+ Crear equipo</a>
        </div>
      } @else {
        <div class="equipos-grid">
          @for (eq of svc.misEquipos(); track eq.id) {
            <a [routerLink]="['/app/equipos', eq.id]" class="equipo-card">
              <div class="equipo-escudo">
                @if (eq.escudo_url) {
                  <img [src]="eq.escudo_url" [alt]="eq.nombre" />
                } @else {
                  <span class="font-display">{{ eq.nombre.charAt(0) }}</span>
                }
              </div>
              <div class="equipo-info">
                <div class="equipo-nombre font-display">{{ eq.nombre }}</div>
                @if (eq.capitan_id === userId()) {
                  <span class="badge-capitan">Capitan</span>
                }
              </div>
              <svg class="arrow" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </a>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 860px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
    .page-title { font-size: 2.4rem; color: var(--color-gold); }
    .btn-new {
      background: linear-gradient(135deg, var(--color-gold), var(--color-gold2));
      color: var(--color-dark); padding: .6rem 1.4rem; border-radius: 8px;
      font-size: 1rem; letter-spacing: .08em; text-decoration: none;
      transition: filter .2s; white-space: nowrap;
    }
    .btn-new:hover { filter: brightness(1.1); }
    .section-title { font-size: .75rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--color-light); margin-bottom: .75rem; }
    .inv-list { display: flex; flex-direction: column; gap: .75rem; margin-bottom: 2rem; }
    .inv-card {
      display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;
      background: rgba(240,192,64,.06); border: 1px solid rgba(240,192,64,.2);
      border-radius: 12px; padding: 1rem 1.25rem;
    }
    .inv-info { display: flex; align-items: center; gap: 1rem; }
    .inv-nombre { font-weight: 700; color: #fff; }
    .inv-sub { font-size: .78rem; color: var(--color-light); margin-top: .15rem; }
    .inv-actions { display: flex; gap: .6rem; }
    .btn-aceptar, .btn-rechazar {
      padding: .45rem 1rem; border-radius: 6px; border: none;
      font-size: .82rem; font-weight: 700; cursor: pointer; transition: filter .2s;
    }
    .btn-aceptar { background: var(--color-green); color: var(--color-dark); }
    .btn-rechazar { background: rgba(255,107,107,.15); color: #ff6b6b; border: 1px solid rgba(255,107,107,.3); }
    .btn-aceptar:hover { filter: brightness(1.1); }
    .btn-rechazar:hover { background: rgba(255,107,107,.25); }
    .btn-aceptar:disabled, .btn-rechazar:disabled { opacity: .5; cursor: not-allowed; }
    .loading { color: var(--color-light); padding: 2rem 0; }
    .empty-state {
      background: rgba(255,255,255,.02); border: 1px dashed rgba(255,255,255,.1);
      border-radius: 16px; padding: 3.5rem 2rem; text-align: center;
    }
    .empty-icon { font-size: 3.5rem; margin-bottom: 1rem; }
    .empty-state h2 { font-size: 1.8rem; color: var(--color-gold); margin-bottom: .5rem; }
    .empty-state p { color: var(--color-light); margin-bottom: 1.5rem; }
    .btn-new-lg {
      display: inline-block; background: linear-gradient(135deg, var(--color-gold), var(--color-gold2));
      color: var(--color-dark); padding: .8rem 2rem; border-radius: 8px;
      font-size: 1.1rem; letter-spacing: .08em; text-decoration: none;
    }
    .equipos-grid { display: flex; flex-direction: column; gap: .75rem; }
    .equipo-card {
      display: flex; align-items: center; gap: 1rem;
      background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
      border-radius: 12px; padding: 1rem 1.25rem;
      text-decoration: none; transition: border-color .2s, background .2s;
    }
    .equipo-card:hover { border-color: rgba(240,192,64,.3); background: rgba(240,192,64,.04); }
    .equipo-escudo {
      width: 52px; height: 52px; border-radius: 10px;
      background: rgba(240,192,64,.1); border: 1px solid rgba(240,192,64,.25);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      overflow: hidden;
    }
    .equipo-escudo.small { width: 38px; height: 38px; border-radius: 7px; }
    .equipo-escudo img { width: 100%; height: 100%; object-fit: cover; }
    .equipo-escudo span { font-size: 1.4rem; color: var(--color-gold); }
    .equipo-escudo.small span { font-size: 1rem; }
    .equipo-info { flex: 1; }
    .equipo-nombre { font-size: 1.1rem; color: #fff; }
    .badge-capitan {
      display: inline-block; margin-top: .25rem;
      background: rgba(240,192,64,.12); border: 1px solid rgba(240,192,64,.3);
      color: var(--color-gold); font-size: .65rem; font-weight: 800;
      letter-spacing: .08em; text-transform: uppercase; padding: .15rem .5rem; border-radius: 4px;
    }
    .arrow { color: rgba(255,255,255,.25); flex-shrink: 0; }
  `],
})
export class EquiposListComponent implements OnInit {
  readonly svc = inject(EquiposService);
  readonly auth = inject(AuthService);
  readonly userId = this.auth.userId;
  readonly invitaciones = signal<Array<{ equipo: { id: string; nombre: string; escudo_url: string | null; capitan_id: string; created_at: string }; miembro: EquipoMiembro }>>([]);
  readonly responding = signal(false);

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.svc.cargarMisEquipos(),
      this.cargarInvitaciones(),
    ]);
  }

  private async cargarInvitaciones(): Promise<void> {
    const data = await this.svc.getInvitacionesPendientes();
    this.invitaciones.set(data);
  }

  async responder(equipo_id: string, aceptar: boolean): Promise<void> {
    this.responding.set(true);
    await this.svc.responderInvitacion(equipo_id, aceptar);
    await Promise.all([this.svc.cargarMisEquipos(), this.cargarInvitaciones()]);
    this.responding.set(false);
  }
}
