import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild,
  OnDestroy,
} from '@angular/core';

interface RepMetric {
  label: string;
  value: number;
  display: string;
}

@Component({
  selector: 'app-reputation-section',
  standalone: true,
  template: `
    <section class="reputation" id="reputation" #sectionEl>
      <div class="rep-layout">
        <div>
          <div class="section-label">Sistema de Reputacion</div>
          <h2 class="section-title font-display">
            Tu historial habla<br />por ti
          </h2>
          <p class="section-sub">
            Cada partido construye (o destruye) tu reputacion. Los capitanes ven
            tu puntaje antes de invitarte. Ser confiable tiene recompensa.
          </p>
          <div class="rep-highlights">
            <div class="rep-hl">
              <div class="font-display rep-hl-val">3</div>
              <div class="rep-hl-lbl">Metricas</div>
            </div>
            <div class="rep-hl">
              <div class="font-display rep-hl-val">100%</div>
              <div class="rep-hl-lbl">Transparente</div>
            </div>
            <div class="rep-hl">
              <div class="font-display rep-hl-val">Live</div>
              <div class="rep-hl-lbl">Post-partido</div>
            </div>
          </div>
        </div>

        <div class="rep-card">
          <div class="rep-header">
            <div class="rep-avatar">🧑‍⚽</div>
            <div>
              <div class="rep-name">Carlos Morales</div>
              <div class="rep-pos">Delantero · Santiago</div>
            </div>
          </div>

          @for (m of metrics; track m.label) {
            <div class="rep-metric">
              <div class="rep-metric-top">
                <span class="rep-metric-label">{{ m.label }}</span>
                <span class="rep-metric-val font-display">{{ m.display }}</span>
              </div>
              <div class="rep-bar">
                <div
                  class="rep-fill"
                  [style.width]="animated ? m.value + '%' : '0%'"
                ></div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .reputation { padding: 6rem 6vw; background: var(--color-dark2); }
    .rep-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
    @media (max-width: 760px) { .rep-layout { grid-template-columns: 1fr; gap: 2rem; } }
    .section-label { font-size: .75rem; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: var(--color-gold); margin-bottom: .8rem; }
    .section-title { font-size: clamp(2.4rem, 5vw, 4rem); line-height: 1; letter-spacing: .04em; margin-bottom: 1rem; }
    .section-sub { color: var(--color-light); font-size: 1rem; line-height: 1.7; margin-bottom: 2rem; }
    .rep-highlights { display: flex; gap: 1.5rem; margin-top: 2rem; }
    .rep-hl { flex: 1; background: rgba(0,208,104,.06); border: 1px solid rgba(0,208,104,.2); border-radius: 8px; padding: 1rem; text-align: center; }
    .rep-hl-val { font-size: 2.2rem; color: var(--color-green); }
    .rep-hl-lbl { font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--color-light); }
    .rep-card { background: var(--color-dark3); border: 1px solid rgba(255,255,255,.07); border-radius: 12px; padding: 2rem; }
    .rep-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.8rem; }
    .rep-avatar { width: 52px; height: 52px; background: var(--color-mid); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; border: 2px solid rgba(240,192,64,.3); }
    .rep-name { font-weight: 700; font-size: .95rem; }
    .rep-pos { font-size: .78rem; color: var(--color-green); font-weight: 600; text-transform: uppercase; letter-spacing: .08em; }
    .rep-metric { margin-bottom: 1.2rem; }
    .rep-metric-top { display: flex; justify-content: space-between; margin-bottom: .4rem; }
    .rep-metric-label { font-size: .82rem; color: var(--color-light); font-weight: 600; }
    .rep-metric-val { font-size: 1rem; color: var(--color-gold); }
    .rep-bar { height: 6px; background: var(--color-mid); border-radius: 3px; overflow: hidden; }
    .rep-fill { height: 100%; border-radius: 3px; background: linear-gradient(to right, var(--color-green2), var(--color-green)); transition: width 1.2s cubic-bezier(.4,0,.2,1); }
  `],
})
export class ReputationSectionComponent implements AfterViewInit, OnDestroy {
  @ViewChild('sectionEl') sectionEl!: ElementRef<HTMLElement>;

  animated = false;
  private observer?: IntersectionObserver;

  metrics: RepMetric[] = [
    { label: 'Asistencia',  value: 96, display: '96 / 100' },
    { label: 'Puntualidad', value: 91, display: '91 / 100' },
    { label: 'Compromiso',  value: 88, display: '88 / 100' },
  ];

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          this.animated = true;
          this.observer?.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    this.observer.observe(this.sectionEl.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
