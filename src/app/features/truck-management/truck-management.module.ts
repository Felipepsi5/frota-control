import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/truck-list/truck-list.component').then(m => m.TruckListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./components/truck-form/truck-form.component').then(m => m.TruckFormComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./components/truck-form/truck-form.component').then(m => m.TruckFormComponent)
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatDialogModule
  ],
  providers: []
})
export class TruckManagementModule { }
