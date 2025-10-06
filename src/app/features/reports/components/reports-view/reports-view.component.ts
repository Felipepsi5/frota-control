import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FinancialReportsService, 
         FinancialSummaryReport, 
         TruckPerformanceReport, 
         CostAnalysisData, 
         FuelEfficiencyReport, 
         MonthlyTrendsReport, 
         ProfitabilityReport, 
         YearlyComparisonReport } from '../../services/financial-reports.service';
import { ExportService } from '../../services/export.service';
import { TruckService } from '../../../truck-management/services/truck.service';
import { Truck } from '../../../../domain/models/truck.model';

@Component({
  selector: 'app-reports-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
    ReactiveFormsModule
  ],
  templateUrl: './reports-view.component.html',
  styleUrls: ['./reports-view.component.scss']
})
export class ReportsViewComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Form
  dateForm!: FormGroup;
  
  // Data
  trucks: Truck[] = [];
  selectedTruckId: string | null = null;
  
  // Loading state
  loading = false;
  
  // Reports data
  financialSummary: FinancialSummaryReport | null = null;
  truckPerformance: TruckPerformanceReport | null = null;
  costAnalysis: CostAnalysisData | null = null;
  fuelEfficiency: FuelEfficiencyReport | null = null;
  monthlyTrends: MonthlyTrendsReport | null = null;
  profitability: ProfitabilityReport | null = null;
  yearlyComparison: YearlyComparisonReport | null = null;

  constructor(
    private fb: FormBuilder,
    private financialReportsService: FinancialReportsService,
    private exportService: ExportService,
    private truckService: TruckService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadTrucks();
    this.setDefaultDateRange();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.dateForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });
  }

  private setDefaultDateRange(): void {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - 1);
    
    this.dateForm.patchValue({
      startDate,
      endDate
    });
  }

  private loadTrucks(): void {
    this.truckService.getAllTrucks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (trucks) => {
          this.trucks = trucks || [];
        },
        error: (error) => {
          console.error('Erro ao carregar caminhões:', error);
          this.snackBar.open('Erro ao carregar caminhões', 'Fechar', { duration: 3000 });
        }
      });
  }

  private getReportParams() {
    const startDate = this.dateForm.get('startDate')?.value;
    const endDate = this.dateForm.get('endDate')?.value;
    
    if (!startDate || !endDate) {
      this.snackBar.open('Por favor, selecione as datas', 'Fechar', { duration: 3000 });
      return null;
    }

    return {
      startDate,
      endDate,
      truckId: this.selectedTruckId || undefined
    };
  }

  generateFinancialSummary(): void {
    const params = this.getReportParams();
    if (!params) return;

    this.loading = true;
    this.financialReportsService.getFinancialSummary(params.startDate, params.endDate, params.truckId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (report) => {
          this.financialSummary = report;
          this.loading = false;
          this.snackBar.open('Relatório de resumo financeiro gerado com sucesso', 'Fechar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Erro ao gerar relatório de resumo financeiro:', error);
          this.loading = false;
          this.snackBar.open('Erro ao gerar relatório', 'Fechar', { duration: 3000 });
        }
      });
  }

  generateTruckPerformance(): void {
    const params = this.getReportParams();
    if (!params) return;

    this.loading = true;
    this.financialReportsService.getTruckPerformance(params.startDate, params.endDate, params.truckId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (report) => {
          this.truckPerformance = report;
          this.loading = false;
          this.snackBar.open('Relatório de performance gerado com sucesso', 'Fechar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Erro ao gerar relatório de performance:', error);
          this.loading = false;
          this.snackBar.open('Erro ao gerar relatório', 'Fechar', { duration: 3000 });
        }
      });
  }

  generateCostAnalysis(): void {
    const params = this.getReportParams();
    if (!params) return;

    this.loading = true;
    this.financialReportsService.getCostAnalysis(params.startDate, params.endDate, params.truckId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (report) => {
          this.costAnalysis = report;
          this.loading = false;
          this.snackBar.open('Relatório de análise de custos gerado com sucesso', 'Fechar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Erro ao gerar relatório de análise de custos:', error);
          this.loading = false;
          this.snackBar.open('Erro ao gerar relatório', 'Fechar', { duration: 3000 });
        }
      });
  }

  generateFuelEfficiency(): void {
    const params = this.getReportParams();
    if (!params) return;

    this.loading = true;
    this.financialReportsService.getFuelEfficiency(params.startDate, params.endDate, params.truckId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (report) => {
          this.fuelEfficiency = report;
          this.loading = false;
          this.snackBar.open('Relatório de eficiência de combustível gerado com sucesso', 'Fechar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Erro ao gerar relatório de eficiência:', error);
          this.loading = false;
          this.snackBar.open('Erro ao gerar relatório', 'Fechar', { duration: 3000 });
        }
      });
  }

  generateMonthlyTrends(): void {
    const params = this.getReportParams();
    if (!params) return;

    this.loading = true;
    this.financialReportsService.getMonthlyTrends(params.startDate, params.endDate, params.truckId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (report) => {
          this.monthlyTrends = report;
          this.loading = false;
          this.snackBar.open('Relatório de tendências mensais gerado com sucesso', 'Fechar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Erro ao gerar relatório de tendências:', error);
          this.loading = false;
          this.snackBar.open('Erro ao gerar relatório', 'Fechar', { duration: 3000 });
        }
      });
  }

  generateProfitability(): void {
    const params = this.getReportParams();
    if (!params) return;

    this.loading = true;
    this.financialReportsService.getProfitability(params.startDate, params.endDate, params.truckId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (report) => {
          this.profitability = report;
          this.loading = false;
          this.snackBar.open('Relatório de lucratividade gerado com sucesso', 'Fechar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Erro ao gerar relatório de lucratividade:', error);
          this.loading = false;
          this.snackBar.open('Erro ao gerar relatório', 'Fechar', { duration: 3000 });
        }
      });
  }

  generateYearlyComparison(): void {
    const params = this.getReportParams();
    if (!params) return;

    this.loading = true;
    this.financialReportsService.getYearlyComparison(params.startDate, params.endDate, params.truckId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (report) => {
          this.yearlyComparison = report;
          this.loading = false;
          this.snackBar.open('Relatório de comparação anual gerado com sucesso', 'Fechar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Erro ao gerar relatório de comparação anual:', error);
          this.loading = false;
          this.snackBar.open('Erro ao gerar relatório', 'Fechar', { duration: 3000 });
        }
      });
  }

  exportCurrentReport(reportType: string): void {
    const params = this.getReportParams();
    if (!params) return;

    const reports = {
      financialSummary: reportType === 'summary' ? this.financialSummary : undefined,
      truckPerformance: reportType === 'truck-performance' ? this.truckPerformance : undefined,
      costAnalysis: reportType === 'cost-analysis' ? this.costAnalysis : undefined,
      fuelEfficiency: reportType === 'fuel-efficiency' ? this.fuelEfficiency : undefined,
      monthlyTrends: reportType === 'monthly-trends' ? this.monthlyTrends : undefined,
      profitability: reportType === 'profitability' ? this.profitability : undefined,
      yearlyComparison: reportType === 'yearly-comparison' ? this.yearlyComparison : undefined
    };

    const period = {
      startDate: params.startDate,
      endDate: params.endDate
    };

    const selectedTruck = this.trucks.find(truck => truck.id === this.selectedTruckId);
    const truckFilter = selectedTruck ? `${selectedTruck.licensePlate} - ${selectedTruck.model}` : undefined;

    this.exportService.exportReportToExcel(reportType, reports, period, truckFilter);
    this.snackBar.open('Relatório exportado com sucesso', 'Fechar', { duration: 3000 });
  }

  exportAllReports(): void {
    const params = this.getReportParams();
    if (!params) return;

    const reports = {
      financialSummary: this.financialSummary || undefined,
      truckPerformance: this.truckPerformance || undefined,
      costAnalysis: this.costAnalysis || undefined,
      fuelEfficiency: this.fuelEfficiency || undefined,
      monthlyTrends: this.monthlyTrends || undefined,
      profitability: this.profitability || undefined,
      yearlyComparison: this.yearlyComparison || undefined
    };

    const period = {
      startDate: params.startDate,
      endDate: params.endDate
    };

    const selectedTruck = this.trucks.find(truck => truck.id === this.selectedTruckId);
    const truckFilter = selectedTruck ? `${selectedTruck.licensePlate} - ${selectedTruck.model}` : undefined;

    this.exportService.exportAllReportsToExcel(reports, period, truckFilter);
    this.snackBar.open('Todos os relatórios foram exportados com sucesso', 'Fechar', { duration: 3000 });
  }

  scheduleReport(): void {
    this.snackBar.open('Funcionalidade de agendamento em desenvolvimento', 'Fechar', { duration: 3000 });
  }

  getCostCategories() {
    if (!this.costAnalysis?.expenseBreakdown) return [];
    
    return Object.entries(this.costAnalysis.expenseBreakdown).map(([name, value]) => ({
      name,
      value,
      percentage: this.costAnalysis!.expensePercentages[name] || 0
    }));
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value);
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(2)}%`;
  }
}