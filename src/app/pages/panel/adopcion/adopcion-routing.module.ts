import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdopcionComponent } from './adopcion.component';
import { AuthGuard } from 'src/app/core/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: AdopcionComponent,
    canActivate: [AuthGuard], data: { claimType: 'CanAccessAdopciones'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdopcionRoutingModule { }
