import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/entry-history/entry-history.component').then(m => m.EntryHistoryComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./components/entry-form/entry-form.component').then(m => m.EntryFormComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./components/entry-form/entry-form.component').then(m => m.EntryFormComponent)
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class FinancialEntriesModule { }
