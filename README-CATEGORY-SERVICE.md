# CategoryService - Gerenciamento de Categorias

O `CategoryService` é um serviço centralizado para gerenciar as categorias de despesas e receitas do sistema FrotaControl.

## 📋 Visão Geral

O serviço fornece uma interface consistente para:
- Gerenciar categorias de despesas e receitas
- Obter informações detalhadas sobre cada categoria
- Filtrar categorias por tipo
- Validar existência de categorias
- Obter estatísticas das categorias

## 🏗️ Estrutura

### Interface Category
```typescript
interface Category {
  id: string;           // Identificador único
  name: string;         // Nome da categoria
  type: 'expense' | 'revenue';  // Tipo (despesa ou receita)
  description?: string; // Descrição opcional
  icon?: string;        // Ícone Material Design
}
```

### Categorias Disponíveis

#### Despesas (Expense)
- **Abastecimento** - Combustível e abastecimento
- **Manutenção** - Manutenção preventiva e corretiva
- **Pneus** - Troca e manutenção de pneus
- **Seguro** - Seguro do veículo
- **IPVA** - Imposto sobre Propriedade de Veículos
- **Licenciamento** - Licenciamento anual
- **Pedágio** - Taxas de pedágio
- **Estacionamento** - Taxas de estacionamento
- **Multas** - Multas de trânsito
- **Outros** - Outras despesas

#### Receitas (Revenue)
- **Pagamento Viagem** - Pagamento por viagem
- **Frete** - Receita de frete
- **Adiantamento** - Adiantamento de pagamento
- **Outros** - Outras receitas

## 🚀 Como Usar

### 1. Injeção de Dependência
```typescript
import { CategoryService } from './core/services/category.service';

constructor(private categoryService: CategoryService) {}
```

### 2. Métodos Principais

#### Obter Todas as Categorias
```typescript
const allCategories = this.categoryService.getAllCategories();
```

#### Obter Categorias por Tipo
```typescript
// Apenas despesas
const expenseCategories = this.categoryService.getCategoriesByType('expense');

// Apenas receitas
const revenueCategories = this.categoryService.getCategoriesByType('revenue');
```

#### Obter Nomes das Categorias
```typescript
// Apenas os nomes das categorias de despesas
const expenseNames = this.categoryService.getExpenseCategoryNames();

// Apenas os nomes das categorias de receitas
const revenueNames = this.categoryService.getRevenueCategoryNames();
```

#### Buscar Categoria Específica
```typescript
// Por ID
const category = this.categoryService.getCategoryById('fuel');

// Por nome
const category = this.categoryService.getCategoryByName('Abastecimento');
```

#### Verificar Existência
```typescript
const exists = this.categoryService.categoryExists('Abastecimento', 'expense');
```

#### Obter Estatísticas
```typescript
const stats = this.categoryService.getCategoryStats();
// Retorna: { total: 14, expenses: 10, revenues: 4 }
```

## 🎯 Exemplos de Uso

### 1. Em um Formulário
```typescript
export class EntryFormComponent {
  categories: string[] = [];

  constructor(private categoryService: CategoryService) {}

  onEntryTypeChange(entryType: 'expense' | 'revenue') {
    this.categories = this.categoryService.getCategoryNamesByType(entryType);
  }
}
```

### 2. Em uma Lista
```typescript
export class EntryListComponent {
  entries: FinancialEntry[] = [];

  getCategoryIcon(entry: FinancialEntry): string {
    const category = this.categoryService.getCategoryByName(entry.category);
    return category?.icon || 'category';
  }

  getCategoryDescription(entry: FinancialEntry): string {
    const category = this.categoryService.getCategoryByName(entry.category);
    return category?.description || entry.category;
  }
}
```

### 3. Em um Pipe
```typescript
@Pipe({ name: 'categoryIcon' })
export class CategoryIconPipe implements PipeTransform {
  constructor(private categoryService: CategoryService) {}

  transform(categoryName: string): string {
    const category = this.categoryService.getCategoryByName(categoryName);
    return category?.icon || 'category';
  }
}
```

## 🎨 Componentes Relacionados

### CategoryChipComponent
Componente para exibir categorias como chips com ícones:
```html
<app-category-chip 
  [categoryName]="entry.category" 
  [entryType]="entry.entryType"
  [showIcon]="true">
</app-category-chip>
```

### CategoryListComponent
Componente para exibir listas de categorias:
```html
<app-category-list type="expense"></app-category-list>
<app-category-list type="revenue"></app-category-list>
<app-category-list type="all"></app-category-list>
```

### CategoryPipe
Pipe para formatar informações de categoria:
```html
{{ entry.category | category:entry.entryType:'description' }}
{{ entry.category | category:entry.entryType:'icon' }}
```

## 🔧 Configuração

### Adicionar Nova Categoria
Para adicionar uma nova categoria, edite o array `categories` no `CategoryService`:

```typescript
private readonly categories: Category[] = [
  // ... categorias existentes
  {
    id: 'new_category',
    name: 'Nova Categoria',
    type: 'expense',
    description: 'Descrição da nova categoria',
    icon: 'new_icon'
  }
];
```

### Modificar Categoria Existente
```typescript
// Encontre a categoria no array e modifique
{
  id: 'fuel',
  name: 'Abastecimento',
  type: 'expense',
  description: 'Combustível, óleo e fluidos',
  icon: 'local_gas_station'
}
```

## 📊 Benefícios

### 1. **Centralização**
- Todas as categorias em um local
- Fácil manutenção e atualização
- Consistência em toda a aplicação

### 2. **Flexibilidade**
- Suporte a ícones e descrições
- Fácil extensão para novas categorias
- Validação automática

### 3. **Reutilização**
- Componentes reutilizáveis
- Pipes para formatação
- Serviços especializados

### 4. **Type Safety**
- Interface TypeScript bem definida
- Validação de tipos
- IntelliSense completo

## 🚀 Próximos Passos

### Funcionalidades Futuras
1. **Categorias Dinâmicas** - Permitir criação/edição via interface
2. **Categorias Personalizadas** - Por usuário ou empresa
3. **Importação/Exportação** - Backup e restauração
4. **Validação de Dados** - Verificar uso antes de remover
5. **Auditoria** - Log de mudanças nas categorias

### Integração com Backend
```typescript
// Futuro: integração com API
getCategoriesFromAPI(): Observable<Category[]> {
  return this.http.get<Category[]>('/api/categories');
}

saveCategory(category: Category): Observable<Category> {
  return this.http.post<Category>('/api/categories', category);
}
```

## 📝 Exemplos Completos

### Configurações de Categoria
```typescript
export class CategorySettingsComponent {
  stats = this.categoryService.getCategoryStats();
  
  exportCategories() {
    const categories = this.categoryService.getAllCategories();
    // Lógica de exportação
  }
}
```

### Filtros Avançados
```typescript
export class EntryFilterComponent {
  getFilteredCategories(type: 'expense' | 'revenue', searchTerm: string) {
    return this.categoryService.getCategoriesByType(type)
      .filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }
}
```

## 🔗 Links Relacionados

- [FinancialEntryService](./README-FINANCIAL-ENTRY-SERVICE.md)
- [TruckService](./README-TRUCK-SERVICE.md)
- [ApiService](./README-API-SERVICE.md)
- [Angular Material Icons](https://fonts.google.com/icons)

---

**O CategoryService é uma peça fundamental do sistema FrotaControl, fornecendo uma base sólida e flexível para o gerenciamento de categorias financeiras.**
