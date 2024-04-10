import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdopcionRoutingModule } from './adopcion-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { AdopcionComponent } from './adopcion.component';
import { DatePipe } from '@angular/common';
import { LOCALE_ID } from '@angular/core';

@NgModule({
  declarations: [
    AdopcionComponent
  ],
  imports: [
    CommonModule,
    AdopcionRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    NgSelectModule,
  ],
  providers: [DatePipe],
})
export class AdopcionModule { }
