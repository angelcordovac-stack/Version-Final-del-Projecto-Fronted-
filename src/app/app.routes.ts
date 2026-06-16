import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { InicioSesion } from './components/inicio-sesion/inicio-sesion';
import { Dashboard } from './components/dashboard/dashboard';
import { InicioDash } from './components/dashboard/inicio-dash';
import { MantenimientoUsuarios } from './components/gestion-mantenimiento/mantenimiento-usuarios/mantenimiento-usuarios';
import { GestionIncidencias } from './components/gestion-incidencias/gestion-incidencias';
import { GestionRepuestos } from './components/gestion-repuestos/gestion-repuestos';
import { DiccionarioFallas } from './components/diccionario-fallas/diccionario-fallas';

import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/module.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: InicioSesion },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', component: InicioDash },
      {
        path: 'MantenimientoUsuarios',
        component: MantenimientoUsuarios,
        canActivate: [roleGuard(['JEFE'])],
      },
      {
        path: 'GestionIncidencias',
        component: GestionIncidencias,
        canActivate: [roleGuard(['JEFE', 'TECNICO', 'SISTEMAS'])],
      },
      {
        path: 'GestionRepuestos',
        component: GestionRepuestos,
        canActivate: [roleGuard(['JEFE', 'TECNICO', 'SISTEMAS'])],
      },
      {
        path: 'DiccionarioFallas',
        component: DiccionarioFallas,
        canActivate: [roleGuard(['JEFE', 'TECNICO', 'SISTEMAS'])],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];