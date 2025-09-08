import { Routes } from '@angular/router';
import { ComponentsService } from './state/components.service';

export const COMPONENTS_ROUTES: Routes = [
  {
    // Aggiungiamo un componente "contenitore" per la rotta padre
    // che fornirà il servizio a tutti i suoi figli.
    path: '',
    providers: [ComponentsService],
    children: [
      {
        path: '', // Corrisponde a '/components'
        loadComponent: () => import('./list/list.component').then(c => c.ListComponent),
      },
      {
        path: 'new',
        loadComponent: () => import('./edit/edit.component').then(c => c.EditComponent),
      },
      {
        path: ':id',
        loadComponent: () => import('./detail/detail.component').then(c => c.DetailComponent),
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./edit/edit.component').then(c => c.EditComponent),
      },
      // Ridirigi la rotta base se l'utente digita solo /components
      // Questo è ridondante se la rotta 'list' è sul path '', ma è una sicurezza in più.
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ]
  }
];