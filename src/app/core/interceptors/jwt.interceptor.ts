import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { JwtAuthService } from '../services/jwt-auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private jwtAuthService: JwtAuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Adicionar token apenas para requisições da API
    if (this.shouldAddToken(request)) {
      const token = this.jwtAuthService.getToken();
      
      if (token) {
        request = this.addTokenToRequest(request, token);
      }
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Se for erro 401 e tiver token, tentar refresh
        if (error.status === 401 && this.shouldAddToken(request)) {
          return this.handle401Error(request, next);
        }
        
        return throwError(() => error);
      })
    );
  }

  /**
   * Verifica se a requisição deve ter token adicionado
   */
  private shouldAddToken(request: HttpRequest<any>): boolean {
    // Adicionar token apenas para requisições da nossa API
    return request.url.includes('/api/') && !request.url.includes('/auth/login');
  }

  /**
   * Adiciona o token JWT ao header Authorization
   */
  private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  /**
   * Trata erro 401 (Unauthorized) tentando refresh do token
   */
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.jwtAuthService.refreshUserInfo().pipe(
        switchMap((user) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(user);
          
          // Repetir a requisição original com o novo token
          const token = this.jwtAuthService.getToken();
          if (token) {
            request = this.addTokenToRequest(request, token);
          }
          
          return next.handle(request);
        }),
        catchError((error) => {
          this.isRefreshing = false;
          this.jwtAuthService.logout().subscribe();
          return throwError(() => error);
        })
      );
    }

    // Se já está fazendo refresh, aguardar o resultado
    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(() => {
        const token = this.jwtAuthService.getToken();
        if (token) {
          request = this.addTokenToRequest(request, token);
        }
        return next.handle(request);
      })
    );
  }
}
