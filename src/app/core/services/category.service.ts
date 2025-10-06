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
    // ========== DESPESAS ==========
    {
      id: 'fuel',
      name: 'Combustível',
      type: 'expense',
      description: 'Abastecimento de combustível',
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
      id: 'parts',
      name: 'Peças',
      type: 'expense',
      description: 'Compra de peças e componentes',
      icon: 'precision_manufacturing'
    },
    {
      id: 'tires',
      name: 'Pneus',
      type: 'expense',
      description: 'Troca e manutenção de pneus',
      icon: 'tire_repair'
    },
    {
      id: 'oil_change',
      name: 'Troca de Óleo',
      type: 'expense',
      description: 'Troca de óleo e filtros',
      icon: 'oil_barrel'
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
      id: 'driver_salary',
      name: 'Salário Motorista',
      type: 'expense',
      description: 'Salário e benefícios do motorista',
      icon: 'person'
    },
    {
      id: 'fuel_card',
      name: 'Cartão Combustível',
      type: 'expense',
      description: 'Taxas e serviços do cartão de combustível',
      icon: 'credit_card'
    },
    {
      id: 'cleaning',
      name: 'Lavagem',
      type: 'expense',
      description: 'Lavagem e limpeza do veículo',
      icon: 'local_car_wash'
    },
    {
      id: 'inspection',
      name: 'Vistoria',
      type: 'expense',
      description: 'Vistoria técnica e inspeção veicular',
      icon: 'search'
    },
    {
      id: 'repair',
      name: 'Reparo',
      type: 'expense',
      description: 'Reparos e consertos',
      icon: 'handyman'
    },
    {
      id: 'tools',
      name: 'Ferramentas',
      type: 'expense',
      description: 'Compra de ferramentas e equipamentos',
      icon: 'construction'
    },
    {
      id: 'communication',
      name: 'Comunicação',
      type: 'expense',
      description: 'Telefone, rádio e comunicação',
      icon: 'phone'
    },
    {
      id: 'food',
      name: 'Alimentação',
      type: 'expense',
      description: 'Alimentação do motorista',
      icon: 'restaurant'
    },
    {
      id: 'lodging',
      name: 'Hospedagem',
      type: 'expense',
      description: 'Hospedagem do motorista',
      icon: 'hotel'
    },
    {
      id: 'fuel_tax',
      name: 'Imposto Combustível',
      type: 'expense',
      description: 'ICMS e outros impostos sobre combustível',
      icon: 'account_balance'
    },
    {
      id: 'other_expense',
      name: 'Outros',
      type: 'expense',
      description: 'Outras despesas não categorizadas',
      icon: 'more_horiz'
    },
    
    // ========== RECEITAS ==========
    {
      id: 'freight',
      name: 'Frete',
      type: 'revenue',
      description: 'Receita de frete de cargas',
      icon: 'local_shipping'
    },
    {
      id: 'delivery',
      name: 'Entrega',
      type: 'revenue',
      description: 'Receita de entrega de mercadorias',
      icon: 'delivery_dining'
    },
    {
      id: 'rental',
      name: 'Aluguel',
      type: 'revenue',
      description: 'Aluguel do veículo para terceiros',
      icon: 'directions_car'
    },
    {
      id: 'sale',
      name: 'Venda',
      type: 'revenue',
      description: 'Venda de mercadorias transportadas',
      icon: 'sell'
    },
    {
      id: 'service',
      name: 'Serviços',
      type: 'revenue',
      description: 'Prestação de serviços de transporte',
      icon: 'handshake'
    },
    {
      id: 'bonus',
      name: 'Bônus',
      type: 'revenue',
      description: 'Bônus por performance ou metas',
      icon: 'emoji_events'
    },
    {
      id: 'refund',
      name: 'Reembolso',
      type: 'revenue',
      description: 'Reembolso de despesas',
      icon: 'account_balance_wallet'
    },
    {
      id: 'interest',
      name: 'Juros',
      type: 'revenue',
      description: 'Juros de aplicações financeiras',
      icon: 'savings'
    },
    {
      id: 'commission',
      name: 'Comissão',
      type: 'revenue',
      description: 'Comissões recebidas',
      icon: 'percent'
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
