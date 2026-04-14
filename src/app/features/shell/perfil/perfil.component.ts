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

            @if (p.nickname) {
              <div class="nickname-wrap">
                <span class="nickname-hash">#</span><span class="nickname-val">{{ p.nickname }}</span>
              </div>
            }

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

            <!-- ── Visibilidad ── -->
            <button class="btn-visibilidad" (click)="modalVis.set(true)">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Visibilidad
            </button>
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

        <!-- ── Modal Visibilidad ── -->
        @if (modalVis()) {
          <div class="modal-backdrop" (click)="modalVis.set(false)"></div>
          <div class="modal-vis">
            <div class="modal-vis-header">
              <h3 class="modal-vis-title">
                <svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                Visibilidad
              </h3>
              <button class="modal-vis-close" (click)="modalVis.set(false)">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <p class="modal-vis-desc">
              Controla en qué contextos otros jugadores y capitanes pueden encontrarte.
            </p>

            <div class="vis-options">
              <label class="vis-option" [class.vis-on]="visForm.visible_equipos">
                <div class="vis-option-info">
                  <span class="vis-icon">🏃</span>
                  <div>
                    <span class="vis-label">Invitaciones a equipos</span>
                    <span class="vis-sublabel">Los capitanes pueden invitarte a unirte a su equipo</span>
                  </div>
                </div>
                <div class="toggle-wrap">
                  <input type="checkbox" [(ngModel)]="visForm.visible_equipos" (change)="saveVis()" class="toggle-input" />
                  <span class="toggle-track" [class.on]="visForm.visible_equipos">
                    <span class="toggle-thumb"></span>
                  </span>
                </div>
              </label>

              <label class="vis-option" [class.vis-on]="visForm.visible_reemplazos">
                <div class="vis-option-info">
                  <span class="vis-icon">⚡</span>
                  <div>
                    <span class="vis-label">Reemplazos</span>
                    <span class="vis-sublabel">Apareces disponible cuando un equipo busca reemplazo de urgencia</span>
                  </div>
                </div>
                <div class="toggle-wrap">
                  <input type="checkbox" [(ngModel)]="visForm.visible_reemplazos" (change)="saveVis()" class="toggle-input" />
                  <span class="toggle-track" [class.on]="visForm.visible_reemplazos">
                    <span class="toggle-thumb"></span>
                  </span>
                </div>
              </label>

              <label class="vis-option" [class.vis-on]="visForm.visible_partidos">
                <div class="vis-option-info">
                  <span class="vis-icon">⚽</span>
                  <div>
                    <span class="vis-label">Partidos</span>
                    <span class="vis-sublabel">Te pueden convocar directamente a partidos sin ser del equipo</span>
                  </div>
                </div>
                <div class="toggle-wrap">
                  <input type="checkbox" [(ngModel)]="visForm.visible_partidos" (change)="saveVis()" class="toggle-input" />
                  <span class="toggle-track" [class.on]="visForm.visible_partidos">
                    <span class="toggle-thumb"></span>
                  </span>
                </div>
              </label>
            </div>

            @if (visMsg()) {
              <p class="vis-saved">{{ visMsg() }}</p>
            }
          </div>
        }
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
    .avatar-wrap { position: relative; display: flex; justify-content: center; margin-bottom: 1rem; }
    .nickname-wrap {
      display: flex; align-items: baseline; justify-content: center; gap: .1rem;
      margin-bottom: 1.25rem;
    }
    .nickname-hash { font-size: 1rem; font-weight: 700; color: rgba(240,192,64,.5); }
    .nickname-val  { font-size: 1.15rem; font-weight: 800; color: var(--color-gold); letter-spacing: .2em; font-family: 'Courier New', monospace; }
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

    /* ── Botón visibilidad ── */
    .btn-visibilidad {
      width: 100%; margin-top: .75rem; padding: .55rem;
      border-radius: 8px; border: 1px solid rgba(255,255,255,.12);
      background: transparent; color: rgba(255,255,255,.55);
      font-size: .78rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase;
      cursor: pointer; display: flex; align-items: center; justify-content: center; gap: .5rem;
      transition: border-color .2s, color .2s, background .2s;
    }
    .btn-visibilidad:hover { border-color: rgba(255,255,255,.3); color: #fff; background: rgba(255,255,255,.05); }

    /* ── Modal visibilidad ── */
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,.65);
      backdrop-filter: blur(4px); z-index: 100;
    }
    .modal-vis {
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      z-index: 101; width: min(440px, calc(100vw - 2rem));
      background: #141a24; border: 1px solid rgba(255,255,255,.1);
      border-radius: 16px; padding: 1.75rem;
      box-shadow: 0 24px 80px rgba(0,0,0,.8);
    }
    .modal-vis-header {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: .75rem;
    }
    .modal-vis-title {
      display: flex; align-items: center; gap: .5rem;
      font-family: 'Bebas Neue', sans-serif; font-size: 1.4rem;
      color: #fff; letter-spacing: .08em; margin: 0;
    }
    .modal-vis-close {
      background: transparent; border: none; color: rgba(255,255,255,.35);
      cursor: pointer; padding: .25rem; border-radius: 6px; display: flex;
      transition: color .2s, background .2s;
    }
    .modal-vis-close:hover { color: #fff; background: rgba(255,255,255,.08); }
    .modal-vis-desc { font-size: .8rem; color: rgba(255,255,255,.4); margin: 0 0 1.25rem; line-height: 1.5; }

    /* Opciones toggle */
    .vis-options { display: flex; flex-direction: column; gap: .6rem; }
    .vis-option {
      display: flex; align-items: center; justify-content: space-between; gap: 1rem;
      background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
      border-radius: 12px; padding: .9rem 1rem; cursor: pointer;
      transition: border-color .2s, background .2s;
    }
    .vis-option:hover { background: rgba(255,255,255,.07); border-color: rgba(255,255,255,.14); }
    .vis-option.vis-on { border-color: rgba(0,210,104,.2); background: rgba(0,210,104,.04); }

    .vis-option-info { display: flex; align-items: flex-start; gap: .75rem; flex: 1; min-width: 0; }
    .vis-icon { font-size: 1.35rem; flex-shrink: 0; margin-top: .05rem; }
    .vis-label { display: block; font-size: .85rem; font-weight: 700; color: #e0e0e0; line-height: 1.2; }
    .vis-sublabel { display: block; font-size: .7rem; color: rgba(255,255,255,.35); margin-top: .2rem; line-height: 1.4; }

    /* Toggle switch */
    .toggle-wrap { flex-shrink: 0; position: relative; }
    .toggle-input { position: absolute; opacity: 0; width: 0; height: 0; }
    .toggle-track {
      display: block; width: 42px; height: 24px; border-radius: 12px;
      background: rgba(255,255,255,.12); transition: background .2s;
      position: relative; cursor: pointer;
    }
    .toggle-track.on { background: #00d068; }
    .toggle-thumb {
      position: absolute; top: 3px; left: 3px;
      width: 18px; height: 18px; border-radius: 50%;
      background: #fff; transition: transform .2s;
      box-shadow: 0 1px 4px rgba(0,0,0,.4);
    }
    .toggle-track.on .toggle-thumb { transform: translateX(18px); }

    .vis-saved {
      margin: .85rem 0 0; font-size: .75rem; font-weight: 700;
      color: #00d068; text-align: center; letter-spacing: .04em;
    }
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
  readonly modalVis   = signal(false);
  readonly visMsg     = signal('');

  visForm = {
    visible_equipos:    true,
    visible_reemplazos: true,
    visible_partidos:   true,
  };
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
      this.visForm.visible_equipos    = p.visible_equipos    ?? true;
      this.visForm.visible_reemplazos = p.visible_reemplazos ?? true;
      this.visForm.visible_partidos   = p.visible_partidos   ?? true;
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

  async saveVis(): Promise<void> {
    this.visMsg.set('');
    await this.auth.savePerfil({
      visible_equipos:    this.visForm.visible_equipos,
      visible_reemplazos: this.visForm.visible_reemplazos,
      visible_partidos:   this.visForm.visible_partidos,
    });
    this.visMsg.set('Configuración guardada');
    setTimeout(() => this.visMsg.set(''), 2500);
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
