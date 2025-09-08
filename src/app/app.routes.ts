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
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'components',
        pathMatch: 'full'
      },
      {
        path: 'components',
        loadChildren: () => import('./feature/components/components.routes').then(r => r.COMPONENTS_ROUTES)
      },
      {
        path: 'my-components',
        // In futuro, questa rotta potrà passare un dato per filtrare
        // es: data: { filter: 'currentUser' }
        loadChildren: () => import('./feature/components/components.routes').then(r => r.COMPONENTS_ROUTES)
      }
    ]
  },
  { path: '**', redirectTo: 'components' }
];