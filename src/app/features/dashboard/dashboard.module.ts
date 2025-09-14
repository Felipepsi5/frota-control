import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { DashboardViewComponent } from './components/dashboard-view/dashboard-view.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardViewComponent
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    DashboardViewComponent
  ],
  providers: []
})
export class DashboardModule { }
