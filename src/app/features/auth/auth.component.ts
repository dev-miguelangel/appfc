import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center"
         style="background: var(--color-dark)">
      <div class="text-center">
        <h1 class="font-display text-4xl mb-4" style="color: var(--color-gold)">
          Login — Proximamente
        </h1>
        <a routerLink="/" class="text-sm" style="color: var(--color-light)">
          Volver al inicio
        </a>
      </div>
    </div>
  `,
})
export class AuthComponent {}
