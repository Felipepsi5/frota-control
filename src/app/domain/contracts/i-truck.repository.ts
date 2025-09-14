import { Observable } from 'rxjs';
import { Truck, CreateTruckRequest, UpdateTruckRequest } from '../models/truck.model';

export interface ITruckRepository {
  /**
   * Busca todos os caminhões
   */
  getAll(): Observable<Truck[]>;

  /**
   * Busca caminhões ativos
   */
  getActive(): Observable<Truck[]>;

  /**
   * Busca um caminhão por ID (placa)
   */
  getById(id: string): Observable<Truck | null>;

  /**
   * Cria um novo caminhão
   */
  create(request: CreateTruckRequest): Promise<Truck>;

  /**
   * Atualiza um caminhão existente
   */
  update(id: string, request: UpdateTruckRequest): Promise<Truck>;

  /**
   * Desativa um caminhão (soft delete)
   */
  deactivate(id: string): Promise<void>;

  /**
   * Verifica se uma placa já existe
   */
  existsByLicensePlate(licensePlate: string): Observable<boolean>;
}
