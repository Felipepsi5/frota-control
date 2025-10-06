# Entidades .NET Core - FrotaControl API

## 1. Entidade: Truck (Caminhão)

### Modelo Principal
```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FrotaControl.Domain.Entities
{
    [Table("Trucks")]
    public class Truck
    {
        [Key]
        [MaxLength(10)]
        public string Id { get; set; } = string.Empty; // Placa do caminhão (ex: "ABC1234")

        [Required]
        [MaxLength(10)]
        [Column("LicensePlate")]
        public string LicensePlate { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Model { get; set; } = string.Empty;

        [Required]
        [Range(1900, 2030)]
        public int Year { get; set; }

        [Required]
        [MaxLength(10)]
        public string Status { get; set; } = string.Empty; // "ativo" | "inativo"

        [Required]
        [Column(TypeName = "datetime2")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        [Column(TypeName = "datetime2")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public virtual ICollection<FinancialEntry> FinancialEntries { get; set; } = new List<FinancialEntry>();
        public virtual ICollection<MonthlySummary> MonthlySummaries { get; set; } = new List<MonthlySummary>();
    }
}
```

### DTOs de Request
```csharp
namespace FrotaControl.Application.DTOs.Requests
{
    public class CreateTruckRequest
    {
        [Required(ErrorMessage = "A placa é obrigatória")]
        [StringLength(10, MinimumLength = 7, ErrorMessage = "A placa deve ter entre 7 e 10 caracteres")]
        [RegularExpression(@"^[A-Z]{3}[0-9]{4}$|^[A-Z]{3}[0-9][A-Z][0-9]{2}$", 
            ErrorMessage = "Formato de placa inválido")]
        public string LicensePlate { get; set; } = string.Empty;

        [Required(ErrorMessage = "O modelo é obrigatório")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "O modelo deve ter entre 2 e 100 caracteres")]
        public string Model { get; set; } = string.Empty;

        [Required(ErrorMessage = "O ano é obrigatório")]
        [Range(1900, 2030, ErrorMessage = "O ano deve estar entre 1900 e 2030")]
        public int Year { get; set; }

        [Required(ErrorMessage = "O status é obrigatório")]
        [RegularExpression(@"^(ativo|inativo)$", ErrorMessage = "Status deve ser 'ativo' ou 'inativo'")]
        public string Status { get; set; } = string.Empty;
    }

    public class UpdateTruckRequest
    {
        [StringLength(100, MinimumLength = 2, ErrorMessage = "O modelo deve ter entre 2 e 100 caracteres")]
        public string? Model { get; set; }

        [Range(1900, 2030, ErrorMessage = "O ano deve estar entre 1900 e 2030")]
        public int? Year { get; set; }

        [RegularExpression(@"^(ativo|inativo)$", ErrorMessage = "Status deve ser 'ativo' ou 'inativo'")]
        public string? Status { get; set; }
    }
}
```

### DTOs de Response
```csharp
namespace FrotaControl.Application.DTOs.Responses
{
    public class TruckResponse
    {
        public string Id { get; set; } = string.Empty;
        public string LicensePlate { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Year { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int TotalFinancialEntries { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal NetIncome { get; set; }
    }

    public class TruckListResponse
    {
        public string Id { get; set; } = string.Empty;
        public string LicensePlate { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Year { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
```

### Filtros
```csharp
namespace FrotaControl.Application.DTOs.Filters
{
    public class TruckFilters
    {
        public string? Search { get; set; }
        public string? Status { get; set; }
        public int? Year { get; set; }
        public string? Model { get; set; }
    }

    public class TruckPaginationParams
    {
        [Range(1, int.MaxValue, ErrorMessage = "Página deve ser maior que 0")]
        public int Page { get; set; } = 1;

        [Range(1, 100, ErrorMessage = "Limite deve estar entre 1 e 100")]
        public int Limit { get; set; } = 20;

        public TruckFilters? Filters { get; set; }
    }

    public class TruckPaginationResponse
    {
        public List<TruckListResponse> Data { get; set; } = new();
        public int Total { get; set; }
        public int Page { get; set; }
        public int Limit { get; set; }
        public int TotalPages { get; set; }
    }
}
```

---

## 2. Entidade: FinancialEntry (Lançamento Financeiro)

