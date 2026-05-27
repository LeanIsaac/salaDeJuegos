import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// Validador custom: solo dígitos
function soloNumeros(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  return /^\d+$/.test(control.value) ? null : { soloNumeros: true };
}

// Validador custom: al menos un checkbox marcado
function alMenosUno(group: AbstractControl): ValidationErrors | null {
  const vals = Object.values((group as FormGroup).controls);
  return vals.some(c => c.value === true) ? null : { ningunoSeleccionado: true };
}

@Component({
  selector: 'app-encuesta',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './encuesta.html',
  styleUrl: './encuesta.css',
})
export class Encuesta {

  private authService = inject(AuthService);
  private router      = inject(Router);

  enviando = signal(false);
  enviado  = signal(false);

  encuestaForm = new FormGroup({
    // Datos personales
    nombre: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
    ]),
    apellido: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
    ]),
    edad: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(18),
      Validators.max(99),
    ]),
    numeroDeTelefono: new FormControl('', [
      Validators.required,
      Validators.maxLength(10),
      soloNumeros,
    ]),

    // Pregunta 1: radio— ¿Te gustó la página?
    pregunta1: new FormControl('', Validators.required),

    // Pregunta 2: checkboxes — ¿Qué juegos te gustaron?
    pregunta2: new FormGroup({
      blackjack:   new FormControl(false),
      ahorcado:    new FormControl(false),
      preguntados: new FormControl(false),
      mayorMenor:  new FormControl(false),
    }, { validators: alMenosUno }),

    // Pregunta 3: textarea ¿Qué mejorarías?
    pregunta3: new FormControl('', [
      Validators.required,
      Validators.minLength(10),
    ]),
  });

  // Helpers para el template, sirve para acceder a los controles del formulario
  c(name: string) { return this.encuestaForm.get(name)!; }

  errorMsg(name: string): string {
    const ctrl = this.c(name);
    if (!ctrl.touched || ctrl.valid) return '';
    if (ctrl.errors?.['required'])    return 'Este campo es requerido.';
    if (ctrl.errors?.['minlength'])   return `Mínimo ${ctrl.errors['minlength'].requiredLength} caracteres.`;
    if (ctrl.errors?.['min'])         return 'Debe ser mayor de 18 años.';
    if (ctrl.errors?.['max'])         return 'Debe ser menor de 99 años.';
    if (ctrl.errors?.['maxlength'])   return 'Máximo 10 dígitos.';
    if (ctrl.errors?.['soloNumeros']) return 'Solo se permiten números.';
    return '';
  }

  // Envío
  async enviar() {
    this.encuestaForm.markAllAsTouched();
    if (this.encuestaForm.invalid) return;

    this.enviando.set(true);
    const v = this.encuestaForm.value;

    const { error } = await this.authService.supabase
      .from('encuestas')
      .insert({
        id_usuario: this.authService.usuarioActual()?.id ?? null,
        nombre:     v.nombre,
        apellido:   v.apellido,
        edad:       v.edad,
        telefono:   v.numeroDeTelefono,
        pregunta1:  v.pregunta1,
        pregunta2:  JSON.stringify(v.pregunta2),
        pregunta3:  v.pregunta3,
      });

    this.enviando.set(false);

    if (error) {
      console.error(error.message);
    } else {
      this.enviado.set(true);
    }
  }

  volver() {
    this.router.navigateByUrl('');
  }
}
