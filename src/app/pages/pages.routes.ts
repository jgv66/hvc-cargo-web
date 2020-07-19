
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AccountSettingsComponent } from './account-settings/account-settings.component';

import { LoginGuardGuard } from '../services/guards/login-guard.guard';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { EncomiendasComponent } from './encomiendas/encomiendas.component';

const pagesRoutes: Routes = [
    {   path: '',
        component: PagesComponent,
        canActivate: [ LoginGuardGuard ],
        children: [
            { path: 'dashboard',         component: DashboardComponent       , data: { titulo: '' } },
            { path: 'encomiendas',       component: EncomiendasComponent     , data: { titulo: 'Registro de Encomiendas' } },
            { path: 'account-settings',  component: AccountSettingsComponent , data: { titulo: 'Ajustes del Tema' } },
            { path: 'usuarios',          component: UsuariosComponent        , data: { titulo: 'Usuarios' } },
            { path: '',                  redirectTo: '/dashboard'            , pathMatch: 'full' }
        ]
    },
];

export const PAGES_ROUTES = RouterModule.forChild( pagesRoutes );
