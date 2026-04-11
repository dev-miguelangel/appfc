import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService, UsuarioPerfil } from '../../../core/auth/auth.service';
import { COMUNAS_CHILE } from '../../../core/data/comunas';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="perfil-page">
      <h1 class="font-display page-title">Mi Perfil</h1>

      @if (auth.perfil(); as p) {
        <div class="perfil-layout">
          <!-- Avatar card -->
          <div class="avatar-card">
            <div class="avatar-wrap">
              @if (p.foto_url) {
                <img [src]="p.foto_url" class="avatar-img" alt="foto de perfil" />
              } @else {
                <div class="avatar-placeholder font-display">{{ p.nombre.charAt(0) }}</div>
              }
              <label class="avatar-edit" title="Cambiar foto">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                <input type="file" accept="image/*" (change)="uploadFoto($event)" hidden />
              </label>
            </div>

            <div class="rep-section">
              <h3>Reputacion</h3>
              <div class="rep-bars">
                <div class="rep-row">
                  <span>Asistencia</span>
                  <div class="rep-bar-bg">
                    <div class="rep-bar" [style.width.%]="p.rep_asistencia"></div>
                  </div>
                  <span class="rep-val">{{ p.rep_asistencia }}</span>
                </div>
                <div class="rep-row">
                  <span>Puntualidad</span>
                  <div class="rep-bar-bg">
                    <div class="rep-bar" [style.width.%]="p.rep_puntualidad"></div>
                  </div>
                  <span class="rep-val">{{ p.rep_puntualidad }}</span>
                </div>
                <div class="rep-row">
                  <span>Compromiso</span>
                  <div class="rep-bar-bg">
                    <div class="rep-bar" [style.width.%]="p.rep_compromiso"></div>
                  </div>
                  <span class="rep-val">{{ p.rep_compromiso }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Edit form -->
          <div class="edit-card">
            <h2>Datos personales</h2>
            <form (ngSubmit)="save()" #f="ngForm" class="edit-form">
              <div class="form-group">
                <label>Nombre completo</label>
                <input type="text" name="nombre" [(ngModel)]="form.nombre" required
                       class="form-input" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Edad</label>
                  <input type="number" name="edad" [(ngModel)]="form.edad"
                         min="13" max="80" class="form-input" />
                </div>
                <div class="form-group">
                  <label>Posicion</label>
                  <select name="posicion" [(ngModel)]="form.posicion" class="form-input">
                    <option value="">Sin especificar</option>
                    <option value="portero">Portero</option>
                    <option value="defensa">Defensa</option>
                    <option value="volante">Volante</option>
                    <option value="delantero">Delantero</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label>Comuna</label>
                <select name="comuna" [(ngModel)]="form.comuna" class="form-input">
                  <option value="">Selecciona...</option>
                  @for (c of comunas; track c) {
                    <option [value]="c">{{ c }}</option>
                  }
                </select>
              </div>

              @if (errorMsg()) {
                <p class="error-msg">{{ errorMsg() }}</p>
              }
              @if (successMsg()) {
                <p class="success-msg">{{ successMsg() }}</p>
              }

              <button type="submit" class="btn-save font-display" [disabled]="busy()">
                {{ busy() ? 'Guardando...' : 'Guardar cambios' }}
              </button>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .perfil-page { max-width: 860px; }
    .page-title { font-size: 2.4rem; color: var(--color-gold); margin-bottom: 1.5rem; }
    .perfil-layout { display: grid; grid-template-columns: 260px 1fr; gap: 1.5rem; }
    @media (max-width: 700px) { .perfil-layout { grid-template-columns: 1fr; } }
    .avatar-card, .edit-card {
      background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
      border-radius: 14px; padding: 1.75rem;
    }
    .avatar-wrap { position: relative; display: flex; justify-content: center; margin-bottom: 1.5rem; }
    .avatar-img { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(240,192,64,.3); }
    .avatar-placeholder {
      width: 100px; height: 100px; border-radius: 50%;
      background: rgba(240,192,64,.1); border: 2px solid rgba(240,192,64,.3);
      display: flex; align-items: center; justify-content: center;
      font-size: 3rem; color: var(--color-gold);
    }
    .avatar-edit {
      position: absolute; bottom: 0; right: calc(50% - 50px - 4px);
      background: var(--color-gold); color: var(--color-dark);
      border-radius: 50%; width: 28px; height: 28px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: filter .2s;
    }
    .avatar-edit:hover { filter: brightness(1.1); }
    .rep-section h3 { font-size: .75rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--color-light); margin-bottom: 1rem; }
    .rep-bars { display: flex; flex-direction: column; gap: .8rem; }
    .rep-row { display: grid; grid-template-columns: 80px 1fr 28px; align-items: center; gap: .5rem; font-size: .78rem; color: var(--color-light); }
    .rep-bar-bg { height: 6px; background: rgba(255,255,255,.08); border-radius: 3px; overflow: hidden; }
    .rep-bar { height: 100%; background: linear-gradient(90deg, var(--color-green), rgba(0,208,104,.6)); border-radius: 3px; transition: width .6s ease; }
    .rep-val { font-weight: 700; color: var(--color-gold); text-align: right; }
    .edit-card h2 { font-size: 1rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--color-light); margin-bottom: 1.5rem; }
    .edit-form { display: flex; flex-direction: column; gap: 1.1rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: .4rem; }
    .form-group label { font-size: .75rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--color-light); }
    .form-input {
      padding: .7rem .9rem; border-radius: 8px;
      background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12);
      color: #fff; font-size: .92rem; outline: none; transition: border-color .2s;
    }
    .form-input:focus { border-color: var(--color-gold); }
    .form-input option { background: #1a2535; }
    .error-msg { color: #ff6b6b; font-size: .82rem; }
    .success-msg { color: var(--color-green); font-size: .82rem; }
    .btn-save {
      padding: .8rem 1.5rem; border-radius: 8px; border: none;
      background: linear-gradient(135deg, var(--color-gold), var(--color-gold2));
      color: var(--color-dark); font-size: 1.1rem; letter-spacing: .08em;
      cursor: pointer; transition: filter .2s; align-self: flex-start;
    }
    .btn-save:hover:not(:disabled) { filter: brightness(1.1); }
    .btn-save:disabled { opacity: .6; cursor: not-allowed; }
  `],
})
export class PerfilComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly comunas = COMUNAS_CHILE;
  readonly busy = signal(false);
  readonly errorMsg = signal('');
  readonly successMsg = signal('');

  form = {
    nombre: '',
    edad: null as number | null,
    posicion: '' as string,
    comuna: '',
  };

  ngOnInit(): void {
    const p = this.auth.perfil();
    if (p) {
      this.form.nombre = p.nombre ?? '';
      this.form.edad = p.edad;
      this.form.posicion = p.posicion ?? '';
      this.form.comuna = p.comuna ?? '';
    }
  }

  async save(): Promise<void> {
    this.errorMsg.set('');
    this.successMsg.set('');
    this.busy.set(true);

    const error = await this.auth.savePerfil({
      nombre: this.form.nombre,
      edad: this.form.edad,
      posicion: (this.form.posicion || null) as UsuarioPerfil['posicion'],
      comuna: this.form.comuna,
    });

    if (error) {
      this.errorMsg.set(error);
    } else {
      this.successMsg.set('Perfil actualizado correctamente.');
    }
    this.busy.set(false);
  }

  async uploadFoto(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.busy.set(true);
    const url = await this.auth.uploadFoto(file);
    if (url) {
      await this.auth.savePerfil({ foto_url: url });
    }
    this.busy.set(false);
  }
}
