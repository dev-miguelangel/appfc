import { inject, Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';

/** Tipo mínimo compartido entre Session de Supabase y LocalSession del mock */
export interface AppSession {
  user: { id: string };
}

export interface UsuarioPerfil {
  id: string;
  nombre: string;
  edad: number | null;
  comuna: string;
  posicion: 'portero' | 'defensa' | 'volante' | 'delantero' | null;
  foto_url: string | null;
  rep_asistencia: number;
  rep_puntualidad: number;
  rep_compromiso: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private supabase = inject<any>(SUPABASE_CLIENT);
  private router = inject(Router);

  readonly session = signal<AppSession | null>(null);
  readonly perfil = signal<UsuarioPerfil | null>(null);
  readonly loading = signal(true);

  readonly isLoggedIn = computed(() => !!this.session());
  readonly userId = computed(() => this.session()?.user?.id ?? null);
  readonly perfilCompleto = computed(() => {
    const p = this.perfil();
    return p !== null && !!p.nombre && !!p.comuna && !!p.posicion && p.edad !== null;
  });

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    const { data } = await this.supabase.auth.getSession();
    this.session.set(data.session ?? null);

    if (data.session) {
      await this.loadPerfil(data.session.user.id);
    }

    this.loading.set(false);

    this.supabase.auth.onAuthStateChange(async (_event: string, session: AppSession | null) => {
      this.session.set(session);
      if (session) {
        await this.loadPerfil(session.user.id);
      } else {
        this.perfil.set(null);
      }
    });
  }

  async loadPerfil(userId: string): Promise<void> {
    const { data } = await this.supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();
    this.perfil.set((data as UsuarioPerfil) ?? null);
  }

  async loginWithGoogle(): Promise<void> {
    await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async loginWithEmail(email: string, password: string): Promise<string | null> {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) return (error as { message: string }).message;
    const session = (data as { session: AppSession | null }).session;
    if (session) {
      this.session.set(session);
      await this.loadPerfil(session.user.id);
    }
    return null;
  }

  async registerWithEmail(email: string, password: string): Promise<string | null> {
    const { data, error } = await this.supabase.auth.signUp({ email, password });
    if (error) return (error as { message: string }).message;
    const session = (data as { session: AppSession | null }).session;
    if (session) {
      this.session.set(session);
      await this.loadPerfil(session.user.id);
    }
    return null;
  }

  async logout(): Promise<void> {
    await this.supabase.auth.signOut();
    this.router.navigate(['/']);
  }

  async savePerfil(data: Partial<UsuarioPerfil>): Promise<string | null> {
    const uid = this.userId();
    if (!uid) return 'No autenticado';

    const { error } = await this.supabase
      .from('usuarios')
      .upsert({ id: uid, ...data });

    if (!error) {
      await this.loadPerfil(uid);
    }
    return (error as { message: string } | null)?.message ?? null;
  }

  async uploadFoto(file: File): Promise<string | null> {
    const uid = this.userId();
    if (!uid) return null;

    const ext = file.name.split('.').pop();
    const path = `avatars/${uid}.${ext}`;

    const { error } = await this.supabase.storage
      .from('fotos')
      .upload(path, file, { upsert: true });

    if (error) return null;

    const { data } = this.supabase.storage.from('fotos').getPublicUrl(path);
    return (data as { publicUrl: string }).publicUrl;
  }
}
