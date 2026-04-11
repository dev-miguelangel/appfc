import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';
import { seedLocalDb, clearSeedLocalDb } from '../../core/local-db/seed';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="auth-page">
      <div class="auth-bg"></div>

      <div class="auth-card">
        <a routerLink="/" class="auth-logo">App<span>FC</span></a>
        <p class="auth-sub">Organiza. Juega. Domina.</p>

        @if (isLocalDb) {
          <div class="local-badge">⚡ Modo local activo — Google OAuth deshabilitado</div>
        }

        <!-- Google -->
        <button class="btn-google" (click)="loginGoogle()" [disabled]="busy() || isLocalDb" [title]="isLocalDb ? 'No disponible en modo local' : ''">
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.8 2.3 30.3 0 24 0 14.7 0 6.8 5.4 2.9 13.3l7.8 6C12.4 13.1 17.8 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17z"/>
            <path fill="#FBBC05" d="M10.7 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.8-6A24 24 0 0 0 0 24c0 3.9.9 7.5 2.5 10.8l8.2-6.1z"/>
            <path fill="#34A853" d="M24 48c6.3 0 11.6-2.1 15.4-5.7l-7.5-5.8c-2.1 1.4-4.8 2.3-7.9 2.3-6.2 0-11.5-3.6-13.8-8.8l-8.2 6.1C6.8 42.6 14.7 48 24 48z"/>
          </svg>
          Continuar con Google
        </button>

        @if (isDev || isLocalDb) {
          <div class="divider"><span>{{ isLocalDb ? 'ingresa o crea cuenta' : 'o para desarrollo' }}</span></div>

          <div class="tab-row">
            <button [class.active]="tab() === 'login'" (click)="tab.set('login')">Ingresar</button>
            <button [class.active]="tab() === 'register'" (click)="tab.set('register')">Registrarse</button>
          </div>

          <form (ngSubmit)="submitEmail()" #f="ngForm" class="email-form">
            <input
              type="email" name="email" [(ngModel)]="email" required
              placeholder="correo@ejemplo.com"
              class="form-input"
            />
            <input
              type="password" name="password" [(ngModel)]="password" required
              placeholder="Contraseña"
              class="form-input"
            />
            @if (errorMsg()) {
              <p class="error-msg">{{ errorMsg() }}</p>
            }
            @if (successMsg()) {
              <p class="success-msg">{{ successMsg() }}</p>
            }
            <button type="submit" class="btn-email" [disabled]="busy()">
              {{ tab() === 'login' ? 'Ingresar' : 'Crear cuenta' }}
            </button>
          </form>
        }

        @if (isLocalDb) {
          <div class="seed-section">
            <div class="seed-header">
              <span>Datos de prueba</span>
              @if (seedDone()) {
                <button class="btn-clear-seed" (click)="limpiarSeed()" title="Eliminar datos de prueba">✕</button>
              }
            </div>
            @if (!seedDone()) {
              <button class="btn-seed" (click)="cargarSeed()" [disabled]="seedBusy()">
                {{ seedBusy() ? 'Cargando...' : '🎮 Cargar datos de prueba' }}
              </button>
            } @else {
              <div class="seed-accounts">
                <div class="seed-account">
                  <span class="seed-team">⚽ Los Barrabases</span>
                  <code>camotillo@barrabases.cl</code>
                  <code class="seed-pass">barrabases</code>
                </div>
                <div class="seed-account">
                  <span class="seed-team">🏆 La Roja 2015</span>
                  <code>claudio.bravo@laroja.cl</code>
                  <code class="seed-pass">laroja2015</code>
                </div>
              </div>
            }
            @if (seedMsg()) {
              <p class="seed-msg">{{ seedMsg() }}</p>
            }
          </div>
        }

        <a routerLink="/" class="back-link">← Volver al inicio</a>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      position: relative;
    }
    .auth-bg {
      position: fixed; inset: 0; z-index: 0;
      background:
        radial-gradient(ellipse 70% 60% at 20% 40%, rgba(0,70,160,.25) 0%, transparent 60%),
        radial-gradient(ellipse 50% 50% at 80% 70%, rgba(0,208,104,.08) 0%, transparent 55%),
        var(--color-dark);
    }
    .auth-card {
      position: relative; z-index: 1;
      background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
      border-radius: 16px; padding: 2.5rem 2rem; width: 100%; max-width: 380px;
      backdrop-filter: blur(12px);
      box-shadow: 0 24px 80px rgba(0,0,0,.5);
    }
    .auth-logo {
      display: block; font-family: 'Bebas Neue', sans-serif;
      font-size: 2.4rem; letter-spacing: .12em;
      color: var(--color-gold); text-decoration: none; text-align: center;
      text-shadow: 0 0 24px rgba(240,192,64,.5); margin-bottom: .2rem;
    }
    .auth-logo span { color: #fff; }
    .auth-sub {
      text-align: center; font-size: .78rem; letter-spacing: .12em;
      text-transform: uppercase; color: var(--color-light); margin-bottom: 2rem;
    }
    .btn-google {
      width: 100%; display: flex; align-items: center; justify-content: center; gap: .75rem;
      background: #fff; color: #1f1f1f; border: none; border-radius: 8px;
      padding: .75rem 1.5rem; font-size: .95rem; font-weight: 600;
      cursor: pointer; transition: filter .2s, transform .1s;
    }
    .btn-google:hover { filter: brightness(.95); transform: translateY(-1px); }
    .btn-google:disabled { opacity: .6; cursor: not-allowed; transform: none; }
    .divider {
      display: flex; align-items: center; gap: 1rem; margin: 1.5rem 0 1rem;
      color: rgba(255,255,255,.3); font-size: .78rem;
    }
    .divider::before, .divider::after {
      content: ''; flex: 1; height: 1px; background: rgba(255,255,255,.1);
    }
    .tab-row {
      display: flex; border: 1px solid rgba(255,255,255,.12); border-radius: 8px;
      overflow: hidden; margin-bottom: 1rem;
    }
    .tab-row button {
      flex: 1; padding: .55rem; background: transparent; border: none;
      color: var(--color-light); font-size: .85rem; font-weight: 600;
      cursor: pointer; transition: background .2s, color .2s;
    }
    .tab-row button.active {
      background: rgba(240,192,64,.15); color: var(--color-gold);
    }
    .email-form { display: flex; flex-direction: column; gap: .75rem; }
    .form-input {
      width: 100%; padding: .75rem 1rem; border-radius: 8px;
      background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12);
      color: #fff; font-size: .95rem; outline: none; box-sizing: border-box;
      transition: border-color .2s;
    }
    .form-input:focus { border-color: var(--color-gold); }
    .form-input::placeholder { color: rgba(255,255,255,.3); }
    .btn-email {
      width: 100%; padding: .8rem; border-radius: 8px; border: none;
      background: linear-gradient(135deg, var(--color-gold), var(--color-gold2));
      color: var(--color-dark); font-family: 'Bebas Neue', sans-serif;
      font-size: 1.15rem; letter-spacing: .1em; cursor: pointer;
      transition: filter .2s, transform .1s;
    }
    .btn-email:hover { filter: brightness(1.1); transform: translateY(-1px); }
    .btn-email:disabled { opacity: .6; cursor: not-allowed; transform: none; }
    .error-msg { color: #ff6b6b; font-size: .82rem; text-align: center; }
    .success-msg { color: var(--color-green); font-size: .82rem; text-align: center; }
    .back-link {
      display: block; text-align: center; margin-top: 1.5rem;
      color: rgba(255,255,255,.35); font-size: .8rem; text-decoration: none;
      transition: color .2s;
    }
    .back-link:hover { color: var(--color-light); }
    .local-badge {
      background: rgba(0,208,104,.1); border: 1px solid rgba(0,208,104,.25);
      color: var(--color-green); font-size: .72rem; font-weight: 700;
      letter-spacing: .06em; text-align: center;
      padding: .45rem .9rem; border-radius: 6px; margin-bottom: 1.25rem;
    }
    .seed-section {
      margin-top: 1.5rem; border-top: 1px solid rgba(255,255,255,.07);
      padding-top: 1.25rem; display: flex; flex-direction: column; gap: .6rem;
    }
    .seed-header {
      display: flex; align-items: center; justify-content: space-between;
      font-size: .72rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: .09em; color: rgba(255,255,255,.3);
    }
    .btn-clear-seed {
      background: transparent; border: none; color: rgba(255,255,255,.25);
      cursor: pointer; font-size: .85rem; line-height: 1;
      transition: color .2s; padding: 0;
    }
    .btn-clear-seed:hover { color: #ff6b6b; }
    .btn-seed {
      width: 100%; padding: .65rem; border-radius: 8px;
      background: rgba(240,192,64,.1); border: 1px solid rgba(240,192,64,.25);
      color: var(--color-gold); font-size: .82rem; font-weight: 700;
      letter-spacing: .06em; cursor: pointer; transition: background .2s;
    }
    .btn-seed:hover:not(:disabled) { background: rgba(240,192,64,.18); }
    .btn-seed:disabled { opacity: .5; cursor: not-allowed; }
    .seed-accounts { display: flex; flex-direction: column; gap: .5rem; }
    .seed-account {
      background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
      border-radius: 8px; padding: .6rem .8rem;
      display: flex; flex-direction: column; gap: .2rem;
    }
    .seed-team { font-size: .72rem; font-weight: 700; color: var(--color-gold); margin-bottom: .1rem; }
    code {
      font-family: 'Courier New', monospace; font-size: .75rem;
      color: rgba(255,255,255,.7); background: rgba(255,255,255,.05);
      padding: .1rem .4rem; border-radius: 3px;
    }
    .seed-pass { color: rgba(255,255,255,.4); }
    .seed-msg {
      font-size: .75rem; color: #ff6b6b; text-align: center;
    }
  `],
})
export class AuthComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly isDev     = !environment.production;
  readonly isLocalDb = environment.useLocalDb;
  readonly busy      = signal(false);
  readonly tab       = signal<'login' | 'register'>('login');
  readonly errorMsg  = signal('');
  readonly successMsg = signal('');
  readonly seedBusy  = signal(false);
  readonly seedDone  = signal(false);
  readonly seedMsg   = signal('');

  email = '';
  password = '';

  async loginGoogle(): Promise<void> {
    this.busy.set(true);
    await this.auth.loginWithGoogle();
    this.busy.set(false);
  }

  cargarSeed(): void {
    this.seedBusy.set(true);
    this.seedMsg.set('');
    const result = seedLocalDb();
    if (result.ok) {
      this.seedDone.set(true);
    } else {
      this.seedDone.set(true); // ya existían
      this.seedMsg.set(result.msg);
    }
    this.seedBusy.set(false);
  }

  limpiarSeed(): void {
    clearSeedLocalDb();
    this.seedDone.set(false);
    this.seedMsg.set('');
  }

  async submitEmail(): Promise<void> {
    this.errorMsg.set('');
    this.successMsg.set('');
    this.busy.set(true);

    let error: string | null;
    if (this.tab() === 'login') {
      error = await this.auth.loginWithEmail(this.email, this.password);
    } else {
      error = await this.auth.registerWithEmail(this.email, this.password);
    }

    if (error) {
      this.errorMsg.set(error);
      this.busy.set(false);
      return;
    }

    // Login/registro exitoso — navegar según estado del perfil
    if (this.auth.perfilCompleto()) {
      this.router.navigate(['/app/dashboard']);
    } else {
      this.router.navigate(['/app/onboarding']);
    }
    this.busy.set(false);
  }
}
