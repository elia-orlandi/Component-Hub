// src/app/core/mappers/supabase-error.mapper.ts

// Mappa basata sui codici di errore ufficiali di Supabase Auth.
// La chiave è il 'code' restituito nell'oggetto AuthApiError.
// Vedi: https://supabase.com/docs/reference/javascript/auth-signup (e altre API) per i codici specifici

export const SUPABASE_ERROR_CODE_MAP: Record<string, string> = {
    // Codici HTTP come fallback
    '400': 'La tua richiesta non è valida. Controlla i dati inseriti.',
    '401': 'Non sei autorizzato a compiere questa azione.',
    '404': 'La risorsa richiesta non è stata trovata.',
    '422': 'I dati inviati non possono essere processati.',
    '429': 'Troppi tentativi. Riprova tra qualche istante.',
    '500': 'Si è verificato un errore sul server. Riprova più tardi.',
  
    // Codici di Errore Specifici di Supabase Auth
    'invalid_credentials': 'Email o password non validi.',
    'user_already_exists': 'Esiste già un utente con questa email.',
    'weak_password': 'La password è troppo debole. Prova una più complessa.',
    'rate_limit_exceeded': 'Hai superato il limite di richieste. Riprova più tardi.',
    'validation_failed': 'I dati inseriti non sono validi.',
  };
  
  // Messaggio di fallback generico
  export const DEFAULT_ERROR_MESSAGE = 'Si è verificato un errore inaspettato. Riprova più tardi.';