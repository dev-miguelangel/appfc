import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { StatsService, StatsResumen, DiaMetrica } from '../../../core/stats/stats.service';

@Component({
  selector: 'app-stats',
  standalone: true,
  template: `
    <div class="stats-page">
      <h1 class="page-title font-display">Análisis de uso</h1>

      @if (loading()) {
        <div class="loading-state">Cargando métricas...</div>
      } @else if (resumen(); as r) {
        <!-- Tarjetas resumen -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <span class="kpi-label">Usuarios registrados</span>
            <span class="kpi-value">{{ r.totalUsuarios }}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Total logins</span>
            <span class="kpi-value">{{ r.totalLogins }}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Registros (últimos 30 días)</span>
            <span class="kpi-value">{{ totalPeriodo(r.registrosPorDia) }}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Logins (últimos 30 días)</span>
            <span class="kpi-value">{{ totalPeriodo(r.loginsPorDia) }}</span>
          </div>
        </div>

        <!-- Gráfico registros -->
        <div class="chart-card">
          <h2 class="chart-title">Registros por día</h2>
          @if (r.registrosPorDia.length) {
            <div class="bar-chart">
              @for (d of r.registrosPorDia; track d.fecha) {
                <div class="bar-col">
                  <span class="bar-count">{{ d.cantidad }}</span>
                  <div
                    class="bar"
                    [style.height.%]="pct(d.cantidad, maxRegistros(r.registrosPorDia))"
                    title="{{ d.fecha }}: {{ d.cantidad }}"
                  ></div>
                  <span class="bar-label">{{ shortDate(d.fecha) }}</span>
                </div>
              }
            </div>
          } @else {
            <p class="empty-msg">Sin registros en los últimos 30 días.</p>
          }
        </div>

        <!-- Gráfico logins -->
        <div class="chart-card">
          <h2 class="chart-title">Logins por día</h2>
          @if (r.loginsPorDia.length) {
            <div class="bar-chart">
              @for (d of r.loginsPorDia; track d.fecha) {
                <div class="bar-col">
                  <span class="bar-count">{{ d.cantidad }}</span>
                  <div
                    class="bar bar--green"
                    [style.height.%]="pct(d.cantidad, maxRegistros(r.loginsPorDia))"
                    title="{{ d.fecha }}: {{ d.cantidad }}"
                  ></div>
                  <span class="bar-label">{{ shortDate(d.fecha) }}</span>
                </div>
              }
            </div>
          } @else {
            <p class="empty-msg">Sin logins registrados aún.</p>
          }
        </div>

        <p class="footnote">* Logins y registros contabilizados desde que se activó el tracking. Visitas de página disponibles en el dashboard de Vercel Analytics.</p>
      }
    </div>
  `,
  styles: [`
    .stats-page { max-width: 900px; }
    .page-title {
      font-size: 2rem; color: var(--color-gold); letter-spacing: .1em;
      margin-bottom: 1.75rem;
    }
    .loading-state {
      color: rgba(255,255,255,.4); font-size: .9rem; padding: 3rem 0; text-align: center;
    }

    /* ── KPI cards ── */
    .kpi-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;
      margin-bottom: 2rem;
    }
    .kpi-card {
      background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
      border-radius: 12px; padding: 1.25rem 1.5rem;
      display: flex; flex-direction: column; gap: .4rem;
    }
    .kpi-label {
      font-size: .7rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: .1em; color: rgba(255,255,255,.4);
    }
    .kpi-value {
      font-family: 'Bebas Neue', sans-serif; font-size: 2.4rem;
      color: var(--color-gold); line-height: 1;
    }

    /* ── Chart cards ── */
    .chart-card {
      background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
      border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;
    }
    .chart-title {
      font-size: .75rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: .1em; color: rgba(255,255,255,.5); margin-bottom: 1.25rem;
    }
    .bar-chart {
      display: flex; align-items: flex-end; gap: 6px;
      height: 160px; overflow-x: auto; padding-bottom: .5rem;
    }
    .bar-col {
      display: flex; flex-direction: column; align-items: center;
      gap: 4px; flex-shrink: 0; width: 36px;
    }
    .bar-count {
      font-size: .6rem; color: rgba(255,255,255,.4); line-height: 1;
    }
    .bar {
      width: 100%; min-height: 4px; border-radius: 4px 4px 0 0;
      background: linear-gradient(to top, var(--color-gold2), var(--color-gold));
      transition: opacity .15s;
    }
    .bar:hover { opacity: .75; }
    .bar--green {
      background: linear-gradient(to top, var(--color-green2), var(--color-green));
    }
    .bar-label {
      font-size: .55rem; color: rgba(255,255,255,.3); white-space: nowrap;
    }
    .empty-msg {
      color: rgba(255,255,255,.3); font-size: .85rem; text-align: center;
      padding: 2rem 0;
    }
    .footnote {
      font-size: .72rem; color: rgba(255,255,255,.25); margin-top: .5rem;
    }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .kpi-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 480px) {
      .kpi-grid { grid-template-columns: 1fr; }
      .kpi-value { font-size: 2rem; }
    }
  `],
})
export class StatsComponent implements OnInit {
  private statsService = inject(StatsService);

  readonly loading = signal(true);
  readonly resumen  = signal<StatsResumen | null>(null);

  async ngOnInit(): Promise<void> {
    const data = await this.statsService.cargarResumen(30);
    this.resumen.set(data);
    this.loading.set(false);
  }

  totalPeriodo(dias: DiaMetrica[]): number {
    return dias.reduce((s, d) => s + d.cantidad, 0);
  }

  maxRegistros(dias: DiaMetrica[]): number {
    return Math.max(...dias.map(d => d.cantidad), 1);
  }

  pct(value: number, max: number): number {
    return Math.round((value / max) * 100);
  }

  shortDate(fecha: string): string {
    const [, mes, dia] = fecha.split('-');
    return `${dia}/${mes}`;
  }
}
