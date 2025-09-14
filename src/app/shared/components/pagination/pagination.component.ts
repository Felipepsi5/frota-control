import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

export interface PaginationConfig {
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions: number[];
}

export interface PaginationEvent {
  pageIndex: number;
  pageSize: number;
  length: number;
}

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  template: `
    <div class="pagination-container" *ngIf="config.totalItems > 0">
      <div class="pagination-info">
        <span class="items-info">
          Mostrando {{ getStartItem() }} - {{ getEndItem() }} de {{ config.totalItems }} itens
        </span>
        
        <div class="page-size-selector">
          <mat-form-field appearance="outline" class="page-size-field">
            <mat-label>Itens por página</mat-label>
            <mat-select 
              [value]="config.pageSize" 
              (selectionChange)="onPageSizeChange($event.value)">
              <mat-option *ngFor="let size of config.pageSizeOptions" [value]="size">
                {{ size }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>
      
      <mat-paginator
        [length]="config.totalItems"
        [pageSize]="config.pageSize"
        [pageIndex]="config.pageIndex"
        [pageSizeOptions]="config.pageSizeOptions"
        [showFirstLastButtons]="true"
        [hidePageSize]="true"
        (page)="onPageChange($event)"
        class="custom-paginator">
      </mat-paginator>
    </div>
  `,
  styles: [`
    .pagination-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-top: 1px solid #e0e0e0;
      margin-top: 16px;
    }
    
    .pagination-info {
      display: flex;
      align-items: center;
      gap: 24px;
    }
    
    .items-info {
      color: #666;
      font-size: 14px;
    }
    
    .page-size-selector {
      display: flex;
      align-items: center;
    }
    
    .page-size-field {
      width: 120px;
    }
    
    .page-size-field .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }
    
    .custom-paginator {
      background: transparent;
    }
    
    .custom-paginator .mat-mdc-paginator-range-label {
      margin: 0 16px;
    }
    
    @media (max-width: 768px) {
      .pagination-container {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
      
      .pagination-info {
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 16px;
      }
      
      .page-size-field {
        width: 100px;
      }
    }
  `]
})
export class PaginationComponent implements OnInit {
  @Input() config: PaginationConfig = {
    pageIndex: 0,
    pageSize: 10,
    totalItems: 0,
    pageSizeOptions: [5, 10, 25, 50, 100]
  };
  
  @Output() pageChange = new EventEmitter<PaginationEvent>();

  ngOnInit(): void {
    // Garantir que o pageSize está nas opções disponíveis
    if (!this.config.pageSizeOptions.includes(this.config.pageSize)) {
      this.config.pageSizeOptions = [...this.config.pageSizeOptions, this.config.pageSize].sort((a, b) => a - b);
    }
  }

  onPageChange(event: PageEvent): void {
    this.config.pageIndex = event.pageIndex;
    this.config.pageSize = event.pageSize;
    
    this.pageChange.emit({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
      length: event.length
    });
  }

  onPageSizeChange(newPageSize: number): void {
    this.config.pageSize = newPageSize;
    this.config.pageIndex = 0; // Reset para primeira página
    
    this.pageChange.emit({
      pageIndex: 0,
      pageSize: newPageSize,
      length: this.config.totalItems
    });
  }

  getStartItem(): number {
    return this.config.pageIndex * this.config.pageSize + 1;
  }

  getEndItem(): number {
    const end = (this.config.pageIndex + 1) * this.config.pageSize;
    return Math.min(end, this.config.totalItems);
  }
}
