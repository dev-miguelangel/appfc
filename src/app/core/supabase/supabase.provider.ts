import { InjectionToken, Provider } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

export const SUPABASE_CLIENT = new InjectionToken<SupabaseClient>('supabase-client');

export const provideSupabase = (): Provider => ({
  provide: SUPABASE_CLIENT,
  useFactory: () =>
    createClient(environment.supabaseUrl, environment.supabaseAnonKey),
});
