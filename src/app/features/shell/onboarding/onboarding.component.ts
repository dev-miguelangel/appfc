import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { COMUNAS_CHILE } from '../../../core/data/comunas';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="onboarding">
      <div class="onb-card">
        <div class="onb-header">
          <div class="onb-icon">⚽</div>
          <h1 class="font-display">Completa tu perfil</h1>
          <p>Para encontrar partidos y reemplazos necesitamos conocerte un poco.</p>
        </div>

        <form (ngSubmit)="save()" #f="ngForm" class="onb-form">
          <div class="form-group">
            <label>Nombre completo</label>
            <input type="text" name="nombre" [(ngModel)]="form.nombre" required
                   placeholder="Ej: Carlos Mendez" class="form-input" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Edad</label>
              <input type="number" name="edad" [(ngModel)]="form.edad" required
                     min="13" max="80" placeholder="25" class="form-input" />
            </div>
            <div class="form-group">
              <label>Posicion</label>
              <select name="posicion" [(ngModel)]="form.posicion" required class="form-input">
                <option value="">Selecciona...</option>
                <option value="portero">Portero</option>
                <option value="defensa">Defensa</option>
                <option value="volante">Volante</option>
                <option value="delantero">Delantero</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Comuna</label>
            <select name="comuna" [(ngModel)]="form.comuna" required class="form-input">
              <option value="">Selecciona tu comuna...</option>
              @for (c of comunas; track c) {
                <option [value]="c">{{ c }}</option>
              }
            </select>
          </div>

          @if (errorMsg()) {
            <p class="error-msg">{{ errorMsg() }}</p>
          }

          <button type="submit" class="btn-save font-display" [disabled]="busy() || !f.valid">
            {{ busy() ? 'Guardando...' : 'Guardar y continuar →' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .onboarding {
      display: flex; align-items: center; justify-content: center;
      min-height: calc(100vh - 60px);
    }
    .onb-card {
      background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
      border-radius: 16px; padding: 2.5rem 2rem; width: 100%; max-width: 500px;
      box-shadow: 0 24px 80px rgba(0,0,0,.4);
    }
    .onb-header { text-align: center; margin-bottom: 2rem; }
    .onb-icon { font-size: 3rem; margin-bottom: .75rem; }
    .onb-header h1 { font-size: 2.2rem; color: var(--color-gold); margin-bottom: .5rem; }
    .onb-header p { color: var(--color-light); font-size: .9rem; }
    .onb-form { display: flex; flex-direction: column; gap: 1.2rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: .4rem; }
    .form-group label { font-size: .78rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--color-light); }
    .form-input {
      padding: .7rem .9rem; border-radius: 8px;
      background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12);
      color: #fff; font-size: .95rem; outline: none; transition: border-color .2s;
    }
    .form-input:focus { border-color: var(--color-gold); }
    .form-input option { background: #1a2535; }
    .error-msg { color: #ff6b6b; font-size: .82rem; text-align: center; }
    .btn-save {
      padding: .9rem; border-radius: 8px; border: none;
      background: linear-gradient(135deg, var(--color-gold), var(--color-gold2));
      color: var(--color-dark); font-size: 1.2rem; letter-spacing: .08em;
      cursor: pointer; transition: filter .2s, transform .1s;
    }
    .btn-save:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
    .btn-save:disabled { opacity: .6; cursor: not-allowed; }
  `],
})
export class OnboardingComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly comunas = COMUNAS_CHILE;
  readonly busy = signal(false);
  readonly errorMsg = signal('');

  form = {
    nombre: '',
    edad: null as number | null,
    posicion: '' as '' | 'portero' | 'defensa' | 'volante' | 'delantero',
    comuna: '',
  };

  async save(): Promise<void> {
    this.errorMsg.set('');
    this.busy.set(true);

    const error = await this.auth.savePerfil({
      nombre: this.form.nombre,
      edad: this.form.edad,
      posicion: this.form.posicion || null,
      comuna: this.form.comuna,
    });

    if (error) {
      this.errorMsg.set(error);
    } else {
      this.router.navigate(['/app/dashboard']);
    }

    this.busy.set(false);
  }
}
