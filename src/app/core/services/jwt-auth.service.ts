import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from '../../domain/models/user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class JwtAuthService {
  private readonly TOKEN_KEY = 'frotacontrol_token';
  private readonly USER_KEY = 'frotacontrol_user';
  
  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });
  
  public authState$ = this.authStateSubject.asObservable();

  constructor(private http: HttpClient) {
    // Verificar se há token salvo no localStorage na inicialização
    this.initializeAuthState();
  }

  /**
   * Realiza login com email e senha
   */
  login(email: string, password: string): Observable<LoginResponse> {
    const loginRequest: LoginRequest = { email, password };
    
    console.log('JwtAuthService.login: Iniciando login para', email);
    console.log('JwtAuthService.login: URL da API:', `${environment.apiUrl}/auth/login`);
    console.log('JwtAuthService.login: Request:', loginRequest);
    
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, loginRequest).pipe(
      tap(response => {
        console.log('JwtAuthService.login: Resposta recebida:', response);
        this.setAuthState(response);
      }),
      catchError(error => {
        console.error('JwtAuthService.login: Erro no login:', error);
        console.error('JwtAuthService.login: Status do erro:', error.status);
        console.error('JwtAuthService.login: Mensagem do erro:', error.message);
        return throwError(() => new Error(this.mapLoginError(error)));
      })
    );
  }

  /**
   * Realiza logout
   */
  logout(): Observable<void> {
    const token = this.getToken();
    
    if (token) {
      return this.http.post<void>(`${environment.apiUrl}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).pipe(
        tap(() => {
          this.clearAuthState();
        }),
        catchError(error => {
          // Mesmo se o logout falhar no servidor, limpar o estado local
          console.warn('Erro no logout do servidor:', error);
          this.clearAuthState();
          return of(void 0);
        })
      );
    }
    
    this.clearAuthState();
    return of(void 0);
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): Observable<boolean> {
    return this.authState$.pipe(
      map(state => {
        const tokenValid = this.isTokenValid();
        const isAuth = state.isAuthenticated && tokenValid;
        console.log('JwtAuthService.isAuthenticated:', { 
          isAuthenticated: state.isAuthenticated, 
          tokenValid, 
          result: isAuth,
          hasToken: !!state.token
        });
        return isAuth;
      })
    );
  }

  /**
   * Obtém o usuário atual
   */
  getCurrentUser(): Observable<User | null> {
    return this.authState$.pipe(
      map(state => state.user)
    );
  }

  /**
   * Obtém o token atual
   */
  getToken(): string | null {
    return this.authStateSubject.value.token;
  }

  /**
   * Verifica se o usuário é admin
   */
  isAdmin(): Observable<boolean> {
    return this.getCurrentUser().pipe(
      map(user => user?.role === 'admin' || false)
    );
  }

  /**
   * Obtém o ID do usuário atual
   */
  getCurrentUserId(): Observable<string | null> {
    return this.getCurrentUser().pipe(
      map(user => user?.id || null)
    );
  }

  /**
   * Verifica se o usuário pode acessar uma funcionalidade baseada na role
   */
  canAccess(requiredRole: 'admin' | 'user'): Observable<boolean> {
    return this.getCurrentUser().pipe(
      map(user => {
        if (!user) return false;
        if (requiredRole === 'admin') return user.role === 'admin';
        return true; // Usuários comuns podem acessar funcionalidades básicas
      })
    );
  }

  /**
   * Atualiza informações do usuário atual
   */
  refreshUserInfo(): Observable<User> {
    const token = this.getToken();
    
    if (!token) {
      return throwError(() => new Error('Token não encontrado'));
    }

    return this.http.get<User>(`${environment.apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap(user => {
        this.updateUser(user);
      }),
      catchError(error => {
        console.error('Erro ao atualizar informações do usuário:', error);
        if (error.status === 401) {
          this.clearAuthState();
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Verifica se o token está válido (não expirado)
   */
  private isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Decodificar o JWT para verificar a expiração
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      return false;
    }
  }

  /**
   * Inicializa o estado de autenticação a partir do localStorage
   */
  private initializeAuthState(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        
        if (this.isTokenValid()) {
          this.authStateSubject.next({
            isAuthenticated: true,
            user,
            token
          });
        } else {
          // Token expirado, limpar estado
          this.clearAuthState();
        }
      } catch (error) {
        console.error('Erro ao inicializar estado de autenticação:', error);
        this.clearAuthState();
      }
    }
  }

  /**
   * Define o estado de autenticação e salva no localStorage
   */
  private setAuthState(loginResponse: LoginResponse): void {
    console.log('JwtAuthService.setAuthState: Definindo estado de autenticação', loginResponse);
    
    const authState: AuthState = {
      isAuthenticated: true,
      user: loginResponse.user,
      token: loginResponse.token
    };

    // Salvar no localStorage
    localStorage.setItem(this.TOKEN_KEY, loginResponse.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(loginResponse.user));
    console.log('JwtAuthService.setAuthState: Dados salvos no localStorage');

    // Atualizar o estado
    this.authStateSubject.next(authState);
    console.log('JwtAuthService.setAuthState: Estado atualizado no BehaviorSubject');
  }

  /**
   * Limpa o estado de autenticação e remove do localStorage
   */
  private clearAuthState(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    this.authStateSubject.next({
      isAuthenticated: false,
      user: null,
      token: null
    });
  }

  /**
   * Atualiza apenas as informações do usuário
   */
  private updateUser(user: User): void {
    const currentState = this.authStateSubject.value;
    const newState: AuthState = {
      ...currentState,
      user
    };

    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.authStateSubject.next(newState);
  }

  /**
   * Mapeia erros de login para mensagens amigáveis
   */
  private mapLoginError(error: any): string {
    console.log('JwtAuthService.mapLoginError: Mapeando erro:', error);
    
    if (error.error?.message) {
      console.log('JwtAuthService.mapLoginError: Usando mensagem do servidor:', error.error.message);
      return error.error.message;
    }

    switch (error.status) {
      case 401:
        return 'Email ou senha incorretos.';
      case 403:
        return 'Usuário desabilitado. Entre em contato com o administrador.';
      case 404:
        return 'Usuário não encontrado.';
      case 429:
        return 'Muitas tentativas de login. Tente novamente mais tarde.';
      case 500:
        return 'Erro interno do servidor. Tente novamente mais tarde.';
      case 0:
        return 'Erro de conexão. Verifique sua internet e tente novamente.';
      default:
        return 'Erro inesperado. Tente novamente.';
    }
  }
}
