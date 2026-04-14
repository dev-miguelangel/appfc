import { Component, input, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PartidoPublico } from '../../../core/models/comunidad.model';
import { TIPO_FUTBOL_LABELS } from '../../../core/models/partido.model';

@Component({
  selector: 'app-partido-publico-card',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="card" [class]="cardClass()">
      <!-- Badge de estado -->
      <div class="estado-badge" [class]="badgeClass()">
        @if (partido().estado === 'en_disputa') {
          <span class="live-dot"></span> EN VIVO
        } @else if (partido().estado === 'programado') {
          PRÓXIMO
        } @else if (partido().estado === 'completado') {
          FINALIZADO
        } @else {
          CANCELADO
        }
      </div>

      <!-- Encabezado: fecha + tipo -->
      <div class="card-meta">
        <span class="fecha">{{ partido().fecha | date:'EEE d MMM · HH:mm':'':'es-CL' }}</span>
        <span class="tipo">{{ tipoLabel() }}</span>
        @if (partido().lugar) {
          <span class="lugar">📍 {{ partido().lugar }}</span>
        }
      </div>

      <!-- Marcador principal -->
      <div class="marcador-row">
        <!-- Equipo local -->
        <div class="equipo" [class.ganador]="ganadorLocal()">
          @if (partido().equipo_local.escudo_url) {
            <img [src]="partido().equipo_local.escudo_url" class="escudo" alt="" />
          } @else {
            <div class="escudo-placeholder">{{ partido().equipo_local.nombre.charAt(0) }}</div>
          }
          <span class="equipo-nombre">{{ partido().equipo_local.nombre }}</span>
        </div>

        <!-- Score / VS -->
        <div class="score-centro">
          @if (partido().estado === 'completado' || partido().estado === 'en_disputa') {
            <span class="score" [class.live-score]="partido().estado === 'en_disputa'">
              {{ partido().goles_local ?? 0 }} – {{ partido().goles_visitante ?? 0 }}
            </span>
          } @else {
            <span class="vs">VS</span>
          }
        </div>

        <!-- Equipo visitante -->
        <div class="equipo equipo-right" [class.ganador]="ganadorVisitante()">
          @if (partido().equipo_visitante.escudo_url) {
            <img [src]="partido().equipo_visitante.escudo_url" class="escudo" alt="" />
          } @else {
            <div class="escudo-placeholder">{{ partido().equipo_visitante.nombre.charAt(0) }}</div>
          }
          <span class="equipo-nombre">{{ partido().equipo_visitante.nombre }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 14px; padding: 1.1rem 1.25rem;
      position: relative; overflow: hidden;
      transition: border-color .2s;
    }
    .card:hover { border-color: rgba(255,255,255,.15); }

    /* Variantes */
    .card-live {
      border-color: rgba(0,210,80,.3);
      background: rgba(0,210,80,.04);
      animation: pulse-border 2.5s ease-in-out infinite;
    }
    @keyframes pulse-border {
      0%,100% { border-color: rgba(0,210,80,.3); }
      50%      { border-color: rgba(0,210,80,.6); }
    }
    .card-cancelado { opacity: .45; filter: grayscale(.6); }

    /* Badge */
    .estado-badge {
      display: inline-flex; align-items: center; gap: .35rem;
      font-size: .6rem; font-weight: 800; letter-spacing: .1em;
      text-transform: uppercase; padding: .2rem .55rem;
      border-radius: 20px; margin-bottom: .65rem;
    }
    .badge-live    { background: rgba(0,210,80,.15); color: #00d250; border: 1px solid rgba(0,210,80,.35); }
    .badge-proximo { background: rgba(240,192,64,.12); color: var(--color-gold); border: 1px solid rgba(240,192,64,.25); }
    .badge-final   { background: rgba(255,255,255,.07); color: rgba(255,255,255,.5); border: 1px solid rgba(255,255,255,.1); }
    .badge-cancelado{ background: rgba(255,80,80,.1); color: #ff5050; border: 1px solid rgba(255,80,80,.2); }

    .live-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #00d250;
      animation: blink 1s ease-in-out infinite;
    }
    @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: .2; } }

    /* Meta */
    .card-meta {
      display: flex; gap: .75rem; align-items: center; flex-wrap: wrap;
      margin-bottom: .85rem;
    }
    .fecha { font-size: .75rem; color: rgba(255,255,255,.5); text-transform: capitalize; }
    .tipo  { font-size: .65rem; font-weight: 700; text-transform: uppercase;
              letter-spacing: .08em; color: var(--color-gold);
              background: rgba(240,192,64,.1); border-radius: 4px; padding: .1rem .4rem; }
    .lugar { font-size: .72rem; color: rgba(255,255,255,.4); }

    /* Marcador row */
    .marcador-row {
      display: grid; grid-template-columns: 1fr auto 1fr;
      align-items: center; gap: .75rem;
    }
    .equipo {
      display: flex; flex-direction: column; align-items: flex-start; gap: .3rem;
    }
    .equipo-right { align-items: flex-end; }
    .escudo {
      width: 38px; height: 38px; border-radius: 8px; object-fit: contain;
      background: rgba(255,255,255,.05);
    }
    .escudo-placeholder {
      width: 38px; height: 38px; border-radius: 8px;
      background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Bebas Neue', sans-serif; font-size: 1.2rem; color: rgba(255,255,255,.4);
    }
    .equipo-nombre {
      font-size: .78rem; font-weight: 700; color: #e0e0e0;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px;
    }
    .ganador .equipo-nombre { color: var(--color-gold); }

    .score-centro { text-align: center; }
    .score {
      font-family: 'Bebas Neue', sans-serif; font-size: 2rem;
      color: #fff; letter-spacing: .05em; line-height: 1;
    }
    .live-score { color: #00d250; text-shadow: 0 0 12px rgba(0,210,80,.5); }
    .vs {
      font-family: 'Bebas Neue', sans-serif; font-size: 1.4rem;
      color: rgba(255,255,255,.2); letter-spacing: .12em;
    }
  `],
})
export class PartidoPublicoCardComponent {
  readonly partido = input.required<PartidoPublico>();

  readonly tipoLabel = computed(() => TIPO_FUTBOL_LABELS[this.partido().tipo_futbol] ?? this.partido().tipo_futbol);

  readonly cardClass = computed(() => {
    const e = this.partido().estado;
    if (e === 'en_disputa') return 'card-live';
    if (e === 'cancelado')  return 'card-cancelado';
    return '';
  });

  readonly badgeClass = computed(() => {
    const e = this.partido().estado;
    if (e === 'en_disputa') return 'badge-live';
    if (e === 'programado') return 'badge-proximo';
    if (e === 'completado') return 'badge-final';
    return 'badge-cancelado';
  });

  readonly ganadorLocal = computed(() => {
    const p = this.partido();
    if (p.estado !== 'completado') return false;
    return (p.goles_local ?? 0) > (p.goles_visitante ?? 0);
  });

  readonly ganadorVisitante = computed(() => {
    const p = this.partido();
    if (p.estado !== 'completado') return false;
    return (p.goles_visitante ?? 0) > (p.goles_local ?? 0);
  });
}
