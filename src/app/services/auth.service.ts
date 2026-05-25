import { inject, Injectable, OnInit, signal, WritableSignal } from '@angular/core';
import { createClient, AuthResponse, User, UserResponse, SupabaseClient } from '@supabase/supabase-js';
import { Router } from '@angular/router';
import { environment } from '../../environments/environments';
import { Iregistro, Ilogin } from '../models/auth.interface';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  supabase: SupabaseClient<any, 'public', 'public', any, any>;

  usuarioActual = signal<User | null>(null);

  constructor() {
    // Inicializar Supabase con las credenciales de environment
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey)

    this.supabase.auth.onAuthStateChange((event, session) =>{
      const user = session?.user; // Obtener el usuario actual
      this.usuarioActual.set(user ?? null); // Establecer el usuario actual

      if(!user){
        this.router.navigateByUrl('');
      }

      if(user){ // Si hay usuario, redirigir a la página principal
        this.router.navigateByUrl('');
      }

    });
  }

  async registrar(data: Iregistro) :Promise<void> {
    // Registrar usuario
    const response: AuthResponse = await this.supabase?.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data:{
          nombre: data.nombre,
          apellido: data.apellido,
          edad: data.edad
        }
      }
    });

    if (response.error) {
      //console.log(response.error);
      if(response.error.message === 'User already registered'){
        this.mostrarAlertaError('Registro Fallido', 'El usuario ya se encuentra registrado.');
      } else {
        this.mostrarAlertaError('Registro Fallido', response.error.message);
      }
      return; // corto la ejecucion si hubo un error en auth
    }

    const usuarioAutenticado = response.data.user;

    if (usuarioAutenticado) {
      const { error: insertError } = await this.supabase
        .from('usuarios')
        .insert({
          id: usuarioAutenticado.id, // <-- Uso el UUID generado por Auth
          email: data.email,
          nombre: data.nombre,
          apellido: data.apellido,
          edad: data.edad
        });

      if (insertError) {
        console.error('Error al guardar datos públicos:', insertError.message);
        this.mostrarAlertaError('Error de perfil', 'Te registraste pero no se pudo crear tu perfil público.');
        return;
      }
    }
    // Si todo salió bien, actualizo el estado y redirijo
    console.log(response.data);
    this.usuarioActual.set(response.data.user);
    this.router.navigateByUrl('');
  }

  async loguear({email, password}: Ilogin) :Promise<void>{
    // Loguear usuario
    const response: AuthResponse = await this.supabase?.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (response.error) {
      console.log(response.error);
      this.mostrarAlertaError('Login Fallido', response.error.message);
      //mostrar el error en concreto
      console.log(response.error.message);
    } else {
      console.log(response.data);
      this.usuarioActual.set(response.data.user);
      this.mostrarAlertaExito('Login Exitoso', 'Has iniciado sesión correctamente');
      this.router.navigateByUrl('');
    }
  }

  router = inject(Router);

  cerrarSesion(){
    this.supabase?.auth.signOut()
    this.usuarioActual.set(null);
    this.mostrarAlertaExito('Sesión cerrada', 'Has cerrado sesión correctamente');
    this.router.navigateByUrl('');
  }

  private mostrarAlertaError(titulo: string, mensaje: string) {
    Swal.fire({
      title: titulo,
      background: '#1e1e1e',
      color: '#fff',
      text: mensaje,
      icon: 'error',
      timer: 2000,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#dc3545',
      heightAuto: false
    });
  }

  private mostrarAlertaExito(titulo: string, mensaje: string) {
    Swal.fire({
      position: "top-end",
      background: '#1e1e1e',
      color: '#fff',
      toast: true,
      timerProgressBar: true,
      icon: "success",
      title: titulo,
      text: mensaje,
      showConfirmButton: false,
      timer: 1500
    });
  }

}
