import { Component, signal , computed} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ahorcado',
  imports: [CommonModule],
  templateUrl: './ahorcado.html',
  styleUrl: './ahorcado.css',
})
export class Ahorcado {
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

  cantLetrasSeleccionadas = signal(0);
  errores = signal(0);
  maxErrores = 6;
  cantVidasRestantes = computed(() => this.maxErrores - this.errores());

  abecedario = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

  constructor() {
    console.log('vidas restantes: ' + (this.maxErrores));
    this.reiniciarJuego();
    // console.log(this.palabraActual());
  }

  seleccionarLetra(letra: string) {
    if (this.letrasSeleccionadas().includes(letra)) return;

    this.letrasSeleccionadas.update((actual) => [...actual, letra]);

    this.cantLetrasSeleccionadas.update((actual) => actual + 1);
    console.log(this.cantLetrasSeleccionadas());


    if (this.palabraActual().includes(letra)) {
      this.letrasAdivinadas.update((actual) => [...actual, letra]);
    } else {
      this.letrasIncorrectas.update((actual) => [...actual, letra]);

      this.errores.update((valor) => valor + 1);
    }

    console.log('letras adivinadas: ' + this.letrasAdivinadas().length);
    console.log('letras incorrectas: ' + this.letrasIncorrectas().length);
    console.log('vidas restantes: ' + this.cantVidasRestantes());


  }

  gano(): boolean {
    return this.palabraActual()
      .split('')
      .every((letra) => this.letrasSeleccionadas().includes(letra));
  }

  perdio(): boolean {
    return this.errores() >= this.maxErrores;
  }

  reiniciarJuego() {
    this.errores.set(0);

    this.letrasSeleccionadas.set([]);

    this.letrasIncorrectas.set([]);

    this.letrasAdivinadas.set([]);

    this.palabraActual.set(this.obtenerPalabraRandom());

    console.log(this.palabraActual());
  }

  obtenerPalabraRandom(): string {
    const indice = Math.floor(Math.random() * this.palabrasDisponibles().length);

    return this.palabrasDisponibles()[indice];
  }
}
