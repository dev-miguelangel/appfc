import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-racha-indicator',
  standalone: true,
  template: `
    @if (racha() > 0) {
      <span class="racha-wrap" [class]="sizeClass()">
        <span class="flame">{{ flameEmoji() }}</span>
        <span class="weeks">{{ racha() }}</span>
      </span>
    }
  `,
  styles: [`
    .racha-wrap {
      display: inline-flex; align-items: center; gap: .2rem;
      font-weight: 800; line-height: 1;
    }
    .flame { line-height: 1; }
    .weeks { color: var(--color-gold); font-family: 'Bebas Neue', sans-serif; }

    /* Sizes */
    .sm  { font-size: .85rem; }
    .md  { font-size: 1.1rem; }
    .lg  { font-size: 1.4rem; filter: drop-shadow(0 0 6px rgba(255,140,0,.6)); }

    /* Glow for big rachas */
    .lg .weeks {
      text-shadow: 0 0 12px rgba(240,192,64,.8);
    }
  `],
})
export class RachaIndicatorComponent {
  readonly racha = input.required<number>();

  readonly sizeClass = computed(() => {
    const r = this.racha();
    if (r >= 8) return 'lg';
    if (r >= 4) return 'md';
    return 'sm';
  });

  readonly flameEmoji = computed(() => {
    const r = this.racha();
    if (r >= 8) return '🔥';
    if (r >= 4) return '🔥';
    return '🔥';
  });
}
