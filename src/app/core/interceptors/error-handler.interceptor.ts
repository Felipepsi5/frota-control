import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {
  constructor(private snackBar: MatSnackBar) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ocorreu um erro inesperado.';

        if (error.error instanceof ErrorEvent) {
          // Erro do cliente
          errorMessage = `Erro: ${error.error.message}`;
        } else {
          // Erro do servidor
          switch (error.status) {
            case 400:
              errorMessage = 'Dados inválidos. Verifique as informações enviadas.';
              break;
            case 401:
              errorMessage = 'Não autorizado. Faça login novamente.';
              break;
            case 403:
              errorMessage = 'Acesso negado. Você não tem permissão para esta ação.';
              break;
            case 404:
              errorMessage = 'Recurso não encontrado.';
              break;
            case 500:
              errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
              break;
            case 0:
              errorMessage = 'Erro de conexão. Verifique sua internet.';
              break;
            default:
              errorMessage = `Erro ${error.status}: ${error.message}`;
          }
        }

        // Exibir mensagem de erro
        this.snackBar.open(errorMessage, 'Fechar', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });

        return throwError(() => error);
      })
    );
  }
}