### Modelo Principal
```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FrotaControl.Domain.Entities
{
    [Table("FinancialEntries")]
    public class FinancialEntry
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(10)]
        [ForeignKey("Truck")]
        public string TruckId { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "datetime2")]
        public DateTime Date { get; set; }

        [Required]
        [MaxLength(10)]
        [RegularExpression(@"^(expense|revenue)$", ErrorMessage = "Tipo deve ser 'expense' ou 'revenue'")]
        public string EntryType { get; set; } = string.Empty; // "expense" | "revenue"

        [Required]
        [MaxLength(50)]
        public string Category { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Valor deve ser maior que 0")]
        public decimal Amount { get; set; }

        [Column(TypeName = "decimal(8,2)")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Litros devem ser maiores que 0")]
        public decimal? LitersFilled { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "Quilometragem deve ser maior ou igual a 0")]
        public int? OdometerReading { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        [Required]
        [MaxLength(50)]
        [ForeignKey("User")]
        public string CreatedUserId { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "datetime2")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        [Column(TypeName = "datetime2")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public virtual Truck Truck { get; set; } = null!;
        public virtual User CreatedUser { get; set; } = null!;
    }
}
```

### DTOs de Request
```csharp
namespace FrotaControl.Application.DTOs.Requests
{
    public class CreateFinancialEntryRequest
    {
        [Required(ErrorMessage = "ID do caminhão é obrigatório")]
        [MaxLength(10, ErrorMessage = "ID do caminhão deve ter no máximo 10 caracteres")]
        public string TruckId { get; set; } = string.Empty;

        [Required(ErrorMessage = "Data é obrigatória")]
        public DateTime Date { get; set; }

        [Required(ErrorMessage = "Tipo é obrigatório")]
        [RegularExpression(@"^(expense|revenue)$", ErrorMessage = "Tipo deve ser 'expense' ou 'revenue'")]
        public string EntryType { get; set; } = string.Empty;

        [Required(ErrorMessage = "Categoria é obrigatória")]
        [MaxLength(50, ErrorMessage = "Categoria deve ter no máximo 50 caracteres")]
        public string Category { get; set; } = string.Empty;

        [Required(ErrorMessage = "Valor é obrigatório")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Valor deve ser maior que 0")]
        public decimal Amount { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Litros devem ser maiores que 0")]
        public decimal? LitersFilled { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "Quilometragem deve ser maior ou igual a 0")]
        public int? OdometerReading { get; set; }

        [MaxLength(500, ErrorMessage = "Descrição deve ter no máximo 500 caracteres")]
        public string? Description { get; set; }
    }

    public class UpdateFinancialEntryRequest
    {
        public DateTime? Date { get; set; }

        [RegularExpression(@"^(expense|revenue)$", ErrorMessage = "Tipo deve ser 'expense' ou 'revenue'")]
        public string? EntryType { get; set; }

        [MaxLength(50, ErrorMessage = "Categoria deve ter no máximo 50 caracteres")]
        public string? Category { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Valor deve ser maior que 0")]
        public decimal? Amount { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Litros devem ser maiores que 0")]
        public decimal? LitersFilled { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "Quilometragem deve ser maior ou igual a 0")]
        public int? OdometerReading { get; set; }

        [MaxLength(500, ErrorMessage = "Descrição deve ter no máximo 500 caracteres")]
        public string? Description { get; set; }
    }
}
```

### DTOs de Response
```csharp
namespace FrotaControl.Application.DTOs.Responses
{
    public class FinancialEntryResponse
    {
        public Guid Id { get; set; }
        public string TruckId { get; set; } = string.Empty;
        public string LicensePlate { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string EntryType { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal? LitersFilled { get; set; }
        public int? OdometerReading { get; set; }
        public string? Description { get; set; }
        public string CreatedUserId { get; set; } = string.Empty;
        public string CreatedUserName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class FinancialEntryListResponse
    {
        public Guid Id { get; set; }
        public string TruckId { get; set; } = string.Empty;
        public string LicensePlate { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string EntryType { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string? Description { get; set; }
    }
}
```

