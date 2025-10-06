import { Component, Inject, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take } from 'rxjs/operators';
import { JwtAuthService } from '../../../../core/services/jwt-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;

  private jwtAuthService = inject(JwtAuthService);

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid && !this.loading) {
      this.loading = true;
      
      const { email, password } = this.loginForm.value;
      
      try {
        // Fazer login com a API .NET Core
        this.jwtAuthService.login(email, password).pipe(take(1)).subscribe({
          next: (loginResponse) => {
            console.log('Login realizado com sucesso:', loginResponse);
            console.log('Tipo da resposta:', typeof loginResponse);
            console.log('Propriedades da resposta:', Object.keys(loginResponse || {}));
            
            this.snackBar.open('Login realizado com sucesso!', 'Fechar', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            });
            
            // Navegar para o dashboard
            console.log('Navegando para dashboard...');
            this.router.navigate(['/dashboard']).then(() => {
              console.log('Navegação concluída');
              this.loading = false;
            }).catch(err => {
              console.error('Erro na navegação:', err);
              this.loading = false;
            });
          },
          error: (error) => {
            console.error('Erro no login:', error);
            console.error('Tipo do erro:', typeof error);
            console.error('Propriedades do erro:', Object.keys(error || {}));
            
            const errorMessage = error?.message || error?.error?.message || 'Erro ao fazer login. Tente novamente.';
            
            this.snackBar.open(errorMessage, 'Fechar', {
              duration: 5000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
            
            this.loading = false;
          }
        });
        
      } catch (error: any) {
        console.error('Erro no login:', error);
        
        this.snackBar.open(error.message || 'Erro ao fazer login. Tente novamente.', 'Fechar', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      } finally {
        this.loading = false;
      }
    }
  }

  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName === 'email' ? 'Email' : 'Senha'} é obrigatório`;
    }
    if (field?.hasError('email')) {
      return 'Email inválido';
    }
    if (field?.hasError('minlength')) {
      return 'Senha deve ter pelo menos 6 caracteres';
    }
    return '';
  }

  /**
   * Método de teste para verificar navegação direta
   */
  testNavigation(): void {
    console.log('Testando navegação direta...');
    
    // Simular dados de login mock diretamente no localStorage
    const mockToken = 'test-token-' + Date.now();
    const mockUser = {
      uid: 'test-user',
      email: 'test@test.com',
      displayName: 'Usuário Teste',
      role: 'user',
      createdAt: new Date(),
      lastLoginAt: new Date()
    };
    
    // Salvar dados mock no localStorage
    localStorage.setItem('frotacontrol_token', mockToken);
    localStorage.setItem('frotacontrol_user', JSON.stringify(mockUser));
    
    console.log('Dados mock salvos no localStorage');
    
    // Tentar navegar
    this.router.navigate(['/dashboard']).then(() => {
      console.log('Navegação bem-sucedida!');
    }).catch(err => {
      console.error('Erro na navegação:', err);
    });
  }
}
