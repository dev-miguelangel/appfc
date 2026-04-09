import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer>
      <div class="footer-logo font-display">App<span>FC</span></div>
      <div class="footer-copy">
        &copy; 2026 AppFC &middot; Chile &middot; Todos los derechos reservados
      </div>
    </footer>
  `,
  styles: [`
    footer {
      background: var(--color-dark2); padding: 2rem 6vw;
      display: flex; align-items: center; justify-content: space-between;
      border-top: 1px solid rgba(255,255,255,.06);
      flex-wrap: wrap; gap: 1rem;
    }
    .footer-logo { font-size: 1.5rem; letter-spacing: .1em; color: var(--color-gold); }
    .footer-logo span { color: #fff; }
    .footer-copy { font-size: .78rem; color: rgba(205,216,232,.4); }
  `],
})
export class FooterComponent {}
