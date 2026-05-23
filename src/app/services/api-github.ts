import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IUserGithub } from '../models/github.interface';

@Injectable({
  providedIn: 'root',
})
export class ApiGithub {
  httpClient = inject(HttpClient);

  usuario = 'leanIsaac';
  apiGithub = 'https://api.github.com/users/';
  usuarioGithub = signal<IUserGithub | null>(null);

  getUserGithub(){
    const peticion = this.httpClient.get(this.apiGithub+this.usuario);

    const suscripcion = peticion.subscribe((data) => {
      if(data){
        // console.log(data);
        this.usuarioGithub.set(data as IUserGithub);
      }
      suscripcion.unsubscribe();
    });
  }
}
