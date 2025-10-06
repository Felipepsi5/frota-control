import { Injectable } from '@angular/core';
import { Observable, of, map, catchError, throwError, switchMap } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { 
  Truck, 
  CreateTruckRequest, 
  UpdateTruckRequest,
  TruckFilters,
  TruckPaginationParams,
  TruckPaginationResponse,
  UpdateTruckStatusRequest
} from '../../../domain/models/truck.model';

@Injectable({
  providedIn: 'root'
})
export class TruckService {
  constructor(private apiService: ApiService) {}

  /**
   * Busca todos os caminhões do usuário
   * Usa o endpoint GET /api/trucks
   */
  getAllTrucks(): Observable<Truck[]> {
    return this.apiService.get<TruckPaginationResponse>('/trucks').pipe(
      map(response => response.data),
      catchError(error => {
        console.error('TruckService.getAllTrucks: Erro ao buscar caminhões:', error);
        return throwError(() => new Error('Erro ao carregar caminhões: ' + (error.error?.message || error.message)));
      })
    );
  }

  /**
   * Busca caminhões com paginação e filtros
   * Usa o endpoint GET /api/trucks
   */
  getTrucksPaginated(params: TruckPaginationParams): Observable<TruckPaginationResponse> {
    console.log('TruckService.getTrucksPaginated: Parâmetros recebidos:', params);
    
    // Preparar parâmetros para o ApiService
    const apiParams: any = {
      page: params.page,
      limit: params.limit
    };
    
    if (params.search) apiParams.search = params.search;
    if (params.status) apiParams.status = params.status;
    if (params.year) apiParams.year = params.year;
    if (params.model) apiParams.model = params.model;

    return this.apiService.get<TruckPaginationResponse>('/trucks', apiParams).pipe(
      map(response => {
        console.log('TruckService.getTrucksPaginated: Resposta da API:', response);
        console.log('TruckService.getTrucksPaginated: Estrutura da resposta:', {
          hasData: !!response.data,
          hasPagination: !!response.pagination,
          dataLength: response.data?.length,
          paginationKeys: response.pagination ? Object.keys(response.pagination) : 'undefined',
          fullResponse: response
        });
        return response;
      }),
      catchError(error => {
        console.error('TruckService.getTrucksPaginated: Erro ao buscar caminhões:', error);
        return throwError(() => new Error('Erro ao carregar caminhões: ' + (error.error?.message || error.message)));
      })
    );
  }

  /**
   * Busca caminhões ativos
   * Usa o endpoint GET /api/trucks com filtro por status
   */
  getActiveTrucks(): Observable<Truck[]> {
    console.log('TruckService.getActiveTrucks: Buscando caminhões ativos');
    
    // Primeiro tentar buscar sem filtro de status para ver se a API está funcionando
    const params: TruckPaginationParams = {
      page: 1,
      limit: 50 // Limite menor para evitar problemas
    };
    
    console.log('TruckService.getActiveTrucks: Parâmetros iniciais (sem status):', params);
    
    return this.getTrucksPaginated(params).pipe(
      map(response => {
        console.log('TruckService.getActiveTrucks: Resposta recebida, filtrando por status ativo');
        // Filtrar por status ativo no frontend se a API não suportar o filtro
        return (response.data || []).filter(truck => truck.status === 'ativo');
      }),
      catchError(error => {
        console.error('TruckService.getActiveTrucks: Erro ao buscar caminhões ativos:', error);
        console.error('TruckService.getActiveTrucks: Detalhes do erro:', {
          status: error.status,
          message: error.message,
          error: error.error
        });
        return throwError(() => new Error('Erro ao carregar caminhões ativos: ' + (error.error?.message || error.message)));
      })
    );
  }

  /**
   * Busca um caminhão por ID
   * Usa o endpoint GET /api/trucks/{id}
   */
  getTruckById(id: string): Observable<Truck | null> {
    console.log('TruckService.getTruckById: Buscando caminhão ID:', id);
    
    return this.apiService.get<Truck>(`/trucks/${id}`).pipe(
      map(truck => {
        console.log('TruckService.getTruckById: Caminhão encontrado:', truck);
        return truck;
      }),
      catchError(error => {
        console.error('TruckService.getTruckById: Erro ao buscar caminhão:', error);
        if (error.status === 404) {
          return of(null);
        }
        return throwError(() => new Error('Erro ao carregar caminhão: ' + (error.error?.message || error.message)));
      })
    );
  }

  /**
   * Cria um novo caminhão
   * Usa o endpoint POST /api/trucks
   */
  createTruck(request: CreateTruckRequest): Observable<Truck> {
    console.log('TruckService.createTruck: Criando caminhão:', request);
    
    return this.apiService.post<Truck>('/trucks', request).pipe(
      map(response => {
        console.log('TruckService.createTruck: Caminhão criado:', response);
        return response;
      }),
      catchError(error => {
        console.error('TruckService.createTruck: Erro ao criar caminhão:', error);
        return throwError(() => new Error('Erro ao criar caminhão: ' + (error.error?.message || error.message)));
      })
    );
  }

