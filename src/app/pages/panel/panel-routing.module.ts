import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PanelComponent } from './panel.component';

const routes: Routes = [
  {
    path: '', component: PanelComponent,
    children: [
      {
        path: '', redirectTo: 'inicio', pathMatch: 'full'
      },
      {
        path: 'inicio',
        loadChildren: () => import('./inicio/inicio.module')
          .then(i => i.InicioModule)
      },
      {
        path: 'usuarios',
        loadChildren: () => import('./usuarios/usuarios.module')
          .then(i => i.UsuariosModule)
      },
      {
        path: 'discapacidades',
        loadChildren: () => import('./discapacidades/discapacidades.module')
          .then(i => i.DiscapacidadesModule)
      },
      {
        path: 'perritos',
        loadChildren: () => import('./perritos/perritos.module')
          .then(i => i.PerritosModule)
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PanelRoutingModule { }
