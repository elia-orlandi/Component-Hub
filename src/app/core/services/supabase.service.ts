import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

// Importa tutti i tipi di dominio per una migliore tipizzazione del database
import { Component, ComponentCreatePayload, ComponentUpdatePayload, ComponentStatus } from '../models/component.model';
import { Profile, UserRole, ProfileCreatePayload, ProfileUpdatePayload } from '../models/profile.model';
import { Tag, TagCreatePayload, TagUpdatePayload } from '../models/tag.model';
import { Review, ReviewCreatePayload, ReviewDecision } from '../models/review.model';

// Definizione del tipo di database per Supabase Client.
// Questo rende il client fortemente tipizzato e aiuta con l'autocompletamento e gli errori a compile-time.
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileCreatePayload;
        Update: ProfileUpdatePayload;
      };
      components: {
        Row: Component;
        Insert: ComponentCreatePayload;
        Update: ComponentUpdatePayload;
      };
      tags: {
        Row: Tag;
        Insert: TagCreatePayload;
        Update: TagUpdatePayload;
      };
      reviews: {
        Row: Review;
        Insert: ReviewCreatePayload;
        Update: ReviewCreatePayload; // Update è come Insert per le reviews (non si modificano dopo)
      };
      component_tags: { // Tabella di giunzione
        Row: { component_id: string; tag_id: number };
        Insert: { component_id: string; tag_id: number };
        Update: { component_id: string; tag_id: number };
      };
    };
    Enums: {
      user_role: UserRole;
      component_status: ComponentStatus;
      review_decision: ReviewDecision;
    };
    Functions: {
      get_my_role: {
        Returns: UserRole;
      };
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  // L'istanza del client Supabase fortemente tipizzata
  public client: SupabaseClient<Database>;

  constructor() {
    // Inizializza il client Supabase con le variabili d'ambiente.
    // L'uso di `createClient` è l'API ufficiale (Regola #1).
    if (!environment.supabaseUrl || !environment.supabaseKey) {
      // Regola #7: Gestione errori robusta; non esporre raw details.
      // In produzione, si loggherebbe a Sentry e si mostrerebbe un messaggio generico.
      console.error('Supabase URL or Key not set in environment.ts!');
      throw new Error('Supabase configuration missing. Cannot initialize application.');
    }
    this.client = createClient<Database>(environment.supabaseUrl, environment.supabaseKey);
  }

  // Puoi aggiungere metodi helper qui per query comuni,
  // ma per l'MVP, esporre direttamente 'client' è sufficiente per la maggior parte delle operazioni.
  // Esempio:
  // getComponents(status: ComponentStatus = 'Approvato') {
  //   return this.client.from('components').select('*').eq('status', status);
  // }
}