import { Component, inject, effect, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { SignInOptions } from '../../../core/models/auth.model';

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
  private errorHandler = inject(ErrorHandlerService);
  
  public loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [true]
  });

  // Segnale per gestire i messaggi di errore dal servizio
  public authError = signal<string | null>(null);
  public successMessage = signal<string | null>(null); // Per feedback
  
  // Segnale per tracciare la modalità corrente (login o registrazione)
  public isSignUpMode = signal<boolean>(false);
  
  // Segnale per mostrare/nascondere password
  public showPassword = signal<boolean>(false);

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
    this.clearMessages();

    try {
      const formValue = this.loginForm.getRawValue();
      const credentials = {
        email: formValue.email!,
        password: formValue.password!
      };
      const options: SignInOptions = {
        rememberMe: !!formValue.rememberMe
      };
      await this.authService.signInWithEmail(credentials, options);

    } catch (error: any) {
      const friendlyMessage = this.errorHandler.mapSupabaseError(error);
      this.authError.set(friendlyMessage);
    }
  }

  async onSignUp(): Promise<void> {
    if (this.loginForm.invalid) return;
    this.clearMessages();
    
    try {
      const formValue = this.loginForm.getRawValue();
      const credentials = {
        email: formValue.email!,
        password: formValue.password!
      };
      await this.authService.signUp(credentials);
      this.loginForm.reset(); // Svuota il form dopo la registrazione
      this.switchToLoginMode(); // Torna al login dopo registrazione
      this.successMessage.set('Registrazione avvenuta! Ora puoi effettuare il login.');
    } catch (error: any) {
      const friendlyMessage = this.errorHandler.mapSupabaseError(error);
      this.authError.set(friendlyMessage);
    }
  }

  // Metodi per switchare tra modalità login e registrazione
  public switchToSignUpMode(): void {
    this.isSignUpMode.set(true);
    this.clearMessages();
    this.loginForm.reset();
  }

  public switchToLoginMode(): void {
    this.isSignUpMode.set(false);
    this.clearMessages();
    this.loginForm.reset();
  }

  private clearMessages(): void {
    this.authError.set(null);
    this.successMessage.set(null);
  }

  public togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  async onSendResetLink(): Promise<void> {
    // Usiamo solo il campo email del form
    const emailControl = this.loginForm.get('email');
    if (emailControl?.invalid) {
      this.authError.set('Per favore, inserisci un indirizzo email valido.');
      return;
    }
    
    this.clearMessages();

    try {
      await this.authService.sendPasswordResetEmail(emailControl!.value!);
      this.successMessage.set('Link inviato! Controlla la tua casella di posta.');
    } catch (error: any) {
      const friendlyMessage = this.errorHandler.mapSupabaseError(error);
      this.authError.set(friendlyMessage);
    }
  }
}