### Filtros
```csharp
namespace FrotaControl.Application.DTOs.Filters
{
    public class FinancialEntryFilters
    {
        public string? TruckId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? EntryType { get; set; } // "expense" | "revenue"
        public string? Category { get; set; }
        public string? Search { get; set; }
    }

    public class FinancialEntryPaginationParams
    {
        [Range(1, int.MaxValue, ErrorMessage = "Página deve ser maior que 0")]
        public int Page { get; set; } = 1;

        [Range(1, 100, ErrorMessage = "Limite deve estar entre 1 e 100")]
        public int Limit { get; set; } = 20;

        public FinancialEntryFilters? Filters { get; set; }
    }

    public class FinancialEntryPaginationResponse
    {
        public List<FinancialEntryListResponse> Data { get; set; } = new();
        public int Total { get; set; }
        public int Page { get; set; }
        public int Limit { get; set; }
        public int TotalPages { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal NetIncome { get; set; }
    }
}
```

---

## 3. Entidade: User (Usuário)

### Modelo Principal
```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FrotaControl.Domain.Entities
{
    [Table("Users")]
    public class User
    {
        [Key]
        [MaxLength(50)]
        public string Id { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? DisplayName { get; set; }

        [Required]
        [MaxLength(10)]
        [RegularExpression(@"^(admin|user)$", ErrorMessage = "Role deve ser 'admin' ou 'user'")]
        public string Role { get; set; } = string.Empty; // "admin" | "user"

        [Required]
        [Column(TypeName = "datetime2")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column(TypeName = "datetime2")]
        public DateTime? LastLoginAt { get; set; }

        [Required]
        [Column(TypeName = "datetime2")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public virtual ICollection<FinancialEntry> FinancialEntries { get; set; } = new List<FinancialEntry>();
    }
}
```

### DTOs de Request
```csharp
namespace FrotaControl.Application.DTOs.Requests
{
    public class LoginRequest
    {
        [Required(ErrorMessage = "Email é obrigatório")]
        [EmailAddress(ErrorMessage = "Email inválido")]
        [MaxLength(100, ErrorMessage = "Email deve ter no máximo 100 caracteres")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Senha é obrigatória")]
        [MinLength(6, ErrorMessage = "Senha deve ter pelo menos 6 caracteres")]
        [MaxLength(100, ErrorMessage = "Senha deve ter no máximo 100 caracteres")]
        public string Password { get; set; } = string.Empty;
    }

    public class UpdateUserRequest
    {
        [MaxLength(100, ErrorMessage = "Nome deve ter no máximo 100 caracteres")]
        public string? DisplayName { get; set; }

        [RegularExpression(@"^(admin|user)$", ErrorMessage = "Role deve ser 'admin' ou 'user'")]
        public string? Role { get; set; }
    }
}
```

### DTOs de Response
```csharp
namespace FrotaControl.Application.DTOs.Responses
{
    public class UserResponse
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? DisplayName { get; set; }
        public string Role { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int TotalFinancialEntries { get; set; }
    }

    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public UserResponse User { get; set; } = new();
        public DateTime ExpiresAt { get; set; }
    }

    public class UserListResponse
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? DisplayName { get; set; }
        public string Role { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
    }
}
```

---

## 4. Entidade: Category (Categoria)

### Modelo Principal
```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FrotaControl.Domain.Entities
{
    [Table("Categories")]
    public class Category
    {
        [Key]
        [MaxLength(50)]
        public string Id { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(10)]
        [RegularExpression(@"^(expense|revenue)$", ErrorMessage = "Tipo deve ser 'expense' ou 'revenue'")]
        public string Type { get; set; } = string.Empty; // "expense" | "revenue"

        [MaxLength(200)]
        public string? Description { get; set; }

        [MaxLength(50)]
        public string? Icon { get; set; }

        [Required]
        [Column(TypeName = "datetime2")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        [Column(TypeName = "datetime2")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public virtual ICollection<FinancialEntry> FinancialEntries { get; set; } = new List<FinancialEntry>();
    }
}
```

### DTOs de Response
```csharp
namespace FrotaControl.Application.DTOs.Responses
{
    public class CategoryResponse
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Icon { get; set; }
        public int UsageCount { get; set; }
    }

    public class CategoryStatsResponse
    {
        public int Total { get; set; }
        public int Expenses { get; set; }
        public int Revenues { get; set; }
    }
}
```

---

## 5. Entidade: MonthlySummary (Resumo Mensal)

