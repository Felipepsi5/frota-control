import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  searchPlaceholder?: string;
  searchValue?: string;
  selectFilters?: {
    key: string;
    label: string;
    options: FilterOption[];
    value?: string;
  }[];
  dateFilters?: {
    key: string;
    label: string;
    value?: string;
  }[];
}

export interface FilterEvent {
  search: string;
  filters: { [key: string]: string };
}

@Component({
  selector: 'app-table-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule
  ],
  template: `
    <div class="filters-container">
      <!-- Filtros Principais (sempre visíveis) -->
      <div class="main-filters">
        <div class="search-field">
          <input 
            type="text"
            [value]="searchValue" 
            (input)="onInputChange($event)"
            (keydown.enter)="onSearch()"
            (keydown.escape)="clearSearch()"
            (blur)="onBlur()"
            placeholder="{{ config.searchPlaceholder || 'Digite para buscar...' }}"
            autocomplete="off"
            class="search-input">
          <button 
            mat-icon-button 
            (click)="onSearch()"
            class="search-button"
            title="Buscar">
            <mat-icon>search</mat-icon>
          </button>
        </div>
        
        <button 
          mat-icon-button 
          (click)="toggleAdvancedFilters()"
          [class.expanded]="showAdvancedFilters"
          title="Filtros avançados">
          <mat-icon>tune</mat-icon>
        </button>
        
        <button 
          mat-icon-button 
          (click)="clearAllFilters()"
          title="Limpar filtros">
          <mat-icon>clear</mat-icon>
        </button>
      </div>
      
      <!-- Filtros Avançados (expansível) -->
      <mat-expansion-panel 
        *ngIf="hasAdvancedFilters"
        [expanded]="showAdvancedFilters"
        (opened)="showAdvancedFilters = true"
        (closed)="showAdvancedFilters = false"
        class="advanced-filters-panel">
        
        <mat-expansion-panel-header>
          <mat-panel-title>
            <mat-icon>filter_list</mat-icon>
            Filtros Avançados
          </mat-panel-title>
        </mat-expansion-panel-header>
        
        <div class="advanced-filters-content">
          <!-- Filtros de Seleção -->
          <div class="filter-group" *ngIf="config.selectFilters?.length">
            <div 
              *ngFor="let filter of config.selectFilters" 
              class="filter-item">
              <mat-form-field appearance="outline">
                <mat-label>{{ filter.label }}</mat-label>
                <mat-select 
                  [(value)]="filterValues[filter.key]"
                  (selectionChange)="onFilterChange()">
                  <mat-option value="">Todos</mat-option>
                  <mat-option 
                    *ngFor="let option of filter.options" 
                    [value]="option.value">
                    {{ option.label }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </div>
          
          <!-- Filtros de Data -->
          <div class="filter-group" *ngIf="config.dateFilters?.length">
            <div 
              *ngFor="let filter of config.dateFilters" 
              class="filter-item">
              <mat-form-field appearance="outline">
                <mat-label>{{ filter.label }}</mat-label>
                <input 
                  matInput 
                  type="date"
                  [(ngModel)]="filterValues[filter.key]"
                  (change)="onFilterChange()">
              </mat-form-field>
            </div>
          </div>
          
          <!-- Ações dos Filtros -->
          <div class="filter-actions">
            <button 
              mat-raised-button 
              color="primary" 
              (click)="applyFilters()">
              <mat-icon>check</mat-icon>
              Aplicar Filtros
            </button>
            
            <button 
              mat-button 
              (click)="clearFilters()">
              <mat-icon>refresh</mat-icon>
              Limpar
            </button>
          </div>
        </div>
      </mat-expansion-panel>
    </div>
  `,
  styles: [`
    .filters-container {
      background: #fafafa;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }
    
    .main-filters {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    
    .search-field {
      flex: 1;
      min-width: 250px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .search-input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    
    .search-input:focus {
      border-color: #1976d2;
      box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
    }
    
    .search-button {
      flex-shrink: 0;
    }
    
    .advanced-filters-panel {
      margin-top: 16px;
      box-shadow: none;
      border: 1px solid #e0e0e0;
    }
    
    .advanced-filters-panel .mat-expansion-panel-header {
      padding: 0 16px;
      height: 48px;
    }
    
    .advanced-filters-content {
      padding: 16px;
    }
    
    .filter-group {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }
    
    .filter-item {
      min-width: 200px;
    }
    
    .filter-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }
    
    .filter-item mat-form-field {
      width: 100%;
    }
    
    @media (max-width: 768px) {
      .main-filters {
        flex-direction: column;
        align-items: stretch;
      }
      
      .search-field {
        min-width: unset;
      }
      
      .filter-group {
        flex-direction: column;
      }
      
      .filter-item {
        min-width: unset;
      }
      
      .filter-actions {
        flex-direction: column;
      }
    }
  `]
})
export class TableFiltersComponent implements OnInit, OnDestroy {
  @Input() config: FilterConfig = {};
  @Output() filterChange = new EventEmitter<FilterEvent>();

  searchValue: string = '';
  filterValues: { [key: string]: string } = {};
  showAdvancedFilters = false;
  
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Inicializar searchValue
    this.searchValue = this.config.searchValue || '';
    
    // Inicializar valores dos filtros
    if (this.config.selectFilters) {
      this.config.selectFilters.forEach(filter => {
        this.filterValues[filter.key] = filter.value || '';
      });
    }
    
    if (this.config.dateFilters) {
      this.config.dateFilters.forEach(filter => {
        this.filterValues[filter.key] = filter.value || '';
      });
    }
    
    // Configurar debounce para pesquisa
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.searchValue = value;
      this.emitFilterChange();
    });
  }

  get hasAdvancedFilters(): boolean {
    return !!(this.config.selectFilters?.length || this.config.dateFilters?.length);
  }

  onSearchValueChange(value: string): void {
    console.log('Search value changed to:', value);
    this.searchValue = value;
    this.emitFilterChange();
  }

  clearSearch(): void {
    this.searchValue = '';
    this.emitFilterChange();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onInputChange(event: any): void {
    this.searchValue = event.target.value;
    // Não emitir imediatamente, apenas quando sair do campo ou após debounce
  }

  onSearch(): void {
    // Aplicar filtro quando pressionar Enter ou clicar no botão
    this.emitFilterChange();
  }

  onBlur(): void {
    // Emitir filtro quando sair do campo
    this.emitFilterChange();
  }

  onSearchChange(): void {
    this.emitFilterChange();
  }

  onFilterChange(): void {
    // Não emitir automaticamente para filtros avançados
    // O usuário deve clicar em "Aplicar Filtros"
  }

  applyFilters(): void {
    this.emitFilterChange();
  }

  clearFilters(): void {
    // Limpar apenas filtros avançados
    if (this.config.selectFilters) {
      this.config.selectFilters.forEach(filter => {
        this.filterValues[filter.key] = '';
      });
    }
    
    if (this.config.dateFilters) {
      this.config.dateFilters.forEach(filter => {
        this.filterValues[filter.key] = '';
      });
    }
    
    this.emitFilterChange();
  }

  clearAllFilters(): void {
    this.searchValue = '';
    this.clearFilters();
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  private emitFilterChange(): void {
    this.filterChange.emit({
      search: this.searchValue,
      filters: { ...this.filterValues }
    });
  }
}
