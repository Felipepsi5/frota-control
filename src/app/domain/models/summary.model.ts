export interface MonthlySummary {
  id: string; // truckId_year_month (ex: guid_2025_07)
  truckId: string; // GUID do caminhão
  year: number;
  month: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  kmPerLiterAverage: number;
  expenseBreakdown: Record<string, number>; // Map de categorias e valores
  totalKm: number;
  totalLiters: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardSummary {
  totalTrucks: number;
  activeTrucks: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  averageKmPerLiter: number;
  monthlySummaries: MonthlySummary[];
}

export interface TruckPerformance {
  truckId: string;
  licensePlate: string;
  model: string;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  kmPerLiterAverage: number;
  totalKm: number;
  totalLiters: number;
}
