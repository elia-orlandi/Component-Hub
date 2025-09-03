import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, skipWhile } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Usiamo toObservable per convertire il segnale in un Observable
  // e skipWhile per attendere che lo stato sia inizializzato.
  return toObservable(authService.isInitialized).pipe(
    skipWhile(isInitialized => !isInitialized), // Aspetta che onAuthStateChange sia stato eseguito almeno una volta
    map(() => {
      if (authService.isAuthenticated()) {
        return true; // Utente autenticato, permette l'accesso
      }
      // Utente non autenticato, reindirizza alla pagina di login
      return router.createUrlTree(['/auth/login']);
    })
  );
};