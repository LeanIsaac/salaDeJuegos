import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

interface Respuesta {
  id: number;
  created_at: string;
  nombre: string;
  apellido: string;
  edad: number;
  telefono: string;
  pregunta1: string;
  pregunta2: string; // JSON string
  pregunta3: string;
  id_usuario: string | null;
}

interface Juego {
  key: string;
  label: string;
}

@Component({
  selector: 'app-encuesta-resultados',
  imports: [CommonModule],
  templateUrl: './encuesta-resultados.html',
  styleUrl: './encuesta-resultados.css',
})
export class EncuestaResultados implements OnInit {

  private authService = inject(AuthService);

  cargando   = signal(false);
  respuestas = signal<Respuesta[]>([]);
  expandida  = signal<number | null>(null); // id de la fila expandida

  readonly juegos: Juego[] = [
    { key: 'blackjack',   label: 'Blackjack'     },
    { key: 'ahorcado',    label: 'Ahorcado'       },
    { key: 'preguntados', label: 'Preguntados'    },
    { key: 'mayorMenor',  label: 'Mayor o Menor'  },
  ];

  async ngOnInit() {
    this.cargando.set(true);
    const { data, error } = await this.authService.supabase
      .from('encuestas')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) this.respuestas.set(data as Respuesta[]);
    this.cargando.set(false);
  }

  toggleExpandir(id: number) {
    this.expandida.set(this.expandida() === id ? null : id);
  }

  parsearJuegos(json: string): string {
    try {
      const obj = JSON.parse(json) as Record<string, boolean>;
      const seleccionados = this.juegos
        .filter(j => obj[j.key])
        .map(j => j.label);
      return seleccionados.length ? seleccionados.join(', ') : 'Ninguno';
    } catch {
      return '—';
    }
  }

  formatearFecha(iso: string): string {
    return new Date(iso).toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
}
