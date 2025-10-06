import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { FinancialReportsService } from '../../reports/services/financial-reports.service';
import { TruckService } from '../../truck-management/services/truck.service';

export interface DashboardSummary {
  totalTrucks: number;
  activeTrucks: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  profitMargin: number;
  averageFuelEfficiency: number;
  totalEntries: number;
  averageEntryValue: number;
}

export interface TruckPerformance {
  truckId: string;
  licensePlate: string;
  model: string;
  year: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  profitMargin: number;
  totalKm: number;
  totalLiters: number;
  fuelEfficiency: number;
  entryCount: number;
  profitPerKm: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(
    private financialReportsService: FinancialReportsService,
    private truckService: TruckService
  ) {}

  /**
   * Obtém resumo completo do dashboard
   */
  getDashboardSummary(): Observable<DashboardSummary> {    
    // Definir período padrão (últimos 30 dias)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    
    // Buscar resumo financeiro e dados de caminhões em paralelo
    return forkJoin({
      financialSummary: this.financialReportsService.getFinancialSummary(startDate, endDate),
      trucks: this.truckService.getAllTrucks()
    }).pipe(
      map(({ financialSummary, trucks }) => {
        console.log('DashboardService.getDashboardSummary: Dados recebidos:', { financialSummary, trucks });
        
        const activeTrucks = trucks?.filter(truck => truck.status === 'ativo') || [];
        // Para o dashboard, vamos usar um valor padrão de eficiência de combustível
        // Em uma implementação real, isso viria dos dados de relatórios de combustível
        const averageFuelEfficiency = 8.5; // Valor padrão em km/l
        
        const summary: DashboardSummary = {
          totalTrucks: trucks?.length || 0,
          activeTrucks: activeTrucks.length,
          totalRevenue: financialSummary.totalRevenue || 0,
          totalExpenses: financialSummary.totalExpenses || 0,
          netIncome: financialSummary.netIncome || 0,
          profitMargin: financialSummary.profitMargin || 0,
          averageFuelEfficiency,
          totalEntries: financialSummary.totalEntries || 0,
          averageEntryValue: financialSummary.averageEntryValue || 0
        };
        
        console.log('DashboardService.getDashboardSummary: Resumo calculado:', summary);
        return summary;
      }),
      catchError(error => {
        console.error('DashboardService.getDashboardSummary: Erro ao buscar dados:', error);
        
        // Retornar dados padrão em caso de erro
        return of({
          totalTrucks: 0,
          activeTrucks: 0,
          totalRevenue: 0,
          totalExpenses: 0,
          netIncome: 0,
          profitMargin: 0,
          averageFuelEfficiency: 0,
          totalEntries: 0,
          averageEntryValue: 0
        });
      })
    );
  }

  /**
   * Obtém performance de todos os caminhões
   */
  getTrucksPerformance(): Observable<TruckPerformance[]> {
    console.log('DashboardService.getTrucksPerformance: Buscando performance dos caminhões');
    
    // Definir período padrão (últimos 30 dias)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    
    return this.financialReportsService.getTruckPerformance(startDate, endDate).pipe(
      map(response => {
        console.log('DashboardService.getTrucksPerformance: Dados recebidos:', response);
        return response.trucks || [];
      }),
      catchError(error => {
        console.error('DashboardService.getTrucksPerformance: Erro ao buscar dados:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtém performance de um caminhão específico
   */
  getTruckPerformance(truckId: string): Observable<TruckPerformance | null> {
    console.log('DashboardService.getTruckPerformance: Buscando performance do caminhão:', truckId);
    
    // Definir período padrão (últimos 30 dias)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    
    return this.financialReportsService.getTruckPerformance(startDate, endDate, truckId).pipe(
      map(response => {
        console.log('DashboardService.getTruckPerformance: Dados recebidos:', response);
        return response.trucks?.[0] || null;
      }),
      catchError(error => {
        console.error('DashboardService.getTruckPerformance: Erro ao buscar dados:', error);
        return of(null);
      })
    );
  }
}
