import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { CategoryService } from '../../../core/services/category.service';
import { 
  FinancialEntry, 
  CreateFinancialEntryRequest, 
  UpdateFinancialEntryRequest,
  FinancialEntryFilters 
} from '../../../domain/models/financial-entry.model';

export interface FinancialEntryPaginationParams {
  page: number;
  limit: number;
  filters?: FinancialEntryFilters;
}

export interface FinancialEntryPaginationResponse {
  data: FinancialEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

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
   */
  getFinancialEntries(filters: FinancialEntryFilters = {}): Observable<FinancialEntry[]> {
    return this.apiService.get<FinancialEntry[]>('/financial-entries', filters).pipe(
      catchError(error => {
        console.error('Erro ao buscar lançamentos:', error);
        return throwError(() => new Error('Erro ao carregar lançamentos'));
      })
    );
  }

  /**
   * Busca lançamentos financeiros paginados com filtros
   */
  getFinancialEntriesPaginated(params: FinancialEntryPaginationParams): Observable<FinancialEntryPaginationResponse> {
    const queryParams: any = {
      _page: params.page + 1, // JSON Server usa 1-based pagination
      _limit: params.limit
    };

    // Adicionar filtros específicos
    if (params.filters) {
      if (params.filters.truckId) {
        queryParams.truckId = params.filters.truckId;
      }
      if (params.filters.entryType) {
        queryParams.entryType = params.filters.entryType;
      }
      if (params.filters.category) {
        queryParams.category = params.filters.category;
      }
      if (params.filters.startDate) {
        queryParams.date_gte = params.filters.startDate;
      }
      if (params.filters.endDate) {
        queryParams.date_lte = params.filters.endDate;
      }
    }

    return this.apiService.get<FinancialEntry[]>('/financial-entries', queryParams).pipe(
      switchMap(entries => {
        // Aplicar filtro de busca no lado do cliente se necessário
        let filteredEntries = entries;
        if (params.filters?.truckId || params.filters?.entryType || params.filters?.category) {
          filteredEntries = entries.filter(entry => {
            let matches = true;
            
            if (params.filters?.truckId && entry.truckId !== params.filters.truckId) {
              matches = false;
            }
            if (params.filters?.entryType && entry.entryType !== params.filters.entryType) {
              matches = false;
            }
            if (params.filters?.category && entry.category !== params.filters.category) {
              matches = false;
            }
            
            return matches;
          });
        }
        
        // Para obter o total, fazer uma segunda requisição sem paginação
        const countParams = { ...queryParams };
        delete countParams._page;
        delete countParams._limit;
        
        return this.apiService.get<FinancialEntry[]>('/financial-entries', countParams).pipe(
          map(allEntries => {
            // Aplicar o mesmo filtro de busca para o total
            let filteredAllEntries = allEntries;
            if (params.filters?.truckId || params.filters?.entryType || params.filters?.category) {
              filteredAllEntries = allEntries.filter(entry => {
                let matches = true;
                
                if (params.filters?.truckId && entry.truckId !== params.filters.truckId) {
                  matches = false;
                }
                if (params.filters?.entryType && entry.entryType !== params.filters.entryType) {
                  matches = false;
                }
                if (params.filters?.category && entry.category !== params.filters.category) {
                  matches = false;
                }
                
                return matches;
              });
            }
            
            const total = filteredAllEntries.length;
            const totalPages = Math.ceil(total / params.limit);
            
            return {
              data: filteredEntries,
              total,
              page: params.page,
              limit: params.limit,
              totalPages
            };
          })
        );
      }),
      catchError(error => {
        console.error('Erro ao buscar lançamentos paginados:', error);
        return throwError(() => new Error('Erro ao carregar lançamentos'));
      })
    );
  }

  /**
   * Busca um lançamento por ID
   */
  getFinancialEntryById(id: string): Observable<FinancialEntry | null> {
    return this.apiService.getById<FinancialEntry>('/financial-entries', id).pipe(
      catchError(error => {
        console.error('Erro ao buscar lançamento:', error);
        return throwError(() => new Error('Erro ao carregar lançamento'));
      })
    );
  }

  /**
   * Busca lançamentos de um caminhão específico
   */
  getFinancialEntriesByTruck(truckId: string): Observable<FinancialEntry[]> {
    return this.apiService.get<FinancialEntry[]>('/financial-entries', { truckId }).pipe(
      catchError(error => {
        console.error('Erro ao buscar lançamentos do caminhão:', error);
        return throwError(() => new Error('Erro ao carregar lançamentos do caminhão'));
      })
    );
  }

  /**
   * Busca lançamentos do usuário atual
   */
  getMyFinancialEntries(): Observable<FinancialEntry[]> {
    // Para simplicidade, vamos buscar todos os lançamentos
    // Em uma implementação real, você filtraria por usuário
    return this.getFinancialEntries();
  }

  /**
   * Cria um novo lançamento financeiro
   */
  createFinancialEntry(request: CreateFinancialEntryRequest): Observable<FinancialEntry> {
    // Adicionar userId simulado
    const entryWithUser = {
      ...request,
      createdUserId: 'user1' // Simular usuário logado
    };

    return this.apiService.post<FinancialEntry>('/financial-entries', entryWithUser).pipe(
      catchError(error => {
        console.error('Erro ao criar lançamento:', error);
        return throwError(() => new Error('Erro ao criar lançamento'));
      })
    );
  }

  /**
   * Atualiza um lançamento existente
   */
  updateFinancialEntry(id: string, request: UpdateFinancialEntryRequest): Observable<FinancialEntry> {
    return this.apiService.putById<FinancialEntry>('/financial-entries', id, request).pipe(
      catchError(error => {
        console.error('Erro ao atualizar lançamento:', error);
        return throwError(() => new Error('Erro ao atualizar lançamento'));
      })
    );
  }

  /**
   * Exclui um lançamento
   */
  deleteFinancialEntry(id: string): Observable<void> {
    return this.apiService.deleteById<void>('/financial-entries', id).pipe(
      catchError(error => {
        console.error('Erro ao excluir lançamento:', error);
        return throwError(() => new Error('Erro ao excluir lançamento'));
      })
    );
  }

  /**
   * Verifica se o usuário pode editar o lançamento
   */
  canEditEntry(entryId: string): Observable<boolean> {
    // Para simplicidade, sempre retorna true
    // Em uma implementação real, você verificaria as permissões
    return of(true);
  }

  /**
   * Obtém categorias disponíveis por tipo
   */
  getCategoriesByType(entryType: 'expense' | 'revenue'): string[] {
    return this.categoryService.getCategoryNamesByType(entryType);
  }
}
