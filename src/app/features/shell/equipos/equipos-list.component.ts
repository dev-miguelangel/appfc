import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EquiposService } from '../../../core/equipos/equipos.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Equipo, EquipoBusquedaResult, EquipoMiembro } from '../../../core/models/equipo.model';

@Component({
  selector: 'app-equipos-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
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

      <!-- ── Buscar y postular a un equipo ── -->
      <section class="buscar-section">
        <h2 class="section-title">Buscar equipo</h2>
        <div class="buscar-input-wrap">
          <svg class="buscar-icon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            class="buscar-input"
            placeholder="Nombre o código del equipo (ej: fcab3k9)..."
            [(ngModel)]="searchQuery"
            (input)="onSearchInput()"
          />
          @if (searchQuery) {
            <button class="buscar-clear" (click)="limpiarBusqueda()">✕</button>
          }
        </div>

        @if (buscando()) {
          <div class="buscar-loading">
            <div class="spinner-sm"></div> Buscando...
          </div>
        } @else if (hasBuscado() && !resultados().length) {
          <div class="buscar-empty">No se encontraron equipos para "{{ searchQuery }}".</div>
        } @else if (resultados().length) {
          <div class="resultados-header">
            <span class="resultados-info">
              {{ totalResultados() }} resultado{{ totalResultados() !== 1 ? 's' : '' }} · página {{ paginaActual() + 1 }} de {{ totalPaginas() }}
            </span>
          </div>

          <div class="resultados-list">
            @for (r of resultados(); track r.equipo.id) {
              <div class="resultado-card">
                <div class="resultado-escudo">
                  @if (r.equipo.escudo_url) {
                    <img [src]="r.equipo.escudo_url" [alt]="r.equipo.nombre" />
                  } @else {
                    <span class="font-display">{{ r.equipo.nombre.charAt(0) }}</span>
                  }
                </div>
                <div class="resultado-info">
                  <div class="resultado-nombre">{{ r.equipo.nombre }}</div>
                  <div class="resultado-meta">
                    @if (r.equipo.codigo) {
                      <span class="resultado-codigo">{{ r.equipo.codigo }}</span>
                    }
                    <span class="resultado-miembros">{{ r.miembrosActivos }} jugador{{ r.miembrosActivos !== 1 ? 'es' : '' }}</span>
                  </div>
                </div>
                <div class="resultado-accion">
                  @if (r.miEstado === 'activo') {
                    <span class="badge-miembro">Ya eres miembro</span>
                  } @else if (r.miEstado === 'pendiente') {
                    <span class="badge-pendiente">Solicitud enviada</span>
                  } @else if (r.equipo.capitan_id === userId()) {
                    <span class="badge-capitan">Tu equipo</span>
                  } @else {
                    <button
                      class="btn-postular"
                      [disabled]="postulando() === r.equipo.id"
                      (click)="postular(r)"
                    >
                      @if (postulando() === r.equipo.id) {
                        Enviando...
                      } @else {
                        Postular
                      }
                    </button>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Paginación -->
          @if (totalPaginas() > 1) {
            <div class="paginacion">
              <button class="pag-btn" [disabled]="paginaActual() === 0" (click)="irPagina(paginaActual() - 1)">
                ← Anterior
              </button>
              @for (p of paginas(); track p) {
                <button class="pag-num" [class.active]="p === paginaActual()" (click)="irPagina(p)">{{ p + 1 }}</button>
              }
              <button class="pag-btn" [disabled]="paginaActual() >= totalPaginas() - 1" (click)="irPagina(paginaActual() + 1)">
                Siguiente →
              </button>
            </div>
          }
        }

        @if (postulaMensaje()) {
          <div class="postula-toast" [class.postula-error]="postulaEsError()">
            {{ postulaMensaje() }}
          </div>
        }
      </section>
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

    /* ── Buscar equipo ── */
    .buscar-section { margin-top: 2.5rem; }
    .buscar-input-wrap {
      position: relative; display: flex; align-items: center;
      background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1);
      border-radius: 10px; overflow: hidden;
      transition: border-color .2s;
    }
    .buscar-input-wrap:focus-within { border-color: rgba(240,192,64,.4); }
    .buscar-icon { position: absolute; left: .85rem; color: rgba(255,255,255,.3); pointer-events: none; flex-shrink: 0; }
    .buscar-input {
      flex: 1; background: transparent; border: none; outline: none;
      color: #fff; font-size: .88rem; padding: .75rem .85rem .75rem 2.5rem;
    }
    .buscar-input::placeholder { color: rgba(255,255,255,.3); }
    .buscar-clear {
      background: transparent; border: none; color: rgba(255,255,255,.3);
      cursor: pointer; padding: .4rem .75rem; font-size: .85rem;
      transition: color .2s;
    }
    .buscar-clear:hover { color: #fff; }

    .buscar-loading {
      display: flex; align-items: center; gap: .6rem;
      color: rgba(255,255,255,.4); font-size: .82rem; padding: 1rem 0;
    }
    .spinner-sm {
      width: 16px; height: 16px; border-radius: 50%;
      border: 2px solid rgba(255,255,255,.15); border-top-color: var(--color-gold);
      animation: spin .6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .buscar-empty { color: rgba(255,255,255,.35); font-size: .85rem; padding: 1rem 0; }

    .resultados-header { margin: .75rem 0 .5rem; }
    .resultados-info { font-size: .72rem; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; color: rgba(255,255,255,.35); }

    .resultados-list { display: flex; flex-direction: column; gap: .5rem; }
    .resultado-card {
      display: flex; align-items: center; gap: 1rem;
      background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
      border-radius: 12px; padding: .85rem 1.1rem;
    }
    .resultado-escudo {
      width: 44px; height: 44px; border-radius: 8px; flex-shrink: 0;
      background: rgba(240,192,64,.1); border: 1px solid rgba(240,192,64,.2);
      display: flex; align-items: center; justify-content: center; overflow: hidden;
    }
    .resultado-escudo img  { width: 100%; height: 100%; object-fit: cover; }
    .resultado-escudo span { font-size: 1.2rem; color: var(--color-gold); }
    .resultado-info  { flex: 1; min-width: 0; }
    .resultado-nombre { font-weight: 700; color: #e0e0e0; font-size: .92rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .resultado-meta  { display: flex; align-items: center; gap: .5rem; margin-top: .2rem; flex-wrap: wrap; }
    .resultado-codigo {
      font-family: 'Courier New', monospace; font-size: .68rem; font-weight: 700;
      color: rgba(255,255,255,.4); background: rgba(255,255,255,.06);
      border: 1px solid rgba(255,255,255,.1); padding: .1rem .4rem; border-radius: 4px; letter-spacing: .1em;
    }
    .resultado-miembros { font-size: .72rem; color: rgba(255,255,255,.35); }

    .resultado-accion { flex-shrink: 0; }
    .btn-postular {
      background: linear-gradient(135deg, var(--color-gold), var(--color-gold2));
      color: var(--color-dark); border: none;
      padding: .45rem 1.1rem; border-radius: 7px;
      font-size: .8rem; font-weight: 800; letter-spacing: .04em;
      cursor: pointer; white-space: nowrap; transition: filter .2s;
    }
    .btn-postular:hover:not(:disabled) { filter: brightness(1.1); }
    .btn-postular:disabled { opacity: .6; cursor: not-allowed; }
    .badge-miembro  { font-size: .72rem; font-weight: 700; color: #00d068; background: rgba(0,208,104,.1); border: 1px solid rgba(0,208,104,.25); padding: .2rem .6rem; border-radius: 5px; white-space: nowrap; }
    .badge-pendiente{ font-size: .72rem; font-weight: 700; color: var(--color-gold); background: rgba(240,192,64,.1); border: 1px solid rgba(240,192,64,.25); padding: .2rem .6rem; border-radius: 5px; white-space: nowrap; }

    /* Paginación */
    .paginacion { display: flex; align-items: center; gap: .4rem; margin-top: 1rem; flex-wrap: wrap; }
    .pag-btn {
      background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1);
      color: rgba(255,255,255,.6); padding: .4rem .85rem; border-radius: 7px;
      font-size: .78rem; font-weight: 700; cursor: pointer; transition: background .2s, color .2s;
    }
    .pag-btn:hover:not(:disabled) { background: rgba(255,255,255,.1); color: #fff; }
    .pag-btn:disabled { opacity: .35; cursor: not-allowed; }
    .pag-num {
      background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
      color: rgba(255,255,255,.5); width: 32px; height: 32px; border-radius: 7px;
      font-size: .8rem; font-weight: 700; cursor: pointer; transition: background .2s, color .2s;
    }
    .pag-num.active  { background: var(--color-gold); color: var(--color-dark); border-color: var(--color-gold); }
    .pag-num:hover:not(.active) { background: rgba(255,255,255,.1); color: #fff; }

    /* Toast postulación */
    .postula-toast {
      margin-top: .85rem; padding: .6rem 1rem; border-radius: 8px;
      font-size: .8rem; font-weight: 700;
      background: rgba(0,208,104,.12); border: 1px solid rgba(0,208,104,.3); color: #00d068;
    }
    .postula-toast.postula-error {
      background: rgba(255,80,80,.1); border-color: rgba(255,80,80,.3); color: #ff6b6b;
    }
  `],
})
export class EquiposListComponent implements OnInit {
  readonly svc    = inject(EquiposService);
  readonly auth   = inject(AuthService);
  readonly userId = this.auth.userId;

  readonly invitaciones = signal<Array<{ equipo: Equipo; miembro: EquipoMiembro }>>([]);
  readonly responding   = signal(false);

  // ── Búsqueda ──
  searchQuery   = '';
  private timer?: ReturnType<typeof setTimeout>;

  readonly buscando        = signal(false);
  readonly hasBuscado      = signal(false);
  readonly resultados      = signal<EquipoBusquedaResult[]>([]);
  readonly totalResultados = signal(0);
  readonly paginaActual    = signal(0);
  readonly postulando      = signal<string | null>(null);
  readonly postulaMensaje  = signal('');
  readonly postulaEsError  = signal(false);

  readonly totalPaginas = () => Math.ceil(this.totalResultados() / this.svc.PAGE_SIZE);
  readonly paginas      = () => Array.from({ length: this.totalPaginas() }, (_, i) => i);

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

  onSearchInput(): void {
    clearTimeout(this.timer);
    if (this.searchQuery.trim().length < 2) {
      this.resultados.set([]);
      this.hasBuscado.set(false);
      return;
    }
    this.timer = setTimeout(() => void this.buscar(0), 350);
  }

  async buscar(pagina: number): Promise<void> {
    this.buscando.set(true);
    this.paginaActual.set(pagina);
    const { resultados, total } = await this.svc.buscarEquipos(this.searchQuery.trim(), pagina);
    this.resultados.set(resultados);
    this.totalResultados.set(total);
    this.hasBuscado.set(true);
    this.buscando.set(false);
  }

  async irPagina(p: number): Promise<void> {
    await this.buscar(p);
    // scroll suave a la sección
    document.querySelector('.buscar-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  limpiarBusqueda(): void {
    this.searchQuery = '';
    this.resultados.set([]);
    this.hasBuscado.set(false);
    this.totalResultados.set(0);
    this.paginaActual.set(0);
  }

  async postular(r: EquipoBusquedaResult): Promise<void> {
    this.postulando.set(r.equipo.id);
    this.postulaMensaje.set('');

    const error = await this.svc.postularAEquipo(r.equipo.id);

    if (error) {
      this.postulaEsError.set(true);
      this.postulaMensaje.set(error);
    } else {
      this.postulaEsError.set(false);
      this.postulaMensaje.set(`Postulación enviada a "${r.equipo.nombre}". El capitán será notificado.`);
      // Actualizar estado en la lista
      this.resultados.update(list =>
        list.map(item =>
          item.equipo.id === r.equipo.id ? { ...item, miEstado: 'pendiente' } : item
        )
      );
    }

    this.postulando.set(null);
    setTimeout(() => this.postulaMensaje.set(''), 4000);
  }
}
