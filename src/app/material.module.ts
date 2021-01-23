import { NgModule } from '@angular/core';

import {MatInputModule,
        MatButtonModule,
        MatProgressBarModule,
        MatTableModule,
        MatNativeDateModule,
        MatDatepickerModule,
        MAT_DATE_LOCALE,
        MatListModule,
        MatRadioModule,
} from '@angular/material';

// import { MatButtonModule } from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import {MatSortModule} from '@angular/material';
import {MatCheckboxModule} from '@angular/material/checkbox';

@NgModule({
    providers: [
      {provide: MAT_DATE_LOCALE, useValue: 'es-CL'},
    ],
    imports: [
      MatButtonModule,
      MatInputModule,
      MatSelectModule,
      MatFormFieldModule,
      MatProgressBarModule,
      MatTableModule,
      MatPaginatorModule,
      MatNativeDateModule,
      MatDatepickerModule,
      MatProgressSpinnerModule,
      MatIconModule,
      MatListModule,
      MatSortModule,
      MatCheckboxModule,
      MatRadioModule,
      ],
    exports: [
      MatButtonModule,
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule,
      MatProgressBarModule,
      MatTableModule,
      MatPaginatorModule,
      MatNativeDateModule,
      MatDatepickerModule,
      MatProgressSpinnerModule,
      MatIconModule,
      MatListModule,
      MatSortModule,
      MatCheckboxModule,
      MatRadioModule
    ],
  })

export class MaterialModule {}



