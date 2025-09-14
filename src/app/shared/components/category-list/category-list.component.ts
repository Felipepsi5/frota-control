import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { CategoryService, Category } from '../../core/services/category.service';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <mat-card class="category-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>{{ getHeaderIcon() }}</mat-icon>
          {{ getHeaderTitle() }}
        </mat-card-title>
        <mat-card-subtitle>
          {{ categories.length }} categoria(s) disponível(is)
        </mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <mat-list>
          <mat-list-item *ngFor="let category of categories" class="category-item">
            <mat-icon matListItemIcon class="category-icon">{{ category.icon }}</mat-icon>
            <div matListItemTitle class="category-name">{{ category.name }}</div>
            <div matListItemLine class="category-description">{{ category.description }}</div>
            <mat-chip matListItemMeta class="category-chip">
              {{ category.type === 'expense' ? 'Despesa' : 'Receita' }}
            </mat-chip>
          </mat-list-item>
        </mat-list>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .category-card {
      margin: 16px 0;
    }
    
    .category-item {
      border-bottom: 1px solid #e0e0e0;
    }
    
    .category-item:last-child {
      border-bottom: none;
    }
    
    .category-icon {
      color: #666;
      margin-right: 16px;
    }
    
    .category-name {
      font-weight: 500;
      color: #333;
    }
    
    .category-description {
      color: #666;
      font-size: 14px;
      margin-top: 4px;
    }
    
    .category-chip {
      font-size: 12px;
      min-height: 24px;
    }
    
    .category-chip.expense {
      background-color: #ffebee;
      color: #c62828;
    }
    
    .category-chip.revenue {
      background-color: #e8f5e8;
      color: #2e7d32;
    }
    
    mat-card-header {
      padding-bottom: 16px;
    }
    
    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class CategoryListComponent implements OnInit {
  @Input() type: 'expense' | 'revenue' | 'all' = 'all';
  
  categories: Category[] = [];

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    switch (this.type) {
      case 'expense':
        this.categories = this.categoryService.getExpenseCategories();
        break;
      case 'revenue':
        this.categories = this.categoryService.getRevenueCategories();
        break;
      case 'all':
      default:
        this.categories = this.categoryService.getAllCategories();
        break;
    }
  }

  getHeaderIcon(): string {
    switch (this.type) {
      case 'expense':
        return 'trending_down';
      case 'revenue':
        return 'trending_up';
      case 'all':
      default:
        return 'category';
    }
  }

  getHeaderTitle(): string {
    switch (this.type) {
      case 'expense':
        return 'Categorias de Despesas';
      case 'revenue':
        return 'Categorias de Receitas';
      case 'all':
      default:
        return 'Todas as Categorias';
    }
  }
}
