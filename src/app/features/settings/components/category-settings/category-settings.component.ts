import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoryService, Category } from '../../../../core/services/category.service';
// import { CategoryListComponent } from '../../../../shared/components/category-list/category-list.component';

@Component({
  selector: 'app-category-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="category-settings-container">
      <mat-card class="header-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>category</mat-icon>
            Configurações de Categorias
          </mat-card-title>
          <mat-card-subtitle>
            Gerencie as categorias de despesas e receitas do sistema
          </mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="stats-container">
            <div class="stat-item">
              <mat-icon class="stat-icon">trending_down</mat-icon>
              <div class="stat-content">
                <div class="stat-number">{{ stats.expenses }}</div>
                <div class="stat-label">Despesas</div>
              </div>
            </div>
            
            <div class="stat-item">
              <mat-icon class="stat-icon">trending_up</mat-icon>
              <div class="stat-content">
                <div class="stat-number">{{ stats.revenues }}</div>
                <div class="stat-label">Receitas</div>
              </div>
            </div>
            
            <div class="stat-item">
              <mat-icon class="stat-icon">category</mat-icon>
              <div class="stat-content">
                <div class="stat-number">{{ stats.total }}</div>
                <div class="stat-label">Total</div>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-tab-group class="category-tabs">
        <mat-tab label="Todas as Categorias">
          <ng-template matTabContent>
            <div class="category-placeholder">
              <mat-icon>category</mat-icon>
              <p>Lista de categorias será implementada aqui</p>
            </div>
          </ng-template>
        </mat-tab>
        
        <mat-tab label="Despesas">
          <ng-template matTabContent>
            <div class="category-placeholder">
              <mat-icon>trending_down</mat-icon>
              <p>Lista de categorias de despesas será implementada aqui</p>
            </div>
          </ng-template>
        </mat-tab>
        
        <mat-tab label="Receitas">
          <ng-template matTabContent>
            <div class="category-placeholder">
              <mat-icon>trending_up</mat-icon>
              <p>Lista de categorias de receitas será implementada aqui</p>
            </div>
          </ng-template>
        </mat-tab>
      </mat-tab-group>

      <mat-card class="actions-card">
        <mat-card-content>
          <div class="actions-container">
            <button mat-raised-button color="primary" (click)="exportCategories()">
              <mat-icon>download</mat-icon>
              Exportar Categorias
            </button>
            
            <button mat-raised-button color="accent" (click)="refreshStats()">
              <mat-icon>refresh</mat-icon>
              Atualizar Estatísticas
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .category-settings-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .header-card {
      margin-bottom: 24px;
    }
    
    .stats-container {
      display: flex;
      gap: 24px;
      margin-top: 16px;
    }
    
    .stat-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
      min-width: 120px;
    }
    
    .stat-icon {
      color: #666;
      font-size: 24px;
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
    
    .category-tabs {
      margin-bottom: 24px;
    }
    
    .actions-card {
      margin-top: 24px;
    }
    
    .actions-container {
      display: flex;
      gap: 16px;
      justify-content: center;
    }
    
    .category-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      background: #f5f5f5;
      border-radius: 8px;
      margin: 24px 0;
    }
    
    .category-placeholder mat-icon {
      font-size: 48px;
      color: #666;
      margin-bottom: 16px;
    }
    
    .category-placeholder p {
      color: #666;
      text-align: center;
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
      .stats-container {
        flex-direction: column;
        gap: 12px;
      }
      
      .actions-container {
        flex-direction: column;
      }
    }
  `]
})
export class CategorySettingsComponent implements OnInit {
  stats = {
    total: 0,
    expenses: 0,
    revenues: 0
  };

  constructor(
    private categoryService: CategoryService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    this.stats = this.categoryService.getCategoryStats();
  }

  refreshStats(): void {
    this.loadStats();
    this.snackBar.open('Estatísticas atualizadas!', 'Fechar', {
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  exportCategories(): void {
    const allCategories = this.categoryService.getAllCategories();
    const dataStr = JSON.stringify(allCategories, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'categorias-frotacontrol.json';
    link.click();
    
    this.snackBar.open('Categorias exportadas com sucesso!', 'Fechar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }
}
