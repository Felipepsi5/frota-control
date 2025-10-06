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
              // Bad Request: Dados inválidos ou validação falhou
              errorMessage = error.error?.message || 'Dados inválidos. Verifique as informações enviadas.';
              break;
            case 401:
              // Unauthorized: Token inválido ou expirado
              errorMessage = 'Sessão expirada. Faça login novamente.';
              // TODO: Implementar redirecionamento para login
              break;
            case 403:
              // Forbidden: Usuário não tem permissão (role insuficiente)
              errorMessage = 'Acesso negado. Você não tem permissão para esta ação.';
              break;
            case 404:
              // Not Found: Recurso não encontrado
              errorMessage = 'Recurso não encontrado.';
              break;
            case 409:
              // Conflict: Conflito (ex: placa já existe)
              errorMessage = error.error?.message || 'Conflito de dados. Verifique se os dados já existem no sistema.';
              break;
            case 422:
              // Unprocessable Entity: Erro de validação específico
              errorMessage = error.error?.message || 'Erro de validação. Verifique os dados enviados.';
              break;
            case 500:
              // Internal Server Error
              errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
              break;
            case 0:
              // Network Error
              errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
              break;
            default:
              // Outros códigos de erro
              errorMessage = error.error?.message || `Erro ${error.status}: ${error.message}`;
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
