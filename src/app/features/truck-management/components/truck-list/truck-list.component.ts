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
import { PaginationComponent, PaginationConfig, PaginationEvent } from '../../../../shared/components/pagination/pagination.component';
import { TableFiltersComponent, FilterConfig, FilterEvent } from '../../../../shared/components/table-filters/table-filters.component';
import { TruckService, TruckFilters, TruckPaginationResponse } from '../../services/truck.service';
import { Truck } from '../../../../domain/models/truck.model';

@Component({
  selector: 'app-truck-list',
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
  templateUrl: './truck-list.component.html',
  styleUrls: ['./truck-list.component.scss']
})
export class TruckListComponent implements OnInit, OnDestroy {
  trucks: Truck[] = [];
  loading = true;
  error: string | null = null;

  displayedColumns: string[] = ['licensePlate', 'model', 'year', 'status', 'actions'];

  // Paginação
  paginationConfig: PaginationConfig = {
    pageIndex: 0,
    pageSize: 10,
    totalItems: 0,
    pageSizeOptions: [5, 10, 25, 50]
  };

  // Filtros
  filterConfig: FilterConfig = {
    searchPlaceholder: 'Buscar por placa, modelo ou ano...',
    selectFilters: [
      {
        key: 'status',
        label: 'Status',
        options: [
          { value: 'ativo', label: 'Ativo' },
          { value: 'inativo', label: 'Inativo' }
        ]
      }
    ]
  };

  currentFilters: TruckFilters = {};

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private truckService: TruckService
  ) {}

  ngOnInit(): void {
    this.loadTrucksPaginated();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTrucksPaginated(): void {
    this.loading = true;
    this.error = null;

    const params = {
      page: this.paginationConfig.pageIndex,
      limit: this.paginationConfig.pageSize,
      filters: this.currentFilters
    };

    this.truckService.getTrucksPaginated(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: TruckPaginationResponse) => {
          this.trucks = response.data;
          this.paginationConfig.totalItems = response.total;
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message || 'Erro ao carregar caminhões';
          this.loading = false;
          this.snackBar.open(this.error || 'Erro ao carregar caminhões', 'Fechar', {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  private loadTrucks(): void {
    this.loading = true;
    this.error = null;

    this.truckService.getAllTrucks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (trucks) => {
          this.trucks = trucks;
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message || 'Erro ao carregar caminhões';
          this.loading = false;
          this.snackBar.open(this.error || 'Erro ao carregar caminhões', 'Fechar', {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  onAddTruck(): void {
    this.router.navigate(['/trucks/new']);
  }

  onEditTruck(truck: any): void {
    this.router.navigate(['/trucks/edit', truck.id]);
  }

  onDeactivateTruck(truck: any): void {
    const dialogData: ConfirmDialogData = {
      title: 'Desativar Caminhão',
      message: `Tem certeza que deseja desativar o caminhão ${truck.licensePlate} (${truck.model})? Esta ação pode ser revertida posteriormente.`,
      confirmText: 'Desativar',
      cancelText: 'Cancelar',
      type: 'warning'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deactivateTruck(truck.id);
      }
    });
  }

  onActivateTruck(truck: any): void {
    const dialogData: ConfirmDialogData = {
      title: 'Reativar Caminhão',
      message: `Tem certeza que deseja reativar o caminhão ${truck.licensePlate} (${truck.model})?`,
      confirmText: 'Reativar',
      cancelText: 'Cancelar',
      type: 'info'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.activateTruck(truck.id);
      }
    });
  }

  private deactivateTruck(truckId: string): void {
    this.truckService.deactivateTruck(truckId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedTruck) => {
          // Atualizar o caminhão na lista local
          const index = this.trucks.findIndex(t => t.id === truckId);
          if (index !== -1) {
            this.trucks[index] = updatedTruck;
          }
          
          this.snackBar.open('Caminhão desativado com sucesso!', 'Fechar', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          this.snackBar.open(error.message || 'Erro ao desativar caminhão', 'Fechar', {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  private activateTruck(truckId: string): void {
    this.truckService.activateTruck(truckId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedTruck) => {
          // Atualizar o caminhão na lista local
          const index = this.trucks.findIndex(t => t.id === truckId);
          if (index !== -1) {
            this.trucks[index] = updatedTruck;
          }
          
          this.snackBar.open('Caminhão reativado com sucesso!', 'Fechar', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          this.snackBar.open(error.message || 'Erro ao reativar caminhão', 'Fechar', {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  refreshData(): void {
    this.loadTrucksPaginated();
  }

  onPageChange(event: PaginationEvent): void {
    this.paginationConfig.pageIndex = event.pageIndex;
    this.paginationConfig.pageSize = event.pageSize;
    this.loadTrucksPaginated();
  }

  onFilterChange(event: FilterEvent): void {
    this.currentFilters = {
      search: event.search || undefined,
      status: event.filters['status'] as 'ativo' | 'inativo' || undefined
    };
    
    // Reset para primeira página quando aplicar filtros
    this.paginationConfig.pageIndex = 0;
    this.loadTrucksPaginated();
  }

  getStatusClass(status: string): string {
    return status === 'ativo' ? 'status-active' : 'status-inactive';
  }

  getStatusIcon(status: string): string {
    return status === 'ativo' ? 'check_circle' : 'cancel';
  }
}
