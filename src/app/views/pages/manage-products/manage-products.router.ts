import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./manage-products.component').then(c => c.ManageProductsComponent),
  }
] as Routes;
