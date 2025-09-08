import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  HostListener
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserProfileMenuComponent } from '../../ui/user-profile-menu/user-profile-menu.component';

@Component({
  selector: 'app-header',
  standalone: true,
  // Le dipendenze dichiarano i moduli e i componenti utilizzati nel template
  imports: [
    RouterLink,
    RouterLinkActive,
    UserProfileMenuComponent
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  public authService = inject(AuthService);
  private router = inject(Router);

  // Segnale per gestire lo stato del menu mobile.
  // Questa è l'unica logica di stato interna al componente.
  public isMobileMenuOpen = signal(false);

  /**
   * Ascolta l'evento di resize della finestra.
   * Se la finestra viene allargata oltre la soglia mobile,
   * il menu mobile viene chiuso per evitare stati UI incoerenti.
   */
  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 768 && this.isMobileMenuOpen()) {
      this.isMobileMenuOpen.set(false);
    }
  }

  /**
   * Inverte lo stato del segnale `isMobileMenuOpen`.
   * Chiamato dal pulsante hamburger/close.
   */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
  }

  /**
   * Chiude il menu mobile.
   * Chiamato quando si clicca su un link di navigazione nel menu mobile,
   * per un'esperienza utente fluida.
   */
  closeMobileMenu(): void {
    if (this.isMobileMenuOpen()) {
      this.isMobileMenuOpen.set(false);
    }
  }

  /**
   * Naviga alla pagina di aggiunta componente.
   * Questa azione è disponibile sia sul pulsante desktop che sul FAB (nello ShellComponent).
   */
  onAddComponent(): void {
    // Chiudi il menu mobile se l'azione viene da lì
    this.closeMobileMenu();
    // Naviga alla rotta appropriata (assicurati che esista in app.routes.ts)
    this.router.navigate(['/components/new']);
  }
}