import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./manage-categories.component').then(c => c.ManageCategoriesComponent),
  }
] as Routes;
