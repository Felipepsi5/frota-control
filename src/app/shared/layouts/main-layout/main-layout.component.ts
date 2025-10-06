import { Component, ViewChild, OnInit, OnDestroy, Inject, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { JwtAuthService } from '../../../core/services/jwt-auth.service';
import { User } from '../../../domain/models/user.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatMenuModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  title = 'FrotaControl';
  isMobile = false;
  currentUser: User | null = null;
  private destroy$ = new Subject<void>();
  private jwtAuthService = inject(JwtAuthService);

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private snackBar: MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Observar mudanças no usuário atual
    this.jwtAuthService.getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        
        // Se não há usuário logado, redirecionar para login
        if (!user) {
          this.router.navigate(['/login']);
          return;
        }
      });

    // Observar mudanças no tamanho da tela
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.Tablet])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobile = result.matches;

        // Em dispositivos móveis, usar mode="over" e fechar sidebar
        if (this.isMobile) {
          this.sidenav?.close();
        } else {
          // Em desktop, usar mode="side" e abrir sidebar
          this.sidenav?.open();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar(): void {
    this.sidenav.toggle();
  }

  getUserDisplayName(): string {
    if (this.currentUser) {
      return this.currentUser.displayName || this.currentUser.email;
    }
    return '';
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin' || false;
  }

  async logout(): Promise<void> {
    try {
      await this.jwtAuthService.logout().toPromise();
      
      this.snackBar.open('Logout realizado com sucesso!', 'Fechar', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });
      
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Erro no logout:', error);
      
      // Mesmo se der erro, redirecionar para login
      this.router.navigate(['/login']);
    }
  }
}
