import { Routes } from '@angular/router';

export const routes: Routes = [

  { path: 'home', loadComponent: () => import('./components/home/home').then(archivo => archivo.Home) },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/login/login').then(archivo => archivo.Login) },
  { path: 'registro', loadComponent: () => import('./components/registro/registro').then(archivo => archivo.Registro) },
  { path: 'quienSoy', loadComponent: () => import('./components/quien-soy/quien-soy').then(archivo => archivo.QuienSoy) },

];
