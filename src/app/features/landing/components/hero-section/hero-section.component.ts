import {
  Component,
  ElementRef,
  AfterViewInit,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero">
      <div class="field-lines"></div>
      <div class="particles" #particles></div>

      <div class="hero-content">
        <div class="hero-badge">Chile · Futbol Amateur</div>

        <h1 class="font-display">
          <span>Organiza.</span>
          <span class="line-gold">Juega.</span>
          <span class="line-stroke">Domina.</span>
        </h1>

        <p class="hero-sub">
          Crea tu equipo, programa partidos y encuentra reemplazos en segundos
          cuando falla un jugador. Todo con un sistema de reputacion que separa
          a los comprometidos del resto.
        </p>

        <div class="hero-actions">
          <a routerLink="/auth" class="btn-primary clip-skew">
            ⚽ Empieza gratis
          </a>
          <a [routerLink]="['/']" fragment="how" class="btn-secondary clip-skew">▶ Como funciona</a>
          <a routerLink="/comunidad" class="btn-community clip-skew">🏆 Ver Comunidad</a>
        </div>

        <div class="hero-stats">
          <div class="stat-item">
            <div class="stat-value font-display">11v11</div>
            <div class="stat-label">Formatos</div>
          </div>
          <div class="stat-item">
            <div class="stat-value font-display">100%</div>
            <div class="stat-label">Gratis</div>
          </div>
          <div class="stat-item">
            <div class="stat-value font-display">+15</div>
            <div class="stat-label">Regiones Chile</div>
          </div>
        </div>
      </div>

      <!-- Player card -->
      <div class="hero-card-wrap">
        <div class="player-card">
          <div class="card-glow"></div>
          <div class="card-badge-rep">TOP REP</div>
          <div class="font-display card-rating">94</div>
          <div class="font-display card-position">DEL</div>
          <div class="card-avatar">🧑‍⚽</div>
          <div class="font-display card-name">Carlos M.</div>
          <div class="card-stats">
            <div class="card-stat">
              <div class="font-display card-stat-val">98</div>
              <div class="card-stat-lbl">Asist.</div>
            </div>
            <div class="card-stat">
              <div class="font-display card-stat-val">95</div>
              <div class="card-stat-lbl">Puntual.</div>
            </div>
            <div class="card-stat">
              <div class="font-display card-stat-val">94</div>
              <div class="card-stat-lbl">Comprom.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero {
      position: relative; min-height: 100vh;
      display: flex; align-items: center; padding: 0 6vw; overflow: hidden;
    }
    .hero::before {
      content: ''; position: absolute; inset: 0;
      background:
        radial-gradient(ellipse 80% 60% at 70% 50%, rgba(0,208,104,.07) 0%, transparent 60%),
        radial-gradient(ellipse 50% 80% at 30% 80%, rgba(0,70,160,.18) 0%, transparent 55%),
        linear-gradient(170deg, var(--color-dark2) 0%, var(--color-dark) 100%);
    }
    .field-lines {
      position: absolute; right: -4vw; top: 0; bottom: 0; width: 55vw; opacity: .09;
      background:
        radial-gradient(circle 160px at 50% 50%, transparent 155px, rgba(255,255,255,1) 156px, rgba(255,255,255,1) 160px, transparent 161px),
        radial-gradient(circle 6px at 50% 50%, rgba(255,255,255,1) 100%, transparent),
        linear-gradient(to right, transparent 49.6%, rgba(255,255,255,1) 49.6%, rgba(255,255,255,1) 50.4%, transparent 50.4%),
        linear-gradient(to bottom, rgba(255,255,255,1) 0 2px, transparent 2px calc(100% - 2px), rgba(255,255,255,1) calc(100% - 2px)),
        linear-gradient(to right, rgba(255,255,255,1) 0 2px, transparent 2px calc(100% - 2px), rgba(255,255,255,1) calc(100% - 2px));
    }
    .particles { position: absolute; inset: 0; pointer-events: none; }
    :global(.particle) {
      position: absolute; border-radius: 50%;
      animation: float linear infinite; opacity: 0;
    }
    @keyframes float {
      0%   { transform: translateY(100vh) scale(0); opacity: 0; }
      10%  { opacity: .7; }
      90%  { opacity: .3; }
      100% { transform: translateY(-10vh) scale(1); opacity: 0; }
    }
    .hero-content { position: relative; z-index: 2; max-width: 680px; }
    .hero-badge {
      display: inline-flex; align-items: center; gap: .5rem;
      background: rgba(240,192,64,.1); border: 1px solid rgba(240,192,64,.3);
      color: var(--color-gold); font-size: .75rem; font-weight: 700;
      letter-spacing: .12em; text-transform: uppercase;
      padding: .35rem .9rem; margin-bottom: 1.5rem;
      clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
    }
    .hero-badge::before {
      content: ''; width: 8px; height: 8px;
      background: var(--color-green); border-radius: 50%;
      box-shadow: 0 0 8px var(--color-green);
      animation: pulse 1.8s ease-in-out infinite;
    }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
    h1 { font-size: clamp(3.5rem, 8vw, 7.5rem); line-height: .92; letter-spacing: .03em; margin-bottom: 1.5rem; }
    h1 span { display: block; }
    .line-gold { color: var(--color-gold); }
    .line-stroke { -webkit-text-stroke: 2px #fff; color: transparent; }
    .hero-sub { font-size: 1.1rem; color: var(--color-light); line-height: 1.7; max-width: 480px; margin-bottom: 2.5rem; }
    .hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; }
    .btn-primary {
      display: inline-flex; align-items: center; gap: .6rem;
      background: linear-gradient(135deg, var(--color-gold), var(--color-gold2));
      color: var(--color-dark); border: none; padding: .9rem 2rem;
      font-family: 'Bebas Neue', sans-serif; font-size: 1.3rem; letter-spacing: .1em;
      cursor: pointer; text-decoration: none;
      transition: filter .2s, transform .1s;
      box-shadow: 0 8px 32px rgba(240,192,64,.3);
    }
    .btn-primary:hover { filter: brightness(1.1); transform: translateY(-2px); }
    .btn-secondary {
      display: inline-flex; align-items: center; gap: .6rem;
      background: transparent; color: #fff;
      border: 1px solid rgba(255,255,255,.25); padding: .9rem 2rem;
      font-family: 'Bebas Neue', sans-serif; font-size: 1.3rem; letter-spacing: .1em;
      cursor: pointer; text-decoration: none;
      transition: border-color .2s, background .2s;
    }
    .btn-secondary:hover { border-color: var(--color-gold); background: rgba(240,192,64,.06); }
    .btn-community {
      display: inline-flex; align-items: center; gap: .6rem;
      background: rgba(240,192,64,.1); color: var(--color-gold);
      border: 1px solid rgba(240,192,64,.3); padding: .9rem 2rem;
      font-family: 'Bebas Neue', sans-serif; font-size: 1.3rem; letter-spacing: .1em;
      cursor: pointer; text-decoration: none;
      transition: border-color .2s, background .2s;
    }
    .btn-community:hover { border-color: var(--color-gold); background: rgba(240,192,64,.16); }
    .hero-stats {
      display: flex; gap: 2.5rem; margin-top: 3.5rem;
      padding-top: 2rem; border-top: 1px solid rgba(255,255,255,.08);
    }
    .stat-value { font-size: 2.4rem; line-height: 1; color: var(--color-gold); }
    .stat-label { font-size: .72rem; font-weight: 600; text-transform: uppercase; letter-spacing: .1em; color: var(--color-light); margin-top: .2rem; }
    /* Player card */
    .hero-card-wrap { position: absolute; right: 6vw; top: 50%; transform: translateY(-50%); z-index: 2; display: none; }
    @media (min-width: 960px) { .hero-card-wrap { display: block; } }
    .player-card {
      width: 220px;
      background: linear-gradient(160deg, #1e3a5f 0%, #0d1e33 60%, #091422 100%);
      border: 1px solid rgba(240,192,64,.25); border-radius: 12px; padding: 1.5rem 1.2rem;
      box-shadow: 0 24px 80px rgba(0,0,0,.6), 0 0 40px rgba(240,192,64,.08);
      position: relative; overflow: hidden;
      animation: cardFloat 4s ease-in-out infinite;
    }
    @keyframes cardFloat {
      0%,100% { transform: translateY(0) rotate(-1deg); }
      50%      { transform: translateY(-12px) rotate(1deg); }
    }
    .card-glow { position: absolute; top: -30%; left: -20%; width: 140%; height: 80%; background: radial-gradient(ellipse, rgba(240,192,64,.12), transparent 60%); }
    .card-rating { font-size: 3rem; line-height: 1; color: var(--color-gold); text-shadow: 0 0 20px rgba(240,192,64,.5); }
    .card-position { font-size: 1.1rem; letter-spacing: .1em; color: var(--color-green); }
    .card-avatar { width: 100%; height: 110px; display: flex; align-items: center; justify-content: center; font-size: 5rem; margin: .5rem 0; }
    .card-name { font-size: 1.6rem; letter-spacing: .08em; text-align: center; border-top: 1px solid rgba(240,192,64,.2); padding-top: .6rem; margin-bottom: .8rem; }
    .card-stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: .5rem; }
    .card-stat { text-align: center; }
    .card-stat-val { font-size: 1.3rem; line-height: 1; }
    .card-stat-lbl { font-size: .6rem; font-weight: 700; letter-spacing: .08em; color: rgba(205,216,232,.5); text-transform: uppercase; }
    .card-badge-rep { position: absolute; top: .8rem; right: .8rem; background: var(--color-green); color: var(--color-dark); font-size: .62rem; font-weight: 900; letter-spacing: .06em; padding: .2rem .5rem; border-radius: 3px; }
  `],
})
export class HeroSectionComponent implements AfterViewInit, OnDestroy {
  @ViewChild('particles') particlesRef!: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    this.createParticles();
  }

  ngOnDestroy(): void {}

  private createParticles(): void {
    const container = this.particlesRef.nativeElement;
    const colors = [
      'rgba(240,192,64,.6)',
      'rgba(0,208,104,.5)',
      'rgba(255,255,255,.3)',
    ];
    for (let i = 0; i < 28; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 4 + 2;
      p.style.cssText = `
        width:${size}px; height:${size}px;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        left:${Math.random() * 100}%;
        animation-duration:${Math.random() * 12 + 8}s;
        animation-delay:${Math.random() * 10}s;
      `;
      container.appendChild(p);
    }
  }
}
