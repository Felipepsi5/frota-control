import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { JwtAuthService } from '../services/jwt-auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private jwtAuthService = inject(JwtAuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    console.log('AuthGuard: Verificando autenticação para rota:', state.url);
    
    const token = this.jwtAuthService.getToken();
    console.log('AuthGuard: Token encontrado:', !!token);
    
    return this.jwtAuthService.isAuthenticated().pipe(
      take(1),
      map(isAuthenticated => {
        console.log('AuthGuard: Usuário autenticado:', isAuthenticated);
        
        if (isAuthenticated) {
          return true;
        } else {
          console.log('AuthGuard: Redirecionando para login');
          // Redirecionar para login se não estiver autenticado
          this.router.navigate(['/login'], { 
            queryParams: { returnUrl: state.url } 
          });
          return false;
        }
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  private jwtAuthService = inject(JwtAuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.jwtAuthService.canAccess('admin').pipe(
      take(1),
      map(canAccess => {
        if (canAccess) {
          return true;
        } else {
          // Redirecionar para dashboard se não for admin
          this.router.navigate(['/dashboard']);
          return false;
        }
      })
    );
  }
}
