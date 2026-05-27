import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { AuthService } from './auth.service';

export type Palo = '♠' | '♥' | '♦' | '♣';
export type ValorCarta = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Carta {
  valor: ValorCarta;
  palo: Palo;
  oculta?: boolean;
}

export type EstadoJuego = 'inicio' | 'jugando' | 'dealer' | 'finalizado';
export type ResultadoRonda = 'victoria' | 'derrota' | 'empate' | 'blackjack' | null;

const PALOS: Palo[] = ['♠', '♥', '♦', '♣'];
const VALORES: ValorCarta[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

@Injectable({ providedIn: 'root' })
export class BlackjackService {

constructor() {
  effect(() => {
    const usuario = this.authService.usuarioActual();

    // Cada vez que cambia el usuario (login, logout), resetear
    this.puntajeTotal.set(0);
    this.puntaje.set(0);
    this.victorias.set(0);
    this.partidas.set(0);
    this.estado.set('inicio');
  });
}

  // Inyectar servicio de autenticación
  private authService = inject(AuthService);

  // Estado
  manoJugador = signal<Carta[]>([]);
  manoDealer = signal<Carta[]>([]);
  estado = signal<EstadoJuego>('inicio');
  resultado = signal<ResultadoRonda>(null);
  puntaje = signal<number>(0);
  partidas = signal<number>(0);
  victorias = signal<number>(0);

  private mazo: Carta[] = [];

  // Computed para calcular puntajes
  puntajeJugador = computed(() => this.calcularPuntaje(this.manoJugador()));
  puntajeDealer  = computed(() => this.calcularPuntaje(
    this.manoDealer().map(c => ({ ...c, oculta: false }))
  ));

  puntajeDealerVisible = computed(() => this.calcularPuntaje(
    this.manoDealer().filter(c => !c.oculta)
  ));
  // calcular porcentaje de victoriass
  porcentajeVictorias = computed(() =>
    this.partidas() === 0 ? 0 : Math.round((this.victorias() / this.partidas()) * 100)
  );

  // Acciones
  iniciarPartida(): void {
    this.mazo = this.generarMazo();
    this.manoJugador.set([]);
    this.manoDealer.set([]);
    this.resultado.set(null);
    this.estado.set('jugando');

    // Repartir 2 cartas a cada uno (??????)
    // (segunda del dealer oculta)
    setTimeout(() => {
      this.manoJugador.update(m => [...m, this.sacarCarta()]);
      setTimeout(() => {
        this.manoDealer.update(m => [...m, this.sacarCarta()]);
        setTimeout(() => {
          this.manoJugador.update(m => [...m, this.sacarCarta()]);
          setTimeout(() => {
            this.manoDealer.update(m => [...m, { ...this.sacarCarta(), oculta: true }]);
            // Verificar blackjack natural
            if (this.puntajeJugador() === 21) {
              this.turnoDealer(true);
            }
          }, 300);
        }, 300);
      }, 300);
    }, 100);
  }

  pedirCarta(): void {
    if (this.estado() !== 'jugando') return;
    this.manoJugador.update(m => [...m, this.sacarCarta()]);

    if (this.puntajeJugador() > 21) {
      this.turnoDealer(false);
    } else if (this.puntajeJugador() === 21) {
      this.turnoDealer(false);
    }
  }

  plantarse(): void {
    if (this.estado() !== 'jugando') return;
    this.turnoDealer(false);
  }

  // Lógica interna
  private turnoDealer(esBlackjackJugador: boolean): void {
    this.estado.set('dealer');

    // Revelar carta oculta
    this.manoDealer.update(m => m.map(c => ({ ...c, oculta: false })));

    const jugarDealer = () => {
      const puntajeJ = this.puntajeJugador();
      const puntajeD = this.puntajeDealer();

      if (puntajeJ > 21) {
        this.finalizarRonda(esBlackjackJugador);
        return;
      }

      if (puntajeD < 17) {
        setTimeout(() => {
          this.manoDealer.update(m => [...m, this.sacarCarta()]);
          jugarDealer();
        }, 600);
      } else {
        this.finalizarRonda(esBlackjackJugador);
      }
    };

    setTimeout(jugarDealer, 700);
  }

  puntajeTotal = signal<number>(0);  // acumulado de toda la sesión (nunca se resetea)

  private async finalizarRonda(esBlackjackJugador: boolean): Promise<void> {
    const pJ = this.puntajeJugador();
    const pD = this.puntajeDealer();
    this.partidas.update(p => p + 1);

    let res: ResultadoRonda;

    if (pJ > 21) {
      res = 'derrota';
    } else if (pD > 21) {
      res = esBlackjackJugador ? 'blackjack' : 'victoria';
    } else if (esBlackjackJugador && pJ === 21 && this.manoJugador().length === 2) {
      res = pD === 21 ? 'empate' : 'blackjack';
    } else if (pJ > pD) {
      res = 'victoria';
    } else if (pJ < pD) {
      res = 'derrota';
    } else {
      res = 'empate';
    }

    if (res === 'victoria' || res === 'blackjack') {
      this.victorias.update(v => v + 1);
      this.puntaje.update(p => p + (res === 'blackjack' ? 3 : 2));
    } else if (res === 'empate') {
      this.puntaje.update(p => p + 1);
    }

    let ganado = 0;

    if (res === 'blackjack') ganado = 3;
    else if (res === 'victoria') ganado = 2;
    else if (res === 'empate')   ganado = 1;

    if (ganado > 0) {
      this.victorias.update(v => v + 1);
      this.puntaje.update(p => p + ganado);
      this.puntajeTotal.update(p => p + ganado);  // ✅ acumula
    }

    this.resultado.set(res);
    this.estado.set('finalizado');
  }

  guardarYSalir(): void {
    if (this.puntajeTotal() > 0) {
      this.authService.guardarPuntaje('blackjack', this.puntajeTotal());
    }
    this.puntajeTotal.set(0);  // resetea por si vuelve a jugar
    this.estado.set('inicio');
  }

  private calcularPuntaje(cartas: Carta[]): number {
    let total = 0;
    let ases = 0;

    for (const carta of cartas) {
      if (carta.oculta) continue;
      if (['J', 'Q', 'K'].includes(carta.valor)) {
        total += 10;
      } else if (carta.valor === 'A') {
        total += 11;
        ases++;
      } else {
        total += parseInt(carta.valor, 10);
      }
    }

    while (total > 21 && ases > 0) {
      total -= 10;
      ases--;
    }

    return total;
  }

  private generarMazo(): Carta[] {
    const mazo: Carta[] = [];
    for (const palo of PALOS) {
      for (const valor of VALORES) {
        mazo.push({ valor, palo });
      }
    }
    // Fisher-Yates shuffle = significa: barajar
    for (let i = mazo.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // indice aleatorio
      [mazo[i], mazo[j]] = [mazo[j], mazo[i]]; // intercambiar
    }
    return mazo;
  }

  private sacarCarta(): Carta {
    if (this.mazo.length === 0) {
      this.mazo = this.generarMazo();
    }
    return this.mazo.pop()!;
  }
}
