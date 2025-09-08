import { Component, Injectable, inject } from '@angular/core';
import { signalState, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap } from 'rxjs';

import { ComponentsState, initialState } from './components.state';
import { SupabaseService } from '../../../core/services/supabase.service';
import { ComponentCreatePayload, ComponentUpdatePayload } from '../../../core/models/database.type';

@Injectable()
export class ComponentsService {
  private supabase = inject(SupabaseService);
  
  // Creazione dello stato con signalState
  readonly state = signalState<ComponentsState>(initialState);

  // Metodo asincrono per caricare i componenti usando rxMethod (Regola #3.2)
  readonly loadAll = rxMethod<void>(
    pipe(
      switchMap(async () => {
        patchState(this.state, { isLoading: true, error: null });
        const client = await this.supabase.getClient();
        const { data, error } = await client
          .from('components')
          .select('*')
          .eq('status', 'Approvato');
        
        if (error) {
          // L'errore viene gestito qui e propagato allo stato
          patchState(this.state, { error: error.message, isLoading: false, components: [] });
        } else {
          // Successo: aggiorna lo stato
          patchState(this.state, { components: data, isLoading: false });
        }
      })
    )
  );

  readonly loadById = rxMethod<string>(
    pipe(
      switchMap(async (id) => {
        patchState(this.state, { isLoading: true, error: null, selectedComponent: null });
        
        const client = await this.supabase.getClient();
        const { data, error } = await client
          .from('components')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          patchState(this.state, {
            error: `Componente non trovato o errore nel caricamento: ${error.message}`,
            isLoading: false
          });
        } else {
          patchState(this.state, { selectedComponent: data, isLoading: false });
        }
      })
    )
  );

  readonly create = rxMethod<ComponentCreatePayload>(
    pipe(
      switchMap(async (newComponent) => {
        patchState(this.state, { isLoading: true, error: null });
        
        const client = await this.supabase.getClient();
        // Aggiungiamo i campi mancanti che il backend si aspetta (anche se alcuni sono default)
        const payload = {
          ...newComponent,
        };

        const { data, error } = await client
          .from('components')
          .insert(payload)
          .select()
          .single();

        if (error) {
          patchState(this.state, { error: `Errore nella creazione: ${error.message}`, isLoading: false });
          // Lancia l'errore per poterlo catturare nel componente se necessario
          throw error;
        } else {
          // Successo: possiamo aggiornare lo stato e navigare
          patchState(this.state, { selectedComponent: data, isLoading: false });
          // In futuro, potremmo aggiungere il nuovo componente alla lista `components`
          // per non doverla ricaricare. Esempio:
          // patchState(this.state, state => ({ components: [...state.components, data] }));
        }
      })
    )
  );

  readonly update = rxMethod<ComponentUpdatePayload & { id: string }>( // Si aspetta un oggetto con l'ID
    pipe(
      switchMap(async (componentToUpdate) => {
        patchState(this.state, { isLoading: true, error: null });
        
        const { id, ...payload } = componentToUpdate;
        
        const client = await this.supabase.getClient();
        const { data, error } = await client
          .from('components')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          patchState(this.state, { error: `Errore nell'aggiornamento: ${error.message}`, isLoading: false });
          throw error;
        } else {
          patchState(this.state, { selectedComponent: data, isLoading: false });
          // Aggiorna anche la lista principale se il componente era presente
          patchState(this.state, state => ({
            components: state.components.map(c => c.id === id ? data : c)
          }));
        }
      })
    )
  );

  public clearSelectedComponent(): void {
    patchState(this.state, { selectedComponent: null });
  }
}