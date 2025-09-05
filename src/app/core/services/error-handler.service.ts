import { Injectable } from '@angular/core';
// Importa i tipi e le funzioni di controllo ufficiali di Supabase
import { AuthApiError, isAuthApiError } from '@supabase/supabase-js';
import { SUPABASE_ERROR_CODE_MAP, DEFAULT_ERROR_MESSAGE } from '../mappers/supabase-error.mapper';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor() { }

  /**
   * Mappa un errore (preferibilmente un AuthError di Supabase) a un messaggio leggibile,
   * usando la logica raccomandata basata su 'code' e 'status'.
   * @param error L'errore catturato nel blocco catch.
   * @returns Una stringa user-friendly.
   */
  public mapSupabaseError(error: unknown): string {
    // 1. Controlla se è un AuthApiError usando la funzione ufficiale (Regola #1)
    if (isAuthApiError(error)) {
      console.error('Supabase AuthApiError:', { code: error.code, status: error.status, message: error.message });

      // 2. Prova a mappare usando il 'code' testuale, se esiste (più specifico)
      // Nota: Supabase non fornisce sempre un 'code', quindi questo è un optional.
      if (error.code && SUPABASE_ERROR_CODE_MAP[error.code]) {
        return SUPABASE_ERROR_CODE_MAP[error.code];
      }

      // 3. Se non c'è un 'code' mappato, prova a mappare usando lo 'status' HTTP (più generico)
      if (error.status && SUPABASE_ERROR_CODE_MAP[error.status.toString()]) {
        return SUPABASE_ERROR_CODE_MAP[error.status.toString()];
      }
      
      // 4. Se nessuno dei due codici è mappato, usa il messaggio dell'errore se non è generico
      // Questo può essere un fallback utile per errori non ancora mappati.
      if (error.message) {
        return error.message; // O una versione pulita di esso
      }

    } else if (error instanceof Error) {
      // Gestisce altri tipi di errori JavaScript generici
      console.error('Generic Error:', error.message);
    } else {
      // Gestisce errori non standard
      console.error('Unknown error type:', error);
    }
    
    // 5. Se tutto il resto fallisce, restituisci il messaggio di default
    return DEFAULT_ERROR_MESSAGE;
  }
}