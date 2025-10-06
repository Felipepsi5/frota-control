import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { CategoryService } from '../../../core/services/category.service';
import { 
  FinancialEntry, 
  CreateFinancialEntryRequest, 
  UpdateFinancialEntryRequest,
  FinancialEntryFilters,
  FinancialEntryResponse,
  FinancialEntryPaginationParams,
  FinancialEntryPaginationResponse
} from '../../../domain/models/financial-entry.model';

@Injectable({
  providedIn: 'root'
})
export class FinancialEntryService {
  constructor(
    private apiService: ApiService,
    private categoryService: CategoryService
  ) {}

  /**
   * Busca lançamentos financeiros com filtros
   * Usa o endpoint GET /api/financialentries
   */
  getFinancialEntries(filters: FinancialEntryFilters = {}): Observable<FinancialEntry[]> {
    console.log('FinancialEntryService.getFinancialEntries: Buscando lançamentos com filtros:', filters);
    
    // Construir query parameters
    const params = new URLSearchParams();
    
    if (filters.truckId) params.append('truckId', filters.truckId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.entryType) params.append('entryType', filters.entryType);
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);

    const queryString = params.toString();
    const endpoint = queryString ? `/financialentries?${queryString}` : '/financialentries';

    return this.apiService.get<FinancialEntryPaginationResponse>(endpoint).pipe(
      map(response => {
        console.log('FinancialEntryService.getFinancialEntries: Resposta da API:', response);
        // Converter FinancialEntryResponse[] para FinancialEntry[]
        return response.data.map(item => this.convertResponseToEntry(item));
      }),
      catchError(error => {
        console.error('FinancialEntryService.getFinancialEntries: Erro ao buscar lançamentos:', error);
        return throwError(() => new Error('Erro ao buscar lançamentos: ' + (error.error?.message || error.message)));
      })
    );
  }

  /**
   * Busca lançamentos financeiros paginados com filtros
   * Usa o endpoint GET /api/financialentries
   */
  getFinancialEntriesPaginated(params: FinancialEntryPaginationParams): Observable<FinancialEntryPaginationResponse> {
    console.log('FinancialEntryService.getFinancialEntriesPaginated: Parâmetros recebidos:', params);
    
    // Preparar parâmetros para o ApiService
    const apiParams: any = {
      page: params.page,
      limit: params.limit
    };
    
    if (params.truckId) apiParams.truckId = params.truckId;
    if (params.startDate) apiParams.startDate = params.startDate;
    if (params.endDate) apiParams.endDate = params.endDate;
    if (params.entryType) apiParams.entryType = params.entryType;
    if (params.category) apiParams.category = params.category;
    if (params.search) apiParams.search = params.search;

    return this.apiService.get<FinancialEntryPaginationResponse>('/financialentries', apiParams).pipe(
      map(response => {
        console.log('FinancialEntryService.getFinancialEntriesPaginated: Resposta da API:', response);
        console.log('FinancialEntryService.getFinancialEntriesPaginated: Estrutura da resposta:', {
          hasData: !!response.data,
          hasPagination: !!response.pagination,
          dataLength: response.data?.length,
          paginationKeys: response.pagination ? Object.keys(response.pagination) : 'undefined'
        });
        return response;
      }),
      catchError(error => {
        console.error('FinancialEntryService.getFinancialEntriesPaginated: Erro ao buscar lançamentos paginados:', error);
        return throwError(() => new Error('Erro ao buscar lançamentos: ' + (error.error?.message || error.message)));
      })
    );
  }

  /**
   * Busca um lançamento por ID
   * Usa o endpoint GET /api/financialentries/{id}
   * NOTA: Conforme documentação, este endpoint está em desenvolvimento
   */
  getFinancialEntryById(id: string): Observable<FinancialEntryResponse | null> {
    console.log('FinancialEntryService.getFinancialEntryById: Buscando lançamento ID:', id);
    console.warn('FinancialEntryService.getFinancialEntryById: Endpoint em desenvolvimento na API');

    return this.apiService.get<FinancialEntryResponse>(`/financialentries/${id}`).pipe(
      map(response => {
        console.log('FinancialEntryService.getFinancialEntryById: Lançamento encontrado:', response);
        return response;
      }),
      catchError(error => {
        console.error('FinancialEntryService.getFinancialEntryById: Erro ao buscar lançamento:', error);
        if (error.status === 404) {
          return of(null);
        }
        return throwError(() => new Error('Erro ao buscar lançamento: ' + (error.error?.message || error.message)));
      })
    );
  }

  /**
   * Busca lançamentos de um caminhão específico
   * Usa o endpoint GET /api/financialentries com filtro por truckId
   */
  getFinancialEntriesByTruck(truckId: string): Observable<FinancialEntry[]> {
    console.log('FinancialEntryService.getFinancialEntriesByTruck: Buscando lançamentos do caminhão:', truckId);
    
    return this.getFinancialEntries({ truckId });
  }

  /**
   * Busca lançamentos do usuário atual
   * A API já filtra automaticamente por UserId (multi-tenancy)
   */
  getMyFinancialEntries(): Observable<FinancialEntry[]> {
    console.log('FinancialEntryService.getMyFinancialEntries: Buscando lançamentos do usuário atual');
    return this.getFinancialEntries();
  }

  /**
   * Cria um novo lançamento financeiro
   * Usa o endpoint POST /api/financialentries
   */
  createFinancialEntry(request: CreateFinancialEntryRequest): Observable<FinancialEntryResponse> {
    console.log('FinancialEntryService.createFinancialEntry: Enviando requisição:', request);
    console.log('FinancialEntryService.createFinancialEntry: Estrutura da requisição:', {
      hasTruckId: !!request.truckId,
      hasDate: !!request.date,
      hasEntryType: !!request.entryType,
      hasCategory: !!request.category,
      hasAmount: !!request.amount,
      amountValue: request.amount,
      amountType: typeof request.amount,
      dateValue: request.date,
      truckIdValue: request.truckId,
      descriptionValue: request.description,
      litersFilledValue: request.litersFilled,
      odometerReadingValue: request.odometerReading
    });

    return this.apiService.post<FinancialEntryResponse>('/financialentries', request).pipe(
      map(response => {
        console.log('FinancialEntryService.createFinancialEntry: Resposta da API:', response);
        return response;
      }),
      catchError(error => {
        console.error('FinancialEntryService.createFinancialEntry: Erro ao criar lançamento:', error);
        console.error('FinancialEntryService.createFinancialEntry: Status do erro:', error.status);
        console.error('FinancialEntryService.createFinancialEntry: Mensagem do erro:', error.message);
        console.error('FinancialEntryService.createFinancialEntry: Detalhes do erro:', {
          status: error.status,
          message: error.message,
          error: error.error,
          url: error.url
        });
        return throwError(() => new Error('Erro ao criar lançamento: ' + (error.error?.message || error.message)));
      })
    );
  }

  /**
   * Atualiza um lançamento existente
   * Usa o endpoint PUT /api/financialentries/{id}
   */
  updateFinancialEntry(id: string, request: UpdateFinancialEntryRequest): Observable<FinancialEntryResponse> {
    console.log('FinancialEntryService.updateFinancialEntry: Atualizando lançamento ID:', id);
    console.log('FinancialEntryService.updateFinancialEntry: Dados da requisição:', request);

    return this.apiService.put<FinancialEntryResponse>(`/financialentries/${id}`, request).pipe(
      map(response => {
        console.log('FinancialEntryService.updateFinancialEntry: Lançamento atualizado:', response);
        return response;
      }),
      catchError(error => {
        console.error('FinancialEntryService.updateFinancialEntry: Erro ao atualizar lançamento:', error);
        return throwError(() => new Error('Erro ao atualizar lançamento: ' + (error.error?.message || error.message)));
      })
    );
  }

  /**
   * Exclui um lançamento
   * NOTA: Este endpoint não está implementado na API atual
   */
  deleteFinancialEntry(id: string): Observable<void> {
    console.warn('FinancialEntryService.deleteFinancialEntry: Endpoint não implementado na API.');
    return throwError(() => new Error('Funcionalidade de exclusão não está disponível ainda'));
  }

  /**
   * Verifica se o usuário pode editar o lançamento
   * Com multi-tenancy, usuários só podem editar seus próprios lançamentos
   */
  canEditEntry(entryId: string): Observable<boolean> {
    // Com multi-tenancy implementado na API, usuários só veem seus próprios dados
    // Portanto, se conseguiu buscar o lançamento, pode editá-lo
    return this.getFinancialEntryById(entryId).pipe(
      map(entry => entry !== null),
      catchError(() => of(false))
    );
  }

  /**
   * Obtém categorias disponíveis por tipo
   */
  getCategoriesByType(entryType: 'expense' | 'revenue'): string[] {
    return this.categoryService.getCategoryNamesByType(entryType);
  }

  /**
   * Método de teste para verificar a API de criação
   */
  testCreateApi(): Observable<any> {
    console.log('FinancialEntryService.testCreateApi: Testando API de criação');
    
    const testRequest = {
      truckId: 'test-truck-id',
      date: new Date().toISOString(),
      entryType: 'expense',
      category: 'Teste',
      amount: 100.00,
      description: 'Teste de criação'
    };
    
    console.log('FinancialEntryService.testCreateApi: Requisição de teste:', testRequest);
    
    return this.apiService.post<any>('/financialentries', testRequest).pipe(
      map(response => {
        console.log('FinancialEntryService.testCreateApi: Resposta da API de teste:', response);
        return response;
      }),
      catchError(error => {
        console.error('FinancialEntryService.testCreateApi: Erro na API de teste:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Converte FinancialEntryResponse para FinancialEntry
   */
  private convertResponseToEntry(response: FinancialEntryResponse): FinancialEntry {
    return {
      id: response.id,
      truckId: response.truckId,
      licensePlate: response.licensePlate,
      date: new Date(response.date),
      entryType: response.entryType,
      category: response.category,
      amount: response.amount,
      litersFilled: response.litersFilled,
      odometerReading: response.odometerReading,
      description: response.description,
      createdUserId: response.createdUserId,
      createdUserName: response.createdUserName,
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt)
    };
  }
}