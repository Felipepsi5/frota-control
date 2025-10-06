export interface Truck {
  id: string; // GUID único do caminhão
  licensePlate: string; // Placa do caminhão (ex: QOL7533)
  model: string;
  year: number;
  status: 'ativo' | 'inativo';
  createdAt: Date;
  updatedAt: Date;
  totalFinancialEntries?: number; // Adicionado conforme nova API
  totalRevenue?: number; // Adicionado conforme nova API
  totalExpenses?: number; // Adicionado conforme nova API
  netIncome?: number; // Adicionado conforme nova API
}

export interface CreateTruckRequest {
  licensePlate: string;
  model: string;
  year: number;
  status: 'ativo' | 'inativo';
}

export interface UpdateTruckRequest {
  licensePlate: string;
  model: string;
  year: number;
  status: 'ativo' | 'inativo';
}

// Interfaces para paginação e filtros conforme nova API
export interface TruckFilters {
  search?: string; // Busca por placa ou modelo
  status?: 'ativo' | 'inativo';
  year?: number;
  model?: string;
}

export interface TruckPaginationParams {
  page: number;
  limit: number;
  search?: string;
  status?: 'ativo' | 'inativo';
  year?: number;
  model?: string;
}

export interface TruckPaginationResponse {
  data: Truck[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface UpdateTruckStatusRequest {
  status: 'ativo' | 'inativo';
}
