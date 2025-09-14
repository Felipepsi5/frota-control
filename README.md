# FrotaControl - Sistema de Gestão de Frota

Sistema web para gestão de despesas, receitas e performance de frota de caminhões, desenvolvido com Angular 19 e Firebase.

## 🚀 Funcionalidades Implementadas

### ✅ Layout Responsivo
- **Navbar e Sidebar Colapsável**: Layout no estilo YouTube com sidebar que pode ser expandida/colapsada
- **Responsividade**: Adaptação automática para dispositivos móveis e desktop
- **Navegação**: Menu lateral com ícones Material Design

### ✅ Autenticação
- **Login/Logout**: Sistema de autenticação com Firebase Auth
- **Proteção de Rotas**: Guards para proteger rotas que exigem autenticação
- **Controle de Acesso**: Suporte para roles de usuário (admin/user)

### ✅ Dashboard
- **Resumo Geral**: Cards com métricas principais da frota
- **Performance por Caminhão**: Tabela com dados de cada veículo
- **Métricas**: Receita, despesas, lucro líquido, km/litro médio

### ✅ Arquitetura
- **Clean Architecture**: Separação clara entre camadas (Domain, Infrastructure, Features)
- **Lazy Loading**: Carregamento sob demanda dos módulos
- **Dependency Injection**: Injeção de dependências com tokens
- **Repository Pattern**: Abstração da camada de dados

## 🛠️ Stack Tecnológica

- **Frontend**: Angular 19 + Angular Material
- **Backend**: Firebase (Firestore, Authentication, Functions, Hosting)
- **Styling**: SCSS + Angular Material Design
- **State Management**: RxJS Observables
- **Architecture**: Clean Architecture + Repository Pattern

## 📁 Estrutura do Projeto

```
src/app/
├── core/                           # Módulo Core: Serviços Singleton, Guards, Interceptores
│   ├── guards/
│   │   └── auth.guard.ts           # Protege rotas que exigem login
│   ├── interceptors/
│   │   └── error-handler.interceptor.ts # Captura erros globais
│   ├── services/
│   │   └── auth.service.ts         # Lógica de autenticação do Firebase
│   └── core.module.ts
│
├── features/                       # Módulos de funcionalidade (Lazy Loaded)
│   ├── dashboard/                  # Módulo Dashboard
│   │   ├── components/
│   │   │   └── dashboard-view/
│   │   ├── services/
│   │   │   └── dashboard.service.ts
│   │   └── dashboard.module.ts
│   │
│   ├── truck-management/           # Módulo CRUD de Caminhões
│   │   ├── components/
│   │   │   ├── truck-form/         # Formulário de criação/edição
│   │   │   └── truck-list/         # Tabela de listagem
│   │   └── truck-management.module.ts
│   │
│   └── financial-entries/          # Módulo CRUD de Lançamentos Financeiros
│       ├── components/
│       │   ├── entry-form/         # Formulário de criação/edição de despesas
│       │   └── entry-history/      # Tabela com histórico de lançamentos
│       └── financial-entries.module.ts
│
├── domain/                         # Camada de Domínio (Clean Architecture Core)
│   ├── models/                     # Interfaces e Classes de modelo de dados
│   │   ├── truck.model.ts
│   │   ├── financial-entry.model.ts
│   │   └── summary.model.ts
│   ├── contracts/                  # Abstrações (Interfaces dos Repositórios)
│   │   ├── i-truck.repository.ts
│   │   └── i-financial-entry.repository.ts
│   └── tokens/
│       └── repository.tokens.ts    # Tokens de injeção de dependência
│
├── infrastructure/                 # Camada de Infraestrutura (Implementações)
│   └── persistence/                # Implementação do acesso aos dados do Firebase
│       ├── truck-firebase.repository.ts
│       └── financial-entry-firebase.repository.ts
│
└── shared/                         # Componentes e utilitários reutilizáveis
    ├── components/                 # Ex: LoadingSpinner, ConfirmDialog
    ├── pipes/                      # Ex: Formatação de moeda, data
    └── directives/
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta Firebase

### 1. Instalação
```bash
npm install
```

### 2. Configuração do Firebase
1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative Authentication (Email/Password)
3. Crie um banco Firestore
4. Copie as credenciais do projeto
5. Atualize `src/environments/environment.ts` com suas credenciais:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "sua-api-key",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto-id",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "123456789",
    appId: "seu-app-id"
  }
};
```

### 3. Executar em Desenvolvimento
```bash
ng serve
```

A aplicação estará disponível em `http://localhost:4200`

### 4. Build para Produção
```bash
ng build --configuration production
```

## 🔐 Autenticação

### Demo/Desenvolvimento
Para testar a aplicação, você pode usar qualquer email e senha. O sistema está configurado para aceitar qualquer credencial durante o desenvolvimento.

### Produção
1. Configure usuários no Firebase Authentication
2. Implemente Cloud Functions para definir roles (admin/user)
3. Configure regras de segurança do Firestore

## 📊 Modelagem de Dados (Firestore)

### Coleção: `trucks`
```typescript
{
  id: string,           // Placa do caminhão (ex: QOL7533)
  licensePlate: string,
  model: string,
  year: number,
  status: 'ativo' | 'inativo',
  createdAt: Date,
  updatedAt: Date
}
```

### Coleção: `financialEntries`
```typescript
{
  id: string,           // ID automático do Firestore
  truckId: string,      // Referência à coleção trucks
  date: Date,
  entryType: 'expense' | 'revenue',
  category: string,     // ex: "Abastecimento", "Manutenção"
  amount: number,
  litersFilled?: number,
  odometerReading?: number,
  createdUserId: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Coleção: `monthlySummaries`
```typescript
{
  id: string,           // truckId_year_month (ex: QOL7533_2025_07)
  truckId: string,
  year: number,
  month: number,
  totalRevenue: number,
  totalExpenses: number,
  netIncome: number,
  kmPerLiterAverage: number,
  expenseBreakdown: Record<string, number>,
  totalKm: number,
  totalLiters: number,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎯 Próximos Passos

### Funcionalidades Pendentes
- [ ] Implementar CRUD completo de caminhões
- [ ] Implementar CRUD completo de lançamentos financeiros
- [ ] Adicionar filtros e paginação nas listagens
- [ ] Implementar relatórios avançados
- [ ] Adicionar gráficos no dashboard
- [ ] Implementar upload de documentos
- [ ] Adicionar notificações push
- [ ] Implementar backup automático

### Melhorias Técnicas
- [ ] Adicionar testes unitários
- [ ] Implementar testes e2e
- [ ] Adicionar PWA (Progressive Web App)
- [ ] Implementar cache offline
- [ ] Adicionar internacionalização (i18n)
- [ ] Implementar CI/CD

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato através de:
- Email: suporte@frotacontrol.com
- Issues: [GitHub Issues](https://github.com/seu-usuario/frotacontrol/issues)

---

**FrotaControl** - Transformando a gestão de frotas com tecnologia moderna! 🚛✨