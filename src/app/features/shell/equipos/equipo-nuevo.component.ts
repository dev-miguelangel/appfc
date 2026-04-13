import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EquiposService } from '../../../core/equipos/equipos.service';

@Component({
  selector: 'app-equipo-nuevo',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <a routerLink="/app/equipos" class="back-link">← Mis equipos</a>
        <h1 class="font-display page-title">Crear equipo</h1>
      </div>

      <div class="form-card">
        <form (ngSubmit)="crear()" #f="ngForm" class="form">

          <!-- Escudo preview -->
          <div class="escudo-section">
            <div class="escudo-preview">
              @if (previewUrl()) {
                <img [src]="previewUrl()!" alt="escudo" />
              } @else if (nombre()) {
                <span class="font-display">{{ nombre().charAt(0).toUpperCase() }}</span>
              } @else {
                <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="opacity:.3">
                  <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z"/>
                </svg>
              }
            </div>
            <label class="btn-upload">
              Subir escudo
              <input type="file" accept="image/*" (change)="seleccionarEscudo($event)" hidden />
            </label>
          </div>

          <div class="form-group">
            <label>Nombre del equipo *</label>
            <input
              type="text" name="nombre"
              [ngModel]="nombre()" (ngModelChange)="nombre.set($event)"
              required maxlength="40" placeholder="Ej: Los Leones FC"
              class="form-input"
            />
            <span class="char-count">{{ nombre().length }}/40</span>
          </div>

          @if (errorMsg()) {
            <p class="error-msg">{{ errorMsg() }}</p>
          }

          <div class="form-actions">
            <a routerLink="/app/equipos" class="btn-cancel">Cancelar</a>
            <button type="submit" class="btn-crear font-display" [disabled]="busy() || !f.valid">
              {{ busy() ? 'Creando...' : 'Crear equipo' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 520px; }
    .page-header { margin-bottom: 1.5rem; }
    .back-link { color: var(--color-light); font-size: .82rem; text-decoration: none; display: inline-block; margin-bottom: .75rem; transition: color .2s; }
    .back-link:hover { color: #fff; }
    .page-title { font-size: 2.2rem; color: var(--color-gold); }
    .form-card {
      background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
      border-radius: 14px; padding: 2rem;
    }
    .form { display: flex; flex-direction: column; gap: 1.4rem; }
    .escudo-section { display: flex; align-items: center; gap: 1.5rem; }
    .escudo-preview {
      width: 80px; height: 80px; border-radius: 14px; flex-shrink: 0;
      background: rgba(240,192,64,.08); border: 1px solid rgba(240,192,64,.2);
      display: flex; align-items: center; justify-content: center; overflow: hidden;
    }
    .escudo-preview img { width: 100%; height: 100%; object-fit: cover; }
    .escudo-preview span { font-size: 2.5rem; color: var(--color-gold); }
    .btn-upload {
      background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12);
      color: var(--color-light); padding: .55rem 1.1rem; border-radius: 7px;
      font-size: .82rem; font-weight: 600; cursor: pointer; transition: border-color .2s, color .2s;
    }
    .btn-upload:hover { border-color: var(--color-gold); color: var(--color-gold); }
    .form-group { display: flex; flex-direction: column; gap: .4rem; position: relative; }
    .form-group label { font-size: .75rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--color-light); }
    .form-input {
      padding: .75rem 1rem; border-radius: 8px;
      background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12);
      color: #fff; font-size: .95rem; outline: none; transition: border-color .2s;
    }
    .form-input:focus { border-color: var(--color-gold); }
    .char-count { position: absolute; right: 0; bottom: -1.2rem; font-size: .7rem; color: rgba(255,255,255,.3); }
    .error-msg { color: #ff6b6b; font-size: .82rem; }
    .form-actions { display: flex; gap: 1rem; justify-content: flex-end; padding-top: .5rem; }
    .btn-cancel {
      padding: .75rem 1.4rem; border-radius: 8px; text-decoration: none;
      background: transparent; border: 1px solid rgba(255,255,255,.12); color: var(--color-light);
      font-size: .9rem; transition: border-color .2s;
    }
    .btn-cancel:hover { border-color: rgba(255,255,255,.3); }
    .btn-crear {
      padding: .75rem 1.8rem; border-radius: 8px; border: none;
      background: linear-gradient(135deg, var(--color-gold), var(--color-gold2));
      color: var(--color-dark); font-size: 1.1rem; letter-spacing: .08em;
      cursor: pointer; transition: filter .2s;
    }
    .btn-crear:hover:not(:disabled) { filter: brightness(1.1); }
    .btn-crear:disabled { opacity: .6; cursor: not-allowed; }
  `],
})
export class EquipoNuevoComponent {
  private svc    = inject(EquiposService);
  private router = inject(Router);

  readonly busy       = signal(false);
  readonly errorMsg   = signal('');
  readonly previewUrl = signal<string | null>(null);
  readonly nombre     = signal('');

  private escudoFile: File | null = null;

  seleccionarEscudo(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.escudoFile = file;
    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  async crear(): Promise<void> {
    if (!this.nombre().trim()) return;
    this.errorMsg.set('');
    this.busy.set(true);

    const result = await this.svc.crearEquipo(this.nombre().trim());

    if (!result) {
      this.errorMsg.set('Error al crear el equipo. Intenta de nuevo.');
      this.busy.set(false);
      return;
    }

    if (result.error) {
      this.errorMsg.set(result.error);
      this.busy.set(false);
      return;
    }

    // Subir escudo si fue seleccionado
    if (this.escudoFile) {
      const url = await this.svc.uploadEscudo(result.id, this.escudoFile);
      if (!url) {
        // El equipo se creó; avisamos del problema con la imagen pero seguimos
        this.errorMsg.set('Equipo creado, pero no se pudo subir el escudo. Puedes subirlo desde el detalle.');
        setTimeout(() => this.router.navigate(['/app/equipos', result.id]), 2000);
        return;
      }
    }

    this.router.navigate(['/app/equipos', result.id]);
  }
}
