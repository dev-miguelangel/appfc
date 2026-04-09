import { Component } from '@angular/core';

interface Step {
  num: string;
  icon: string;
  title: string;
  desc: string;
}

@Component({
  selector: 'app-how-it-works-section',
  standalone: true,
  template: `
    <section class="how" id="how">
      <div class="section-label">Como funciona</div>
      <h2 class="section-title font-display">
        De cero a partido<br />en minutos
      </h2>
      <p class="section-sub">Un flujo simple para el capitan y para el jugador libre.</p>

      <div class="steps">
        @for (s of steps; track s.num) {
          <div class="step">
            <div class="step-num font-display">{{ s.num }}</div>
            <div class="step-icon">{{ s.icon }}</div>
            <div class="step-title font-display">{{ s.title }}</div>
            <p class="step-desc">{{ s.desc }}</p>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .how { padding: 6rem 6vw; background: var(--color-dark); }
    .section-label { font-size: .75rem; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: var(--color-gold); margin-bottom: .8rem; }
    .section-title { font-size: clamp(2.4rem, 5vw, 4rem); line-height: 1; letter-spacing: .04em; margin-bottom: 1rem; }
    .section-sub { color: var(--color-light); font-size: 1rem; line-height: 1.7; max-width: 520px; margin-bottom: 3.5rem; }
    .steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 2rem; }
    .step { position: relative; padding-left: 1.5rem; border-left: 2px solid rgba(240,192,64,.2); transition: border-color .25s; }
    .step:hover { border-color: var(--color-gold); }
    .step-num { font-size: 4rem; line-height: .85; color: rgba(240,192,64,.12); position: absolute; right: 0; top: 0; }
    .step-icon { font-size: 1.8rem; margin-bottom: .8rem; }
    .step-title { font-size: 1.35rem; letter-spacing: .05em; margin-bottom: .5rem; }
    .step-desc { font-size: .86rem; color: var(--color-light); line-height: 1.65; }
  `],
})
export class HowItWorksSectionComponent {
  steps: Step[] = [
    { num: '01', icon: '👤', title: 'Crea tu perfil',    desc: 'Nombre, edad, comuna, posicion favorita. Login con Google, sin formularios largos.' },
    { num: '02', icon: '🛡️', title: 'Arma tu equipo',   desc: 'Crea tu club e invita a tus compas por nombre de usuario.' },
    { num: '03', icon: '📣', title: 'Convoca el partido', desc: 'Elige fecha, cancha, tipo de futbol y formato. La app notifica a todos los convocados.' },
    { num: '04', icon: '🔄', title: 'Cubre las bajas',   desc: 'Alguien cancela? La app te muestra jugadores libres compatibles. Tu eliges, la app invita.' },
    { num: '05', icon: '✅', title: 'Cierra el partido',  desc: 'Al terminar, ambos capitanes confirman el resultado. La reputacion se actualiza automaticamente.' },
  ];
}
