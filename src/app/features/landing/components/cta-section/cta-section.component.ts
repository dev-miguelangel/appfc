import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cta-section',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="cta-section">
      <div class="section-label">Empieza hoy</div>
      <h2 class="cta-title font-display">
        El proximo partido<br />
        <span>no puede esperar</span>
      </h2>
      <p class="cta-sub">Gratis. Sin tarjeta. Solo Google y a jugar.</p>
      <a routerLink="/auth" class="btn-primary clip-skew">
        ⚽ Crear mi perfil gratis
      </a>
    </section>
  `,
  styles: [`
    .cta-section { padding: 6rem 6vw; background: var(--color-dark); text-align: center; position: relative; overflow: hidden; }
    .cta-section::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,208,104,.07), transparent 65%); }
    .cta-section > * { position: relative; z-index: 1; }
    .section-label { font-size: .75rem; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: var(--color-gold); margin-bottom: .8rem; }
    .cta-title { font-size: clamp(3rem, 6vw, 5.5rem); line-height: .95; letter-spacing: .04em; margin-bottom: 1.2rem; }
    .cta-title span { color: var(--color-gold); }
    .cta-sub { color: var(--color-light); font-size: 1.05rem; margin-bottom: 2.5rem; }
    .btn-primary {
      display: inline-flex; align-items: center; gap: .6rem;
      background: linear-gradient(135deg, var(--color-gold), var(--color-gold2));
      color: var(--color-dark); border: none; padding: 1rem 3rem;
      font-family: 'Bebas Neue', sans-serif; font-size: 1.4rem; letter-spacing: .1em;
      cursor: pointer; text-decoration: none;
      transition: filter .2s, transform .1s;
      box-shadow: 0 8px 32px rgba(240,192,64,.3);
    }
    .btn-primary:hover { filter: brightness(1.1); transform: translateY(-2px); }
  `],
})
export class CtaSectionComponent {}
