import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { 
  FinancialSummaryReport, 
  TruckPerformanceReport, 
  CostAnalysisData, 
  FuelEfficiencyReport, 
  MonthlyTrendsReport, 
  ProfitabilityReport, 
  YearlyComparisonReport 
} from './financial-reports.service';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() {}

  /**
   * Exporta um relatório específico para Excel
   */
  exportReportToExcel(reportType: string, data: any, period: { startDate: Date; endDate: Date }, truckFilter?: string): void {
    console.log(`ExportService.exportReportToExcel: Exportando ${reportType} para Excel`);
    
    const workbook = XLSX.utils.book_new();
    
    switch (reportType) {
      case 'summary':
        this.addFinancialSummaryToExcel(workbook, data, period, truckFilter);
        break;
      case 'truck-performance':
        this.addTruckPerformanceToExcel(workbook, data, period, truckFilter);
        break;
      case 'cost-analysis':
        this.addCostAnalysisToExcel(workbook, data, period, truckFilter);
        break;
      case 'fuel-efficiency':
        this.addFuelEfficiencyToExcel(workbook, data, period, truckFilter);
        break;
      case 'monthly-trends':
        this.addMonthlyTrendsToExcel(workbook, data, period, truckFilter);
        break;
      case 'profitability':
        this.addProfitabilityToExcel(workbook, data, period, truckFilter);
        break;
      case 'yearly-comparison':
        this.addYearlyComparisonToExcel(workbook, data, period, truckFilter);
        break;
      default:
        console.error(`ExportService.exportReportToExcel: Tipo de relatório não suportado: ${reportType}`);
        return;
    }
    
    const fileName = this.generateFileName(reportType, period, truckFilter);
    XLSX.writeFile(workbook, fileName);
    
    console.log(`ExportService.exportReportToExcel: Arquivo ${fileName} gerado com sucesso`);
  }

  /**
   * Exporta todos os relatórios para Excel
   */
  exportAllReportsToExcel(reports: {
    financialSummary?: FinancialSummaryReport;
    truckPerformance?: TruckPerformanceReport;
    costAnalysis?: CostAnalysisData;
    fuelEfficiency?: FuelEfficiencyReport;
    monthlyTrends?: MonthlyTrendsReport;
    profitability?: ProfitabilityReport;
    yearlyComparison?: YearlyComparisonReport;
  }, period: { startDate: Date; endDate: Date }, truckFilter?: string): void {
    
    console.log('ExportService.exportAllReportsToExcel: Exportando todos os relatórios para Excel');
    
    const workbook = XLSX.utils.book_new();
    
    // Adicionar cada relatório como uma planilha separada
    if (reports.financialSummary) {
      this.addFinancialSummaryToExcel(workbook, reports.financialSummary, period, truckFilter);
    }
    
    if (reports.truckPerformance) {
      this.addTruckPerformanceToExcel(workbook, reports.truckPerformance, period, truckFilter);
    }
    
    if (reports.costAnalysis) {
      this.addCostAnalysisToExcel(workbook, reports.costAnalysis, period, truckFilter);
    }
    
    if (reports.fuelEfficiency) {
      this.addFuelEfficiencyToExcel(workbook, reports.fuelEfficiency, period, truckFilter);
    }
    
    if (reports.monthlyTrends) {
      this.addMonthlyTrendsToExcel(workbook, reports.monthlyTrends, period, truckFilter);
    }
    
    if (reports.profitability) {
      this.addProfitabilityToExcel(workbook, reports.profitability, period, truckFilter);
    }
    
    if (reports.yearlyComparison) {
      this.addYearlyComparisonToExcel(workbook, reports.yearlyComparison, period, truckFilter);
    }
    
    const fileName = this.generateFileName('relatorios-completos', period, truckFilter);
    XLSX.writeFile(workbook, fileName);
    
    console.log(`ExportService.exportAllReportsToExcel: Arquivo ${fileName} gerado com sucesso`);
  }

  /**
   * Adiciona resumo financeiro ao Excel
   */
  private addFinancialSummaryToExcel(workbook: XLSX.WorkBook, data: FinancialSummaryReport, period: { startDate: Date; endDate: Date }, truckFilter?: string): void {
    const summaryData = [
      ['Resumo Financeiro'],
      [''],
      ['Período', this.formatPeriod(period)],
      ['Filtro de Caminhão', truckFilter || 'Todos'],
      [''],
      ['Indicador', 'Valor'],
      ['Total Receitas', this.formatCurrency(data.totalRevenue || 0)],
      ['Total Despesas', this.formatCurrency(data.totalExpenses || 0)],
      ['Lucro Líquido', this.formatCurrency(data.netIncome || 0)],
      ['Margem de Lucro', `${(data.profitMargin || 0).toFixed(2)}%`],
      ['Total Lançamentos', (data.totalEntries || 0).toString()],
      ['Valor Médio', this.formatCurrency(data.averageEntryValue || 0)],
      ['Caminhões', (data.truckCount || 0).toString()]
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(summaryData);
    this.formatSummaryWorksheet(worksheet);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Resumo Financeiro');
  }

  /**
   * Adiciona performance de caminhões ao Excel
   */
  private addTruckPerformanceToExcel(workbook: XLSX.WorkBook, data: TruckPerformanceReport, period: { startDate: Date; endDate: Date }, truckFilter?: string): void {
    const truckData = [
      ['Performance por Caminhão'],
      [''],
      ['Período', this.formatPeriod(period)],
      ['Filtro de Caminhão', truckFilter || 'Todos'],
      [''],
      ['Placa', 'Modelo', 'Ano', 'Receita Total', 'Despesa Total', 'Lucro Líquido', 'Margem de Lucro (%)', 'Total KM', 'Total Litros', 'Eficiência (km/l)', 'Lançamentos', 'Lucro por KM']
    ];
    
    data.trucks?.forEach(truck => {
      truckData.push([
        truck.licensePlate || '',
        truck.model || '',
        truck.year?.toString() || '',
        this.formatCurrency(truck.totalRevenue || 0),
        this.formatCurrency(truck.totalExpenses || 0),
        this.formatCurrency(truck.netIncome || 0),
        (truck.profitMargin || 0).toFixed(2),
        (truck.totalKm || 0).toString(),
        (truck.totalLiters || 0).toString(),
        (truck.fuelEfficiency || 0).toFixed(2),
        (truck.entryCount || 0).toString(),
        (truck.profitPerKm || 0).toFixed(2)
      ]);
    });
    
    // Adicionar resumo
    truckData.push(['']);
    truckData.push(['Resumo Geral']);
    truckData.push(['Total Caminhões', (data.summary?.totalTrucks || 0).toString()]);
    truckData.push(['Receita Total', this.formatCurrency(data.summary?.totalRevenue || 0)]);
    truckData.push(['Despesa Total', this.formatCurrency(data.summary?.totalExpenses || 0)]);
    truckData.push(['Margem Média', `${(data.summary?.averageProfitMargin || 0).toFixed(2)}%`]);
    
    const worksheet = XLSX.utils.aoa_to_sheet(truckData);
    this.formatTableWorksheet(worksheet);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Performance Caminhões');
  }

  /**
   * Adiciona análise de custos ao Excel
   */
  private addCostAnalysisToExcel(workbook: XLSX.WorkBook, data: CostAnalysisData, period: { startDate: Date; endDate: Date }, truckFilter?: string): void {
    const costData = [
      ['Análise de Custos'],
      [''],
      ['Período', this.formatPeriod(period)],
      ['Filtro de Caminhão', truckFilter || 'Todos'],
      [''],
      ['Categoria', 'Valor', 'Percentual (%)']
    ];
    
    // Breakdown por categoria
    if (data.expenseBreakdown) {
      Object.entries(data.expenseBreakdown).forEach(([category, value]) => {
        costData.push([
          category,
          this.formatCurrency(value),
          `${(data.expensePercentages?.[category] || 0).toFixed(2)}%`
        ]);
      });
    }
    
    // Adicionar resumo
    costData.push(['']);
    costData.push(['Resumo']);
    costData.push(['Total de Despesas', this.formatCurrency(data.summary?.totalExpenses || 0)]);
    costData.push(['Média Mensal', this.formatCurrency(data.summary?.averageMonthlyExpenses || 0)]);
    costData.push(['Maior Categoria', data.summary?.highestExpenseCategory || 'N/A']);
    costData.push(['Crescimento', `${(data.summary?.expenseGrowth || 0).toFixed(2)}%`]);
    
    const worksheet = XLSX.utils.aoa_to_sheet(costData);
    this.formatTableWorksheet(worksheet);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Análise de Custos');
  }

  /**
   * Adiciona eficiência de combustível ao Excel
   */
  private addFuelEfficiencyToExcel(workbook: XLSX.WorkBook, data: FuelEfficiencyReport, period: { startDate: Date; endDate: Date }, truckFilter?: string): void {
    const fuelData = [
      ['Eficiência de Combustível'],
      [''],
      ['Período', this.formatPeriod(period)],
      ['Filtro de Caminhão', truckFilter || 'Todos'],
      [''],
      ['Placa', 'Total Litros', 'Total KM', 'Eficiência (km/l)', 'Custo Combustível', 'Custo por KM', 'Custo por Litro']
    ];
    
    data.truckEfficiency?.forEach(truck => {
      fuelData.push([
        truck.licensePlate || '',
        (truck.totalLiters || 0).toString(),
        (truck.totalKm || 0).toString(),
        (truck.fuelEfficiency || 0).toFixed(2),
        this.formatCurrency(truck.fuelCost || 0),
        (truck.fuelCostPerKm || 0).toFixed(2),
        (truck.fuelCostPerLiter || 0).toFixed(2)
      ]);
    });
    
    // Adicionar resumo
    fuelData.push(['']);
    fuelData.push(['Resumo']);
    fuelData.push(['Total Litros', (data.summary?.totalLiters || 0).toString()]);
    fuelData.push(['Total KM', (data.summary?.totalKm || 0).toString()]);
    fuelData.push(['Eficiência Média', (data.summary?.averageEfficiency || 0).toFixed(2)]);
    fuelData.push(['Custo Total Combustível', this.formatCurrency(data.summary?.totalFuelCost || 0)]);
    fuelData.push(['Custo Médio por KM', (data.summary?.averageFuelCostPerKm || 0).toFixed(2)]);
    
    const worksheet = XLSX.utils.aoa_to_sheet(fuelData);
    this.formatTableWorksheet(worksheet);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Eficiência Combustível');
  }

  /**
   * Adiciona tendências mensais ao Excel
   */
  private addMonthlyTrendsToExcel(workbook: XLSX.WorkBook, data: MonthlyTrendsReport, period: { startDate: Date; endDate: Date }, truckFilter?: string): void {
    const trendsData = [
      ['Tendências Mensais'],
      [''],
      ['Período', this.formatPeriod(period)],
      ['Filtro de Caminhão', truckFilter || 'Todos'],
      [''],
      ['Mês', 'Receita', 'Despesas', 'Lucro', 'Margem (%)', 'Lançamentos']
    ];
    
    data.monthlyData?.forEach(month => {
      trendsData.push([
        month.month || '',
        this.formatCurrency(month.revenue || 0),
        this.formatCurrency(month.expenses || 0),
        this.formatCurrency(month.netIncome || 0),
        (month.profitMargin || 0).toFixed(2),
        (month.entryCount || 0).toString()
      ]);
    });
    
    // Adicionar resumo
    trendsData.push(['']);
    trendsData.push(['Resumo']);
    trendsData.push(['Receita Média', this.formatCurrency(data.summary?.averageMonthlyRevenue || 0)]);
    trendsData.push(['Despesa Média', this.formatCurrency(data.summary?.averageMonthlyExpenses || 0)]);
    trendsData.push(['Crescimento Receita', `${(data.summary?.revenueGrowth || 0).toFixed(2)}%`]);
    trendsData.push(['Crescimento Despesa', `${(data.summary?.expenseGrowth || 0).toFixed(2)}%`]);
    
    const worksheet = XLSX.utils.aoa_to_sheet(trendsData);
    this.formatTableWorksheet(worksheet);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tendências Mensais');
  }

  /**
   * Adiciona lucratividade ao Excel
   */
  private addProfitabilityToExcel(workbook: XLSX.WorkBook, data: ProfitabilityReport, period: { startDate: Date; endDate: Date }, truckFilter?: string): void {
    const profitabilityData = [
      ['Lucratividade por Caminhão'],
      [''],
      ['Período', this.formatPeriod(period)],
      ['Filtro de Caminhão', truckFilter || 'Todos'],
      [''],
      ['Placa', 'Receita', 'Despesas', 'Lucro', 'Margem (%)', 'Total KM', 'Lucro por KM', 'ROI (%)']
    ];
    
    data.truckProfitability?.forEach(truck => {
      profitabilityData.push([
        truck.licensePlate || '',
        this.formatCurrency(truck.revenue || 0),
        this.formatCurrency(truck.expenses || 0),
        this.formatCurrency(truck.netIncome || 0),
        (truck.profitMargin || 0).toFixed(2),
        (truck.totalKm || 0).toString(),
        (truck.profitPerKm || 0).toFixed(2),
        (truck.roi || 0).toFixed(2)
      ]);
    });
    
    // Adicionar resumo
    profitabilityData.push(['']);
    profitabilityData.push(['Resumo']);
    profitabilityData.push(['Receita Total', this.formatCurrency(data.summary?.totalRevenue || 0)]);
    profitabilityData.push(['Despesa Total', this.formatCurrency(data.summary?.totalExpenses || 0)]);
    profitabilityData.push(['Lucro Total', this.formatCurrency(data.summary?.totalNetIncome || 0)]);
    profitabilityData.push(['Margem Média', `${(data.summary?.averageProfitMargin || 0).toFixed(2)}%`]);
    profitabilityData.push(['ROI Médio', `${(data.summary?.averageROI || 0).toFixed(2)}%`]);
    
    const worksheet = XLSX.utils.aoa_to_sheet(profitabilityData);
    this.formatTableWorksheet(worksheet);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lucratividade');
  }

  /**
   * Adiciona comparação anual ao Excel
   */
  private addYearlyComparisonToExcel(workbook: XLSX.WorkBook, data: YearlyComparisonReport, period: { startDate: Date; endDate: Date }, truckFilter?: string): void {
    const comparisonData = [
      ['Comparação Anual'],
      [''],
      ['Período', this.formatPeriod(period)],
      ['Filtro de Caminhão', truckFilter || 'Todos'],
      [''],
      ['Indicador', 'Ano Atual', 'Ano Anterior', 'Crescimento (%)'],
      ['Receita', this.formatCurrency(data.currentYear?.revenue || 0), this.formatCurrency(data.previousYear?.revenue || 0), `${(data.comparison?.revenueGrowth || 0).toFixed(2)}%`],
      ['Despesas', this.formatCurrency(data.currentYear?.expenses || 0), this.formatCurrency(data.previousYear?.expenses || 0), `${(data.comparison?.expenseGrowth || 0).toFixed(2)}%`],
      ['Lucro', this.formatCurrency(data.currentYear?.netIncome || 0), this.formatCurrency(data.previousYear?.netIncome || 0), `${(data.comparison?.netIncomeGrowth || 0).toFixed(2)}%`],
      ['Margem', `${(data.currentYear?.profitMargin || 0).toFixed(2)}%`, `${(data.previousYear?.profitMargin || 0).toFixed(2)}%`, `${(data.comparison?.profitMarginGrowth || 0).toFixed(2)}%`],
      ['Lançamentos', (data.currentYear?.entryCount || 0).toString(), (data.previousYear?.entryCount || 0).toString(), `${(data.comparison?.entryCountGrowth || 0).toFixed(2)}%`]
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(comparisonData);
    this.formatTableWorksheet(worksheet);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Comparação Anual');
  }

  /**
   * Formata planilha de resumo
   */
  private formatSummaryWorksheet(worksheet: XLSX.WorkSheet): void {
    // Definir larguras das colunas
    worksheet['!cols'] = [
      { wch: 20 }, // Coluna A
      { wch: 15 }  // Coluna B
    ];
  }

  /**
   * Formata planilha de tabela
   */
  private formatTableWorksheet(worksheet: XLSX.WorkSheet): void {
    // Definir larguras das colunas automaticamente
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    worksheet['!cols'] = [];
    
    for (let C = range.s.c; C <= range.e.c; ++C) {
      worksheet['!cols'][C] = { wch: 15 };
    }
  }

  /**
   * Formata período para exibição
   */
  private formatPeriod(period: { startDate: Date; endDate: Date }): string {
    const start = period.startDate.toLocaleDateString('pt-BR');
    const end = period.endDate.toLocaleDateString('pt-BR');
    return `${start} a ${end}`;
  }

  /**
   * Formata valores monetários
   */
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  /**
   * Gera nome do arquivo
   */
  private generateFileName(reportType: string, period: { startDate: Date; endDate: Date }, truckFilter?: string): string {
    const startDate = period.startDate.toISOString().split('T')[0];
    const endDate = period.endDate.toISOString().split('T')[0];
    const truckSuffix = truckFilter ? `-${truckFilter}` : '';
    
    const reportNames: { [key: string]: string } = {
      'summary': 'resumo-financeiro',
      'truck-performance': 'performance-caminhoes',
      'cost-analysis': 'analise-custos',
      'fuel-efficiency': 'eficiencia-combustivel',
      'monthly-trends': 'tendencias-mensais',
      'profitability': 'lucratividade',
      'yearly-comparison': 'comparacao-anual',
      'relatorios-completos': 'relatorios-completos'
    };
    
    const reportName = reportNames[reportType] || reportType;
    return `${reportName}${truckSuffix}_${startDate}_${endDate}.xlsx`;
  }
}