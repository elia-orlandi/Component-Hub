import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

// Custom validator per controllare che le password corrispondano
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  return password && confirmPassword && password.value !== confirmPassword.value ? { passwordMismatch: true } : null;
};

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordComponent {
  public authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private errorHandler = inject(ErrorHandlerService);

  public formError = signal<string | null>(null);
  public successMessage = signal<string | null>(null);
  
  // Segnali per mostrare/nascondere password
  public showPassword = signal<boolean>(false);
  public showConfirmPassword = signal<boolean>(false);

  public resetForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: passwordMatchValidator });

  async onResetPassword(): Promise<void> {
    if (this.resetForm.invalid) return;
    this.clearMessages();

    try {
      const { password } = this.resetForm.getRawValue();
      // 1. Aggiorna la password dell'utente. A questo punto, Supabase lo logga.
      await this.authService.updatePassword(password!);

      // 2. Mostra immediatamente il messaggio di successo all'utente.
      this.successMessage.set('Password aggiornata con successo!');

      // 3. Invalida la sessione che Supabase ha appena creato.
      await this.authService.signOut();
      
      // 4. Countdown timer prima del redirect
      let countdown = 3;
      const timer = setInterval(() => {
        this.successMessage.set(`Verrai reindirizzato al login tra ${countdown}...`);
        countdown--;
        
        if (countdown < 0) {
          clearInterval(timer);
          this.router.navigate(['/auth/login']);
        }
      }, 1000);

    } catch (error: any) {
      const friendlyMessage = this.errorHandler.mapSupabaseError(error);
      this.formError.set(friendlyMessage);
    }
  }

  private clearMessages(): void {
    this.formError.set(null);
    this.successMessage.set(null);
  }

  public togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  public toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }
}