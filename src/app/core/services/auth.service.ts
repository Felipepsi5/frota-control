import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { User as AppUser, UserClaims } from '../../domain/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AppUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private auth: Auth) {
    // Observar mudanças no estado de autenticação
    onAuthStateChanged(this.auth, (user: User | null) => {
      if (user) {
        this.currentUserSubject.next(this.mapFirebaseUserToAppUser(user));
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  /**
   * Realiza login com email e senha
   */
  async login(email: string, password: string): Promise<AppUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const appUser = this.mapFirebaseUserToAppUser(userCredential.user);
      this.currentUserSubject.next(appUser);
      return appUser;
    } catch (error: any) {
      throw this.mapFirebaseErrorToMessage(error);
    }
  }

  /**
   * Realiza logout
   */
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.currentUserSubject.next(null);
    } catch (error: any) {
      throw this.mapFirebaseErrorToMessage(error);
    }
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => user !== null)
    );
  }

  /**
   * Obtém o usuário atual
   */
  getCurrentUser(): Observable<AppUser | null> {
    return this.currentUser$;
  }

  /**
   * Verifica se o usuário é admin
   */
  isAdmin(): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => user?.role === 'admin')
    );
  }

  /**
   * Obtém o ID do usuário atual
   */
  getCurrentUserId(): Observable<string | null> {
    return this.currentUser$.pipe(
      map(user => user?.id || null)
    );
  }

  /**
   * Verifica se o usuário pode acessar uma funcionalidade baseada na role
   */
  canAccess(requiredRole: 'admin' | 'user'): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => {
        if (!user) return false;
        if (requiredRole === 'admin') return user.role === 'admin';
        return true; // Usuários comuns podem acessar funcionalidades básicas
      })
    );
  }

  private mapFirebaseUserToAppUser(firebaseUser: User): AppUser {
    // Por padrão, todos os usuários são 'user'
    // Em produção, isso seria obtido das custom claims
    const role = (firebaseUser as any).customClaims?.role || 'user';
    
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || undefined,
      role: role as 'admin' | 'user',
      createdAt: new Date(firebaseUser.metadata.creationTime || ''),
      lastLoginAt: new Date(firebaseUser.metadata.lastSignInTime || ''),
      updatedAt: new Date() // Adicionado campo obrigatório
    };
  }

  private mapFirebaseErrorToMessage(error: any): string {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'Usuário não encontrado. Verifique o email informado.';
      case 'auth/wrong-password':
        return 'Senha incorreta. Tente novamente.';
      case 'auth/invalid-email':
        return 'Email inválido. Verifique o formato do email.';
      case 'auth/user-disabled':
        return 'Usuário desabilitado. Entre em contato com o administrador.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas de login. Tente novamente mais tarde.';
      case 'auth/network-request-failed':
        return 'Erro de conexão. Verifique sua internet e tente novamente.';
      default:
        return 'Erro inesperado. Tente novamente.';
    }
  }
}
