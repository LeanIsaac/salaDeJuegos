import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, ResultadoJuego } from '../../services/auth.service';

type NombreJuego = 'ahorcado' | 'mayor-menor' | 'preguntados' | 'blackjack';

interface FilaTabla {
  nombre: string;
  puntaje: number;
}

@Component({
  selector: 'app-resultados',
  imports: [CommonModule],
  templateUrl: './resultados.html',
  styleUrl: './resultados.css',
})
export class Resultados implements OnInit {

  authService = inject(AuthService);

  cargando = signal<boolean>(false);

  ahorcado    = signal<FilaTabla[]>([]);
  mayorMenor  = signal<FilaTabla[]>([]);
  preguntados = signal<FilaTabla[]>([]);
  blackjack   = signal<FilaTabla[]>([]);

  readonly juegos: { key: NombreJuego; label: string }[] = [
    { key: 'ahorcado',    label: 'Ahorcado'      },
    { key: 'mayor-menor', label: 'Mayor o Menor'  },
    { key: 'preguntados', label: 'Preguntados'    },
    { key: 'blackjack',   label: 'Blackjack'      },
  ];

  async ngOnInit() {
    this.cargando.set(true);
    const todos = await this.authService.traerPuntajes();
    this.procesarResultados(todos);
    this.cargando.set(false);
  }

  private procesarResultados(datos: ResultadoJuego[]): void {
    // Agrupa por juego y sumar puntaje por usuario
    const mapas: Record<NombreJuego, Map<string, FilaTabla>> = {
      ahorcado:    new Map(),
      'mayor-menor': new Map(),
      preguntados: new Map(),
      blackjack:   new Map(),
    };

    for (const fila of datos) {
      const juego = fila.juego as NombreJuego;
      if (!mapas[juego]) continue;

      const nombre = `${fila.usuarios.nombre} ${fila.usuarios.apellido}`;
      const actual = mapas[juego].get(fila.id_usuario);

      if (actual) {
        actual.puntaje += fila.puntaje;
      } else {
        mapas[juego].set(fila.id_usuario, { nombre, puntaje: fila.puntaje });
      }
    }

    // Ordena cada juego de mayor a menor puntaje
    const ordenar = (m: Map<string, FilaTabla>) =>
      Array.from(m.values()).sort((a, b) => b.puntaje - a.puntaje);

    this.ahorcado.set(ordenar(mapas.ahorcado));
    this.mayorMenor.set(ordenar(mapas['mayor-menor']));
    this.preguntados.set(ordenar(mapas.preguntados));
    this.blackjack.set(ordenar(mapas.blackjack));
  }

  getFilas(juego: NombreJuego): FilaTabla[] {
    switch (juego) {
      case 'ahorcado':    return this.ahorcado();
      case 'mayor-menor': return this.mayorMenor();
      case 'preguntados': return this.preguntados();
      case 'blackjack':   return this.blackjack();
    }
  }
}
