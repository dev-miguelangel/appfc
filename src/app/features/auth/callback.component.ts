import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SUPABASE_CLIENT } from '../../core/supabase/supabase.provider';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--color-dark)">
      <p style="color:var(--color-light);font-size:.9rem;letter-spacing:.08em">Iniciando sesion...</p>
    </div>
  `,
})
export class AuthCallbackComponent implements OnInit {
  private supabase = inject(SUPABASE_CLIENT);
  private authService = inject(AuthService);
  private router = inject(Router);

  async ngOnInit(): Promise<void> {
    const { data } = await this.supabase.auth.getSession();
    if (data.session) {
      await this.authService.loadPerfil(data.session.user.id);
      if (this.authService.perfilCompleto()) {
        this.router.navigate(['/app/dashboard']);
      } else {
        this.router.navigate(['/app/onboarding']);
      }
    } else {
      this.router.navigate(['/auth']);
    }
  }
}
