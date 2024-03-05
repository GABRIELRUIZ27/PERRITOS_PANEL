import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DiscapacidadesRoutingModule } from './discapacidades-routing.module';
import { DiscapacidadesComponent } from './discapacidades.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [
    DiscapacidadesComponent
  ],
  imports: [
    CommonModule,
    DiscapacidadesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    NgSelectModule,
  ]
})
export class DiscapacidadesModule { }
