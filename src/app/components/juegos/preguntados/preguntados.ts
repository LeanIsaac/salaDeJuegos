import { Component, inject } from '@angular/core';
import { PreguntadosService, TOTAL_PREGUNTAS } from '../../../services/preguntados.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-preguntados',
  imports: [CommonModule],
  templateUrl: './preguntados.html',
  styleUrl: './preguntados.css',
})
export class Preguntados {
  preguntadosService = inject(PreguntadosService);
  readonly totalPreguntas = TOTAL_PREGUNTAS;

  get numeroPreguntaActual() {
    return this.preguntadosService.preguntaActualIndex() + 1;
  }

  async empezar() {
    await this.preguntadosService.iniciarJuego();
  }

  responder(opcion: string) {
    this.preguntadosService.responder(opcion);
  }

  siguiente() {
    this.preguntadosService.siguientePregunta();
  }

  getClaseBoton(opcion: string): string {
    const estado = this.preguntadosService.estadoJuego();
    if (estado !== 'respondida') return '';

    const correcta = this.preguntadosService.preguntaActual()?.correcta;
    if (opcion === correcta) return 'correcta';
    return 'incorrecta';
  }
}
