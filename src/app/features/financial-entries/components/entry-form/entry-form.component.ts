import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { CategoryService } from '../../../../core/services/category.service';

@Component({
  selector: 'app-entry-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.scss']
})
export class EntryFormComponent implements OnInit, OnDestroy {
  entryForm: FormGroup;
  loading = false;
  isEditMode = false;
  entryId: string | null = null;
  trucks: any[] = [];
  categories: string[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private categoryService: CategoryService
  ) {
    this.entryForm = this.createForm();
  }

  ngOnInit(): void {
    this.entryId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.entryId;

    // Carregar caminhões ativos
    this.loadActiveTrucks();

    if (this.isEditMode && this.entryId) {
      this.loadEntryData();
    }

    // Observar mudanças no tipo de entrada para atualizar categorias
    this.entryForm.get('entryType')?.valueChanges
      .subscribe(entryType => {
        this.updateCategories(entryType as 'expense' | 'revenue');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      truckId: ['', Validators.required],
      date: [new Date(), Validators.required],
      entryType: ['expense', Validators.required],
      category: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      litersFilled: [null],
      odometerReading: [null]
    });
  }

  private loadActiveTrucks(): void {
    // Simulate loading trucks data
    this.trucks = [
      { id: '1', licensePlate: 'ABC1234', model: 'Volvo FH 540' },
      { id: '2', licensePlate: 'DEF5678', model: 'Scania R 450' },
      { id: '3', licensePlate: 'GHI9012', model: 'Mercedes Actros' },
      { id: '5', licensePlate: 'MNO7890', model: 'MAN TGX' }
    ];
  }

  private loadEntryData(): void {
    if (!this.entryId) return;

    // Simulate loading entry data
    this.loading = true;
    setTimeout(() => {
      this.entryForm.patchValue({
        truckId: '1',
        date: new Date(),
        entryType: 'expense',
        category: 'Combustível',
        amount: 500.00,
        litersFilled: 100,
        odometerReading: 50000
      });

      this.updateCategories('expense');
      this.loading = false;
    }, 1000);
  }

  private updateCategories(entryType: 'expense' | 'revenue'): void {
    // Usar o CategoryService para obter as categorias
    this.categories = this.categoryService.getCategoryNamesByType(entryType);
    
    // Reset category if current selection is not valid for new type
    const currentCategory = this.entryForm.get('category')?.value;
    if (currentCategory && !this.categories.includes(currentCategory)) {
      this.entryForm.get('category')?.setValue('');
    }

    // Update validators for conditional fields
    this.updateConditionalValidators(entryType);
  }

  private updateConditionalValidators(entryType: 'expense' | 'revenue'): void {
    const category = this.entryForm.get('category')?.value;
    const litersFilledControl = this.entryForm.get('litersFilled');
    const odometerReadingControl = this.entryForm.get('odometerReading');

    if (entryType === 'expense' && category === 'Combustível') {
      litersFilledControl?.setValidators([Validators.required, Validators.min(0.01)]);
      odometerReadingControl?.setValidators([Validators.required, Validators.min(0)]);
    } else {
      litersFilledControl?.clearValidators();
      odometerReadingControl?.clearValidators();
    }

    litersFilledControl?.updateValueAndValidity();
    odometerReadingControl?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.entryForm.valid && !this.loading) {
      this.loading = true;

      // Simulate save operation
      setTimeout(() => {
        if (this.isEditMode) {
          this.snackBar.open('Lançamento atualizado com sucesso!', 'Fechar', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
        } else {
          this.snackBar.open('Lançamento cadastrado com sucesso!', 'Fechar', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
        }

        this.loading = false;
        this.router.navigate(['/financial-entries']);
      }, 1500);
    }
  }

  onCancel(): void {
    this.router.navigate(['/financial-entries']);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.entryForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} é obrigatório`;
    }
    if (field?.hasError('min')) {
      return `${this.getFieldLabel(fieldName)} deve ser maior que ${field.errors?.['min'].min}`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      truckId: 'Caminhão',
      date: 'Data',
      entryType: 'Tipo',
      category: 'Categoria',
      amount: 'Valor',
      litersFilled: 'Litros Abastecidos',
      odometerReading: 'Quilometragem'
    };
    return labels[fieldName] || fieldName;
  }

  shouldShowFuelFields(): boolean {
    const entryType = this.entryForm.get('entryType')?.value;
    const category = this.entryForm.get('category')?.value;
    
    // Verificar se é uma categoria de abastecimento usando o CategoryService
    const categoryInfo = this.categoryService.getCategoryByName(category);
    return entryType === 'expense' && 
           (category === 'Abastecimento' || categoryInfo?.id === 'fuel');
  }
}