### Modelo Principal
```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FrotaControl.Domain.Entities
{
    [Table("MonthlySummaries")]
    public class MonthlySummary
    {
        [Key]
        [MaxLength(50)]
        public string Id { get; set; } = string.Empty; // truckId_year_month (ex: "ABC1234_2024_01")

        [Required]
        [MaxLength(10)]
        [ForeignKey("Truck")]
        public string TruckId { get; set; } = string.Empty;

        [Required]
        [Range(2020, 2050)]
        public int Year { get; set; }

        [Required]
        [Range(1, 12)]
        public int Month { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal TotalRevenue { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal TotalExpenses { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal NetIncome { get; set; }

        [Required]
        [Column(TypeName = "decimal(8,2)")]
        public decimal KmPerLiterAverage { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string ExpenseBreakdownJson { get; set; } = "{}"; // JSON serializado

        [Required]
        public int TotalKm { get; set; }

        [Required]
        [Column(TypeName = "decimal(8,2)")]
        public decimal TotalLiters { get; set; }

        [Required]
        [Column(TypeName = "datetime2")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        [Column(TypeName = "datetime2")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public virtual Truck Truck { get; set; } = null!;

        // Helper Properties (não mapeadas)
        [NotMapped]
        public Dictionary<string, decimal> ExpenseBreakdown
        {
            get => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, decimal>>(ExpenseBreakdownJson) ?? new();
            set => ExpenseBreakdownJson = System.Text.Json.JsonSerializer.Serialize(value);
        }
    }
}
```

### DTOs de Response
```csharp
namespace FrotaControl.Application.DTOs.Responses
{
    public class MonthlySummaryResponse
    {
        public string Id { get; set; } = string.Empty;
        public string TruckId { get; set; } = string.Empty;
        public string LicensePlate { get; set; } = string.Empty;
        public int Year { get; set; }
        public int Month { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal NetIncome { get; set; }
        public decimal KmPerLiterAverage { get; set; }
        public Dictionary<string, decimal> ExpenseBreakdown { get; set; } = new();
        public int TotalKm { get; set; }
        public decimal TotalLiters { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class DashboardSummaryResponse
    {
        public int TotalTrucks { get; set; }
        public int ActiveTrucks { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal NetIncome { get; set; }
        public decimal AverageKmPerLiter { get; set; }
        public List<MonthlySummaryResponse> MonthlySummaries { get; set; } = new();
        public List<TruckPerformanceResponse> TopPerformers { get; set; } = new();
    }

    public class TruckPerformanceResponse
    {
        public string TruckId { get; set; } = string.Empty;
        public string LicensePlate { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public decimal TotalRevenue { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal NetIncome { get; set; }
        public decimal KmPerLiterAverage { get; set; }
        public int TotalKm { get; set; }
        public decimal TotalLiters { get; set; }
        public int TotalTrips { get; set; }
        public decimal AverageRevenuePerTrip { get; set; }
    }
}
```

---

## 6. Enums e Constantes

### Enums
```csharp
namespace FrotaControl.Domain.Enums
{
    public enum EntryType
    {
        Expense = 1,
        Revenue = 2
    }

    public enum TruckStatus
    {
        Ativo = 1,
        Inativo = 2
    }

    public enum UserRole
    {
        User = 1,
        Admin = 2
    }

    public enum CategoryType
    {
        Expense = 1,
        Revenue = 2
    }
}
```

### Constantes
```csharp
namespace FrotaControl.Domain.Constants
{
    public static class FinancialCategories
    {
        public static readonly string[] ExpenseCategories = new[]
        {
            "Abastecimento",
            "Manutenção",
            "Pneus",
            "Seguro",
            "IPVA",
            "Licenciamento",
            "Pedágio",
            "Estacionamento",
            "Multas",
            "Outros"
        };

        public static readonly string[] RevenueCategories = new[]
        {
            "Pagamento Viagem",
            "Frete",
            "Adiantamento",
            "Outros"
        };
    }

    public static class ValidationConstants
    {
        public const int MaxPageSize = 100;
        public const int DefaultPageSize = 20;
        public const int MinPasswordLength = 6;
        public const int MaxPasswordLength = 100;
        public const int MaxDescriptionLength = 500;
        public const int MaxCategoryNameLength = 50;
        public const int MaxTruckModelLength = 100;
        public const int MaxLicensePlateLength = 10;
        public const int MinLicensePlateLength = 7;
        public const int MaxYear = 2030;
        public const int MinYear = 1900;
    }
}
```

---

## 7. Configurações do Entity Framework

