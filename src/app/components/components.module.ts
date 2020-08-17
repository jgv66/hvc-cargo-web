import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// material modules
import { MaterialModule } from './../material.module';

import { MattableencomiendasComponent } from './mattableencomiendas/mattableencomiendas.component';

@NgModule({
  exports: [MattableencomiendasComponent],
  declarations: [MattableencomiendasComponent],
  imports: [ CommonModule, MaterialModule ]
})
export class ComponentsModule { }
