import { Pipe, PipeTransform } from '@angular/core';
import { CategoryService, Category } from '../../core/services/category.service';

@Pipe({
  name: 'category',
  standalone: true
})
export class CategoryPipe implements PipeTransform {
  
  constructor(private categoryService: CategoryService) {}

  transform(categoryName: string, type: 'expense' | 'revenue', property: 'name' | 'description' | 'icon' = 'name'): string {
    const category = this.categoryService.getCategoryByName(categoryName);
    
    if (!category || category.type !== type) {
      return categoryName; // Retorna o nome original se não encontrar
    }

    switch (property) {
      case 'description':
        return category.description || categoryName;
      case 'icon':
        return category.icon || 'category';
      case 'name':
      default:
        return category.name;
    }
  }
}
