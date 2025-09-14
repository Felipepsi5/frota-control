# Componentes de Paginação e Filtros

Este documento explica como usar os componentes reutilizáveis de paginação e filtros criados para as tabelas da aplicação.

## Componentes Disponíveis

### 1. PaginationComponent (`app-pagination`)

Componente de paginação reutilizável com Material Design.

#### Uso Básico

```typescript
import { PaginationComponent, PaginationConfig, PaginationEvent } from '../../shared/components/pagination/pagination.component';

@Component({
  imports: [PaginationComponent],
  template: `
    <app-pagination 
      [config]="paginationConfig"
      (pageChange)="onPageChange($event)">
    </app-pagination>
  `
})
export class MyComponent {
  paginationConfig: PaginationConfig = {
    pageIndex: 0,
    pageSize: 10,
    totalItems: 0,
    pageSizeOptions: [5, 10, 25, 50]
  };

  onPageChange(event: PaginationEvent): void {
    this.paginationConfig.pageIndex = event.pageIndex;
    this.paginationConfig.pageSize = event.pageSize;
    this.loadData();
  }
}
```

#### Configuração

- `pageIndex`: Página atual (baseado em 0)
- `pageSize`: Número de itens por página
- `totalItems`: Total de itens
- `pageSizeOptions`: Opções de itens por página

### 2. TableFiltersComponent (`app-table-filters`)

Componente de filtros reutilizável com busca e filtros avançados.

#### Uso Básico

```typescript
import { TableFiltersComponent, FilterConfig, FilterEvent } from '../../shared/components/table-filters/table-filters.component';

@Component({
  imports: [TableFiltersComponent],
  template: `
    <app-table-filters 
      [config]="filterConfig"
      (filterChange)="onFilterChange($event)">
    </app-table-filters>
  `
})
export class MyComponent {
  filterConfig: FilterConfig = {
    searchPlaceholder: 'Buscar...',
    selectFilters: [
      {
        key: 'status',
        label: 'Status',
        options: [
          { value: 'ativo', label: 'Ativo' },
          { value: 'inativo', label: 'Inativo' }
        ]
      }
    ],
    dateFilters: [
      {
        key: 'dateFrom',
        label: 'Data Inicial'
      },
      {
        key: 'dateTo',
        label: 'Data Final'
      }
    ]
  };

  onFilterChange(event: FilterEvent): void {
    // event.search - texto de busca
    // event.filters - objeto com filtros aplicados
    this.loadData();
  }
}
```

#### Tipos de Filtros

1. **Busca**: Campo de texto para busca geral
2. **Filtros de Seleção**: Dropdown com opções predefinidas
3. **Filtros de Data**: Campos de data para filtros por período

## Exemplo Completo - Lista de Caminhões

### Serviço com Paginação

```typescript
export interface TruckFilters {
  search?: string;
  status?: 'ativo' | 'inativo';
  year?: number;
  model?: string;
}

export interface TruckPaginationParams {
  page: number;
  limit: number;
  filters?: TruckFilters;
}

export interface TruckPaginationResponse {
  data: Truck[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class TruckService {
  getTrucksPaginated(params: TruckPaginationParams): Observable<TruckPaginationResponse> {
    const queryParams: any = {
      _page: params.page + 1,
      _limit: params.limit
    };

    if (params.filters) {
      if (params.filters.search) {
        queryParams.q = params.filters.search;
      }
      if (params.filters.status) {
        queryParams.status = params.filters.status;
      }
    }

    return this.apiService.get<Truck[]>('/trucks', queryParams).pipe(
      switchMap(trucks => {
        return this.apiService.get<Truck[]>('/trucks', { ...queryParams, _page: undefined, _limit: undefined }).pipe(
          map(allTrucks => ({
            data: trucks,
            total: allTrucks.length,
            page: params.page,
            limit: params.limit,
            totalPages: Math.ceil(allTrucks.length / params.limit)
          }))
        );
      })
    );
  }
}
```

### Componente com Paginação e Filtros

```typescript
@Component({
  selector: 'app-truck-list',
  imports: [PaginationComponent, TableFiltersComponent],
  template: `
    <!-- Filtros -->
    <app-table-filters 
      [config]="filterConfig"
      (filterChange)="onFilterChange($event)">
    </app-table-filters>

    <!-- Tabela -->
    <mat-card>
      <mat-card-content>
        <!-- Conteúdo da tabela -->
      </mat-card-content>
    </mat-card>

    <!-- Paginação -->
    <app-pagination 
      [config]="paginationConfig"
      (pageChange)="onPageChange($event)">
    </app-pagination>
  `
})
export class TruckListComponent {
  // Configuração de paginação
  paginationConfig: PaginationConfig = {
    pageIndex: 0,
    pageSize: 10,
    totalItems: 0,
    pageSizeOptions: [5, 10, 25, 50]
  };

  // Configuração de filtros
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

  loadTrucksPaginated(): void {
    const params = {
      page: this.paginationConfig.pageIndex,
      limit: this.paginationConfig.pageSize,
      filters: this.currentFilters
    };

    this.truckService.getTrucksPaginated(params).subscribe({
      next: (response) => {
        this.trucks = response.data;
        this.paginationConfig.totalItems = response.total;
      }
    });
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
    
    this.paginationConfig.pageIndex = 0; // Reset para primeira página
    this.loadTrucksPaginated();
  }
}
```

## Benefícios

1. **Reutilização**: Componentes podem ser usados em qualquer tabela
2. **Consistência**: Interface uniforme em toda a aplicação
3. **Responsividade**: Funciona bem em desktop e mobile
4. **Flexibilidade**: Configurável para diferentes tipos de dados
5. **Performance**: Paginação reduz carga de dados
6. **UX**: Filtros facilitam a navegação em grandes volumes de dados

## Próximos Passos

Para implementar em outras tabelas:

1. Atualizar o serviço para suportar paginação e filtros
2. Adicionar os componentes no template
3. Configurar os filtros específicos para cada tipo de dados
4. Implementar os métodos de callback para paginação e filtros
