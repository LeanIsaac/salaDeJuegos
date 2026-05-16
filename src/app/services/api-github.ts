import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiGithub {
  httpClient = inject(HttpClient);

  usuario = 'leanIsaac';
  apiGithub = 'https://api.github.com/users/';
  usuarioGithub = signal<any | null>(null);

  getUserGithub(){
    const peticion = this.httpClient.get(this.apiGithub+this.usuario);

    const suscripcion =peticion.subscribe((data) => {
      if(data){
        console.log(data);
        this.usuarioGithub.set(data);
      }
      suscripcion.unsubscribe();
    });
  }
}
