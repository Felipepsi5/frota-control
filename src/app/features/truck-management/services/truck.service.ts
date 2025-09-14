import { Injectable } from '@angular/core';
import { Observable, map, catchError, throwError, switchMap } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Truck, CreateTruckRequest, UpdateTruckRequest } from '../../../domain/models/truck.model';

export interface TruckFilters {
  search?: string;
  status?: 'ativo' | 'inativo';
  year?: number;
  model?: string;
}

export interface TruckPaginationParams {
  page: number;
  limit: number;
  filters?: TruckFilters;
}

export interface TruckPaginationResponse {
  data: Truck[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class TruckService {
  constructor(private apiService: ApiService) {}

  /**
   * Busca todos os caminhões
   */
  getAllTrucks(): Observable<Truck[]> {
    return this.apiService.get<Truck[]>('/trucks').pipe(
      catchError(error => {
        console.error('Erro ao buscar caminhões:', error);
        return throwError(() => new Error('Erro ao carregar caminhões'));
      })
    );
  }

  /**
   * Busca caminhões com paginação e filtros
   */
  getTrucksPaginated(params: TruckPaginationParams): Observable<TruckPaginationResponse> {
    const queryParams: any = {
      _page: params.page + 1, // JSON Server usa 1-based pagination
      _limit: params.limit
    };

    // Adicionar filtros
    if (params.filters) {
      if (params.filters.status) {
        queryParams.status = params.filters.status;
      }
      if (params.filters.year) {
        queryParams.year = params.filters.year;
      }
      if (params.filters.model) {
        queryParams.model_like = params.filters.model;
      }
    }

    return this.apiService.get<Truck[]>('/trucks', queryParams).pipe(
      switchMap(trucks => {
        // Aplicar filtro de busca no lado do cliente se necessário
        let filteredTrucks = trucks;
        if (params.filters?.search) {
          const searchTerm = params.filters.search.toLowerCase();
          filteredTrucks = trucks.filter(truck => 
            truck.licensePlate.toLowerCase().includes(searchTerm) ||
            truck.model.toLowerCase().includes(searchTerm) ||
            truck.year.toString().includes(searchTerm)
          );
        }
        
        // Para obter o total, fazer uma segunda requisição sem paginação
        const countParams = { ...queryParams };
        delete countParams._page;
        delete countParams._limit;
        
        return this.apiService.get<Truck[]>('/trucks', countParams).pipe(
          map(allTrucks => {
            // Aplicar o mesmo filtro de busca para o total
            let filteredAllTrucks = allTrucks;
            if (params.filters?.search) {
              const searchTerm = params.filters.search.toLowerCase();
              filteredAllTrucks = allTrucks.filter(truck => 
                truck.licensePlate.toLowerCase().includes(searchTerm) ||
                truck.model.toLowerCase().includes(searchTerm) ||
                truck.year.toString().includes(searchTerm)
              );
            }
            
            const total = filteredAllTrucks.length;
            const totalPages = Math.ceil(total / params.limit);
            
            return {
              data: filteredTrucks,
              total,
              page: params.page,
              limit: params.limit,
              totalPages
            };
          })
        );
      }),
      catchError(error => {
        console.error('Erro ao buscar caminhões paginados:', error);
        return throwError(() => new Error('Erro ao carregar caminhões'));
      })
    );
  }

  /**
   * Busca caminhões ativos
   */
  getActiveTrucks(): Observable<Truck[]> {
    return this.apiService.get<Truck[]>('/trucks', { status: 'ativo' }).pipe(
      catchError(error => {
        console.error('Erro ao buscar caminhões ativos:', error);
        return throwError(() => new Error('Erro ao carregar caminhões ativos'));
      })
    );
  }

  /**
   * Busca um caminhão por ID
   */
  getTruckById(id: string): Observable<Truck | null> {
    return this.apiService.getById<Truck>('/trucks', id).pipe(
      catchError(error => {
        console.error('Erro ao buscar caminhão:', error);
        return throwError(() => new Error('Erro ao carregar caminhão'));
      })
    );
  }

  /**
   * Cria um novo caminhão
   */
  createTruck(request: CreateTruckRequest): Observable<Truck> {
    return this.apiService.post<Truck>('/trucks', request).pipe(
      catchError(error => {
        console.error('Erro ao criar caminhão:', error);
        return throwError(() => new Error('Erro ao criar caminhão'));
      })
    );
  }

  /**
   * Atualiza um caminhão existente
   */
  updateTruck(id: string, request: UpdateTruckRequest): Observable<Truck> {
    return this.apiService.putById<Truck>('/trucks', id, request).pipe(
      catchError(error => {
        console.error('Erro ao atualizar caminhão:', error);
        return throwError(() => new Error('Erro ao atualizar caminhão'));
      })
    );
  }

  /**
   * Desativa um caminhão (soft delete)
   */
  deactivateTruck(id: string): Observable<Truck> {
    // Primeiro, buscar o caminhão atual para preservar todos os dados
    return this.getTruckById(id).pipe(
      switchMap(currentTruck => {
        if (!currentTruck) {
          throw new Error('Caminhão não encontrado');
        }
        // Preservar todos os dados existentes e apenas alterar o status
        const updatedTruck = {
          ...currentTruck,
          status: 'inativo' as const,
          updatedAt: new Date()
        };
        // Fazer a atualização com todos os dados preservados
        return this.apiService.putById<Truck>('/trucks', id, updatedTruck);
      }),
      catchError(error => {
        console.error('Erro ao desativar caminhão:', error);
        return throwError(() => new Error('Erro ao desativar caminhão'));
      })
    );
  }

  /**
   * Reativa um caminhão
   */
  activateTruck(id: string): Observable<Truck> {
    // Primeiro, buscar o caminhão atual para preservar todos os dados
    return this.getTruckById(id).pipe(
      switchMap(currentTruck => {
        if (!currentTruck) {
          throw new Error('Caminhão não encontrado');
        }
        // Preservar todos os dados existentes e apenas alterar o status
        const updatedTruck = {
          ...currentTruck,
          status: 'ativo' as const,
          updatedAt: new Date()
        };
        // Fazer a atualização com todos os dados preservados
        return this.apiService.putById<Truck>('/trucks', id, updatedTruck);
      }),
      catchError(error => {
        console.error('Erro ao reativar caminhão:', error);
        return throwError(() => new Error('Erro ao reativar caminhão'));
      })
    );
  }

  /**
   * Verifica se uma placa já existe
   */
  existsByLicensePlate(licensePlate: string): Observable<boolean> {
    return this.apiService.get<Truck[]>('/trucks', { licensePlate }).pipe(
      map(trucks => trucks.length > 0),
      catchError(error => {
        console.error('Erro ao verificar placa:', error);
        return throwError(() => new Error('Erro ao verificar placa'));
      })
    );
  }
}
