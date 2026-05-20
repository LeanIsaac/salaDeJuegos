import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [

  { path: '', loadComponent: () => import('./components/home/home').then(archivo => archivo.Home) },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/login/login').then(archivo => archivo.Login) },
  { path: 'registro', loadComponent: () => import('./components/registro/registro').then(archivo => archivo.Registro) },
  { path: 'quienSoy', loadComponent: () => import('./components/quien-soy/quien-soy').then(archivo => archivo.QuienSoy) },

  {
    path: 'juegos',
    canActivate: [authGuard],
    children:[
      {
        path: 'ahorcado',
        loadComponent: ()=> import('./components/juegos/ahorcado/ahorcado').then(archivo => archivo.Ahorcado)
      },
      {
        path: 'mayorMenor',
        loadComponent: ()=> import('./components/juegos/mayor-menor/mayor-menor').then(archivo => archivo.MayorMenor)
      },
      {
        path: 'preguntados',
        loadComponent: ()=> import('./components/juegos/preguntados/preguntados').then(archivo => archivo.Preguntados)
      },
      {
        path: 'blackjack',
        loadComponent: ()=> import('./components/juegos/blackjack/blackjack').then(archivo => archivo.Blackjack)
      }
    ]
  },

  { path: '**', redirectTo: 'home' },

];
