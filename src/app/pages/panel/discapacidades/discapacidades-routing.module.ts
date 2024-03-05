import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DiscapacidadesComponent } from './discapacidades.component';
import { AuthGuard } from 'src/app/core/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: DiscapacidadesComponent,
    canActivate: [AuthGuard], data: { claimType: 'CanAccessDiscapacidades'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DiscapacidadesRoutingModule { }
