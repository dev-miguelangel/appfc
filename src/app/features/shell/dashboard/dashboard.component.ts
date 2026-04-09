import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="min-h-screen flex items-center justify-center"
         style="background: var(--color-dark)">
      <h1 class="font-display text-4xl" style="color: var(--color-gold)">
        Dashboard — Etapa 2
      </h1>
    </div>
  `,
})
export class DashboardComponent {}
