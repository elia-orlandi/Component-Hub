import {
  Component,
  ChangeDetectionStrategy,
  input,
  output
} from '@angular/core';
import { DropdownMenuComponent } from '../dropdown-menu/dropdown-menu.component';

// Importa i tipi di Supabase per una tipizzazione più completa
import { User } from '@supabase/supabase-js';
import { Profile } from '../../core/models/database.type';

@Component({
  selector: 'app-user-profile-menu',
  standalone: true,
  // Dipendenze: Usa il nostro dropdown generico e il nuovo control flow
  imports: [DropdownMenuComponent],
  templateUrl: './user-profile-menu.component.html',
  styleUrls: ['./user-profile-menu.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfileMenuComponent {
  /**
   * API Pubblica (Input): Riceve l'oggetto del profilo utente.
   * Può essere `null` se il profilo non è ancora stato caricato.
   */
  profile = input<Profile | null>();

  /**
   * API Pubblica (Input): Riceve l'oggetto User di Supabase per avere l'email come fallback.
   * Può essere `null` se l'utente non è autenticato.
   */
  user = input<User | null>();
  
  /**
   * API Pubblica (Output): Emette un evento quando si clicca sul pulsante di logout.
   * Non contiene dati (`void`), segnala solo che l'azione è avvenuta.
   */
  logoutClicked = output<void>();

  /**
   * Metodo interno chiamato dal template.
   * Inoltra l'evento di click all'esterno tramite l'output.
   */
  onLogout(): void {
    this.logoutClicked.emit();
  }
}