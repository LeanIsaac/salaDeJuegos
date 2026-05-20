import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Ilogin } from '../../models/auth.interface';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})

export class Login {
  authService = inject(AuthService);

  formulario = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  accion(){
    this.authService.loguear(this.formulario.value as Ilogin);
  }

  inicioRapido(user: string){
    switch(user) {

      case 'user1':
        this.formulario.get('email')?.setValue('user@prueba.com');
        this.formulario.get('password')?.setValue('qwerty');
        break;

      case 'user2':
        this.formulario.get('email')?.setValue('mario@g.com');
        this.formulario.get('password')?.setValue('asdfgh');
        break;

      case 'user3':
        this.formulario.get('email')?.setValue('mora@gmail.com');
        this.formulario.get('password')?.setValue('elmascrack');
        break;
    }
  }
}

