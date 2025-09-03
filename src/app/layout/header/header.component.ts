import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necessario per ngIf, ma useremo @if
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  // Inietta il servizio di autenticazione per accedere ai segnali
  public authService = inject(AuthService);

  // Metodo per gestire il logout, che chiama il servizio
  onSignOut(): void {
    this.authService.signOut();
  }
}