  /**
   * Atualiza um caminhão existente
   * Usa o endpoint PUT /api/trucks/{id}
   */
  updateTruck(id: string, request: UpdateTruckRequest): Observable<Truck> {
    console.log('TruckService.updateTruck: Atualizando caminhão ID:', id);
    console.log('TruckService.updateTruck: Dados da requisição:', request);
    
    return this.apiService.put<Truck>(`/trucks/${id}`, request).pipe(
      map(response => {
        console.log('TruckService.updateTruck: Caminhão atualizado:', response);
        return response;
      }),
      catchError(error => {
        console.error('TruckService.updateTruck: Erro ao atualizar caminhão:', error);
        return throwError(() => new Error('Erro ao atualizar caminhão: ' + (error.error?.message || error.message)));
      })
    );
  }

  /**
   * Atualiza apenas o status de um caminhão
   * Usa o endpoint PATCH /api/trucks/{id}/status
   */
  updateTruckStatus(id: string, status: 'ativo' | 'inativo'): Observable<Truck> {
    console.log('TruckService.updateTruckStatus: Atualizando status do caminhão ID:', id, 'para:', status);
    
    const request: UpdateTruckStatusRequest = { status };
    
    return this.apiService.patch<Truck>(`/trucks/${id}/status`, request).pipe(
      map(response => {
        console.log('TruckService.updateTruckStatus: Status atualizado:', response);
        return response;
      }),
      catchError(error => {
        console.error('TruckService.updateTruckStatus: Erro ao atualizar status:', error);
        return throwError(() => new Error('Erro ao atualizar status: ' + (error.error?.message || error.message)));
      })
    );
  }

  /**
   * Remove um caminhão
   * Usa o endpoint DELETE /api/trucks/{id}
   */
  deleteTruck(id: string): Observable<void> {
    console.log('TruckService.deleteTruck: Removendo caminhão ID:', id);
    
    return this.apiService.delete<void>(`/trucks/${id}`).pipe(
      map(() => {
        console.log('TruckService.deleteTruck: Caminhão removido com sucesso');
      }),
      catchError(error => {
        console.error('TruckService.deleteTruck: Erro ao remover caminhão:', error);
        return throwError(() => new Error('Erro ao remover caminhão: ' + (error.error?.message || error.message)));
      })
    );
  }

  /**
   * Desativa um caminhão (soft delete)
   * Usa o endpoint PATCH /api/trucks/{id}/status
   */
  deactivateTruck(id: string): Observable<Truck> {
    console.log('TruckService.deactivateTruck: Desativando caminhão ID:', id);
    return this.updateTruckStatus(id, 'inativo');
  }

  /**
   * Reativa um caminhão
   * Usa o endpoint PATCH /api/trucks/{id}/status
   */
  activateTruck(id: string): Observable<Truck> {
    console.log('TruckService.activateTruck: Reativando caminhão ID:', id);
    return this.updateTruckStatus(id, 'ativo');
  }

  /**
   * Verifica se uma placa já existe
   * Usa o endpoint GET /api/trucks com filtro de busca
   */
  existsByLicensePlate(licensePlate: string): Observable<boolean> {
    console.log('TruckService.existsByLicensePlate: Verificando placa:', licensePlate);
    
    const params: TruckPaginationParams = {
      page: 1,
      limit: 1,
      search: licensePlate
    };
    
    return this.getTrucksPaginated(params).pipe(
      map(response => {
        const exists = response.data.length > 0;
        console.log('TruckService.existsByLicensePlate: Placa existe:', exists);
        return exists;
      }),
      catchError(error => {
        console.error('TruckService.existsByLicensePlate: Erro ao verificar placa:', error);
        return throwError(() => new Error('Erro ao verificar placa: ' + (error.error?.message || error.message)));
      })
    );
  }

  /**
   * Método de teste para verificar se a API está funcionando
   */
  testApi(): Observable<TruckPaginationResponse> {
    console.log('TruckService.testApi: Testando API');
    
    const testParams: TruckPaginationParams = {
      page: 1,
      limit: 10
    };
    
    return this.getTrucksPaginated(testParams);
  }

  /**
   * Método para testar a API sem parâmetros
   */
  testApiBasic(): Observable<any> {
    console.log('TruckService.testApiBasic: Testando API básica sem parâmetros');
    
    return this.apiService.get<any>('/trucks').pipe(
      map(response => {
        console.log('TruckService.testApiBasic: Resposta da API básica:', response);
        return response;
      }),
      catchError(error => {
        console.error('TruckService.testApiBasic: Erro na API básica:', error);
        return throwError(() => error);
      })
    );
  }
}