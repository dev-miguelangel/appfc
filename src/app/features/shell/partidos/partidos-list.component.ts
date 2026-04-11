import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PartidosService } from '../../../core/partidos/partidos.service';
import { PartidoConEquipos, TIPO_FUTBOL_LABELS } from '../../../core/models/partido.model';

@Component({
  selector: 'app-partidos-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="partidos-page">
      <div class="page-header">
        <div>
          <h1 class="font-display">Partidos</h1>
          <p>Tus próximos y pasados encuentros</p>
        </div>
        <a routerLink="/app/partidos/nuevo" class="btn-primary">+ Nuevo Partido</a>
      </div>

      @if (service.loading()) {
        <div class="loading">Cargando partidos...</div>
      } @else if (!service.misPartidos().length) {
        <div class="empty-state">
          <div class="empty-icon">⚽</div>
          <h2 class="font-display">Aún no tienes partidos</h2>
          <p>Crea tu primer partido y convoca a tus jugadores.</p>
          <a routerLink="/app/partidos/nuevo" class="btn-primary">Crear Partido</a>
        </div>
      } @else {
        @if (proximos().length) {
          <section>
            <h2 class="section-title">Próximos</h2>
            <div class="partidos-grid">
              @for (p of proximos(); track p.id) {
                <a [routerLink]="['/app/partidos', p.id]" class="partido-card">
                  <div class="partido-fecha">{{ formatFecha(p.fecha) }}</div>
                  <div class="partido-match">
                    <span class="equipo-name">{{ p.equipo_local.nombre }}</span>
                    <span class="vs">VS</span>
                    <span class="equipo-name right">{{ p.equipo_visitante.nombre }}</span>
                  </div>
                  <div class="partido-meta">
                    <span class="badge-tipo">{{ tipoLabel(p.tipo_futbol) }}</span>
                    @if (p.lugar) { <span class="lugar">📍 {{ p.lugar }}</span> }
                    <span class="badge-estado programado">Programado</span>
                  </div>
                </a>
              }
            </div>
          </section>
        }

        @if (pasados().length) {
          <section>
            <h2 class="section-title">Historial</h2>
            <div class="partidos-grid">
              @for (p of pasados(); track p.id) {
                <a [routerLink]="['/app/partidos', p.id]" class="partido-card past">
                  <div class="partido-fecha">{{ formatFecha(p.fecha) }}</div>
                  <div class="partido-match">
                    <span class="equipo-name">{{ p.equipo_local.nombre }}</span>
                    <span class="vs">VS</span>
                    <span class="equipo-name right">{{ p.equipo_visitante.nombre }}</span>
                  </div>
                  <div class="partido-meta">
                    <span class="badge-tipo">{{ tipoLabel(p.tipo_futbol) }}</span>
                    @if (p.lugar) { <span class="lugar">📍 {{ p.lugar }}</span> }
                    <span [class]="'badge-estado ' + p.estado">{{ estadoLabel(p.estado) }}</span>
                  </div>
                </a>
              }
            </div>
          </section>
        }
      }
    </div>
  `,
  styles: [`
    .partidos-page { max-width: 900px; }

    .page-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      margin-bottom: 2rem; gap: 1rem; flex-wrap: wrap;
    }
    .page-header h1 { font-size: 2.4rem; color: #fff; }
    .page-header p  { color: var(--color-light); margin-top: .25rem; }

    .btn-primary {
      background: var(--color-gold); color: #000; font-weight: 700;
      border: none; border-radius: 8px; padding: .65rem 1.2rem;
      cursor: pointer; text-decoration: none; font-size: .85rem;
      letter-spacing: .06em; text-transform: uppercase; flex-shrink: 0;
      transition: opacity .2s; display: inline-block;
    }
    .btn-primary:hover { opacity: .85; }

    .loading {
      color: var(--color-light); text-align: center; padding: 3rem;
      font-size: .9rem; letter-spacing: .06em;
    }

    .empty-state {
      background: rgba(255,255,255,.02); border: 1px dashed rgba(255,255,255,.1);
      border-radius: 16px; padding: 3.5rem 2rem; text-align: center;
    }
    .empty-icon  { font-size: 4rem; margin-bottom: 1rem; }
    .empty-state h2 { font-size: 1.8rem; color: var(--color-gold); margin-bottom: .75rem; }
    .empty-state p  { color: var(--color-light); margin-bottom: 1.5rem; }

    .section-title {
      font-size: .72rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: .12em; color: var(--color-light);
      margin: 2rem 0 .75rem;
    }
    .partidos-grid { display: grid; gap: .75rem; }

    .partido-card {
      display: block; text-decoration: none;
      background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
      border-radius: 12px; padding: 1.25rem 1.5rem;
      transition: border-color .2s, background .2s;
    }
    .partido-card:hover { border-color: rgba(240,192,64,.3); background: rgba(240,192,64,.03); }
    .partido-card.past  { opacity: .65; }

    .partido-fecha {
      font-size: .72rem; text-transform: uppercase; letter-spacing: .08em;
      color: var(--color-light); margin-bottom: .5rem;
    }
    .partido-match {
      display: flex; align-items: center; gap: 1rem; margin-bottom: .75rem;
    }
    .equipo-name {
      font-family: 'Bebas Neue', sans-serif; font-size: 1.4rem;
      color: #fff; flex: 1;
    }
    .equipo-name.right { text-align: right; }
    .vs {
      font-family: 'Bebas Neue', sans-serif; font-size: .95rem;
      color: var(--color-gold); flex-shrink: 0;
    }

    .partido-meta { display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; }
    .badge-tipo {
      font-size: .65rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: .08em; background: rgba(255,255,255,.08);
      color: var(--color-light); padding: .2rem .55rem; border-radius: 4px;
    }
    .lugar { font-size: .75rem; color: var(--color-light); }

    .badge-estado {
      font-size: .65rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: .08em; padding: .2rem .55rem; border-radius: 4px; margin-left: auto;
    }
    .badge-estado.programado  { background: rgba(64,196,240,.12);  color: #40c4f0; }
    .badge-estado.completado  { background: rgba(72,199,142,.12);  color: #48c78e; }
    .badge-estado.cancelado   { background: rgba(255,107,107,.12); color: #ff6b6b; }
    .badge-estado.en_disputa  { background: rgba(255,140,0,.12);   color: #ff8c00; }
  `],
})
export class PartidosListComponent implements OnInit {
  readonly service = inject(PartidosService);

  readonly proximos = computed(() =>
    this.service.misPartidos().filter(p => p.estado === 'programado'),
  );
  readonly pasados = computed(() =>
    this.service.misPartidos().filter(p => p.estado !== 'programado'),
  );

  async ngOnInit(): Promise<void> {
    await this.service.cargarMisPartidos();
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CL', {
      weekday: 'short', day: 'numeric', month: 'short',
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
}
