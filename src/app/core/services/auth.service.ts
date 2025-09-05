import { Injectable, inject, computed, effect } from '@angular/core';
import { signalState, patchState } from '@ngrx/signals';
import { AuthState, initialState } from '../state/auth.state';
import { User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { AuthCredentials, SignInOptions } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase = inject(SupabaseService);

  readonly state = signalState<AuthState>(initialState);

  readonly user = computed(() => this.state.user());
  readonly profile = computed(() => this.state.profile());
  readonly session = computed(() => this.state.session());
  readonly isAuthenticated = computed(() => !!this.state.session());
  readonly inRecoveryFlow = computed(() => this.state.inRecoveryFlow());
  readonly isInitialized = computed(() => this.state.isInitialized());

  private beforeUnloadListener: (() => void) | null = null;

  constructor() {
    // IMPORTANTE: NON METTERE DEGLI await DENTRO AL onAuthStateChange PERCHE' POI SMINCHIA MOLTE CHIAMATE. TIPO SMINCHIAVA LA logout E LA updateUser PER LA PASSWORD
    this.supabase.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery session detected. Setting recovery flag.');
        patchState(this.state, { inRecoveryFlow: true }); 
        
        if (!this.state.isInitialized()) {
          patchState(this.state, { isInitialized: true });
        }
        return; 
      }

      if (event === 'USER_UPDATED' && this.inRecoveryFlow()) {
        console.log('User update during recovery flow detected. Suppressing state update and resetting flag.');
        patchState(this.state, { inRecoveryFlow: false }); 
        return; 
      }

      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        patchState(this.state, { inRecoveryFlow: false }); 
      }
      if (event === 'SIGNED_OUT') {
        this.clearSessionEndListener();
        patchState(this.state, initialState);
        return;
      }

      patchState(this.state, {
        session,
        user: session?.user ?? null,
        isInitialized: true,
      });

      if (!session) {
        patchState(this.state, { profile: null });
      }
    });

    // Effect to load user profile when user changes
    effect(() => {
      const user = this.state.user();
      if (user) {
        this.loadUserProfile(user);
      }
    });
  }

  async signUp(credentials: AuthCredentials): Promise<void> {
    patchState(this.state, { isLoading: true });
    try {
      const client = await this.supabase.getClient(); // Ottieni il client
      const { error } = await client.auth.signUp(credentials);
      if (error) throw error;
    } finally {
      patchState(this.state, { isLoading: false });
    }
  }

  async signInWithEmail(credentials: AuthCredentials, options: SignInOptions): Promise<void> {
    patchState(this.state, { isLoading: true });
    try {
      this.supabase.initializeClient(options.rememberMe);
      const client = await this.supabase.getClient(); // Ottieni il client appena creato
      const { error } = await client.auth.signInWithPassword(credentials);
      if (error) throw error;
    } finally {
      patchState(this.state, { isLoading: false });
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    patchState(this.state, { isLoading: true });
    try {
      const client = await this.supabase.getClient();
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
    } finally {
      patchState(this.state, { isLoading: false });
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    patchState(this.state, { isLoading: true });
    try {
      const client = await this.supabase.getClient();
      const { error } = await client.auth.updateUser({ password: newPassword });
      if (error) throw error;
    } finally {
      patchState(this.state, { isLoading: false });
    }
  }

  async signOut(): Promise<void> {
    patchState(this.state, { isLoading: true });
    try {
      const client = await this.supabase.getClient();
      const { error } = await client.auth.signOut();
      if (error) throw error;
    } finally {
      patchState(this.state, { isLoading: false });
    }
  }

  private clearSessionEndListener(): void {
    if (this.beforeUnloadListener) {
      console.log("AuthService: Rimosso listener di logout.");
      window.removeEventListener('beforeunload', this.beforeUnloadListener);
      this.beforeUnloadListener = null;
    }
  }
  
  private async loadUserProfile(user: User): Promise<void> {
    const client = await this.supabase.getClient();
    const { data, error } = await client.from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (error) {
      console.error('Error loading user profile:', error.message);
      patchState(this.state, { profile: null });
    } else {
      patchState(this.state, { profile: data });
    }
  }
}