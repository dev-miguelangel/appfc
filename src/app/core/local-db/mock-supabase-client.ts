/**
 * MockSupabaseClient
 * Implementa la misma API superficial que @supabase/supabase-js pero
 * persiste datos en localStorage. Solo para desarrollo local (useLocalDb=true).
 *
 * Tablas disponibles: usuarios, equipos, partidos, ...
 * Auth: usuarios_auth (email, password_plain, id)
 */
import { localStore } from './local-store';

// ─── Tipos mínimos ────────────────────────────────────────────────────────────

interface LocalUser {
  id: string;
  email: string;
  user_metadata: Record<string, unknown>;
  app_metadata: Record<string, unknown>;
  aud: string;
}

interface LocalSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: LocalUser;
}

type AuthChangeEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED';
type AuthChangeCallback = (event: AuthChangeEvent, session: LocalSession | null) => void;

interface AuthCredential { email: string; password: string; }

// ─── Claves de storage ────────────────────────────────────────────────────────

const SESSION_KEY = 'ldb_session';
const AUTH_TABLE  = 'auth_accounts'; // {id, email, password}

// ─── Query builder ────────────────────────────────────────────────────────────

type DbRow = Record<string, unknown>;
type DbResult = { data: DbRow[] | null; error: { message: string } | null };
type DbSingleResult = { data: DbRow | null; error: { message: string } | null };

class QueryBuilder {
  private _table: string;
  private _filters: Array<{ op: 'eq' | 'neq' | 'ilike'; field: string; value: unknown }> = [];
  private _orderField: string | null = null;
  private _orderAsc = true;
  private _limitN: number | null = null;
  private _isDelete = false;
  private _updateFields: Partial<DbRow> | null = null;

  constructor(table: string) {
    this._table = table;
  }

  select(_cols?: string): this { return this; }

  eq(field: string, value: unknown): this {
    this._filters.push({ op: 'eq', field, value });
    return this;
  }

  neq(field: string, value: unknown): this {
    this._filters.push({ op: 'neq', field, value });
    return this;
  }

  ilike(field: string, pattern: string): this {
    this._filters.push({ op: 'ilike', field, value: pattern });
    return this;
  }

  order(field: string, opts?: { ascending?: boolean }): this {
    this._orderField = field;
    this._orderAsc = opts?.ascending ?? true;
    return this;
  }

  limit(n: number): this {
    this._limitN = n;
    return this;
  }

  // Acumula campos a actualizar — se ejecuta en then() al ser awaited
  update(fields: Partial<DbRow>): this {
    this._updateFields = fields;
    return this;
  }

  // Marca como DELETE — se ejecuta en then/execute
  delete(): this {
    this._isDelete = true;
    return this;
  }

  private applyFilters(rows: DbRow[]): DbRow[] {
    for (const f of this._filters) {
      rows = rows.filter(r => {
        if (f.op === 'eq')    return r[f.field] === f.value;
        if (f.op === 'neq')   return r[f.field] !== f.value;
        if (f.op === 'ilike') {
          const pattern = (f.value as string).replace(/%/g, '.*').replace(/_/g, '.');
          return new RegExp(pattern, 'i').test(String(r[f.field] ?? ''));
        }
        return true;
      });
    }
    if (this._orderField) {
      const field = this._orderField;
      const asc   = this._orderAsc;
      rows = [...rows].sort((a, b) => {
        const va = a[field] as string | number;
        const vb = b[field] as string | number;
        return asc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
      });
    }
    if (this._limitN !== null) rows = rows.slice(0, this._limitN);
    return rows;
  }

  async single(): Promise<DbSingleResult> {
    const rows = this.applyFilters(localStore.all<DbRow>(this._table));
    return { data: rows[0] ?? null, error: null };
  }

  // Permite `const { data, error } = await supabase.from(...).select().eq(...)`
  then<T>(resolve: (v: DbResult) => T, reject?: (e: unknown) => T): Promise<T> {
    return Promise.resolve().then(() => {
      if (this._isDelete) {
        const keep = localStore.all<DbRow>(this._table).filter(r =>
          !this.applyFilters([r]).length,
        );
        localStore.clear(this._table);
        for (const row of keep) localStore.upsert(this._table, row);
        return resolve({ data: [], error: null });
      }
      if (this._updateFields !== null) {
        const fields = this._updateFields;
        const rows = localStore.all<DbRow>(this._table);
        const updated: DbRow[] = [];
        for (const row of rows) {
          if (this.applyFilters([row]).length > 0) {
            const newRow = { ...row, ...fields };
            localStore.upsert(this._table, newRow);
            updated.push(newRow);
          }
        }
        return resolve({ data: updated, error: null });
      }
      const rows = this.applyFilters(localStore.all<DbRow>(this._table));
      return resolve({ data: rows, error: null });
    }).catch(reject ?? (e => { throw e; })) as Promise<T>;
  }

  async upsert(record: DbRow): Promise<DbSingleResult> {
    const saved = localStore.upsert(this._table, record);
    return { data: saved, error: null };
  }

  async insert(record: DbRow): Promise<DbSingleResult> {
    return this.upsert(record);
  }

}

// ─── Storage mock ─────────────────────────────────────────────────────────────

