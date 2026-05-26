import { Component, signal , computed, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-ahorcado',
  imports: [CommonModule],
  templateUrl: './ahorcado.html',
  styleUrl: './ahorcado.css',
})
export class Ahorcado implements OnInit {
  palabrasDisponibles = signal<string[]>([
    'ANGULAR',
    'JAVASCRIPT',
    'TYPESCRIPT',
    'HTML',
    'CSS',
    'REACT',
    'VUE',
  ]);
  palabraActual = signal('');

  letrasSeleccionadas = signal<string[]>([]);
  letrasIncorrectas = signal<string[]>([]);
  letrasAdivinadas = signal<string[]>([]);

  puntaje = signal(0);
  mejorPuntaje = signal(0);

  cantLetrasSeleccionadas = signal(0);
  errores = signal(0);
  maxErrores = 6;
  cantVidasRestantes = computed(() => this.maxErrores - this.errores());

  abecedario = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    console.log('vidas restantes: ' + (this.maxErrores));
    this.puntaje.set(0);
    this.palabraActual.set(this.obtenerPalabraRandom());
  }
  seleccionarLetra(letra: string) {
    if (this.letrasSeleccionadas().includes(letra)) return;

    this.letrasSeleccionadas.update((actual) => [...actual, letra]);
    this.cantLetrasSeleccionadas.update((actual) => actual + 1);

    if (this.palabraActual().includes(letra)) {
      // Letra correcta
      this.letrasAdivinadas.update((actual) => [...actual, letra]);
      this.puntaje.update((actual) => actual + 10);

      if (this.gano()) {
        // Math.max ya se encarga de dejar el valor más alto, no hace falta el if extra.
        this.mejorPuntaje.update((actual) => Math.max(actual, this.puntaje()));
      }
    } else {
      // Letra incorrecta
      this.letrasIncorrectas.update((actual) => [...actual, letra]);

      // sumo el error
      this.errores.update((valor) => valor + 1);

      // verifo si perdió
      if (this.perdio()) {
        this.mejorPuntaje.update((actual) => Math.max(actual, this.puntaje()));

        // Eliminamos this.puntaje.set(0) de acá para que el usuario pueda ver su puntaje final.
      }
    }
    // console.log('letras adivinadas: ' + this.letrasAdivinadas().length);
    // console.log('letras incorrectas: ' + this.letrasIncorrectas().length);
    // console.log('vidas restantes: ' + this.cantVidasRestantes());
  }

  gano(): boolean {
    return this.palabraActual()
      .split('')
      .every((letra) => this.letrasSeleccionadas().includes(letra));
  }

  perdio(): boolean {
    return this.errores() >= this.maxErrores;
  }

  siguientePalabra() {
    this.errores.set(0);
    this.letrasSeleccionadas.set([]);
    this.letrasIncorrectas.set([]);
    this.letrasAdivinadas.set([]);

    this.palabraActual.set(this.obtenerPalabraRandom());
  }

  reiniciarJuego() {
    // Reseteo el puntaje a 0 porque es una partida nueva
    this.puntaje.set(0);

    //Llamo al otro método para que limpie el tablero y traiga la palabra
    this.siguientePalabra();
  }

  obtenerPalabraRandom(): string {
    const indice = Math.floor(Math.random() * this.palabrasDisponibles().length);

    return this.palabrasDisponibles()[indice];
  }

  async salir(){
    const puuntaje = this.mejorPuntaje();
    if(puuntaje !== 0){
      await this.authService.guardarPuntaje('ahorcado', puuntaje);
      //ir al home
      this.router.navigate(['']);
    }
    // Redirigir a la página de inicio
    this.router.navigate(['']);
  }
}
