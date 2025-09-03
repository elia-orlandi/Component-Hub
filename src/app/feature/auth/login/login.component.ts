import { Component, inject, effect, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  public authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  
  public loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  // Segnale per gestire i messaggi di errore dal servizio
  public authError = signal<string | null>(null);
  public successMessage = signal<string | null>(null); // Per feedback

  constructor() {
    // Effetto per reindirizzare l'utente se si autentica con successo
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.router.navigate(['/']); // Reindirizza alla home page protetta
      }
    });
  }
  async onLogin(): Promise<void> {
    if (this.loginForm.invalid) return; // Blocca se il form non è valido
    this.authError.set(null); // Resetta l'errore precedente

    try {
      const formValue = this.loginForm.getRawValue();
      const credentials = {
        email: formValue.email!,
        password: formValue.password!
      };
      await this.authService.signInWithEmail(credentials);
    } catch (error: any) {
      this.authError.set(error.message || 'Si è verificato un errore.');
    }
  }

  async onSignUp(): Promise<void> {
    if (this.loginForm.invalid) return;
    this.authError.set(null);
    
    try {
      const formValue = this.loginForm.getRawValue();
      const credentials = {
        email: formValue.email!,
        password: formValue.password!
      };
      await this.authService.signUp(credentials);
      // Potresti voler mostrare un messaggio di successo o di "controlla la mail"
      this.authError.set('Registrazione avvenuta! Ora puoi effettuare il login.');
    } catch (error: any) {
      this.authError.set(error.message || 'Si è verificato un errore.');
    }
  }

  async onSendResetLink(): Promise<void> {
    // Usiamo solo il campo email del form
    const emailControl = this.loginForm.get('email');
    if (emailControl?.invalid) {
      this.authError.set('Per favore, inserisci un indirizzo email valido.');
      return;
    }
    
    this.authError.set(null);
    this.successMessage.set(null);

    try {
      await this.authService.sendPasswordResetEmail(emailControl!.value!);
      this.successMessage.set('Link inviato! Controlla la tua casella di posta.');
    } catch (error: any) {
      this.authError.set(error.message || 'Si è verificato un errore.');
    }
  }
}