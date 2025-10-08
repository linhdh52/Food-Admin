import {Routes} from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./manage-discounts.component').then(c => c.ManageDiscountsComponent),
  }
] as Routes;
