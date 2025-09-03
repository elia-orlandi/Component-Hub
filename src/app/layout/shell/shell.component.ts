import { ChangeDetectionStrategy, Component, inject, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShellComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    // Questo effect si attiva quando il componente viene creato
    // e riesegue ogni volta che uno dei segnali al suo interno cambia.
    effect(() => {
      // Se il segnale isAuthenticated() diventa false...
      if (!this.authService.isAuthenticated()) {
        // ...e l'utente si trova ancora nell'area protetta (dove vive questo componente),
        // allora lo reindirizziamo forzatamente alla pagina di login.
        this.router.navigate(['/auth/login']);
      }
    });
  }
}