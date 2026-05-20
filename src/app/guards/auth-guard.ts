import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);


  const {data} = await authService.supabase.auth.getUser(); // busco si el usuario inicio sesion

  if(data.user) {
    return true;
  }
  else{
    return router.navigate(['/login']);
  }
};
