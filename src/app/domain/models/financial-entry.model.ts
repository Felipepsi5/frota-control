export interface FinancialEntry {
  id: string;
  truckId: string; // Referência à coleção trucks
  date: Date;
  entryType: 'expense' | 'revenue';
  category: string; // ex: "Abastecimento", "Manutenção", "Pagamento Viagem"
  amount: number;
  litersFilled?: number; // Opcional
  odometerReading?: number; // Opcional
  createdUserId: string; // ID do usuário autenticado que criou o registro
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFinancialEntryRequest {
  truckId: string;
  date: Date;
  entryType: 'expense' | 'revenue';
  category: string;
  amount: number;
  litersFilled?: number;
  odometerReading?: number;
}

export interface UpdateFinancialEntryRequest {
  date?: Date;
  entryType?: 'expense' | 'revenue';
  category?: string;
  amount?: number;
  litersFilled?: number;
  odometerReading?: number;
}

export interface FinancialEntryFilters {
  truckId?: string;
  startDate?: Date;
  endDate?: Date;
  entryType?: 'expense' | 'revenue';
  category?: string;
}

export const FINANCIAL_CATEGORIES = {
  expense: [
    'Abastecimento',
    'Manutenção',
    'Pneus',
    'Seguro',
    'IPVA',
    'Licenciamento',
    'Pedágio',
    'Estacionamento',
    'Multas',
    'Outros'
  ],
  revenue: [
    'Pagamento Viagem',
    'Frete',
    'Adiantamento',
    'Outros'
  ]
} as const;
