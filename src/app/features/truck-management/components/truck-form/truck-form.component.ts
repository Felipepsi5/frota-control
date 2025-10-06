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
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { TruckService } from '../../services/truck.service';
import { CreateTruckRequest, UpdateTruckRequest } from '../../../../domain/models/truck.model';

@Component({
  selector: 'app-truck-form',
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
    MatProgressSpinnerModule
  ],
  templateUrl: './truck-form.component.html',
  styleUrls: ['./truck-form.component.scss']
})
export class TruckFormComponent implements OnInit, OnDestroy {
  truckForm: FormGroup;
  loading = false;
  isEditMode = false;
  truckId: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private truckService: TruckService
  ) {
    this.truckForm = this.createForm();
  }

  ngOnInit(): void {
    this.truckId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.truckId;

    console.log('TruckFormComponent.ngOnInit: Modo de edição:', this.isEditMode, 'ID:', this.truckId);

    if (this.isEditMode && this.truckId) {
      this.loadTruckData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      licensePlate: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}[0-9]{4}$|^[A-Z]{3}[0-9][A-Z][0-9]{2}$/)]],
      model: ['', [Validators.required, Validators.minLength(2)]],
      year: [new Date().getFullYear(), [Validators.required, Validators.min(1900), Validators.max(2030)]],
      status: ['ativo', Validators.required]
    });
  }

  private loadTruckData(): void {
    if (!this.truckId) {
      console.error('TruckFormComponent.loadTruckData: ID do caminhão não fornecido');
      return;
    }

    console.log('TruckFormComponent.loadTruckData: Carregando dados do caminhão ID:', this.truckId);
    this.loading = true;
    
    this.truckService.getTruckById(this.truckId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (truck) => {
          console.log('TruckFormComponent.loadTruckData: Dados recebidos:', truck);
          
          if (truck) {
            this.truckForm.patchValue({
              licensePlate: truck.licensePlate,
              model: truck.model,
              year: truck.year,
              status: truck.status
            });

            // Desabilitar edição da placa em modo de edição
            this.truckForm.get('licensePlate')?.disable();
            console.log('TruckFormComponent.loadTruckData: Formulário preenchido com dados do caminhão');
          } else {
            console.error('TruckFormComponent.loadTruckData: Caminhão não encontrado');
            this.snackBar.open('Caminhão não encontrado', 'Fechar', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
            this.router.navigate(['/trucks']);
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('TruckFormComponent.loadTruckData: Erro ao carregar dados do caminhão:', error);
          this.snackBar.open('Erro ao carregar dados do caminhão', 'Fechar', {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
          this.loading = false;
          this.router.navigate(['/trucks']);
        }
      });
  }

  onSubmit(): void {
    if (this.truckForm.valid && !this.loading) {
      this.loading = true;

      // Obter valores do formulário, incluindo campos desabilitados
      const formValue = this.truckForm.getRawValue();
      console.log('TruckFormComponent.onSubmit: Dados do formulário:', formValue);

      if (this.isEditMode && this.truckId) {
        // Atualizar caminhão existente
        const updateRequest: UpdateTruckRequest = {
          licensePlate: formValue.licensePlate,
          model: formValue.model,
          year: formValue.year,
          status: formValue.status
        };

        console.log('TruckFormComponent.onSubmit: Atualizando caminhão:', this.truckId, updateRequest);

        this.truckService.updateTruck(this.truckId, updateRequest)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (updatedTruck) => {
              console.log('TruckFormComponent.onSubmit: Caminhão atualizado com sucesso:', updatedTruck);
              
              this.snackBar.open('Caminhão atualizado com sucesso!', 'Fechar', {
                duration: 3000,
                horizontalPosition: 'right',
                verticalPosition: 'top',
                panelClass: ['success-snackbar']
              });

              this.loading = false;
              this.router.navigate(['/trucks']);
            },
            error: (error) => {
              console.error('TruckFormComponent.onSubmit: Erro ao atualizar caminhão:', error);
              
              this.snackBar.open(error.message || 'Erro ao atualizar caminhão', 'Fechar', {
                duration: 5000,
                horizontalPosition: 'right',
                verticalPosition: 'top',
                panelClass: ['error-snackbar']
              });

              this.loading = false;
            }
          });
      } else {
        // Criar novo caminhão
        const createRequest: CreateTruckRequest = {
          licensePlate: formValue.licensePlate,
          model: formValue.model,
          year: formValue.year,
          status: formValue.status
        };

        console.log('TruckFormComponent.onSubmit: Criando novo caminhão:', createRequest);

        this.truckService.createTruck(createRequest)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (newTruck) => {
              console.log('TruckFormComponent.onSubmit: Caminhão criado com sucesso:', newTruck);
              
              this.snackBar.open('Caminhão cadastrado com sucesso!', 'Fechar', {
                duration: 3000,
                horizontalPosition: 'right',
                verticalPosition: 'top',
                panelClass: ['success-snackbar']
              });

              this.loading = false;
              this.router.navigate(['/trucks']);
            },
            error: (error) => {
              console.error('TruckFormComponent.onSubmit: Erro ao criar caminhão:', error);
              
              this.snackBar.open(error.message || 'Erro ao cadastrar caminhão', 'Fechar', {
                duration: 5000,
                horizontalPosition: 'right',
                verticalPosition: 'top',
                panelClass: ['error-snackbar']
              });

              this.loading = false;
            }
          });
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/trucks']);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.truckForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} é obrigatório`;
    }
    if (field?.hasError('pattern')) {
      return 'Formato inválido. Use 3 letras seguidas de 4 números (ex: ABC1234) ou formato Mercosul (ex: ABC1D23)';
    }
    if (field?.hasError('minlength')) {
      return `${this.getFieldLabel(fieldName)} deve ter pelo menos ${field.errors?.['minlength'].requiredLength} caracteres`;
    }
    if (field?.hasError('min')) {
      return `${this.getFieldLabel(fieldName)} deve ser maior que ${field.errors?.['min'].min}`;
    }
    if (field?.hasError('max')) {
      return `${this.getFieldLabel(fieldName)} deve ser menor que ${field.errors?.['max'].max}`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      licensePlate: 'Placa',
      model: 'Modelo',
      year: 'Ano',
      status: 'Status'
    };
    return labels[fieldName] || fieldName;
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }
}
