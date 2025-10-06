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
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
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
