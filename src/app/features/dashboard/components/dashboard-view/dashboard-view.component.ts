import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DashboardService, DashboardSummary, TruckPerformance } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatButtonModule,
    MatChipsModule
  ],
  templateUrl: './dashboard-view.component.html',
  styleUrls: ['./dashboard-view.component.scss']
})
export class DashboardViewComponent implements OnInit, OnDestroy {
  loading = true;
  error: string | null = null;
  dashboardSummary: DashboardSummary | null = null;
  trucksPerformance: TruckPerformance[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private dashboardService: DashboardService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    console.log('DashboardViewComponent.ngOnInit: Inicializando dashboard');
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    console.log('DashboardViewComponent.loadDashboardData: Carregando dados do dashboard');
    this.loading = true;
    this.error = null;

    // Carregar dados do resumo e performance em paralelo
    this.dashboardService.getDashboardSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (summary) => {
          console.log('DashboardViewComponent.loadDashboardData: Resumo carregado:', summary);
          this.dashboardSummary = summary;
        },
        error: (error) => {
          console.error('DashboardViewComponent.loadDashboardData: Erro ao carregar resumo:', error);
          this.error = 'Erro ao carregar dados do dashboard';
          this.snackBar.open('Erro ao carregar dados do dashboard', 'Fechar', {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });

    this.dashboardService.getTrucksPerformance()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (performance) => {
          console.log('DashboardViewComponent.loadDashboardData: Performance carregada:', performance);
          this.trucksPerformance = performance;
          this.loading = false;
        },
        error: (error) => {
          console.error('DashboardViewComponent.loadDashboardData: Erro ao carregar performance:', error);
          this.trucksPerformance = [];
          if (!this.error) {
            this.error = 'Erro ao carregar performance dos caminhões';
          }
          this.loading = false;
        }
      });
  }

  refreshData(): void {
    console.log('DashboardViewComponent.refreshData: Atualizando dados');
    this.loadDashboardData();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatNumber(value: number, decimals: number = 2): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  }

  getNetIncomeClass(netIncome: number): string {
    return netIncome >= 0 ? 'positive' : 'negative';
  }
}
