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
import { takeUntil } from 'rxjs/operators';
import { CategoryService } from '../../../../core/services/category.service';
import { FinancialEntryService } from '../../services/financial-entry.service';
import { TruckService } from '../../../truck-management/services/truck.service';
import { CreateFinancialEntryRequest, UpdateFinancialEntryRequest, FinancialEntryResponse } from '../../../../domain/models/financial-entry.model';
import { Truck } from '../../../../domain/models/truck.model';

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
  trucks: Truck[] = [];
  categories: string[] = [];
  
  // Lista estática de categorias
  private expenseCategories: string[] = [
    'Combustível',
    'Manutenção',
    'Peças',
    'Pneus',
    'Troca de Óleo',
    'Pedágio',
    'Estacionamento',
    'Multas',
    'Seguro',
    'IPVA',
    'Licenciamento',
    'Salário Motorista',
    'Cartão Combustível',
    'Lavagem',
    'Vistoria',
    'Reparo',
    'Ferramentas',
    'Comunicação',
    'Alimentação',
    'Hospedagem',
    'Imposto Combustível',
    'Outros'
  ];

  private revenueCategories: string[] = [
    'Frete',
    'Entrega',
    'Aluguel',
    'Venda',
    'Serviços',
    'Bônus',
    'Reembolso',
    'Juros',
    'Comissão',
    'Outros'
  ];
  
  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private categoryService: CategoryService,
    private financialEntryService: FinancialEntryService,
    private truckService: TruckService
  ) {
    this.entryForm = this.createForm();
  }

  ngOnInit(): void {
    this.entryId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.entryId;

    // Carregar caminhões ativos
    this.loadActiveTrucks();

    // Carregar categorias iniciais (despesas por padrão)
    this.updateCategories('expense');

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
      description: ['', Validators.maxLength(500)],
      litersFilled: [null],
      odometerReading: [null]
    });
  }

  private loadActiveTrucks(): void {
    console.log('EntryFormComponent.loadActiveTrucks: Carregando caminhões da API');
    
    this.truckService.getActiveTrucks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (trucks) => {
          console.log('EntryFormComponent.loadActiveTrucks: Caminhões carregados da API:', trucks);
          this.trucks = trucks;
        },
        error: (error) => {
          console.error('EntryFormComponent.loadActiveTrucks: Erro ao carregar caminhões:', error);
        }
      });
  }

  private loadEntryData(): void {
    if (!this.entryId) return;

    this.loading = true;
    console.log('EntryFormComponent.loadEntryData: Carregando dados do lançamento ID:', this.entryId);

    this.financialEntryService.getFinancialEntryById(this.entryId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (entry: FinancialEntryResponse | null) => {
          if (entry) {
            console.log('EntryFormComponent.loadEntryData: Dados carregados:', entry);
            
            this.entryForm.patchValue({
              truckId: entry.truckId,
              date: new Date(entry.date),
              entryType: entry.entryType,
              category: entry.category,
              amount: entry.amount,
              description: entry.description || '',
              litersFilled: entry.litersFilled || null,
              odometerReading: entry.odometerReading || null
            });

            this.updateCategories(entry.entryType);
          } else {
            console.error('EntryFormComponent.loadEntryData: Lançamento não encontrado');
            this.snackBar.open('Lançamento não encontrado', 'Fechar', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
            this.router.navigate(['/financial-entries']);
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('EntryFormComponent.loadEntryData: Erro ao carregar lançamento:', error);
          this.snackBar.open('Erro ao carregar lançamento: ' + error.message, 'Fechar', {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
          this.loading = false;
          this.router.navigate(['/financial-entries']);
        }
      });
  }

  private updateCategories(entryType: 'expense' | 'revenue'): void {
    console.log('EntryFormComponent.updateCategories: Atualizando categorias para tipo:', entryType);
    
    // Usar listas estáticas
    if (entryType === 'expense') {
      this.categories = [...this.expenseCategories];
    } else {
      this.categories = [...this.revenueCategories];
    }
    
    console.log('EntryFormComponent.updateCategories: Categorias carregadas:', this.categories);
    
    // Reset category if current selection is not valid for new type
    const currentCategory = this.entryForm.get('category')?.value;
    if (currentCategory && !this.categories.includes(currentCategory)) {
      console.log('EntryFormComponent.updateCategories: Resetando categoria atual:', currentCategory);
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

      const formValue = this.entryForm.value;
      console.log('EntryFormComponent.onSubmit: Dados do formulário:', formValue);

      if (this.isEditMode && this.entryId) {
        // Modo de edição
        this.updateEntry(formValue);
      } else {
        // Modo de criação
        this.createEntry(formValue);
      }
    }
  }

  private createEntry(formValue: any): void {
    console.log('EntryFormComponent.createEntry: Dados do formulário:', formValue);
    
    // Validar dados antes de enviar
    if (!formValue.truckId) {
      this.snackBar.open('Selecione um caminhão', 'Fechar', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      this.loading = false;
      return;
    }

    // Validar se o truckId é um UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(formValue.truckId)) {
      console.error('EntryFormComponent.createEntry: TruckId inválido:', formValue.truckId);
      this.snackBar.open('ID do caminhão inválido', 'Fechar', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      this.loading = false;
      return;
    }

    if (!formValue.date) {
      this.snackBar.open('Selecione uma data', 'Fechar', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      this.loading = false;
      return;
    }

    if (!formValue.amount || Number(formValue.amount) <= 0) {
      this.snackBar.open('Digite um valor válido', 'Fechar', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      this.loading = false;
      return;
    }

    if (!formValue.category || formValue.category.trim() === '') {
      this.snackBar.open('Selecione uma categoria', 'Fechar', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      this.loading = false;
      return;
    }

    // Garantir que os valores numéricos sejam tratados corretamente
    const amount = Number(formValue.amount);
    
    // Para campos opcionais, enviar valores padrão conforme exemplo da API
    const litersFilled = formValue.litersFilled && formValue.litersFilled !== '' 
      ? Number(formValue.litersFilled) 
      : 0.01; // Valor padrão conforme exemplo
    
    const odometerReading = formValue.odometerReading && formValue.odometerReading !== ''
      ? Number(formValue.odometerReading)
      : 2147483647; // Valor padrão conforme exemplo
    
    const description = formValue.description && formValue.description.trim() !== ''
      ? formValue.description
      : "string"; // Valor padrão conforme exemplo

    const createRequest: CreateFinancialEntryRequest = {
      truckId: formValue.truckId,
      date: formValue.date.toISOString(),
      entryType: formValue.entryType,
      category: formValue.category,
      amount: amount,
      description: description,
      litersFilled: litersFilled,
      odometerReading: odometerReading
    };

    console.log('EntryFormComponent.createEntry: Requisição para API:', createRequest);
    console.log('EntryFormComponent.createEntry: JSON que será enviado:', JSON.stringify(createRequest, null, 2));
    console.log('EntryFormComponent.createEntry: Estrutura da requisição:', {
      hasTruckId: !!createRequest.truckId,
      hasDate: !!createRequest.date,
      hasEntryType: !!createRequest.entryType,
      hasCategory: !!createRequest.category,
      hasAmount: !!createRequest.amount,
      amountType: typeof createRequest.amount,
      amountValue: createRequest.amount,
      dateValue: createRequest.date,
      truckIdValue: createRequest.truckId,
      descriptionValue: createRequest.description,
      litersFilledValue: createRequest.litersFilled,
      litersFilledType: typeof createRequest.litersFilled,
      odometerReadingValue: createRequest.odometerReading,
      odometerReadingType: typeof createRequest.odometerReading
    });

    this.financialEntryService.createFinancialEntry(createRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('EntryFormComponent.createEntry: Resposta da API:', response);
          this.snackBar.open('Lançamento cadastrado com sucesso!', 'Fechar', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
          this.loading = false;
          this.router.navigate(['/financial-entries']);
        },
        error: (error) => {
          console.error('EntryFormComponent.createEntry: Erro ao criar lançamento:', error);
          console.error('EntryFormComponent.createEntry: Detalhes do erro:', {
            status: error.status,
            message: error.message,
            error: error.error,
            url: error.url
          });
          
          let errorMessage = 'Erro ao cadastrar lançamento';
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          this.snackBar.open(errorMessage, 'Fechar', {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
          this.loading = false;
        }
      });
  }

  private updateEntry(formValue: any): void {
    const updateRequest: UpdateFinancialEntryRequest = {
      date: formValue.date.toISOString(),
      entryType: formValue.entryType,
      category: formValue.category,
      amount: formValue.amount,
      description: formValue.description || null,
      descriptionProvided: true, // Indicar que a descrição foi explicitamente fornecida
      litersFilled: formValue.litersFilled || undefined,
      odometerReading: formValue.odometerReading || undefined
    };

    console.log('EntryFormComponent.updateEntry: Requisição para API:', updateRequest);

    this.financialEntryService.updateFinancialEntry(this.entryId!, updateRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('EntryFormComponent.updateEntry: Resposta da API:', response);
          this.snackBar.open('Lançamento atualizado com sucesso!', 'Fechar', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
          this.loading = false;
          this.router.navigate(['/financial-entries']);
        },
        error: (error) => {
          console.error('EntryFormComponent.updateEntry: Erro ao atualizar lançamento:', error);
          this.snackBar.open('Erro ao atualizar lançamento: ' + error.message, 'Fechar', {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
          this.loading = false;
        }
      });
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
    if (field?.hasError('maxlength')) {
      return `${this.getFieldLabel(fieldName)} deve ter no máximo ${field.errors?.['maxlength'].requiredLength} caracteres`;
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
      description: 'Descrição',
      litersFilled: 'Litros Abastecidos',
      odometerReading: 'Quilometragem'
    };
    return labels[fieldName] || fieldName;
  }

  shouldShowFuelFields(): boolean {
    const entryType = this.entryForm.get('entryType')?.value;
    const category = this.entryForm.get('category')?.value;
    
    // Verificar se é uma categoria de combustível
    return entryType === 'expense' && category === 'Combustível';
  }
}
