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
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
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
