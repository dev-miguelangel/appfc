import { Component } from '@angular/core';

interface Feature {
  icon: string;
  title: string;
  desc: string;
}

@Component({
  selector: 'app-features-section',
  standalone: true,
  imports: [],
  template: `
    <section class="features" id="features">
      <div class="section-label">Funcionalidades</div>
      <h2 class="section-title font-display">
        Todo lo que necesitas<br />para tu partido
      </h2>
      <p class="section-sub">
        Nada sobra. Nada falta. Disenado para el futbolista amateur que quiere
        jugar, no administrar.
      </p>

      <div class="features-grid">
        @for (f of features; track f.title) {
          <div class="feature-card">
            <span class="feature-icon">{{ f.icon }}</span>
            <div class="feature-title font-display">{{ f.title }}</div>
            <p class="feature-desc">{{ f.desc }}</p>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .features { padding: 6rem 6vw; background: var(--color-dark2); }
    .section-label { font-size: .75rem; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: var(--color-gold); margin-bottom: .8rem; }
    .section-title { font-size: clamp(2.4rem, 5vw, 4rem); line-height: 1; letter-spacing: .04em; margin-bottom: 1rem; }
    .section-sub { color: var(--color-light); font-size: 1rem; line-height: 1.7; max-width: 520px; margin-bottom: 3.5rem; }
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5px; border: 1px solid rgba(255,255,255,.06); }
    .feature-card { background: var(--color-dark3); padding: 2.2rem 2rem; position: relative; overflow: hidden; transition: background .25s; }
    .feature-card:hover { background: var(--color-mid); }
    .feature-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(to right, var(--color-gold), var(--color-green)); transform: scaleX(0); transform-origin: left; transition: transform .3s; }
    .feature-card:hover::before { transform: scaleX(1); }
    .feature-icon { font-size: 2.4rem; margin-bottom: 1.2rem; display: block; }
    .feature-title { font-size: 1.5rem; letter-spacing: .06em; margin-bottom: .6rem; }
    .feature-desc { font-size: .88rem; color: var(--color-light); line-height: 1.65; }
  `],
})
export class FeaturesSectionComponent {
  features: Feature[] = [
    { icon: '🛡️', title: 'Tu equipo',         desc: 'Crea tu club, invita jugadores y gestiona tu plantilla. Puedes ser parte de multiples equipos al mismo tiempo.' },
    { icon: '📅', title: 'Programa partidos', desc: 'Crea eventos con fecha, hora, cancha y formato (5v5, 7v7, 11v11). Las invitaciones se envian automaticamente.' },
    { icon: '⚡', title: 'Busca reemplazos',  desc: 'Cuando falla un jugador, la app propone candidatos por posicion y comuna. El capitan elige y envia la invitacion.' },
    { icon: '⭐', title: 'Reputacion',         desc: 'Cada partido suma o resta en tu perfil: asistencia, puntualidad y compromiso. Los mejores jugadores destacan.' },
    { icon: '🎯', title: 'Jugadores libres',  desc: 'Sin equipo fijo? Completa tu perfil y recibe invitaciones a partidos cerca de tu comuna. Solo acepta y juega.' },
    { icon: '🇨🇱', title: 'Hecho para Chile', desc: 'Busqueda por comuna, terminologia local y pensado para la realidad del futbolito y el fulbito chileno.' },
  ];
}
