import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CategoryService } from '../../../../core/services/category.service';
import { FinancialEntryService, FinancialEntryPaginationParams, FinancialEntryPaginationResponse } from '../../services/financial-entry.service';
import { TruckService } from '../../../truck-management/services/truck.service';
import { FinancialEntry, FinancialEntryFilters } from '../../../../domain/models/financial-entry.model';
import { Truck } from '../../../../domain/models/truck.model';
import { PaginationComponent, PaginationConfig } from '../../../../shared/components/pagination/pagination.component';
import { TableFiltersComponent, FilterConfig, FilterEvent } from '../../../../shared/components/table-filters/table-filters.component';

@Component({
  selector: 'app-entry-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    PaginationComponent,
    TableFiltersComponent
  ],
  templateUrl: './entry-history.component.html',
  styleUrls: ['./entry-history.component.scss']
})
export class EntryHistoryComponent implements OnInit, OnDestroy {
  entries: FinancialEntry[] = [];
  trucks: Truck[] = [];
  loading = true;
  error: string | null = null;

  displayedColumns: string[] = ['date', 'truck', 'type', 'category', 'amount', 'actions'];

  // Paginação
  paginationConfig: PaginationConfig = {
    pageIndex: 0,
    pageSize: 10,
    totalItems: 0,
    pageSizeOptions: [5, 10, 25, 50]
  };

  // Filtros
  filterConfig: FilterConfig = {
    searchPlaceholder: 'Buscar por categoria, valor...',
    selectFilters: [
      {
        key: 'truckId',
        label: 'Caminhão',
        options: []
      },
      {
        key: 'entryType',
        label: 'Tipo',
        options: [
          { value: 'expense', label: 'Despesa' },
          { value: 'revenue', label: 'Receita' }
        ]
      },
      {
        key: 'category',
        label: 'Categoria',
        options: []
      }
    ],
    dateFilters: [
      {
        key: 'startDate',
        label: 'Data Inicial'
      },
      {
        key: 'endDate',
        label: 'Data Final'
      }
    ]
  };

  currentFilters: FinancialEntryFilters = {};

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private categoryService: CategoryService,
    private financialEntryService: FinancialEntryService,
    private truckService: TruckService
  ) {}

  ngOnInit(): void {
    this.loadTrucks();
    this.loadCategories();
    this.loadEntriesPaginated();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTrucks(): void {
    this.truckService.getAllTrucks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (trucks: Truck[]) => {
          this.trucks = trucks;
          // Atualizar opções de caminhões nos filtros
          const truckFilter = this.filterConfig.selectFilters?.find(f => f.key === 'truckId');
          if (truckFilter) {
            truckFilter.options = trucks.map((truck: Truck) => ({
              value: truck.id,
              label: `${truck.licensePlate} - ${truck.model}`
            }));
          }
        },
        error: (error: any) => {
          console.error('Erro ao carregar caminhões:', error);
        }
      });
  }

  private loadCategories(): void {
    const categories = this.categoryService.getAllCategories();
    // Atualizar opções de categorias nos filtros
    const categoryFilter = this.filterConfig.selectFilters?.find(f => f.key === 'category');
    if (categoryFilter) {
      categoryFilter.options = categories.map((category: any) => ({
        value: category.name,
        label: category.name
      }));
    }
  }

  private loadEntriesPaginated(): void {
    this.loading = true;
    this.error = null;

    const params: FinancialEntryPaginationParams = {
      page: this.paginationConfig.pageIndex,
      limit: this.paginationConfig.pageSize,
      filters: this.currentFilters
    };

    this.financialEntryService.getFinancialEntriesPaginated(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: FinancialEntryPaginationResponse) => {
          this.entries = response.data;
          this.paginationConfig.totalItems = response.total;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Erro ao carregar lançamentos';
          this.loading = false;
          this.snackBar.open('Erro ao carregar lançamentos', 'Fechar', { duration: 3000 });
        }
      });
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.paginationConfig.pageIndex = event.pageIndex;
    this.paginationConfig.pageSize = event.pageSize;
    this.loadEntriesPaginated();
  }

  onFilterChange(event: FilterEvent): void {
    this.currentFilters = {
      truckId: event.filters['truckId'] || undefined,
      entryType: event.filters['entryType'] as 'expense' | 'revenue' || undefined,
      category: event.filters['category'] || undefined,
      startDate: event.filters['startDate'] ? new Date(event.filters['startDate']) : undefined,
      endDate: event.filters['endDate'] ? new Date(event.filters['endDate']) : undefined
    };
    
    // Reset para primeira página quando aplicar filtros
    this.paginationConfig.pageIndex = 0;
    this.loadEntriesPaginated();
  }

  getTruckById(truckId: string): Truck | undefined {
    return this.trucks.find(truck => truck.id === truckId);
  }


  onAddEntry(): void {
    this.router.navigate(['/financial-entries/new']);
  }

  onEditEntry(entry: any): void {
    this.router.navigate(['/financial-entries/edit', entry.id]);
  }

  onDeleteEntry(entry: any): void {
    const dialogData: ConfirmDialogData = {
      title: 'Excluir Lançamento',
      message: `Tem certeza que deseja excluir este lançamento de ${entry.entryType === 'revenue' ? 'receita' : 'despesa'} de ${this.formatCurrency(entry.amount)}? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      type: 'danger'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteEntry(entry.id);
      }
    });
  }

  private deleteEntry(entryId: string): void {
    // Simulate deletion
    this.entries = this.entries.filter(entry => entry.id !== entryId);
    this.snackBar.open('Lançamento excluído com sucesso!', 'Fechar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  refreshData(): void {
    this.loadEntriesPaginated();
  }

  getTypeClass(entryType: string): string {
    return entryType === 'revenue' ? 'type-revenue' : 'type-expense';
  }

  getTypeIcon(entryType: string): string {
    return entryType === 'revenue' ? 'trending_up' : 'trending_down';
  }

  getTypeLabel(entryType: string): string {
    return entryType === 'revenue' ? 'Receita' : 'Despesa';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  }

  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-BR').format(dateObj);
  }

  getCategoryIcon(categoryName: string, entryType: 'expense' | 'revenue'): string {
    const category = this.categoryService.getCategoryByName(categoryName);
    return category?.icon || 'category';
  }

  getCategoryDescription(categoryName: string, entryType: 'expense' | 'revenue'): string {
    const category = this.categoryService.getCategoryByName(categoryName);
    return category?.description || categoryName;
  }

  getCategoryClass(entryType: 'expense' | 'revenue'): string {
    return entryType === 'expense' ? 'category-expense' : 'category-revenue';
  }
}
