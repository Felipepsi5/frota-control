import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { CategoryService, Category } from '../../core/services/category.service';

@Component({
  selector: 'app-category-chip',
  standalone: true,
  imports: [
    CommonModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './category-chip.component.html',
  styleUrls: ['./category-chip.component.scss']
})
export class CategoryChipComponent {
  @Input() categoryName: string = '';
  @Input() entryType: 'expense' | 'revenue' = 'expense';
  @Input() showIcon: boolean = true;
  @Input() showTooltip: boolean = true;

  constructor(private categoryService: CategoryService) {}

  getIcon(): string {
    const category = this.categoryService.getCategoryByName(this.categoryName);
    return category?.icon || 'category';
  }

  getTooltip(): string {
    if (!this.showTooltip) return '';
    
    const category = this.categoryService.getCategoryByName(this.categoryName);
    return category?.description || this.categoryName;
  }

  getChipClass(): string {
    return this.entryType === 'expense' ? 'expense-chip' : 'revenue-chip';
  }
}
