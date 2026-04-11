import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { EquiposService } from '../../../core/equipos/equipos.service';
import { PartidosService } from '../../../core/partidos/partidos.service';
import { Equipo } from '../../../core/models/equipo.model';
import { TipoFutbol, TIPO_FUTBOL_MAX } from '../../../core/models/partido.model';

@Component({
  selector: 'app-partido-nuevo',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="nuevo-page">
      <a routerLink="/app/partidos" class="back-link">← Volver</a>
      <h1 class="font-display">Nuevo Partido</h1>
      <p class="subtitle">Programa un encuentro entre dos equipos</p>

      @if (!equiposPropios().length) {
        <div class="alert-info">
          Debes ser capitán de al menos un equipo para crear un partido.
          <a routerLink="/app/equipos/nuevo">Crear equipo</a>
        </div>
      } @else {
        <form class="form-card" (ngSubmit)="submit()">

          <!-- Equipo local -->
          <div class="field">
            <label>Equipo local <span class="req">*</span></label>
            <select [(ngModel)]="equipo_local_id" name="equipo_local_id" required>
              <option value="">Selecciona tu equipo</option>
              @for (e of equiposPropios(); track e.id) {
                <option [value]="e.id">{{ e.nombre }}</option>
              }
            </select>
            <span class="hint">Solo se muestran equipos donde eres capitán</span>
          </div>

          <!-- Equipo visitante -->
          <div class="field">
            <label>Equipo visitante <span class="req">*</span></label>
            <select [(ngModel)]="equipo_visitante_id" name="equipo_visitante_id" required>
              <option value="">Selecciona el rival</option>
              @for (e of equiposVisitante(); track e.id) {
                <option [value]="e.id">{{ e.nombre }}</option>
              }
            </select>
          </div>

          <!-- Tipo de fútbol -->
          <div class="field">
            <label>Modalidad <span class="req">*</span></label>
            <select [(ngModel)]="tipo_futbol" name="tipo_futbol" (ngModelChange)="onTipoChange($event)">
              <option value="futbol5">Fútbol 5</option>
              <option value="futbol7">Fútbol 7</option>
              <option value="futbol8">Fútbol 8</option>
              <option value="futbol11">Fútbol 11</option>
            </select>
          </div>

          <!-- Max jugadores -->
          <div class="field">
            <label>Máximo de jugadores por equipo <span class="req">*</span></label>
            <input
              type="number"
              [(ngModel)]="max_jugadores_equipo"
              name="max_jugadores_equipo"
              [min]="1"
              [max]="25"
              required />
          </div>

          <!-- Fecha y hora -->
          <div class="field">
            <label>Fecha y hora <span class="req">*</span></label>
            <input
              type="datetime-local"
              [(ngModel)]="fecha"
              name="fecha"
              [min]="minFecha"
              required />
          </div>

          <!-- Lugar -->
          <div class="field">
            <label>Lugar / Cancha <span class="opt">(opcional)</span></label>
            <input
              type="text"
              [(ngModel)]="lugar"
              name="lugar"
              placeholder="Ej: Cancha Los Leones, La Florida" />
          </div>

          @if (error) {
            <div class="alert-error">{{ error }}</div>
          }

          <div class="form-actions">
            <a routerLink="/app/partidos" class="btn-secondary">Cancelar</a>
            <button type="submit" class="btn-primary" [disabled]="saving">
              {{ saving ? 'Creando...' : 'Crear Partido' }}
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    .nuevo-page { max-width: 560px; }

    .back-link {
      display: inline-block; font-size: .8rem; font-weight: 600;
      text-transform: uppercase; letter-spacing: .08em;
      color: var(--color-light); text-decoration: none; margin-bottom: 1.25rem;
      transition: color .2s;
    }
    .back-link:hover { color: var(--color-gold); }

    h1 { font-size: 2.4rem; color: #fff; margin-bottom: .25rem; }
    .subtitle { color: var(--color-light); margin-bottom: 2rem; }

    .form-card {
      background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
      border-radius: 16px; padding: 2rem; display: flex; flex-direction: column; gap: 1.25rem;
    }

    .field { display: flex; flex-direction: column; gap: .4rem; }
    .field label {
      font-size: .75rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: .09em; color: var(--color-light);
    }
    .req { color: var(--color-gold); }
    .opt { color: rgba(255,255,255,.3); font-weight: 400; text-transform: none; letter-spacing: 0; }
    .hint { font-size: .7rem; color: rgba(255,255,255,.3); margin-top: .1rem; }

    input, select {
      background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12);
      border-radius: 8px; padding: .65rem .9rem;
      color: #fff; font-size: .9rem; outline: none;
      transition: border-color .2s;
      color-scheme: dark;
    }
    input:focus, select:focus { border-color: var(--color-gold); }
    select option { background: #1a1f2e; }

    .alert-info {
      background: rgba(64,196,240,.08); border: 1px solid rgba(64,196,240,.2);
      color: #40c4f0; border-radius: 10px; padding: 1.25rem 1.5rem;
      font-size: .9rem;
    }
    .alert-info a {
      color: var(--color-gold); font-weight: 700; text-decoration: underline;
      margin-left: .5rem;
    }
    .alert-error {
      background: rgba(255,107,107,.08); border: 1px solid rgba(255,107,107,.2);
      color: #ff6b6b; border-radius: 8px; padding: .75rem 1rem; font-size: .85rem;
    }

    .form-actions { display: flex; gap: .75rem; justify-content: flex-end; margin-top: .5rem; }
    .btn-primary {
      background: var(--color-gold); color: #000; font-weight: 700;
      border: none; border-radius: 8px; padding: .65rem 1.5rem;
      cursor: pointer; font-size: .85rem; letter-spacing: .06em; text-transform: uppercase;
      transition: opacity .2s;
    }
    .btn-primary:hover:not(:disabled) { opacity: .85; }
    .btn-primary:disabled { opacity: .45; cursor: not-allowed; }
    .btn-secondary {
      background: rgba(255,255,255,.06); color: var(--color-light);
      border: 1px solid rgba(255,255,255,.12); border-radius: 8px;
      padding: .65rem 1.2rem; font-size: .85rem; font-weight: 600;
      letter-spacing: .06em; text-transform: uppercase; text-decoration: none;
      cursor: pointer; transition: background .2s;
    }
    .btn-secondary:hover { background: rgba(255,255,255,.1); }
  `],
})
export class PartidoNuevoComponent implements OnInit {
  private router         = inject(Router);
  private auth           = inject(AuthService);
  private equiposService = inject(EquiposService);
  private partidosService = inject(PartidosService);

  readonly todosEquipos = signal<Equipo[]>([]);

  readonly equiposPropios = computed(() =>
    this.equiposService.misEquipos().filter(e => e.capitan_id === this.auth.userId()),
  );

  readonly equiposVisitante = computed(() =>
    this.todosEquipos().filter(e => e.id !== this.equipo_local_id),
  );

  // Estado del formulario
  equipo_local_id      = '';
  equipo_visitante_id  = '';
  tipo_futbol: TipoFutbol = 'futbol7';
  max_jugadores_equipo = 7;
  fecha                = '';
  lugar                = '';
  saving               = false;
  error                = '';

  get minFecha(): string {
    return new Date().toISOString().slice(0, 16);
  }

  async ngOnInit(): Promise<void> {
    await this.equiposService.cargarMisEquipos();
    this.todosEquipos.set(await this.equiposService.getAllEquipos());
  }

  onTipoChange(tipo: TipoFutbol): void {
    this.max_jugadores_equipo = TIPO_FUTBOL_MAX[tipo];
  }

  async submit(): Promise<void> {
    this.error = '';

    if (!this.equipo_local_id || !this.equipo_visitante_id || !this.fecha) {
      this.error = 'Completa todos los campos obligatorios.';
      return;
    }
    if (this.equipo_local_id === this.equipo_visitante_id) {
      this.error = 'El equipo local y visitante deben ser distintos.';
      return;
    }

    this.saving = true;
    const result = await this.partidosService.crearPartido({
      equipo_local_id:      this.equipo_local_id,
      equipo_visitante_id:  this.equipo_visitante_id,
      tipo_futbol:          this.tipo_futbol,
      max_jugadores_equipo: this.max_jugadores_equipo,
      fecha:                new Date(this.fecha).toISOString(),
      lugar:                this.lugar || undefined,
    });

    if (result) {
      this.router.navigate(['/app/partidos', result.id]);
    } else {
      this.error  = 'Error al crear el partido. Intenta nuevamente.';
      this.saving = false;
    }
  }
}
