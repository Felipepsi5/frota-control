export interface FinancialEntry {
  id: string;
  truckId: string;
  licensePlate: string; // Adicionado conforme documentação
  date: Date;
  entryType: 'expense' | 'revenue';
  category: string;
  amount: number;
  litersFilled?: number;
  odometerReading?: number;
  description?: string; // Adicionado conforme documentação
  createdUserId: string;
  createdUserName: string; // Adicionado conforme documentação
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFinancialEntryRequest {
  truckId: string;
  date: string; // Alterado para string (ISO 8601) conforme documentação
  entryType: 'expense' | 'revenue';
  category: string;
  amount: number;
  litersFilled?: number;
  odometerReading?: number;
  description?: string; // Adicionado conforme documentação
}

export interface UpdateFinancialEntryRequest {
  date?: string; // ISO 8601 format
  entryType?: 'expense' | 'revenue';
  category?: string;
  amount?: number;
  litersFilled?: number;
  odometerReading?: number;
  description?: string | null; // Adicionado conforme documentação
  descriptionProvided?: boolean; // Flag para indicar se description foi explicitamente fornecido
}

export interface FinancialEntryFilters {
  truckId?: string;
  startDate?: string; // ISO 8601 format
  endDate?: string; // ISO 8601 format
  entryType?: 'expense' | 'revenue';
  category?: string;
  search?: string; // Busca por descrição ou categoria
}

// Interfaces para paginação conforme nova API
export interface FinancialEntryPaginationParams {
  page: number;
  limit: number;
  truckId?: string;
  startDate?: string;
  endDate?: string;
  entryType?: 'expense' | 'revenue';
  category?: string;
  search?: string;
}

export interface FinancialEntryPaginationResponse {
  data: FinancialEntryResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Resposta completa da API (FinancialEntryResponse)
export interface FinancialEntryResponse {
  id: string;
  truckId: string;
  licensePlate: string;
  date: string; // ISO 8601 format
  entryType: 'expense' | 'revenue';
  category: string;
  amount: number;
  litersFilled?: number;
  odometerReading?: number;
  description?: string;
  createdUserId: string;
  createdUserName: string;
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
}

// Resposta simplificada da API (FinancialEntryListResponse)
export interface FinancialEntryListResponse {
  id: string;
  truckId: string;
  licensePlate: string;
  date: string; // ISO 8601 format
  entryType: 'expense' | 'revenue';
  category: string;
  amount: number;
  description?: string;
}

export const FINANCIAL_CATEGORIES = {
  expense: [
    'Combustível',
    'Manutenção',
    'Pedágio',
    'Estacionamento',
    'Peças',
    'Seguro',
    'IPVA',
    'Licenciamento',
    'Outros'
  ],
  revenue: [
    'Frete',
    'Entrega',
    'Aluguel',
    'Venda',
    'Outros'
  ]
} as const;
