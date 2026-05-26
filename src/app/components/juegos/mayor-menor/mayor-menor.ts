import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-mayor-menor',
  imports: [CommonModule],
  templateUrl: './mayor-menor.html',
  styleUrl: './mayor-menor.css',
})

export class MayorMenor implements OnInit{
  cartaActual: number = 0;
  cartaSiguiente: number = 0;
  puntaje: number = 0;
  mensaje: string = '';
  juegoActivo: boolean = false;
  revelando = signal<boolean>(false);

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.reiniciarJuego();
  }

  reiniciarJuego() {
    this.cartaActual = this.obtenerCarta();
    this.juegoActivo = true;
    this.puntaje = 0;
    this.mensaje = '';
    this.revelando.set(false);
  }

  obtenerCarta(): number {
    return Math.floor(Math.random() * 12) + 1;
  }

  async adivinarCarta(opcion: 'mayor' | 'menor') {

    if (!this.juegoActivo) {
      return;
    }

    this.cartaSiguiente = this.obtenerCarta();
    this.revelando.set(true);

    const esMayor = this.cartaSiguiente > this.cartaActual;
    const esMenor = this.cartaSiguiente < this.cartaActual;

    // Evaluo si el jugador acertó
    const acerto = (opcion === 'mayor' && esMayor) || (opcion === 'menor' && esMenor);

    if (acerto) {
      this.puntaje++;
      this.mensaje = '¡Correcto!';
    } else {
      this.mensaje = 'Incorrecto. Fin del juego.';
    }

    // Pauso la ejecución por 1 segundo
    // Esto le da tiempo al usuario de ver la carta renderizada en el HTML (?
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.revelando.set(false);

    if (acerto) {
      this.cartaActual = this.cartaSiguiente;
      this.mensaje = '';
    } else {
      this.juegoActivo = false;
    }
  }

  async salir(){
    // Redirigir a la página de inicio
    if(this.puntaje > 0){
      await this.authService.guardarPuntaje('mayor-menor', this.puntaje);
      //ir al home
      this.router.navigate(['']);
    }
    // Redirigir a la página de inicio
    this.router.navigate(['']);
  }
}
