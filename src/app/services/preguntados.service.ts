import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Character } from '../models/preguntados.interface';
import { AuthService } from './auth.service';
export const TOTAL_PREGUNTAS = 10;
const TOTAL_PERSONAJES_API = 200; // cantidad de personajes en la API de attack on titan

export interface Pregunta {
  personaje: Character;
  opciones: string[]; // 4 nombres, uno es el correcto
  correcta: string;
}

export type EstadoJuego = 'inicio' | 'jugando' | 'respondida' | 'finalizado';

@Injectable({
  providedIn: 'root',
})
export class PreguntadosService {
  http = inject(HttpClient);

  private apiUrl = 'https://api.attackontitanapi.com/characters';

  constructor(private authSrv: AuthService) {
    effect(() => {
    const usuario = this.authSrv.usuarioActual();
    // Cada vez que cambia el usuario, resetear todo
    this.reiniciar();
    // this.puntajeTotal.set(0);
    });
  }

  // Estado del juego
  preguntas = signal<Pregunta[]>([]);
  preguntaActualIndex = signal<number>(0);
  puntaje = signal<number>(0);
  estadoJuego = signal<EstadoJuego>('inicio');
  ultimaRespuestaCorrecta = signal<boolean | null>(null);
  cargando = signal<boolean>(false);

  // Computadas
  preguntaActual = computed(() => this.preguntas()[this.preguntaActualIndex()]);
  esUltimaPregunta = computed(() => this.preguntaActualIndex() === TOTAL_PREGUNTAS - 1);

  async iniciarJuego() {
    this.cargando.set(true);
    this.puntaje.set(0);
    this.preguntaActualIndex.set(0);
    this.ultimaRespuestaCorrecta.set(null);
    this.estadoJuego.set('jugando');

    try {
      const personajes = await this.obtenerPersonajesRandom(TOTAL_PREGUNTAS + 3); // extra por si acaso
      const preguntas = this.armarPreguntas(personajes);
      this.preguntas.set(preguntas);
    } catch (error) {
      console.error('Error cargando personajes', error);
    } finally {
      this.cargando.set(false);
    }
  }

  responder(nombre: string) {
    const pregunta = this.preguntaActual();
    if (!pregunta || this.estadoJuego() !== 'jugando') return;

    const esCorrecta = nombre === pregunta.correcta;
    this.ultimaRespuestaCorrecta.set(esCorrecta);
    if (esCorrecta) {
      this.puntaje.update(p => p + 1);
    }
    this.estadoJuego.set('respondida');
  }

  async siguientePregunta() {
    if (this.esUltimaPregunta()) {
      this.estadoJuego.set('finalizado');
      if (this.puntaje() > 0) {
        await this.authSrv.guardarPuntaje('preguntados', this.puntaje());
      }
      return;
    }
    this.preguntaActualIndex.update(i => i + 1);
    this.ultimaRespuestaCorrecta.set(null);
    this.estadoJuego.set('jugando');
  }

  private async obtenerPersonajesRandom(cantidad: number): Promise<Character[]> {
    // Genera IDs únicos al azar dentro del rango de la API
    const ids = this.generarIdsRandom(cantidad, 1, TOTAL_PERSONAJES_API);
    const idsStr = ids.join(','); //

    return new Promise((resolve, reject) => {
      this.http.get<Character | Character[]>(`${this.apiUrl}/${idsStr}`)
        .subscribe({
          next: (resp) => {
            const lista = Array.isArray(resp) ? resp : [resp];
            // Filtrar personajes sin imagen válida
            const conImagen = lista.filter(p => p.img && p.img.startsWith('http'));
            resolve(conImagen);
          },
          error: reject,
        });
    });
  }

  private armarPreguntas(personajes: Character[]): Pregunta[] {
    // Necesitamos al menos TOTAL_PREGUNTAS personajes
    const disponibles = [...personajes].slice(0, TOTAL_PREGUNTAS);
    const todosLosNombres = personajes.map(p => p.name);

    return disponibles.map((personaje) => {
      const correcta = personaje.name;

      // Obtener 3 nombres incorrectos al azar
      const incorrectos = todosLosNombres
        .filter(n => n !== correcta)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      // Mezclar las 4 opciones
      const opciones = [correcta, ...incorrectos].sort(() => Math.random() - 0.5);

      return { personaje, opciones, correcta };
    });
  }

  private generarIdsRandom(cantidad: number, min: number, max: number): number[] {
    const ids = new Set<number>();
    while (ids.size < cantidad) {
      ids.add(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return Array.from(ids);
  }

  reiniciar() {
    this.preguntas.set([]);
    this.preguntaActualIndex.set(0);
    this.puntaje.set(0);
    this.ultimaRespuestaCorrecta.set(null);
    this.estadoJuego.set('inicio');
  }
}

