import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // INYECTO SERVICIO DE AUTENTICACIÓN
  authService = inject(AuthService);
  protected readonly title = signal('salaDeJuegos');
}
