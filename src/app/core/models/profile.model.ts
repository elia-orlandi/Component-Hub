// Tipo enumerativo per il ruolo dell'utente, replicando il tipo ENUM di PostgreSQL.
export type UserRole = 'Sviluppatore' | 'Admin';

// Interfaccia per il profilo utente.
// Collega l'ID dell'utente autenticato (auth.users) al suo ruolo e username.
export type Profile = {
  id: string; // UUID, FK a auth.users.id
  username: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// Tipo per la creazione di un profilo (usato raramente, Supabase Auth lo gestisce quasi)
export type ProfileCreatePayload = Omit<Profile, 'created_at' | 'updated_at' | 'username'> & {
  username?: string; // Rendiamo username opzionale per la creazione
};

// Tipo per l'aggiornamento di un profilo
export type ProfileUpdatePayload = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;