// Tipo enumerativo per lo stato di un componente, replicando il tipo ENUM di PostgreSQL.
export type ComponentStatus = 'In Revisione' | 'Approvato' | 'Respinto';

// Interfaccia principale per un Componente.
// Riflette fedelmente la struttura della tabella 'components' di Supabase.
export type Component = {
  id: string; // UUID generato da Supabase
  name: string;
  readme: string | null; // Può essere NULL in DB, quindi deve esserlo anche qui
  author_id: string; // UUID dell'autore, FK a profiles.id
  status: ComponentStatus;
  
  angular_version: string;
  dependencies: Record<string, string> | null; // JSONB in DB, mappato a un oggetto TS
                                               // es. { "@angular/material": "17.0.0" }
  code_html: string | null;
  code_ts: string | null;
  code_css: string | null;
  
  preview_screenshot_url: string | null; // URL su Supabase Storage
  
  created_at: string; // TIMESTAMPTZ in DB, stringa ISO in JS
  updated_at: string; // TIMESTAMPTZ in DB, stringa ISO in JS
}

// Tipo per la creazione di un componente (quando non ha ancora un ID o timestamps)
// Utilizza `Omit` per derivare dall'interfaccia principale ma rimuovendo campi autogenerati.
export type ComponentCreatePayload = Omit<Component, 'id' | 'status' | 'created_at' | 'updated_at'>;

// Tipo per l'aggiornamento di un componente (tutti i campi sono opzionali)
// Utilizza `Partial` per rendere tutti i campi opzionali.
export type ComponentUpdatePayload = Partial<Component>;