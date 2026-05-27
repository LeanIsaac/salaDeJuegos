import { Component, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
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
//AfterViewChecked se ejecuta después de que la vista ha sido actualizada / cada vez que envio un mensaje
export class Chat implements AfterViewChecked{
  @ViewChild('mensajesContainer') mensajesContainer!: ElementRef;
  chatService = inject(ChatService);
  authService = inject(AuthService);
  contenido = '';

  ngAfterViewChecked() {
    this.scrollAbajo();
  }

  scrollAbajo() {
    const el = this.mensajesContainer?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }

  async enviarMensaje() {
    await this.chatService.enviarMensaje(this.contenido);
    this.contenido = ''; // Limpiar el input después de enviar
  }

  esElUsuarioActual(msg: any): boolean {
    return msg.id_usuario === this.authService.usuarioActual()?.id;
  }

}
