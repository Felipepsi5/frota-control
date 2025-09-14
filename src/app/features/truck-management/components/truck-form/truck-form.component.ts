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
import { Subject } from 'rxjs';

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
    private snackBar: MatSnackBar
  ) {
    this.truckForm = this.createForm();
  }

  ngOnInit(): void {
    this.truckId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.truckId;

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
      licensePlate: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}[0-9]{4}$/)]],
      model: ['', [Validators.required, Validators.minLength(2)]],
      year: [new Date().getFullYear(), [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
      status: ['ativo', Validators.required]
    });
  }

  private loadTruckData(): void {
    if (!this.truckId) return;

    // Simulate loading truck data for demo purposes
    this.loading = true;
    setTimeout(() => {
      // Mock data for editing
      this.truckForm.patchValue({
        licensePlate: 'ABC1234',
        model: 'Volvo FH 540',
        year: 2022,
        status: 'ativo'
      });

      // Desabilitar edição da placa em modo de edição
      this.truckForm.get('licensePlate')?.disable();
      this.loading = false;
    }, 1000);
  }

  onSubmit(): void {
    if (this.truckForm.valid && !this.loading) {
      this.loading = true;

      // Simulate save operation
      setTimeout(() => {
        if (this.isEditMode) {
          this.snackBar.open('Caminhão atualizado com sucesso!', 'Fechar', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
        } else {
          this.snackBar.open('Caminhão cadastrado com sucesso!', 'Fechar', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
        }

        this.loading = false;
        this.router.navigate(['/trucks']);
      }, 1500);
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
      return 'Formato inválido. Use 3 letras seguidas de 4 números (ex: ABC1234)';
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
