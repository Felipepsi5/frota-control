import { Injectable } from '@angular/core';

export interface Category {
  id: string;
  name: string;
  type: 'expense' | 'revenue';
  description?: string;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  
  private readonly categories: Category[] = [
    // Categorias de Despesas
    {
      id: 'fuel',
      name: 'Abastecimento',
      type: 'expense',
      description: 'Combustível e abastecimento',
      icon: 'local_gas_station'
    },
    {
      id: 'maintenance',
      name: 'Manutenção',
      type: 'expense',
      description: 'Manutenção preventiva e corretiva',
      icon: 'build'
    },
    {
      id: 'tires',
      name: 'Pneus',
      type: 'expense',
      description: 'Troca e manutenção de pneus',
      icon: 'tire_repair'
    },
    {
      id: 'insurance',
      name: 'Seguro',
      type: 'expense',
      description: 'Seguro do veículo',
      icon: 'security'
    },
    {
      id: 'ipva',
      name: 'IPVA',
      type: 'expense',
      description: 'Imposto sobre Propriedade de Veículos Automotores',
      icon: 'receipt'
    },
    {
      id: 'licensing',
      name: 'Licenciamento',
      type: 'expense',
      description: 'Licenciamento anual do veículo',
      icon: 'assignment'
    },
    {
      id: 'toll',
      name: 'Pedágio',
      type: 'expense',
      description: 'Taxas de pedágio',
      icon: 'toll'
    },
    {
      id: 'parking',
      name: 'Estacionamento',
      type: 'expense',
      description: 'Taxas de estacionamento',
      icon: 'local_parking'
    },
    {
      id: 'fines',
      name: 'Multas',
      type: 'expense',
      description: 'Multas de trânsito',
      icon: 'warning'
    },
    {
      id: 'other_expense',
      name: 'Outros',
      type: 'expense',
      description: 'Outras despesas não categorizadas',
      icon: 'more_horiz'
    },
    
    // Categorias de Receitas
    {
      id: 'trip_payment',
      name: 'Pagamento Viagem',
      type: 'revenue',
      description: 'Pagamento por viagem realizada',
      icon: 'directions_car'
    },
    {
      id: 'freight',
      name: 'Frete',
      type: 'revenue',
      description: 'Receita de frete',
      icon: 'local_shipping'
    },
    {
      id: 'advance',
      name: 'Adiantamento',
      type: 'revenue',
      description: 'Adiantamento de pagamento',
      icon: 'account_balance_wallet'
    },
    {
      id: 'other_revenue',
      name: 'Outros',
      type: 'revenue',
      description: 'Outras receitas não categorizadas',
      icon: 'more_horiz'
    }
  ];

  /**
   * Obtém todas as categorias
   */
  getAllCategories(): Category[] {
    return [...this.categories];
  }

  /**
   * Obtém categorias por tipo
   */
  getCategoriesByType(type: 'expense' | 'revenue'): Category[] {
    return this.categories.filter(category => category.type === type);
  }

  /**
   * Obtém apenas os nomes das categorias por tipo
   */
  getCategoryNamesByType(type: 'expense' | 'revenue'): string[] {
    return this.getCategoriesByType(type).map(category => category.name);
  }

  /**
   * Busca uma categoria por ID
   */
  getCategoryById(id: string): Category | undefined {
    return this.categories.find(category => category.id === id);
  }

  /**
   * Busca uma categoria por nome
   */
  getCategoryByName(name: string): Category | undefined {
    return this.categories.find(category => category.name === name);
  }

  /**
   * Obtém todas as categorias de despesas
   */
  getExpenseCategories(): Category[] {
    return this.getCategoriesByType('expense');
  }

  /**
   * Obtém todas as categorias de receitas
   */
  getRevenueCategories(): Category[] {
    return this.getCategoriesByType('revenue');
  }

  /**
   * Obtém apenas os nomes das categorias de despesas
   */
  getExpenseCategoryNames(): string[] {
    return this.getCategoryNamesByType('expense');
  }

  /**
   * Obtém apenas os nomes das categorias de receitas
   */
  getRevenueCategoryNames(): string[] {
    return this.getCategoryNamesByType('revenue');
  }

  /**
   * Verifica se uma categoria existe
   */
  categoryExists(name: string, type: 'expense' | 'revenue'): boolean {
    return this.categories.some(category => 
      category.name === name && category.type === type
    );
  }

  /**
   * Obtém estatísticas das categorias
   */
  getCategoryStats(): { total: number; expenses: number; revenues: number } {
    return {
      total: this.categories.length,
      expenses: this.getExpenseCategories().length,
      revenues: this.getRevenueCategories().length
    };
  }
}
