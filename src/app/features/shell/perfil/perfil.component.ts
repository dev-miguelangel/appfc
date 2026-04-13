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

            <!-- ── Estado físico ── -->
            <div class="estado-fisico">
              <h3>Estado físico</h3>
              <div class="estado-card" [class.estado-card--lesionado]="p.lesionado">
                @if (p.lesionado) {
                  <div class="estado-icon estado-icon--lesion">
                    <svg width="22" height="22" fill="white" viewBox="0 0 24 24">
                      <rect x="9" y="2" width="6" height="20" rx="2.5"/>
                      <rect x="2" y="9" width="20" height="6" rx="2.5"/>
                    </svg>
                  </div>
                  <div class="estado-info">
                    <span class="estado-label estado-label--lesion">LESIONADO</span>
                    <span class="estado-sub">No disponible para partidos</span>
                  </div>
                } @else {
                  <div class="estado-icon estado-icon--ok">
                    <svg width="22" height="22" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div class="estado-info">
                    <span class="estado-label estado-label--ok">DISPONIBLE</span>
                    <span class="estado-sub">Listo para jugar</span>
                  </div>
                }
              </div>
              <button
                class="btn-toggle-lesion"
                [class.btn-toggle-lesion--active]="p.lesionado"
                [disabled]="busyLesion()"
                (click)="toggleLesion(p.lesionado)"
              >
                @if (busyLesion()) {
                  Actualizando...
                } @else if (p.lesionado) {
                  <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Marcar como disponible
                } @else {
                  <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="9" y="2" width="6" height="20" rx="2"/>
                    <rect x="2" y="9" width="20" height="6" rx="2"/>
                  </svg>
                  Reportar lesión
                }
              </button>
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

    /* ── Estado físico ── */
    .estado-fisico { margin-top: 1.5rem; }
    .estado-fisico h3 { font-size: .75rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--color-light); margin-bottom: .75rem; }
    .estado-card {
      display: flex; align-items: center; gap: .85rem;
      padding: .9rem 1.1rem; border-radius: 10px;
      background: rgba(0,208,104,.07); border: 1px solid rgba(0,208,104,.2);
      margin-bottom: .75rem; transition: background .3s, border-color .3s;
    }
    .estado-card--lesionado {
      background: rgba(220,30,30,.08); border-color: rgba(220,30,30,.3);
    }
    .estado-icon {
      width: 38px; height: 38px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .estado-icon--ok { background: rgba(0,208,104,.85); box-shadow: 0 0 14px rgba(0,208,104,.4); }
    .estado-icon--lesion {
      background: #dc1e1e;
      box-shadow: 0 0 14px rgba(220,30,30,.55);
      animation: pulse-lesion 1.8s ease-in-out infinite;
    }
    @keyframes pulse-lesion {
      0%, 100% { box-shadow: 0 0 14px rgba(220,30,30,.55); }
      50%       { box-shadow: 0 0 22px rgba(220,30,30,.85); }
    }
    .estado-info { display: flex; flex-direction: column; gap: .2rem; }
    .estado-label { font-family: 'Bebas Neue', sans-serif; font-size: 1.15rem; letter-spacing: .12em; }
    .estado-label--ok      { color: #00d068; }
    .estado-label--lesion  { color: #ff4444; }
    .estado-sub { font-size: .7rem; color: rgba(255,255,255,.35); }
    .btn-toggle-lesion {
      width: 100%; padding: .55rem; border-radius: 8px;
      background: transparent; border: 1px solid rgba(220,30,30,.35);
      color: #ff6b6b; font-size: .78rem; font-weight: 700;
      letter-spacing: .06em; text-transform: uppercase;
      cursor: pointer; transition: background .2s, border-color .2s;
      display: flex; align-items: center; justify-content: center; gap: .4rem;
    }
    .btn-toggle-lesion:hover:not(:disabled) { background: rgba(220,30,30,.1); border-color: rgba(220,30,30,.6); }
    .btn-toggle-lesion--active {
      border-color: rgba(0,208,104,.35); color: #00d068;
    }
    .btn-toggle-lesion--active:hover:not(:disabled) { background: rgba(0,208,104,.08); border-color: rgba(0,208,104,.6); }
    .btn-toggle-lesion:disabled { opacity: .5; cursor: not-allowed; }
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
  readonly busyLesion = signal(false);
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

  async toggleLesion(actual: boolean): Promise<void> {
    this.busyLesion.set(true);
    await this.auth.savePerfil({ lesionado: !actual });
    this.busyLesion.set(false);
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
