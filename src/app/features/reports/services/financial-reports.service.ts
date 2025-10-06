import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';

// Interfaces para os tipos de relatórios
export interface FinancialSummaryReport {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  profitMargin: number;
  totalEntries: number;
  averageEntryValue: number;
  period: string;
  truckCount: number;
}

export interface TruckPerformanceData {
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

export interface TruckPerformanceReport {
  trucks: TruckPerformanceData[];
  summary: {
    totalTrucks: number;
    totalRevenue: number;
    totalExpenses: number;
    averageProfitMargin: number;
  };
}

export interface CostAnalysisData {
  expenseBreakdown: { [category: string]: number };
  expensePercentages: { [category: string]: number };
  monthlyTrends: Array<{
    month: string;
    totalExpenses: number;
    expenseBreakdown: { [category: string]: number };
  }>;
  summary: {
    totalExpenses: number;
    averageMonthlyExpenses: number;
    highestExpenseCategory: string;
    expenseGrowth: number;
  };
}

export interface FuelEfficiencyData {
  truckId: string;
  licensePlate: string;
  totalLiters: number;
  totalKm: number;
  fuelEfficiency: number;
  fuelCost: number;
  fuelCostPerKm: number;
  fuelCostPerLiter: number;
}

export interface FuelEfficiencyReport {
  truckEfficiency: FuelEfficiencyData[];
  summary: {
    totalLiters: number;
    totalKm: number;
    averageEfficiency: number;
    totalFuelCost: number;
    averageFuelCostPerKm: number;
  };
}

export interface MonthlyTrendData {
  month: string;
  revenue: number;
  expenses: number;
  netIncome: number;
  profitMargin: number;
  entryCount: number;
  truckCount: number;
}

export interface MonthlyTrendsReport {
  monthlyData: MonthlyTrendData[];
  summary: {
    totalMonths: number;
    averageMonthlyRevenue: number;
    averageMonthlyExpenses: number;
    revenueGrowth: number;
    expenseGrowth: number;
  };
}

export interface ProfitabilityData {
  truckId: string;
  licensePlate: string;
  revenue: number;
  expenses: number;
  netIncome: number;
  profitMargin: number;
  totalKm: number;
  profitPerKm: number;
  roi: number;
}

export interface ProfitabilityReport {
  truckProfitability: ProfitabilityData[];
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    totalNetIncome: number;
    averageProfitMargin: number;
    averageROI: number;
  };
}

export interface YearlyComparisonData {
  year: number;
  revenue: number;
  expenses: number;
  netIncome: number;
  profitMargin: number;
  entryCount: number;
  truckCount: number;
}

export interface YearlyComparisonReport {
  currentYear: YearlyComparisonData;
  previousYear: YearlyComparisonData;
  comparison: {
    revenueGrowth: number;
    expenseGrowth: number;
    netIncomeGrowth: number;
    profitMarginGrowth: number;
    entryCountGrowth: number;
  };
}

export type ReportType = 
  | 'summary' 
  | 'truck-performance' 
  | 'cost-analysis' 
  | 'fuel-efficiency' 
  | 'monthly-trends' 
  | 'profitability' 
  | 'yearly-comparison';

export interface ReportParams {
  startDate: Date;
  endDate: Date;
  reportType: ReportType;
  truckId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FinancialReportsService {

  constructor(private apiService: ApiService) {}

  /**
   * Gera relatório unificado baseado nos parâmetros
   */
  generateReport(params: ReportParams): Observable<any> {
    console.log('FinancialReportsService.generateReport: Parâmetros:', params);
    
    const queryParams: any = {
      StartDate: this.formatDate(params.startDate),
      EndDate: this.formatDate(params.endDate),
      ReportType: params.reportType
    };

    if (params.truckId) {
      queryParams.TruckId = params.truckId;
    }

    return this.apiService.get('/FinancialEntries/reports', queryParams).pipe(
      map(response => {
        console.log(`FinancialReportsService.generateReport: Resposta para ${params.reportType}:`, response);
        return response;
      }),
      catchError(error => {
        console.error(`FinancialReportsService.generateReport: Erro ao gerar relatório ${params.reportType}:`, error);
        return throwError(() => new Error(`Erro ao gerar relatório: ${error.error?.message || error.message}`));
      })
    );
  }

  /**
   * Gera relatório de resumo financeiro
   */
  getFinancialSummary(startDate: Date, endDate: Date, truckId?: string): Observable<FinancialSummaryReport> {
    return this.generateReport({
      startDate,
      endDate,
      reportType: 'summary',
      truckId
    }) as Observable<FinancialSummaryReport>;
  }

  /**
   * Gera relatório de performance por caminhão
   */
  getTruckPerformance(startDate: Date, endDate: Date, truckId?: string): Observable<TruckPerformanceReport> {
    return this.generateReport({
      startDate,
      endDate,
      reportType: 'truck-performance',
      truckId
    }) as Observable<TruckPerformanceReport>;
  }

  /**
   * Gera relatório de análise de custos
   */
  getCostAnalysis(startDate: Date, endDate: Date, truckId?: string): Observable<CostAnalysisData> {
    return this.generateReport({
      startDate,
      endDate,
      reportType: 'cost-analysis',
      truckId
    }) as Observable<CostAnalysisData>;
  }

  /**
   * Gera relatório de eficiência de combustível
   */
  getFuelEfficiency(startDate: Date, endDate: Date, truckId?: string): Observable<FuelEfficiencyReport> {
    return this.generateReport({
      startDate,
      endDate,
      reportType: 'fuel-efficiency',
      truckId
    }) as Observable<FuelEfficiencyReport>;
  }

  /**
   * Gera relatório de tendências mensais
   */
  getMonthlyTrends(startDate: Date, endDate: Date, truckId?: string): Observable<MonthlyTrendsReport> {
    return this.generateReport({
      startDate,
      endDate,
      reportType: 'monthly-trends',
      truckId
    }) as Observable<MonthlyTrendsReport>;
  }

  /**
   * Gera relatório de lucratividade
   */
  getProfitability(startDate: Date, endDate: Date, truckId?: string): Observable<ProfitabilityReport> {
    return this.generateReport({
      startDate,
      endDate,
      reportType: 'profitability',
      truckId
    }) as Observable<ProfitabilityReport>;
  }

  /**
   * Gera relatório de comparação anual
   */
  getYearlyComparison(startDate: Date, endDate: Date, truckId?: string): Observable<YearlyComparisonReport> {
    return this.generateReport({
      startDate,
      endDate,
      reportType: 'yearly-comparison',
      truckId
    }) as Observable<YearlyComparisonReport>;
  }

  /**
   * Formata data para formato ISO (YYYY-MM-DD)
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Valida se o período é válido (máximo 1 ano)
   */
  validateDateRange(startDate: Date, endDate: Date): { valid: boolean; message?: string } {
    if (startDate >= endDate) {
      return { valid: false, message: 'Data de início deve ser anterior à data de fim' };
    }

    const diffInDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffInDays > 366) {
      return { valid: false, message: 'Período máximo permitido é de 1 ano (366 dias)' };
    }

    return { valid: true };
  }
}
