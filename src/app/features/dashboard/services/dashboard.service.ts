import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ISummaryRepository } from '../../../domain/contracts/i-summary.repository';
import { DashboardSummary, TruckPerformance } from '../../../domain/models/summary.model';
import { SUMMARY_REPOSITORY } from '../../../domain/tokens/repository.tokens';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(@Inject(SUMMARY_REPOSITORY) private summaryRepository: ISummaryRepository) {}

  /**
   * Obtém resumo completo do dashboard
   */
  getDashboardSummary(): Observable<DashboardSummary> {
    return this.summaryRepository.getDashboardSummary();
  }

  /**
   * Obtém performance de todos os caminhões
   */
  getTrucksPerformance(): Observable<TruckPerformance[]> {
    return this.summaryRepository.getTrucksPerformance();
  }

  /**
   * Obtém performance de um caminhão específico
   */
  getTruckPerformance(truckId: string): Observable<TruckPerformance | null> {
    return this.summaryRepository.getTruckPerformance(truckId);
  }
}
