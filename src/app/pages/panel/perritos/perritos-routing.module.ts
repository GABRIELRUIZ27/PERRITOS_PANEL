import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PerritosComponent } from './perritos.component';
import { AuthGuard } from 'src/app/core/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: PerritosComponent,
    canActivate: [AuthGuard], data: { claimType: 'CanAccessInicio'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PerritosRoutingModule { }
