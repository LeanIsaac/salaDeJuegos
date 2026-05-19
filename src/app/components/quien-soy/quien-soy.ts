import { Component, inject } from '@angular/core';
import { ApiGithub } from '../../services/api-github';

@Component({
  selector: 'app-quien-soy',
  imports: [],
  templateUrl: './quien-soy.html',
  styleUrl: './quien-soy.css',
})
export class QuienSoy {
  githubService = inject(ApiGithub);

  ngOnInit() {
    // cuando se carga el componente, se obtiene el usuario de github desde el servicio
    this.githubService.getUserGithub();
  }
}
