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
  template: `
    <mat-chip-set>
      <mat-chip 
        [class]="getChipClass()"
        [matTooltip]="getTooltip()"
        matTooltipPosition="above">
        <mat-icon *ngIf="showIcon" class="chip-icon">{{ getIcon() }}</mat-icon>
        {{ categoryName }}
      </mat-chip>
    </mat-chip-set>
  `,
  styles: [`
    .chip-icon {
      font-size: 16px;
      height: 16px;
      width: 16px;
      margin-right: 4px;
    }
    
    .expense-chip {
      background-color: #ffebee;
      color: #c62828;
    }
    
    .revenue-chip {
      background-color: #e8f5e8;
      color: #2e7d32;
    }
    
    mat-chip {
      font-size: 12px;
      min-height: 24px;
    }
  `]
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
