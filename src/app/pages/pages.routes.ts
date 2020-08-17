
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AccountSettingsComponent } from './account-settings/account-settings.component';

import { LoginGuardGuard } from '../services/guards/login-guard.guard';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { EncomiendasComponent } from './encomiendas/encomiendas.component';
import { OtComponent } from './ot/ot.component';
import { InfpickComponent } from './infpick/infpick.component';

const pagesRoutes: Routes = [
    {   path: '',
        component: PagesComponent,
        canActivate: [ LoginGuardGuard ],
        children: [
            { path: 'dashboard',         component: DashboardComponent       , data: { titulo: '' } },
            { path: 'encomiendas',       component: EncomiendasComponent     , data: { titulo: 'Registro de Encomiendas' } },
            { path: 'ot',                component: OtComponent              , data: { titulo: 'Registro de Órdenes de Transporte' } },
            { path: 'infpick',           component: InfpickComponent         , data: { titulo: 'Informe de Encomiendas' } },
            { path: 'account-settings',  component: AccountSettingsComponent , data: { titulo: 'Ajustes del Tema' } },
            { path: 'usuarios',          component: UsuariosComponent        , data: { titulo: 'Usuarios' } },
            { path: '',                  redirectTo: '/dashboard'            , pathMatch: 'full' }
        ]
    },
];

export const PAGES_ROUTES = RouterModule.forChild( pagesRoutes );
