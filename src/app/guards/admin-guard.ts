import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const usuario = authService.usuarioActual();

  // Verificar si el usuario tiene el rol de admin en sus metadatos
  // En Supabase, los metadatos del usuario se guardan en app_metadata
  const esAdmin = usuario?.app_metadata?.['role'] === 'admin';

  if (!usuario) {
    router.navigateByUrl('');
    return false;
  }

  if (!esAdmin) {
    router.navigateByUrl('');
    return false;
  }

  return true;
};
