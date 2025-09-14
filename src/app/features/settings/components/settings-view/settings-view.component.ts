import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategorySettingsComponent } from '../category-settings/category-settings.component';

@Component({
  selector: 'app-settings-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    CategorySettingsComponent
  ],
  template: `
    <div class="settings-container">
      <mat-card class="header-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>settings</mat-icon>
            Configurações
          </mat-card-title>
          <mat-card-subtitle>
            Gerencie as configurações do sistema
          </mat-card-subtitle>
        </mat-card-header>
      </mat-card>

      <mat-tab-group class="settings-tabs">
        <mat-tab label="Geral">
          <ng-template matTabContent>
            <mat-card class="settings-card">
              <mat-card-header>
                <mat-card-title>Configurações Gerais</mat-card-title>
                <mat-card-subtitle>Configurações básicas do sistema</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="settings-form">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Nome da Empresa</mat-label>
                    <input matInput [(ngModel)]="generalSettings.companyName" placeholder="Digite o nome da empresa">
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>CNPJ</mat-label>
                    <input matInput [(ngModel)]="generalSettings.cnpj" placeholder="00.000.000/0000-00">
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Moeda Padrão</mat-label>
                    <mat-select [(value)]="generalSettings.defaultCurrency">
                      <mat-option value="BRL">Real Brasileiro (R$)</mat-option>
                      <mat-option value="USD">Dólar Americano ($)</mat-option>
                      <mat-option value="EUR">Euro (€)</mat-option>
                    </mat-select>
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Fuso Horário</mat-label>
                    <mat-select [(value)]="generalSettings.timezone">
                      <mat-option value="America/Sao_Paulo">São Paulo (GMT-3)</mat-option>
                      <mat-option value="America/New_York">Nova York (GMT-5)</mat-option>
                      <mat-option value="Europe/London">Londres (GMT+0)</mat-option>
                    </mat-select>
                  </mat-form-field>
                  
                  <div class="toggle-settings">
                    <mat-slide-toggle [checked]="generalSettings.notifications" (change)="generalSettings.notifications = $event.checked">
                      Notificações por Email
                    </mat-slide-toggle>
                    
                    <mat-slide-toggle [checked]="generalSettings.autoBackup" (change)="generalSettings.autoBackup = $event.checked">
                      Backup Automático
                    </mat-slide-toggle>
                    
                    <mat-slide-toggle [checked]="generalSettings.darkMode" (change)="generalSettings.darkMode = $event.checked">
                      Modo Escuro
                    </mat-slide-toggle>
                  </div>
                  
                  <div class="form-actions">
                    <button mat-raised-button color="primary" (click)="saveGeneralSettings()">
                      <mat-icon>save</mat-icon>
                      Salvar Configurações
                    </button>
                    
                    <button mat-button (click)="resetGeneralSettings()">
                      <mat-icon>refresh</mat-icon>
                      Restaurar Padrões
                    </button>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </ng-template>
        </mat-tab>
        
        <mat-tab label="Categorias">
          <ng-template matTabContent>
            <app-category-settings></app-category-settings>
          </ng-template>
        </mat-tab>
        
        <mat-tab label="Usuários">
          <ng-template matTabContent>
            <mat-card class="settings-card">
              <mat-card-header>
                <mat-card-title>Gerenciamento de Usuários</mat-card-title>
                <mat-card-subtitle>Configure usuários e permissões</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="user-management">
                  <div class="user-stats">
                    <div class="stat-item">
                      <mat-icon>person</mat-icon>
                      <div class="stat-content">
                        <div class="stat-number">{{ userStats.totalUsers }}</div>
                        <div class="stat-label">Total de Usuários</div>
                      </div>
                    </div>
                    
                    <div class="stat-item">
                      <mat-icon>admin_panel_settings</mat-icon>
                      <div class="stat-content">
                        <div class="stat-number">{{ userStats.adminUsers }}</div>
                        <div class="stat-label">Administradores</div>
                      </div>
                    </div>
                    
                    <div class="stat-item">
                      <mat-icon>person_pin</mat-icon>
                      <div class="stat-content">
                        <div class="stat-number">{{ userStats.regularUsers }}</div>
                        <div class="stat-label">Usuários Comuns</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="user-actions">
                    <button mat-raised-button color="primary" (click)="addUser()">
                      <mat-icon>person_add</mat-icon>
                      Adicionar Usuário
                    </button>
                    
                    <button mat-raised-button color="accent" (click)="managePermissions()">
                      <mat-icon>security</mat-icon>
                      Gerenciar Permissões
                    </button>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </ng-template>
        </mat-tab>
        
        <mat-tab label="Sistema">
          <ng-template matTabContent>
            <mat-card class="settings-card">
              <mat-card-header>
                <mat-card-title>Configurações do Sistema</mat-card-title>
                <mat-card-subtitle>Configurações avançadas e manutenção</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="system-settings">
                  <div class="system-info">
                    <h3>Informações do Sistema</h3>
                    <div class="info-grid">
                      <div class="info-item">
                        <mat-icon>info</mat-icon>
                        <div class="info-content">
                          <div class="info-label">Versão</div>
                          <div class="info-value">{{ systemInfo.version }}</div>
                        </div>
                      </div>
                      
                      <div class="info-item">
                        <mat-icon>storage</mat-icon>
                        <div class="info-content">
                          <div class="info-label">Banco de Dados</div>
                          <div class="info-value">{{ systemInfo.database }}</div>
                        </div>
                      </div>
                      
                      <div class="info-item">
                        <mat-icon>schedule</mat-icon>
                        <div class="info-content">
                          <div class="info-label">Último Backup</div>
                          <div class="info-value">{{ systemInfo.lastBackup }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="maintenance-actions">
                    <h3>Manutenção</h3>
                    <div class="action-buttons">
                      <button mat-raised-button color="primary" (click)="createBackup()">
                        <mat-icon>backup</mat-icon>
                        Criar Backup
                      </button>
                      
                      <button mat-raised-button color="accent" (click)="clearCache()">
                        <mat-icon>cleaning_services</mat-icon>
                        Limpar Cache
                      </button>
                      
                      <button mat-raised-button color="warn" (click)="resetSystem()">
                        <mat-icon>restore</mat-icon>
                        Resetar Sistema
                      </button>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </ng-template>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .settings-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .header-card {
      margin-bottom: 24px;
    }
    
    .settings-tabs {
      margin-bottom: 24px;
    }
    
    .settings-card {
      margin-bottom: 24px;
    }
    
    .settings-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .full-width {
      width: 100%;
    }
    
    .toggle-settings {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin: 24px 0;
    }
    
    .form-actions {
      display: flex;
      gap: 16px;
      margin-top: 24px;
    }
    
    .user-management {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    .user-stats {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }
    
    .stat-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
      min-width: 150px;
    }
    
    .stat-content {
      display: flex;
      flex-direction: column;
    }
    
    .stat-number {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }
    
    .stat-label {
      font-size: 14px;
      color: #666;
    }
    
    .user-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    
    .system-settings {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
    
    .system-info h3,
    .maintenance-actions h3 {
      margin-bottom: 16px;
      color: #333;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }
    
    .info-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
    }
    
    .info-content {
      display: flex;
      flex-direction: column;
    }
    
    .info-label {
      font-size: 14px;
      color: #666;
    }
    
    .info-value {
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }
    
    .action-buttons {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    
    mat-card-header {
      padding-bottom: 16px;
    }
    
    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    @media (max-width: 768px) {
      .form-actions {
        flex-direction: column;
      }
      
      .user-stats {
        flex-direction: column;
      }
      
      .user-actions {
        flex-direction: column;
      }
      
      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class SettingsViewComponent implements OnInit {
  generalSettings = {
    companyName: 'FrotaControl',
    cnpj: '',
    defaultCurrency: 'BRL',
    timezone: 'America/Sao_Paulo',
    notifications: true,
    autoBackup: true,
    darkMode: false
  };
  
  userStats = {
    totalUsers: 5,
    adminUsers: 2,
    regularUsers: 3
  };
  
  systemInfo = {
    version: '1.0.0',
    database: 'JSON Server',
    lastBackup: 'Hoje às 14:30'
  };

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  private loadSettings(): void {
    // Carregar configurações salvas do localStorage ou API
    const savedSettings = localStorage.getItem('generalSettings');
    if (savedSettings) {
      this.generalSettings = { ...this.generalSettings, ...JSON.parse(savedSettings) };
    }
  }

  saveGeneralSettings(): void {
    // Salvar configurações
    localStorage.setItem('generalSettings', JSON.stringify(this.generalSettings));
    
    this.snackBar.open('Configurações salvas com sucesso!', 'Fechar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  resetGeneralSettings(): void {
    this.generalSettings = {
      companyName: 'FrotaControl',
      cnpj: '',
      defaultCurrency: 'BRL',
      timezone: 'America/Sao_Paulo',
      notifications: true,
      autoBackup: true,
      darkMode: false
    };
    
    this.snackBar.open('Configurações restauradas para os padrões!', 'Fechar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['info-snackbar']
    });
  }

  addUser(): void {
    this.snackBar.open('Funcionalidade de adicionar usuário será implementada em breve!', 'Fechar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['info-snackbar']
    });
  }

  managePermissions(): void {
    this.snackBar.open('Funcionalidade de gerenciar permissões será implementada em breve!', 'Fechar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['info-snackbar']
    });
  }

  createBackup(): void {
    this.snackBar.open('Backup criado com sucesso!', 'Fechar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  clearCache(): void {
    this.snackBar.open('Cache limpo com sucesso!', 'Fechar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  resetSystem(): void {
    this.snackBar.open('Funcionalidade de reset do sistema será implementada em breve!', 'Fechar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['warn-snackbar']
    });
  }
}
