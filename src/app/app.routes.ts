import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Rotte di autenticazione (pubbliche)
  {
    path: 'auth/login',
    // Lazy-load del componente di login
    loadComponent: () => import('./feature/auth/login/login.component').then(c => c.LoginComponent)
  },
  {
    path: 'auth/reset-password',
    loadComponent: () => import('./feature/auth/reset-password/reset-password.component').then(c => c.ResetPasswordComponent)
  },
  // Rotte protette che usano la Shell
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard], // Applica la guardia a tutte le rotte figlie
    children: [
      {
        path: '',
        redirectTo: 'library', // La rotta di default protetta è la libreria
        pathMatch: 'full'
      },
      {
        path: 'library',
        // Lazy-load della feature 'library' (che creeremo nel prossimo step)
        loadComponent: () => import('./feature/library/library.component').then(c => c.LibraryComponent)
      },
      // ... altre rotte protette qui (es. 'my-components', 'admin-dashboard')
    ]
  },

  // Rotta di fallback
  { path: '**', redirectTo: 'library' }
];