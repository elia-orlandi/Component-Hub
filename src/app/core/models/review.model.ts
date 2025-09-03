export type ReviewDecision = 'Approvato' | 'Respinto';

export interface Review {
  id: string; // UUID
  component_id: string; // FK a components.id
  reviewer_id: string; // FK a profiles.id
  decision: ReviewDecision;
  comments: string | null; // Obbligatorio se decision è 'Respinto'
  created_at: string;
}

// Per la creazione, ID, reviewer_id e created_at vengono gestiti dal backend/supabase.
// Il frontend invia solo i dati rilevanti.
export type ReviewCreatePayload = Omit<Review, 'id' | 'reviewer_id' | 'created_at'>;