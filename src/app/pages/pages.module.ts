import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PAGES_ROUTES } from './pages.routes';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// material modules
import { MaterialModule } from './../material.module';

import { PagesComponent } from './pages.component';
import { SharedModule } from '../shared/shared.module';

import { DashboardComponent } from './dashboard/dashboard.component';
import { AccountSettingsComponent } from './account-settings/account-settings.component';
import { EditalineaComponent } from '../components/editalinea/editalinea.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { EncomiendasComponent } from './encomiendas/encomiendas.component';

@NgModule({
    declarations: [
        PagesComponent,
        DashboardComponent,
        AccountSettingsComponent,
        EditalineaComponent,
        UsuariosComponent,
        EncomiendasComponent
    ],
    exports: [
        DashboardComponent,
        EditalineaComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        PAGES_ROUTES,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
    ]
})
export class PagesModule { }
