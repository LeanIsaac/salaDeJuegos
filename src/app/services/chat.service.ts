import { Injectable, signal } from "@angular/core";
import { AuthService } from "./auth.service";
import { Mensaje } from "../models/mensajes.interface";

@Injectable({
  providedIn: 'root'
})
export class ChatService{

  mensajes = signal<Mensaje[]>([]);

  constructor(private authService: AuthService) {
    this.cargarMensajes();
    this.escucharMensajes();
  }

  async cargarMensajes() {
    const { data } = await this.authService.supabase.from('mensajes').select(`*, usuarios(nombre, email)`).order('created_at', { ascending: true });

    if(data) this.mensajes.set(data as Mensaje[]);
  }

  escucharMensajes(){
    this.authService.supabase.channel('mensajes').on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'mensajes'
    }, async() => {
       await this.cargarMensajes();
    }).subscribe();
  }

  async enviarMensaje(contenido: string) {
    const usuario = this.authService.usuarioActual();
    console.log('Usuario actual:', usuario?.email);
    if (!usuario || !contenido.trim()) {
      return;
    }

    const { error } = await this.authService.supabase
      .from('mensajes')
      .insert({
        contenido: contenido,
        id_usuario: usuario.id // Vinculamos con la clave foránea
      });

    if (error) {
      console.error('Error al insertar el mensaje:', error.message);
    }
  }

}
