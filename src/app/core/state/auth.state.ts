import { Session, User } from '@supabase/supabase-js';
import { Profile } from '../models/profile.model';

// Definisce la struttura dello stato di autenticazione
export type AuthState = {
  session: Session | null;
  user: User | null;
  profile: Profile | null; // Aggiungiamo il profilo dell'utente per avere anche il suo ruolo
  isInitialized: boolean; // Flag per sapere se il primo controllo è stato fatto
  inRecoveryFlow: boolean; // Flag per sapere se siamo in un flusso di recupero password
  isLoading: boolean; // Per gestire lo stato di caricamento durante il login/logout
}

// Stato iniziale, da usare quando il servizio viene creato
export const initialState: AuthState = {
  session: null,
  user: null,
  profile: null,
  isInitialized: false,
  inRecoveryFlow: false,
  isLoading: false, // Inizialmente non stiamo caricando nulla
};