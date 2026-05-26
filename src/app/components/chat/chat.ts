import { Component, inject } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat',
  imports: [FormsModule, CommonModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat {
  chatService = inject(ChatService);
  authService = inject(AuthService);
  contenido = '';

  async enviarMensaje() {
    await this.chatService.enviarMensaje(this.contenido);
    this.contenido = ''; // Limpiar el input después de enviar
  }

  esElUsuarioActual(msg: any): boolean {
    return msg.id_usuario === this.authService.usuarioActual()?.id;
  }

}
