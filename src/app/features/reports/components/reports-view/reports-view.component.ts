import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reports-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule
  ],
  template: `
    <div class="reports-container">
      <mat-card class="header-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>assessment</mat-icon>
            Relatórios
          </mat-card-title>
          <mat-card-subtitle>
            Visualize e analise os dados da sua frota
          </mat-card-subtitle>
        </mat-card-header>
      </mat-card>

      <mat-tab-group class="reports-tabs">
        <mat-tab label="Resumo Financeiro">
          <ng-template matTabContent>
            <mat-card class="report-card">
              <mat-card-header>
                <mat-card-title>Resumo Financeiro</mat-card-title>
                <mat-card-subtitle>Visão geral das receitas e despesas</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="filters-container">
                  <mat-form-field appearance="outline">
                    <mat-label>Período</mat-label>
                    <mat-select [(value)]="selectedPeriod">
                      <mat-option value="current-month">Mês Atual</mat-option>
                      <mat-option value="last-month">Mês Anterior</mat-option>
                      <mat-option value="current-year">Ano Atual</mat-option>
                      <mat-option value="custom">Personalizado</mat-option>
                    </mat-select>
                  </mat-form-field>
                  
                  <button mat-raised-button color="primary" (click)="generateFinancialReport()">
                    <mat-icon>refresh</mat-icon>
                    Gerar Relatório
                  </button>
                </div>
                
                <div class="report-content" *ngIf="financialReport">
                  <div class="summary-cards">
                    <div class="summary-card revenue">
                      <mat-icon>trending_up</mat-icon>
                      <div class="card-content">
                        <div class="card-value">{{ financialReport.totalRevenue | currency:'BRL' }}</div>
                        <div class="card-label">Total Receitas</div>
                      </div>
                    </div>
                    
                    <div class="summary-card expense">
                      <mat-icon>trending_down</mat-icon>
                      <div class="card-content">
                        <div class="card-value">{{ financialReport.totalExpense | currency:'BRL' }}</div>
                        <div class="card-label">Total Despesas</div>
                      </div>
                    </div>
                    
                    <div class="summary-card balance" [class.positive]="financialReport.balance > 0" [class.negative]="financialReport.balance < 0">
                      <mat-icon>{{ financialReport.balance > 0 ? 'account_balance' : 'account_balance_wallet' }}</mat-icon>
                      <div class="card-content">
                        <div class="card-value">{{ financialReport.balance | currency:'BRL' }}</div>
                        <div class="card-label">Saldo</div>
                      </div>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </ng-template>
        </mat-tab>
        
        <mat-tab label="Relatório de Caminhões">
          <ng-template matTabContent>
            <mat-card class="report-card">
              <mat-card-header>
                <mat-card-title>Relatório de Caminhões</mat-card-title>
                <mat-card-subtitle>Status e performance dos veículos</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="filters-container">
                  <mat-form-field appearance="outline">
                    <mat-label>Status</mat-label>
                    <mat-select [(value)]="selectedTruckStatus">
                      <mat-option value="all">Todos</mat-option>
                      <mat-option value="active">Ativos</mat-option>
                      <mat-option value="inactive">Inativos</mat-option>
                      <mat-option value="maintenance">Em Manutenção</mat-option>
                    </mat-select>
                  </mat-form-field>
                  
                  <button mat-raised-button color="primary" (click)="generateTruckReport()">
                    <mat-icon>refresh</mat-icon>
                    Gerar Relatório
                  </button>
                </div>
                
                <div class="report-content" *ngIf="truckReport">
                  <div class="truck-stats">
                    <div class="stat-item">
                      <mat-icon>directions_car</mat-icon>
                      <div class="stat-content">
                        <div class="stat-number">{{ truckReport.totalTrucks }}</div>
                        <div class="stat-label">Total de Caminhões</div>
                      </div>
                    </div>
                    
                    <div class="stat-item">
                      <mat-icon>check_circle</mat-icon>
                      <div class="stat-content">
                        <div class="stat-number">{{ truckReport.activeTrucks }}</div>
                        <div class="stat-label">Ativos</div>
                      </div>
                    </div>
                    
                    <div class="stat-item">
                      <mat-icon>build</mat-icon>
                      <div class="stat-content">
                        <div class="stat-number">{{ truckReport.maintenanceTrucks }}</div>
                        <div class="stat-label">Em Manutenção</div>
                      </div>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </ng-template>
        </mat-tab>
        
        <mat-tab label="Relatório de Categorias">
          <ng-template matTabContent>
            <mat-card class="report-card">
              <mat-card-header>
                <mat-card-title>Relatório de Categorias</mat-card-title>
                <mat-card-subtitle>Análise por categoria de despesas e receitas</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="filters-container">
                  <mat-form-field appearance="outline">
                    <mat-label>Tipo</mat-label>
                    <mat-select [(value)]="selectedCategoryType">
                      <mat-option value="all">Todas</mat-option>
                      <mat-option value="expense">Despesas</mat-option>
                      <mat-option value="revenue">Receitas</mat-option>
                    </mat-select>
                  </mat-form-field>
                  
                  <button mat-raised-button color="primary" (click)="generateCategoryReport()">
                    <mat-icon>refresh</mat-icon>
                    Gerar Relatório
                  </button>
                </div>
                
                <div class="report-content" *ngIf="categoryReport">
                  <div class="category-chart-placeholder">
                    <mat-icon>pie_chart</mat-icon>
                    <p>Gráfico de categorias será implementado aqui</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </ng-template>
        </mat-tab>
      </mat-tab-group>

      <mat-card class="actions-card">
        <mat-card-content>
          <div class="actions-container">
            <button mat-raised-button color="primary" (click)="exportAllReports()">
              <mat-icon>download</mat-icon>
              Exportar Todos os Relatórios
            </button>
            
            <button mat-raised-button color="accent" (click)="scheduleReport()">
              <mat-icon>schedule</mat-icon>
              Agendar Relatório
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .reports-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .header-card {
      margin-bottom: 24px;
    }
    
    .reports-tabs {
      margin-bottom: 24px;
    }
    
    .report-card {
      margin-bottom: 24px;
    }
    
    .filters-container {
      display: flex;
      gap: 16px;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-top: 24px;
    }
    
    .summary-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      border-radius: 8px;
      background: #f5f5f5;
    }
    
    .summary-card.revenue {
      background: linear-gradient(135deg, #4caf50, #66bb6a);
      color: white;
    }
    
    .summary-card.expense {
      background: linear-gradient(135deg, #f44336, #ef5350);
      color: white;
    }
    
    .summary-card.balance {
      background: linear-gradient(135deg, #2196f3, #42a5f5);
      color: white;
    }
    
    .summary-card.balance.positive {
      background: linear-gradient(135deg, #4caf50, #66bb6a);
    }
    
    .summary-card.balance.negative {
      background: linear-gradient(135deg, #f44336, #ef5350);
    }
    
    .card-content {
      display: flex;
      flex-direction: column;
    }
    
    .card-value {
      font-size: 24px;
      font-weight: bold;
    }
    
    .card-label {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .truck-stats {
      display: flex;
      gap: 24px;
      margin-top: 24px;
      flex-wrap: wrap;
    }
    
    .stat-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
      min-width: 150px;
    }
    
    .stat-content {
      display: flex;
      flex-direction: column;
    }
    
    .stat-number {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }
    
    .stat-label {
      font-size: 14px;
      color: #666;
    }
    
    .category-chart-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      background: #f5f5f5;
      border-radius: 8px;
      margin-top: 24px;
    }
    
    .category-chart-placeholder mat-icon {
      font-size: 48px;
      color: #666;
      margin-bottom: 16px;
    }
    
    .actions-card {
      margin-top: 24px;
    }
    
    .actions-container {
      display: flex;
      gap: 16px;
      justify-content: center;
    }
    
    mat-card-header {
      padding-bottom: 16px;
    }
    
    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    @media (max-width: 768px) {
      .filters-container {
        flex-direction: column;
        align-items: stretch;
      }
      
      .summary-cards {
        grid-template-columns: 1fr;
      }
      
      .truck-stats {
        flex-direction: column;
      }
      
      .actions-container {
        flex-direction: column;
      }
    }
  `]
})
export class ReportsViewComponent implements OnInit {
  selectedPeriod = 'current-month';
  selectedTruckStatus = 'all';
  selectedCategoryType = 'all';
  
  financialReport: any = null;
  truckReport: any = null;
  categoryReport: any = null;

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    // Inicializar dados se necessário
  }

  generateFinancialReport(): void {
    // Simular geração de relatório financeiro
    this.financialReport = {
      totalRevenue: 150000,
      totalExpense: 120000,
      balance: 30000
    };
    
    this.snackBar.open('Relatório financeiro gerado com sucesso!', 'Fechar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  generateTruckReport(): void {
    // Simular geração de relatório de caminhões
    this.truckReport = {
      totalTrucks: 15,
      activeTrucks: 12,
      maintenanceTrucks: 3
    };
    
    this.snackBar.open('Relatório de caminhões gerado com sucesso!', 'Fechar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  generateCategoryReport(): void {
    // Simular geração de relatório de categorias
    this.categoryReport = {
      categories: []
    };
    
    this.snackBar.open('Relatório de categorias gerado com sucesso!', 'Fechar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  exportAllReports(): void {
    this.snackBar.open('Todos os relatórios foram exportados!', 'Fechar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  scheduleReport(): void {
    this.snackBar.open('Funcionalidade de agendamento será implementada em breve!', 'Fechar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['info-snackbar']
    });
  }
}
