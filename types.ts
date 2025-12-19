
export enum TransactionType {
  INCOME = 'ENTRATA',
  EXPENSE = 'USCITA'
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  description: string;
}

export interface CategoryTotal {
  name: string;
  value: number;
  color?: string;
}

export interface BudgetSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export interface AIInsight {
  title: string;
  content: string;
  type: 'success' | 'warning' | 'info';
  category?: string;
}

export interface DoctorProfile {
  firstName: string;
  lastName: string;
  specialization: string;
  studioName: string;
}

export interface User {
  id: string;
  username: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  hasProfile: boolean;
}

export interface HealthStatus {
  status: 'online' | 'offline' | 'latency';
  latency?: number;
}
