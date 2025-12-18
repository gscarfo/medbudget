
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

export interface BudgetSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export interface AIInsight {
  title: string;
  content: string;
  type: 'success' | 'warning' | 'info';
}

export interface DoctorProfile {
  firstName: string;
  lastName: string;
  specialization: string;
  studioName: string;
}
