import { InjectionToken, Provider } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { MockSupabaseClient } from '../local-db/mock-supabase-client';

// El token acepta SupabaseClient real o el mock — comparten la misma API superficial
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SUPABASE_CLIENT = new InjectionToken<SupabaseClient | MockSupabaseClient>('supabase-client');

export const provideSupabase = (): Provider => ({
  provide: SUPABASE_CLIENT,
  useFactory: () => {
    if (environment.useLocalDb) {
      console.info(
        '%c[AppFC] Modo LOCAL activo — datos en localStorage, sin Supabase.',
        'color:#00D068;font-weight:700',
      );
      return new MockSupabaseClient();
    }
    return createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  },
});
