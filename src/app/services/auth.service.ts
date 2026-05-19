import { inject, Injectable, OnInit, signal, WritableSignal } from '@angular/core';
import { createClient, AuthResponse, User, UserResponse, SupabaseClient } from '@supabase/supabase-js';
import { Router } from '@angular/router';
import { environment } from '../../environments/environments';
import { Iregistro, Ilogin } from '../models/auth.interface';

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
      const user = session?.user;
      this.usuarioActual.set(user ?? null);

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
      console.log(response.error);
    } else {
      console.log(response.data);
      this.usuarioActual.set(response.data.user);
      this.router.navigateByUrl('/auth');
    }
  }

  async loguear({email, password}: Ilogin) :Promise<void>{
    // Loguear usuario
    const response: AuthResponse = await this.supabase?.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (response.error) {
      console.log(response.error);
    } else {
      console.log(response.data);
      this.usuarioActual.set(response.data.user);
      this.router.navigateByUrl('/auth');
    }
  }

  router = inject(Router);

  cerrarSesion(){
    this.supabase?.auth.signOut()
    this.usuarioActual.set(null);
    this.router.navigateByUrl('/auth/login');
  }

}
