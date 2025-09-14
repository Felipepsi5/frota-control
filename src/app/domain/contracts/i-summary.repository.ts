import { Observable } from 'rxjs';
import { MonthlySummary, DashboardSummary, TruckPerformance } from '../models/summary.model';

export interface ISummaryRepository {
  /**
   * Busca resumo do dashboard
   */
  getDashboardSummary(): Observable<DashboardSummary>;

  /**
   * Busca resumos mensais de um caminhão
   */
  getMonthlySummariesByTruck(truckId: string): Observable<MonthlySummary[]>;

  /**
   * Busca resumo mensal específico
   */
  getMonthlySummary(truckId: string, year: number, month: number): Observable<MonthlySummary | null>;

  /**
   * Busca performance de todos os caminhões
   */
  getTrucksPerformance(): Observable<TruckPerformance[]>;

  /**
   * Busca performance de um caminhão específico
   */
  getTruckPerformance(truckId: string): Observable<TruckPerformance | null>;
}
