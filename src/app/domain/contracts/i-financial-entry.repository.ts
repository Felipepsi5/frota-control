import { Observable } from 'rxjs';
import { 
  FinancialEntry, 
  CreateFinancialEntryRequest, 
  UpdateFinancialEntryRequest,
  FinancialEntryFilters 
} from '../models/financial-entry.model';

export interface IFinancialEntryRepository {
  /**
   * Busca lançamentos financeiros com filtros
   */
  getByFilters(filters: FinancialEntryFilters): Observable<FinancialEntry[]>;

  /**
   * Busca um lançamento por ID
   */
  getById(id: string): Observable<FinancialEntry | null>;

  /**
   * Busca lançamentos de um caminhão específico
   */
  getByTruckId(truckId: string): Observable<FinancialEntry[]>;

  /**
   * Busca lançamentos de um usuário específico
   */
  getByUserId(userId: string): Observable<FinancialEntry[]>;

  /**
   * Cria um novo lançamento financeiro
   */
  create(request: CreateFinancialEntryRequest, userId: string): Promise<FinancialEntry>;

  /**
   * Atualiza um lançamento existente
   */
  update(id: string, request: UpdateFinancialEntryRequest): Promise<FinancialEntry>;

  /**
   * Exclui um lançamento
   */
  delete(id: string): Promise<void>;

  /**
   * Verifica se o usuário pode editar o lançamento
   */
  canUserEdit(entryId: string, userId: string, isAdmin: boolean): Observable<boolean>;
}
