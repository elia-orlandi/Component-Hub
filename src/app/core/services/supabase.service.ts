import { Injectable, signal } from '@angular/core';
import { createClient, Session, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Database } from '../models/database.type';
import { SessionStorageAdapter } from './storage.adapter';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private _client: SupabaseClient<Database> | null = null;
  private authChangeCallback: ((event: string, session: Session | null) => void) | null = null;
  private initializationPromise: Promise<void> | null = null;
  
  public async getClient(): Promise<SupabaseClient<Database>> {
    if (!this.initializationPromise) {
      // Se per qualche motivo l'inizializzazione non è partita, falla partire ora
      this.initializeClientOnLoad();
    }
    await this.initializationPromise;
    return this._client!;
  }

  
  constructor() {
    this.initializeClientOnLoad();
  }

  private initializeClientOnLoad(): void {
    this.initializationPromise = (async () => {
      try {
        console.log("Avvio del controllo della sessione esistente...");
        
        // 1. Crea un client "sonda" solo per controllare localStorage
        const probeClient = createClient(environment.supabaseUrl!, environment.supabaseKey!);
        
        // 2. Chiedi al client sonda se esiste una sessione
        const { data: { session: persistentSession } } = await probeClient.auth.getSession();

        if (persistentSession) {
          // 3a. Se c'è una sessione, inizializza il client definitivo in modalità persistente
          console.log("Sessione persistente trovata. Inizializzo il client in modalità localStorage.");
          this.initializeClient(true);
        } else {
          // 3b. Altrimenti, controlliamo anche sessionStorage per completezza
          const volatileProbeClient = createClient(environment.supabaseUrl!, environment.supabaseKey!, {
            auth: { storage: SessionStorageAdapter }
          });
          const { data: { session: volatileSession } } = await volatileProbeClient.auth.getSession();
          
          if (volatileSession) {
            console.log("Nessuna sessione persistente, ma trovata sessione volatile. Inizializzo in modalità sessionStorage.");
            this.initializeClient(false);
          } else {
            console.log("Nessuna sessione trovata. Inizializzo in modalità persistente di default.");
            this.initializeClient(true); // Default a persistente se non c'è nessuna sessione
          }
        }
      } catch (error) {
        console.error("Errore durante l'inizializzazione del client Supabase:", error);
        this.initializeClient(true); // Fallback
      }
    })();
  }

  public initializeClient(persistent: boolean): void {
    console.log(`Creazione del client con storage: ${persistent ? 'localStorage' : 'sessionStorage'}`);
    
    const storageOptions = persistent ? {} : { storage: SessionStorageAdapter };

    this._client = createClient<Database>(
      environment.supabaseUrl!,
      environment.supabaseKey!,
      { auth: { ...storageOptions, persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
    );

    if (this.authChangeCallback) {
      this._client.auth.onAuthStateChange(this.authChangeCallback);
    }
  }
  
  public onAuthStateChange(callback: (event: string, session: Session | null) => void): void {
    this.authChangeCallback = callback;
    if (this._client) {
      this._client.auth.onAuthStateChange(this.authChangeCallback);
    }
  }
}