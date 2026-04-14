import { Component, input } from '@angular/core';
import { BoletinData } from '../../../core/models/comunidad.model';
import { RachaIndicatorComponent } from '../../../shared/components/racha-indicator.component';
import { PartidoPublicoCardComponent } from './partido-publico-card.component';

@Component({
  selector: 'app-boletin',
  standalone: true,
  imports: [RachaIndicatorComponent, PartidoPublicoCardComponent],
  template: `
    <div class="boletin">
      <div class="boletin-header">
        <div class="boletin-icon">📰</div>
        <div>
          <h2 class="boletin-title font-display">Boletín Semanal</h2>
          <p class="boletin-semana">{{ data().semana }}</p>
        </div>
      </div>

      <!-- ── Goleadores ── -->
      <section class="section">
        <h3 class="section-title">
          <span class="section-icon">⚽</span> Goleadores de la semana
        </h3>
        @if (!data().goleadores.length) {
          <p class="empty">Sin datos esta semana.</p>
        } @else {
          <div class="podio">
            @for (j of data().goleadores.slice(0, 3); track j.usuario_id; let i = $index) {
              <div class="podio-item" [class]="'pos-' + (i + 1)">
                <div class="medal">{{ medals[i] }}</div>
                <div class="player-avatar-wrap">
                  @if (j.foto_url) {
                    <img [src]="j.foto_url" class="player-avatar" alt="" />
                  } @else {
                    <div class="player-avatar-placeholder">{{ j.nombre.charAt(0) }}</div>
                  }
                </div>
                <p class="player-name">{{ j.nombre }}</p>
                <p class="player-stat">{{ j.goles_semana }} <span>gol{{ j.goles_semana !== 1 ? 'es' : '' }}</span></p>
              </div>
            }
          </div>
          @if (data().goleadores.length > 3) {
            <div class="ranking-list">
              @for (j of data().goleadores.slice(3); track j.usuario_id; let i = $index) {
                <div class="ranking-row">
                  <span class="rank-num">{{ i + 4 }}</span>
                  <div class="mini-avatar-wrap">
                    @if (j.foto_url) {
                      <img [src]="j.foto_url" class="mini-avatar" alt="" />
                    } @else {
                      <div class="mini-avatar-placeholder">{{ j.nombre.charAt(0) }}</div>
                    }
                  </div>
                  <span class="rank-name">{{ j.nombre }}</span>
                  <span class="rank-posicion">{{ j.posicion ?? '' }}</span>
                  <span class="rank-val">{{ j.goles_semana }} ⚽</span>
                </div>
              }
            </div>
          }
        }
      </section>

      <div class="separator"></div>

      <!-- ── Más activos ── -->
      <section class="section">
        <h3 class="section-title">
          <span class="section-icon">🏃</span> Más activos
        </h3>
        @if (!data().masActivos.length) {
          <p class="empty">Sin datos esta semana.</p>
        } @else {
          <div class="ranking-list">
            @for (j of data().masActivos; track j.usuario_id; let i = $index) {
              <div class="ranking-row">
                <span class="rank-num">{{ i + 1 }}</span>
                <div class="mini-avatar-wrap">
                  @if (j.foto_url) {
                    <img [src]="j.foto_url" class="mini-avatar" alt="" />
                  } @else {
                    <div class="mini-avatar-placeholder">{{ j.nombre.charAt(0) }}</div>
                  }
                </div>
                <span class="rank-name">{{ j.nombre }}</span>
                <span class="rank-posicion">{{ j.posicion ?? '' }}</span>
                <span class="rank-val">{{ j.partidos_semana }} partidos</span>
              </div>
            }
          </div>
        }
      </section>

      <div class="separator"></div>

      <!-- ── Mejor racha ── -->
      <section class="section">
        <h3 class="section-title">
          <span class="section-icon">🔥</span> Mejor racha
        </h3>
        @if (!data().mejorRacha.length) {
          <p class="empty">Sin datos esta semana.</p>
        } @else {
          <div class="ranking-list">
            @for (j of data().mejorRacha; track j.usuario_id; let i = $index) {
              <div class="ranking-row">
                <span class="rank-num">{{ i + 1 }}</span>
                <div class="mini-avatar-wrap">
                  @if (j.foto_url) {
                    <img [src]="j.foto_url" class="mini-avatar" alt="" />
                  } @else {
                    <div class="mini-avatar-placeholder">{{ j.nombre.charAt(0) }}</div>
                  }
                </div>
                <span class="rank-name">{{ j.nombre }}</span>
                <span class="rank-posicion">{{ j.posicion ?? '' }}</span>
                <app-racha-indicator [racha]="j.racha_actual ?? 0" />
                <span class="rank-val rank-semanas">{{ j.racha_actual ?? 0 }} sem.</span>
              </div>
            }
          </div>
        }
      </section>

      <div class="separator"></div>

      <!-- ── Equipos destacados ── -->
      <section class="section">
        <h3 class="section-title">
          <span class="section-icon">🏆</span> Equipos destacados
        </h3>
        @if (!data().equiposDestacados.length) {
          <p class="empty">Sin datos esta semana.</p>
        } @else {
          <div class="equipos-grid">
            @for (e of data().equiposDestacados; track e.equipo_id; let i = $index) {
              <div class="equipo-card" [class.top-equipo]="i === 0">
                @if (i === 0) { <div class="top-badge">🏆 Líder</div> }
                <div class="eq-header">
                  @if (e.escudo_url) {
                    <img [src]="e.escudo_url" class="eq-escudo" alt="" />
                  } @else {
                    <div class="eq-escudo-ph">{{ e.nombre.charAt(0) }}</div>
                  }
                  <span class="eq-nombre">{{ e.nombre }}</span>
                </div>
                <div class="eq-stats">
                  <span class="eq-stat win">{{ e.victorias }}V</span>
                  <span class="eq-stat draw">{{ e.empates }}E</span>
                  <span class="eq-stat loss">{{ e.derrotas }}D</span>
                  <span class="eq-stat gf">{{ e.goles_favor }}–{{ e.goles_contra }}</span>
                </div>
              </div>
            }
          </div>
        }
      </section>

      <!-- ── Partido de la semana ── -->
      @if (data().partidoSemana) {
        <div class="separator"></div>
        <section class="section">
          <h3 class="section-title">
            <span class="section-icon">⭐</span> Partido de la semana
          </h3>
          <app-partido-publico-card [partido]="data().partidoSemana!" />
        </section>
      }
    </div>
  `,
  styles: [`
    .boletin {
      background: rgba(255,255,255,.025);
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 16px; padding: 1.5rem;
    }
    .boletin-header {
      display: flex; align-items: center; gap: 1rem; margin-bottom: 1.75rem;
    }
    .boletin-icon { font-size: 2.5rem; }
    .boletin-title { font-size: 1.8rem; color: var(--color-gold); margin: 0; line-height: 1; }
    .boletin-semana { font-size: .78rem; color: rgba(255,255,255,.4); margin: .25rem 0 0; text-transform: uppercase; letter-spacing: .06em; }

    .section { margin-bottom: 1.5rem; }
    .section-title {
      display: flex; align-items: center; gap: .5rem;
      font-family: 'Bebas Neue', sans-serif; font-size: 1.2rem; color: #fff;
      margin: 0 0 1rem; letter-spacing: .06em;
    }
    .section-icon { font-size: 1.1rem; }

    .separator { height: 1px; background: rgba(255,255,255,.07); margin: 1.5rem 0; }
    .empty { font-size: .82rem; color: rgba(255,255,255,.3); padding: .5rem 0; }

    /* Podio */
    .podio {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;
      margin-bottom: 1rem;
    }
    .podio-item {
      display: flex; flex-direction: column; align-items: center; gap: .4rem;
      background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
      border-radius: 12px; padding: 1rem .75rem; text-align: center;
    }
    .pos-1 { border-color: rgba(255,215,0,.35); background: rgba(255,215,0,.06); }
    .pos-2 { border-color: rgba(192,192,192,.25); }
    .pos-3 { border-color: rgba(205,127,50,.2); }
    .medal { font-size: 1.5rem; }
    .player-avatar-wrap { position: relative; }
    .player-avatar { width: 52px; height: 52px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(240,192,64,.3); }
    .player-avatar-placeholder {
      width: 52px; height: 52px; border-radius: 50%;
      background: rgba(240,192,64,.1); border: 2px solid rgba(240,192,64,.2);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Bebas Neue', sans-serif; font-size: 1.4rem; color: var(--color-gold);
    }
    .player-name { font-size: .8rem; font-weight: 700; color: #e0e0e0; line-height: 1.2; }
    .player-stat { font-family: 'Bebas Neue', sans-serif; font-size: 1.3rem; color: var(--color-gold); line-height: 1; }
    .player-stat span { font-family: inherit; font-size: .75rem; color: rgba(255,255,255,.4); }

    /* Ranking list */
    .ranking-list { display: flex; flex-direction: column; gap: .35rem; }
    .ranking-row {
      display: flex; align-items: center; gap: .65rem;
      background: rgba(255,255,255,.03); border-radius: 8px;
      padding: .55rem .75rem;
    }
    .rank-num { font-family: 'Bebas Neue', sans-serif; font-size: 1rem; color: rgba(255,255,255,.3); width: 1.4rem; text-align: center; flex-shrink: 0; }
    .rank-name { font-size: .82rem; font-weight: 700; color: #e0e0e0; flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .rank-posicion { font-size: .65rem; color: rgba(255,255,255,.3); text-transform: uppercase; letter-spacing: .06em; flex-shrink: 0; }
    .rank-val { font-family: 'Bebas Neue', sans-serif; font-size: .95rem; color: var(--color-gold); flex-shrink: 0; margin-left: auto; }
    .rank-semanas { display: none; }

    /* Mini avatar */
    .mini-avatar-wrap { flex-shrink: 0; }
    .mini-avatar { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; border: 1px solid rgba(255,255,255,.15); }
    .mini-avatar-placeholder {
      width: 30px; height: 30px; border-radius: 50%;
      background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Bebas Neue', sans-serif; font-size: .85rem; color: rgba(255,255,255,.4);
    }

    /* Equipos grid */
    .equipos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: .75rem; }
    .equipo-card {
      background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
      border-radius: 12px; padding: .85rem; position: relative;
    }
    .top-equipo { border-color: rgba(240,192,64,.4); background: rgba(240,192,64,.06); }
    .top-badge {
      font-size: .6rem; font-weight: 800; text-transform: uppercase; letter-spacing: .1em;
      color: var(--color-gold); margin-bottom: .5rem;
    }
    .eq-header { display: flex; align-items: center; gap: .5rem; margin-bottom: .6rem; }
    .eq-escudo { width: 28px; height: 28px; border-radius: 6px; object-fit: contain; }
    .eq-escudo-ph {
      width: 28px; height: 28px; border-radius: 6px;
      background: rgba(255,255,255,.07);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Bebas Neue', sans-serif; font-size: .9rem; color: rgba(255,255,255,.4);
    }
    .eq-nombre { font-size: .78rem; font-weight: 700; color: #e0e0e0; flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .eq-stats { display: flex; gap: .4rem; flex-wrap: wrap; }
    .eq-stat { font-family: 'Bebas Neue', sans-serif; font-size: .9rem; padding: .1rem .35rem; border-radius: 4px; }
    .win  { color: #00d250; background: rgba(0,210,80,.1); }
    .draw { color: rgba(255,255,255,.5); background: rgba(255,255,255,.06); }
    .loss { color: #ff5050; background: rgba(255,80,80,.1); }
    .gf   { color: rgba(255,255,255,.35); font-size: .75rem; margin-left: auto; }

    @media (max-width: 600px) {
      .podio { grid-template-columns: repeat(3, 1fr); gap: .5rem; }
      .podio-item { padding: .75rem .5rem; }
      .player-avatar, .player-avatar-placeholder { width: 40px; height: 40px; }
      .boletin { padding: 1rem; }
    }
  `],
})
export class BoletinComponent {
  readonly data = input.required<BoletinData>();

  readonly medals = ['🥇', '🥈', '🥉'];
}
