import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
  searchTerm: string; // Adicionado para compatibilidade
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
  templateUrl: './table-filters.component.html',
  styleUrls: ['./table-filters.component.scss']
})
export class TableFiltersComponent implements OnInit, OnDestroy {
  @Input() config: FilterConfig = {};
  @Output() filterChange = new EventEmitter<FilterEvent>();

  searchValue: string = '';
  filterValues: { [key: string]: string } = {};
  showAdvancedFilters = false;
  
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
    
    // Removido debounce automático - busca apenas quando usuário solicitar
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

  onSearchInputChange(event: any): void {
    this.searchValue = event.target.value;
    console.log('TableFiltersComponent.onSearchInputChange: Valor da busca alterado para:', this.searchValue);
    // Não emitir automaticamente - apenas quando usuário clicar em buscar ou pressionar Enter
  }

  onSearch(): void {
    console.log('TableFiltersComponent.onSearch: Botão buscar clicado');
    // Aplicar filtro quando pressionar Enter ou clicar no botão
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
    console.log('TableFiltersComponent.applyFilters: Aplicando filtros avançados');
    console.log('TableFiltersComponent.applyFilters: Valores dos filtros:', this.filterValues);
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
    const filterEvent = {
      search: this.searchValue,
      searchTerm: this.searchValue, // Adicionado para compatibilidade
      filters: { ...this.filterValues }
    };
    
    console.log('TableFiltersComponent.emitFilterChange: Emitindo evento de filtro:', filterEvent);
    this.filterChange.emit(filterEvent);
  }
}