### DbContext
```csharp
using Microsoft.EntityFrameworkCore;
using FrotaControl.Domain.Entities;

namespace FrotaControl.Infrastructure.Data
{
    public class FrotaControlContext : DbContext
    {
        public FrotaControlContext(DbContextOptions<FrotaControlContext> options) : base(options)
        {
        }

        public DbSet<Truck> Trucks { get; set; }
        public DbSet<FinancialEntry> FinancialEntries { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<MonthlySummary> MonthlySummaries { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Truck configurations
            modelBuilder.Entity<Truck>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.LicensePlate).IsRequired().HasMaxLength(10);
                entity.Property(e => e.Model).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Status).IsRequired().HasMaxLength(10);
                entity.Property(e => e.CreatedAt).IsRequired().HasColumnType("datetime2");
                entity.Property(e => e.UpdatedAt).IsRequired().HasColumnType("datetime2");
                
                entity.HasIndex(e => e.LicensePlate).IsUnique();
                
                entity.HasMany(e => e.FinancialEntries)
                      .WithOne(e => e.Truck)
                      .HasForeignKey(e => e.TruckId)
                      .OnDelete(DeleteBehavior.Cascade);
                      
                entity.HasMany(e => e.MonthlySummaries)
                      .WithOne(e => e.Truck)
                      .HasForeignKey(e => e.TruckId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // FinancialEntry configurations
            modelBuilder.Entity<FinancialEntry>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TruckId).IsRequired().HasMaxLength(10);
                entity.Property(e => e.Date).IsRequired().HasColumnType("datetime2");
                entity.Property(e => e.EntryType).IsRequired().HasMaxLength(10);
                entity.Property(e => e.Category).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Amount).IsRequired().HasColumnType("decimal(10,2)");
                entity.Property(e => e.LitersFilled).HasColumnType("decimal(8,2)");
                entity.Property(e => e.CreatedUserId).IsRequired().HasMaxLength(50);
                entity.Property(e => e.CreatedAt).IsRequired().HasColumnType("datetime2");
                entity.Property(e => e.UpdatedAt).IsRequired().HasColumnType("datetime2");
                
                entity.HasIndex(e => e.TruckId);
                entity.HasIndex(e => e.Date);
                entity.HasIndex(e => e.EntryType);
                entity.HasIndex(e => e.CreatedUserId);
                
                entity.HasOne(e => e.Truck)
                      .WithMany(e => e.FinancialEntries)
                      .HasForeignKey(e => e.TruckId)
                      .OnDelete(DeleteBehavior.Cascade);
                      
                entity.HasOne(e => e.CreatedUser)
                      .WithMany(e => e.FinancialEntries)
                      .HasForeignKey(e => e.CreatedUserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // User configurations
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
                entity.Property(e => e.DisplayName).HasMaxLength(100);
                entity.Property(e => e.Role).IsRequired().HasMaxLength(10);
                entity.Property(e => e.CreatedAt).IsRequired().HasColumnType("datetime2");
                entity.Property(e => e.UpdatedAt).IsRequired().HasColumnType("datetime2");
                
                entity.HasIndex(e => e.Email).IsUnique();
            });

            // Category configurations
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Type).IsRequired().HasMaxLength(10);
                entity.Property(e => e.Description).HasMaxLength(200);
                entity.Property(e => e.Icon).HasMaxLength(50);
                entity.Property(e => e.CreatedAt).IsRequired().HasColumnType("datetime2");
                entity.Property(e => e.UpdatedAt).IsRequired().HasColumnType("datetime2");
                
                entity.HasIndex(e => new { e.Name, e.Type }).IsUnique();
            });

            // MonthlySummary configurations
            modelBuilder.Entity<MonthlySummary>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TruckId).IsRequired().HasMaxLength(10);
                entity.Property(e => e.TotalRevenue).IsRequired().HasColumnType("decimal(10,2)");
                entity.Property(e => e.TotalExpenses).IsRequired().HasColumnType("decimal(10,2)");
                entity.Property(e => e.NetIncome).IsRequired().HasColumnType("decimal(10,2)");
                entity.Property(e => e.KmPerLiterAverage).IsRequired().HasColumnType("decimal(8,2)");
                entity.Property(e => e.ExpenseBreakdownJson).IsRequired();
                entity.Property(e => e.TotalLiters).IsRequired().HasColumnType("decimal(8,2)");
                entity.Property(e => e.CreatedAt).IsRequired().HasColumnType("datetime2");
                entity.Property(e => e.UpdatedAt).IsRequired().HasColumnType("datetime2");
                
                entity.HasIndex(e => new { e.TruckId, e.Year, e.Month }).IsUnique();
                
                entity.HasOne(e => e.Truck)
                      .WithMany(e => e.MonthlySummaries)
                      .HasForeignKey(e => e.TruckId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Seed data
            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Seed Categories
            var categories = new List<Category>();
            var expenseCategories = FinancialCategories.ExpenseCategories;
            var revenueCategories = FinancialCategories.RevenueCategories;

            for (int i = 0; i < expenseCategories.Length; i++)
            {
                categories.Add(new Category
                {
                    Id = $"expense_{i + 1}",
                    Name = expenseCategories[i],
                    Type = "expense",
                    Description = GetCategoryDescription(expenseCategories[i]),
                    Icon = GetCategoryIcon(expenseCategories[i]),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
            }

            for (int i = 0; i < revenueCategories.Length; i++)
            {
                categories.Add(new Category
                {
                    Id = $"revenue_{i + 1}",
                    Name = revenueCategories[i],
                    Type = "revenue",
                    Description = GetCategoryDescription(revenueCategories[i]),
                    Icon = GetCategoryIcon(revenueCategories[i]),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
            }

            modelBuilder.Entity<Category>().HasData(categories);

            // Seed Users
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = "admin",
                    Email = "admin@frotacontrol.com",
                    DisplayName = "Administrador",
                    Role = "admin",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = "user1",
                    Email = "user@frotacontrol.com",
                    DisplayName = "Usuário Padrão",
                    Role = "user",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            );
        }

        private string GetCategoryDescription(string categoryName)
        {
            return categoryName switch
            {
                "Abastecimento" => "Combustível e abastecimento",
                "Manutenção" => "Manutenção preventiva e corretiva",
                "Pneus" => "Troca e manutenção de pneus",
                "Seguro" => "Seguro do veículo",
                "IPVA" => "Imposto sobre Propriedade de Veículos Automotores",
                "Licenciamento" => "Licenciamento anual do veículo",
                "Pedágio" => "Taxas de pedágio",
                "Estacionamento" => "Taxas de estacionamento",
                "Multas" => "Multas de trânsito",
                "Pagamento Viagem" => "Pagamento por viagem realizada",
                "Frete" => "Receita de frete",
                "Adiantamento" => "Adiantamento de pagamento",
                _ => "Outras categorias"
            };
        }

        private string GetCategoryIcon(string categoryName)
        {
            return categoryName switch
            {
                "Abastecimento" => "local_gas_station",
                "Manutenção" => "build",
                "Pneus" => "tire_repair",
                "Seguro" => "security",
                "IPVA" => "receipt",
                "Licenciamento" => "assignment",
                "Pedágio" => "toll",
                "Estacionamento" => "local_parking",
                "Multas" => "warning",
                "Pagamento Viagem" => "directions_car",
                "Frete" => "local_shipping",
                "Adiantamento" => "account_balance_wallet",
                _ => "more_horiz"
            };
        }
    }
}
```

