import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlackjackService, Carta } from '../../../services/blackjack.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-blackjack',
  imports: [CommonModule],
  templateUrl: './blackjack.html',
  styleUrl: './blackjack.css',
})
export class Blackjack {
  private router = inject(Router);
  bj = inject(BlackjackService);

  esRoja(carta: Carta): boolean {
    return carta.palo === '♥' || carta.palo === '♦';
  }

  //mapeo las signals a strings para el template
  get mensajeResultado(): string {
    switch (this.bj.resultado()) {
      case 'blackjack': return '¡BLACKJACK!';
      case 'victoria':  return '¡Ganaste!';
      case 'derrota':   return 'El dealer gana';
      case 'empate':    return 'Empate';
      default:          return '';
    }
  }

  get claseResultado(): string {
    switch (this.bj.resultado()) {
      case 'blackjack': return 'res-blackjack';
      case 'victoria':  return 'res-victoria';
      case 'derrota':   return 'res-derrota';
      case 'empate':    return 'res-empate';
      default:          return '';
    }
  }

  trackCarta(index: number, carta: Carta): string {
    return `${carta.valor}${carta.palo}${index}`;
  }

  // En blackjack.ts
  salir() {
    this.bj.guardarYSalir();
    this.router.navigateByUrl('');
  }
}

