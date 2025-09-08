import {
  Component,
  ChangeDetectionStrategy,
  inject,
  effect
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FabComponent } from '../../pattern/fab/fab.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true, // Aggiunto standalone: true per completezza
  // Le dipendenze sono corrette
  imports: [
    RouterOutlet,
    HeaderComponent,
    FabComponent
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css', // Assicurati sia styleUrls
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShellComponent {
  // Iniezione delle dipendenze usando inject(), come da direttive.
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    /**
     * Effetto reattivo per la sicurezza della sessione.
     * Questo effect si attiva quando il componente viene creato e riesegue
     * ogni volta che il segnale `isAuthenticated` cambia.
     * È il meccanismo che garantisce che un utente la cui sessione scade
     * (o che fa logout da un'altra tab) venga immediatamente reindirizzato.
     */
    effect(() => {
      // Se l'utente non è più autenticato...
      if (!this.authService.isAuthenticated()) {
        // ...reindirizzalo forzatamente alla pagina di login.
        // `replaceUrl: true` è una buona pratica qui per non salvare
        // la pagina protetta nella cronologia del browser dopo il logout.
        this.router.navigate(['/auth/login'], { replaceUrl: true });
      }
    });
  }

  /**
   * Metodo per gestire l'azione primaria (click sul FAB).
   * Questo metodo viene passato come gestore dell'evento `(clicked)`
   * del nostro `app-fab` component nel template.
   */
  onAddComponent(): void {
    // Naviga alla rotta per la creazione di un nuovo componente.
    // Assicurati che questa rotta esista nel tuo file `app.routes.ts`.
    this.router.navigate(['/components/new']);
  }
}