---

## 8. AutoMapper Profiles

```csharp
using AutoMapper;
using FrotaControl.Domain.Entities;
using FrotaControl.Application.DTOs.Requests;
using FrotaControl.Application.DTOs.Responses;

namespace FrotaControl.Application.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Truck mappings
            CreateMap<Truck, TruckResponse>()
                .ForMember(dest => dest.TotalFinancialEntries, opt => opt.MapFrom(src => src.FinancialEntries.Count))
                .ForMember(dest => dest.TotalRevenue, opt => opt.MapFrom(src => src.FinancialEntries.Where(f => f.EntryType == "revenue").Sum(f => f.Amount)))
                .ForMember(dest => dest.TotalExpenses, opt => opt.MapFrom(src => src.FinancialEntries.Where(f => f.EntryType == "expense").Sum(f => f.Amount)))
                .ForMember(dest => dest.NetIncome, opt => opt.MapFrom(src => 
                    src.FinancialEntries.Where(f => f.EntryType == "revenue").Sum(f => f.Amount) -
                    src.FinancialEntries.Where(f => f.EntryType == "expense").Sum(f => f.Amount)));

            CreateMap<Truck, TruckListResponse>();
            CreateMap<CreateTruckRequest, Truck>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.LicensePlate.ToUpper()))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            // FinancialEntry mappings
            CreateMap<FinancialEntry, FinancialEntryResponse>()
                .ForMember(dest => dest.LicensePlate, opt => opt.MapFrom(src => src.Truck.LicensePlate))
                .ForMember(dest => dest.CreatedUserName, opt => opt.MapFrom(src => src.CreatedUser.DisplayName ?? src.CreatedUser.Email));

            CreateMap<FinancialEntry, FinancialEntryListResponse>()
                .ForMember(dest => dest.LicensePlate, opt => opt.MapFrom(src => src.Truck.LicensePlate));

            CreateMap<CreateFinancialEntryRequest, FinancialEntry>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            // User mappings
            CreateMap<User, UserResponse>()
                .ForMember(dest => dest.TotalFinancialEntries, opt => opt.MapFrom(src => src.FinancialEntries.Count));

            CreateMap<User, UserListResponse>();

            // Category mappings
            CreateMap<Category, CategoryResponse>()
                .ForMember(dest => dest.UsageCount, opt => opt.MapFrom(src => src.FinancialEntries.Count));

            // MonthlySummary mappings
            CreateMap<MonthlySummary, MonthlySummaryResponse>()
                .ForMember(dest => dest.LicensePlate, opt => opt.MapFrom(src => src.Truck.LicensePlate))
                .ForMember(dest => dest.ExpenseBreakdown, opt => opt.MapFrom(src => src.ExpenseBreakdown));

            // TruckPerformance mappings
            CreateMap<Truck, TruckPerformanceResponse>()
                .ForMember(dest => dest.TotalRevenue, opt => opt.MapFrom(src => src.FinancialEntries.Where(f => f.EntryType == "revenue").Sum(f => f.Amount)))
                .ForMember(dest => dest.TotalExpenses, opt => opt.MapFrom(src => src.FinancialEntries.Where(f => f.EntryType == "expense").Sum(f => f.Amount)))
                .ForMember(dest => dest.NetIncome, opt => opt.MapFrom(src => 
                    src.FinancialEntries.Where(f => f.EntryType == "revenue").Sum(f => f.Amount) -
                    src.FinancialEntries.Where(f => f.EntryType == "expense").Sum(f => f.Amount)))
                .ForMember(dest => dest.TotalLiters, opt => opt.MapFrom(src => src.FinancialEntries.Where(f => f.LitersFilled.HasValue).Sum(f => f.LitersFilled ?? 0)))
                .ForMember(dest => dest.TotalKm, opt => opt.MapFrom(src => 
                    src.FinancialEntries.Where(f => f.OdometerReading.HasValue).Max(f => f.OdometerReading ?? 0) -
                    src.FinancialEntries.Where(f => f.OdometerReading.HasValue).Min(f => f.OdometerReading ?? 0)))
                .ForMember(dest => dest.KmPerLiterAverage, opt => opt.MapFrom(src => 
                    src.FinancialEntries.Where(f => f.LitersFilled.HasValue && f.LitersFilled > 0).Any() ?
                    src.FinancialEntries.Where(f => f.LitersFilled.HasValue && f.LitersFilled > 0).Average(f => f.Amount / f.LitersFilled!.Value) : 0))
                .ForMember(dest => dest.TotalTrips, opt => opt.MapFrom(src => src.FinancialEntries.Where(f => f.EntryType == "revenue").Count()))
                .ForMember(dest => dest.AverageRevenuePerTrip, opt => opt.MapFrom(src => 
                    src.FinancialEntries.Where(f => f.EntryType == "revenue").Any() ?
                    src.FinancialEntries.Where(f => f.EntryType == "revenue").Average(f => f.Amount) : 0));
        }
    }
}
```

---

Esta documentação completa das entidades fornece todas as especificações técnicas necessárias para implementar a API .NET Core, incluindo:

- ✅ **Modelos de domínio** com todas as validações
- ✅ **DTOs de request e response** completos
- ✅ **Configurações do Entity Framework** com relacionamentos
- ✅ **AutoMapper profiles** para conversões
- ✅ **Enums e constantes** organizadas
- ✅ **Dados de seed** para inicialização
- ✅ **Validações e constraints** de banco de dados
- ✅ **Índices** para performance
- ✅ **Relacionamentos** entre entidades
