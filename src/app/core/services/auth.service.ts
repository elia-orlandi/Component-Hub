import { Injectable, inject, computed, effect } from '@angular/core';
import { signalState, patchState } from '@ngrx/signals';
import { AuthState, initialState } from '../state/auth.state';
import { User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { AuthCredentials } from '../models/auth.model';

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

  constructor() {
    // IMPORTANTE: NON METTERE DEGLI await DENTRO AL onAuthStateChange PERCHE' POI SMINCHIA MOLTE CHIAMATE. TIPO SMINCHIAVA LA logout E LA updateUser PER LA PASSWORD
    this.supabase.client.auth.onAuthStateChange((event, session) => {
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

      patchState(this.state, { session, user: session?.user ?? null });

      if (!session?.user) {
        patchState(this.state, { profile: null });
      }

      if (!this.state.isInitialized()) {
        patchState(this.state, { isInitialized: true });
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
      const { error } = await this.supabase.client.auth.signUp(credentials);
      if (error) {
        console.error('Error during sign-up:', error.message);
        throw error;
      }
    } finally {
      patchState(this.state, { isLoading: false });
    }
  }

  async signInWithEmail(credentials: AuthCredentials): Promise<void> {
    patchState(this.state, { isLoading: true });
    try {
      const { error } = await this.supabase.client.auth.signInWithPassword(credentials);
      if (error) {
        console.error('Error during sign-in:', error.message);
        throw error;
      }
    } finally {
      patchState(this.state, { isLoading: false });
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    patchState(this.state, { isLoading: true });
    try {
      const { error } = await this.supabase.client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) {
        console.error('Error sending password reset email:', error.message);
        throw error;
      }
    } finally {
      patchState(this.state, { isLoading: false });
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    patchState(this.state, { isLoading: true });
    try {
      const { error } = await this.supabase.client.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        console.error('Error updating password:', error.message);
        throw error;
      }
    } finally {
      patchState(this.state, { isLoading: false });
    }
  }

  async signOut(): Promise<void> {
    patchState(this.state, { isLoading: true });
    try {
      const { error } = await this.supabase.client.auth.signOut();
      if (error) {
        console.error('Error during sign-out:', error.message);
      } else {
        patchState(this.state, initialState);
      }
    } finally {
      patchState(this.state, { isLoading: false });
    }
  }
  
  private async loadUserProfile(user: User): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('profiles')
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