class StorageBucket {
  private bucket: string;

  constructor(bucket: string) {
    this.bucket = bucket;
  }

  async upload(
    path: string,
    file: File,
    _opts?: { upsert?: boolean },
  ): Promise<{ data: { path: string } | null; error: null | { message: string } }> {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => {
        const key = `ldb_storage_${this.bucket}_${path}`;
        localStorage.setItem(key, reader.result as string);
        resolve({ data: { path }, error: null });
      };
      reader.onerror = () => resolve({ data: null, error: { message: 'Error leyendo archivo' } });
      reader.readAsDataURL(file);
    });
  }

  getPublicUrl(path: string): { data: { publicUrl: string } } {
    const key = `ldb_storage_${this.bucket}_${path}`;
    const stored = localStorage.getItem(key);
    // Si existe retorna el data URL, si no un placeholder
    const publicUrl = stored ?? `https://via.placeholder.com/150?text=${encodeURIComponent(path)}`;
    return { data: { publicUrl } };
  }
}

class StorageMock {
  from(bucket: string): StorageBucket {
    return new StorageBucket(bucket);
  }
}

// ─── Auth mock ────────────────────────────────────────────────────────────────

class AuthMock {
  private listeners: AuthChangeCallback[] = [];

  private readSession(): LocalSession | null {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null');
    } catch {
      return null;
    }
  }

  private writeSession(s: LocalSession | null): void {
    if (s) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }

  private buildSession(user: LocalUser): LocalSession {
    return {
      access_token: `mock_token_${user.id}`,
      refresh_token: `mock_refresh_${user.id}`,
      expires_in: 3600,
      token_type: 'bearer',
      user,
    };
  }

  private notify(event: AuthChangeEvent, session: LocalSession | null): void {
    this.listeners.forEach(cb => cb(event, session));
  }

  async getSession(): Promise<{ data: { session: LocalSession | null } }> {
    return { data: { session: this.readSession() } };
  }

  onAuthStateChange(callback: AuthChangeCallback): { data: { subscription: { unsubscribe(): void } } } {
    this.listeners.push(callback);
    // Notifica estado actual inmediatamente
    const current = this.readSession();
    if (current) {
      setTimeout(() => callback('SIGNED_IN', current), 0);
    }
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners = this.listeners.filter(l => l !== callback);
          },
        },
      },
    };
  }

  async signInWithPassword(
    creds: AuthCredential,
  ): Promise<{ data: { session: LocalSession | null; user: LocalUser | null }; error: { message: string } | null }> {
    const account = localStore.findOne<{ id: string; email: string; password: string }>(
      AUTH_TABLE, 'email', creds.email,
    );

    if (!account || account.password !== creds.password) {
      return { data: { session: null, user: null }, error: { message: 'Email o contraseña incorrectos' } };
    }

    const user: LocalUser = {
      id: account.id,
      email: account.email,
      user_metadata: {},
      app_metadata: {},
      aud: 'authenticated',
    };
    const session = this.buildSession(user);
    this.writeSession(session);
    this.notify('SIGNED_IN', session);
    return { data: { session, user }, error: null };
  }

  async signUp(
    creds: AuthCredential,
  ): Promise<{ data: { session: LocalSession | null; user: LocalUser | null }; error: { message: string } | null }> {
    const existing = localStore.findOne(AUTH_TABLE, 'email', creds.email);
    if (existing) {
      return { data: { session: null, user: null }, error: { message: 'Este correo ya esta registrado' } };
    }

    const id = crypto.randomUUID();
    localStore.upsert(AUTH_TABLE, { id, email: creds.email, password: creds.password });

    // Auto-insert en tabla usuarios (igual que el trigger de Supabase)
    localStore.upsert('usuarios', {
      id,
      nombre: '',
      edad: null,
      comuna: '',
      posicion: null,
      foto_url: null,
      rep_asistencia: 50,
      rep_puntualidad: 50,
      rep_compromiso: 50,
      created_at: new Date().toISOString(),
    });

    // En produccion Supabase pide confirmacion de correo;
    // en modo local devolvemos sesion activa directamente
    const user: LocalUser = {
      id,
      email: creds.email,
      user_metadata: {},
      app_metadata: {},
      aud: 'authenticated',
    };
    const session = this.buildSession(user);
    this.writeSession(session);
    this.notify('SIGNED_IN', session);
    return { data: { session, user }, error: null };
  }

  async signInWithOAuth(
    _opts: { provider: string; options?: { redirectTo?: string } },
  ): Promise<{ data: unknown; error: null }> {
    // En modo local no podemos hacer OAuth real; mostramos aviso en consola
    console.warn(
      '[MockSupabase] signInWithOAuth no disponible en modo local. ' +
      'Usa email/contraseña para desarrollo.',
    );
    return { data: null, error: null };
  }

  async signOut(): Promise<{ error: null }> {
    this.writeSession(null);
    this.notify('SIGNED_OUT', null);
    return { error: null };
  }
}

// ─── Cliente principal ────────────────────────────────────────────────────────

export class MockSupabaseClient {
  readonly auth = new AuthMock();
  readonly storage = new StorageMock();

  from(table: string): QueryBuilder {
    return new QueryBuilder(table);
  }
}
