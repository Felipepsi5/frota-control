export interface User {
  id: string; // GUID único do usuário
  email: string;
  displayName?: string;
  role: 'admin' | 'user';
  createdAt: Date;
  lastLoginAt?: Date;
  updatedAt: Date; // Adicionado conforme nova API
  totalFinancialEntries?: number; // Adicionado conforme nova API
}

export interface UserClaims {
  role: 'admin' | 'user';
}
