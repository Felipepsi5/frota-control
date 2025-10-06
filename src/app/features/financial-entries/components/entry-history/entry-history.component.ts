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
import { FinancialEntryService } from '../../services/financial-entry.service';
import { TruckService } from '../../../truck-management/services/truck.service';
import { FinancialEntry, FinancialEntryFilters, FinancialEntryPaginationParams, FinancialEntryPaginationResponse } from '../../../../domain/models/financial-entry.model';
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

  currentFilters: FinancialEntryFilters = {
    truckId: undefined,
    entryType: undefined,
    category: undefined,
    startDate: undefined,
    endDate: undefined,
    search: undefined
  };

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
    console.log('EntryHistoryComponent.loadTrucks: Carregando caminhões da API');
    
    this.truckService.getActiveTrucks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (trucks) => {
          console.log('EntryHistoryComponent.loadTrucks: Caminhões carregados:', trucks);
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
        error: (error) => {
          console.error('EntryHistoryComponent.loadTrucks: Erro ao carregar caminhões:', error);
          // Fallback para dados mockados em caso de erro
          console.warn('EntryHistoryComponent.loadTrucks: Usando dados mockados como fallback');
          
          const mockTrucks: Truck[] = [
            {
              id: 'truck-1',
              licensePlate: 'ABC-1234',
              model: 'Volvo FH 460',
              year: 2020,
              status: 'ativo',
              createdAt: new Date('2023-01-01'),
              updatedAt: new Date('2023-01-01')
            },
            {
              id: 'truck-2',
              licensePlate: 'XYZ-5678',
              model: 'Scania R 450',
              year: 2021,
              status: 'ativo',
              createdAt: new Date('2023-01-02'),
              updatedAt: new Date('2023-01-02')
            }
          ];

          this.trucks = mockTrucks;
          
          const truckFilter = this.filterConfig.selectFilters?.find(f => f.key === 'truckId');
          if (truckFilter) {
            truckFilter.options = mockTrucks.map((truck: Truck) => ({
              value: truck.id,
              label: `${truck.licensePlate} - ${truck.model}`
            }));
          }
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

    console.log('EntryHistoryComponent.loadEntriesPaginated: currentFilters:', this.currentFilters);

    const params: FinancialEntryPaginationParams = {
      page: this.paginationConfig.pageIndex + 1, // API usa 1-based indexing
      limit: this.paginationConfig.pageSize,
      truckId: this.currentFilters.truckId || undefined,
      startDate: this.currentFilters.startDate || undefined,
      endDate: this.currentFilters.endDate || undefined,
      entryType: this.currentFilters.entryType || undefined,
      category: this.currentFilters.category || undefined,
      search: this.currentFilters.search || undefined
    };

    console.log('EntryHistoryComponent.loadEntriesPaginated: Parâmetros enviados:', params);

    this.financialEntryService.getFinancialEntriesPaginated(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: FinancialEntryPaginationResponse) => {
          console.log('EntryHistoryComponent.loadEntriesPaginated: Resposta recebida:', response);
          console.log('EntryHistoryComponent.loadEntriesPaginated: Estrutura da resposta:', {
            hasData: !!response.data,
            hasPagination: !!response.pagination,
            dataLength: response.data?.length,
            paginationKeys: response.pagination ? Object.keys(response.pagination) : 'undefined'
          });
          
          this.entries = (response.data || []).map(item => ({
            id: item.id,
            truckId: item.truckId,
            licensePlate: item.licensePlate,
            date: new Date(item.date),
            entryType: item.entryType,
            category: item.category,
            amount: item.amount,
            litersFilled: item.litersFilled,
            odometerReading: item.odometerReading,
            description: item.description,
            createdUserId: item.createdUserId,
            createdUserName: item.createdUserName,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt)
          }));
          
          // Verificar se a estrutura de paginação existe
          if (response.pagination) {
            this.paginationConfig.totalItems = response.pagination.total;
          } else {
            // Fallback: usar o comprimento dos dados se paginação não estiver disponível
            this.paginationConfig.totalItems = response.data?.length || 0;
            console.warn('EntryHistoryComponent.loadEntriesPaginated: Paginação não disponível, usando fallback');
          }
          
          this.loading = false;
        },
        error: (error) => {
          console.error('EntryHistoryComponent.loadEntriesPaginated: Erro:', error);
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
    console.log('EntryHistoryComponent.onFilterChange: Evento recebido:', event);
    console.log('EntryHistoryComponent.onFilterChange: event.filters:', event.filters);
    
    this.currentFilters = {
      truckId: event.filters['truckId'] && event.filters['truckId'].trim() ? event.filters['truckId'] : undefined,
      entryType: event.filters['entryType'] && event.filters['entryType'].trim() ? event.filters['entryType'] as 'expense' | 'revenue' : undefined,
      category: event.filters['category'] && event.filters['category'].trim() ? event.filters['category'] : undefined,
      startDate: event.filters['startDate'] && event.filters['startDate'].trim() ? new Date(event.filters['startDate']).toISOString() : undefined,
      endDate: event.filters['endDate'] && event.filters['endDate'].trim() ? new Date(event.filters['endDate']).toISOString() : undefined,
      search: event.searchTerm && event.searchTerm.trim() ? event.searchTerm.trim() : undefined
    };
    
    console.log('EntryHistoryComponent.onFilterChange: Filtros aplicados:', this.currentFilters);
    
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
