import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="nav-bar">
      <div class="nav-logo">App<span>FC</span></div>
      <div class="nav-links">
        <a [routerLink]="['/']" fragment="features">Funciones</a>
        <a [routerLink]="['/']" fragment="how">Como funciona</a>
        <a [routerLink]="['/']" fragment="reputation">Reputacion</a>
      </div>
      <a routerLink="/auth" class="nav-cta clip-skew">Registrarse</a>
    </nav>
  `,
  styles: [`
    .nav-bar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 6vw; height: 64px;
      background: linear-gradient(to bottom, rgba(8,12,20,.97), transparent);
      backdrop-filter: blur(4px);
    }
    .nav-logo {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 2rem; letter-spacing: .12em;
      color: var(--color-gold);
      text-shadow: 0 0 24px rgba(240,192,64,.6);
      text-decoration: none;
    }
    .nav-logo span { color: #fff; }
    .nav-links { display: flex; gap: 2rem; }
    .nav-links a {
      color: var(--color-light); text-decoration: none;
      font-size: .85rem; font-weight: 600;
      letter-spacing: .08em; text-transform: uppercase;
      transition: color .2s;
    }
    .nav-links a:hover { color: var(--color-gold); }
    .nav-cta {
      background: var(--color-gold); color: var(--color-dark);
      border: none; padding: .55rem 1.4rem;
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.1rem; letter-spacing: .1em;
      cursor: pointer; text-decoration: none;
      transition: background .2s, transform .1s;
      display: inline-block;
    }
    .nav-cta:hover { background: var(--color-gold2); transform: scale(1.04); }
    @media (max-width: 640px) { .nav-links { display: none; } }
  `],
})
export class NavComponent {}
