export interface Truck {
  id: string; // Placa do caminhão (ex: QOL7533)
  licensePlate: string;
  model: string;
  year: number;
  status: 'ativo' | 'inativo';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTruckRequest {
  licensePlate: string;
  model: string;
  year: number;
  status: 'ativo' | 'inativo';
}

export interface UpdateTruckRequest {
  model?: string;
  year?: number;
  status?: 'ativo' | 'inativo';
}
