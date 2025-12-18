
import React from 'react';
import { 
  Stethoscope, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Settings, 
  Home, 
  FileText,
  PlusCircle,
  Lightbulb
} from 'lucide-react';
import { Transaction, TransactionType } from './types';

export const CATEGORIES = {
  INCOME: [
    'Visite Specialistiche',
    'Interventi Chirurgici',
    'Esami Diagnostici',
    'Consulenze',
    'Rimborsi Assicurativi',
    'Altro'
  ],
  EXPENSE: [
    'Affitto Studio',
    'Materiale Sanitario',
    'Stipendi Personale',
    'Utenze (Luce, Gas, Web)',
    'Assicurazioni',
    'Manutenzione Apparecchiature',
    'Marketing',
    'Altro'
  ]
};

// Generazione di date dinamiche per gli ultimi 6 mesi per popolare il grafico
const now = new Date();
const getDateAgo = (months: number) => {
  const d = new Date(now.getFullYear(), now.getMonth() - months, 15);
  return d.toISOString().split('T')[0];
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Mese Corrente
  { id: '1', type: TransactionType.INCOME, amount: 1500, category: 'Visite Specialistiche', date: getDateAgo(0), description: 'Pacchetto visite cardiologiche' },
  { id: '2', type: TransactionType.EXPENSE, amount: 800, category: 'Materiale Sanitario', date: getDateAgo(0), description: 'Fornitura guanti e siringhe' },
  { id: '3', type: TransactionType.INCOME, amount: 3000, category: 'Interventi Chirurgici', date: getDateAgo(0), description: 'Intervento ambulatoriale' },
  
  // 1 Mese fa
  { id: 'h1', type: TransactionType.EXPENSE, amount: 1200, category: 'Affitto Studio', date: getDateAgo(1), description: 'Affitto mensile' },
  { id: 'h2', type: TransactionType.INCOME, amount: 4500, category: 'Esami Diagnostici', date: getDateAgo(1), description: 'Screening preventivo' },
  
  // 2 Mesi fa
  { id: 'h3', type: TransactionType.EXPENSE, amount: 950, category: 'Utenze (Luce, Gas, Web)', date: getDateAgo(2), description: 'Bolletta energia' },
  { id: 'h4', type: TransactionType.INCOME, amount: 3800, category: 'Visite Specialistiche', date: getDateAgo(2), description: 'Check-up stagionali' },
  
  // 3 Mesi fa
  { id: 'h5', type: TransactionType.EXPENSE, amount: 1500, category: 'Manutenzione Apparecchiature', date: getDateAgo(3), description: 'Revisione Ecografo' },
  
  // 4 Mesi fa
  { id: 'h6', type: TransactionType.EXPENSE, amount: 1100, category: 'Materiale Sanitario', date: getDateAgo(4), description: 'Stock dispositivi protezione' },
  
  // 5 Mesi fa
  { id: 'h7', type: TransactionType.EXPENSE, amount: 700, category: 'Marketing', date: getDateAgo(5), description: 'Campagna Social Media' }
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
  { id: 'transactions', label: 'Movimenti', icon: <FileText className="w-5 h-5" /> },
  { id: 'analytics', label: 'Analisi AI', icon: <Lightbulb className="w-5 h-5" /> },
  { id: 'settings', label: 'Impostazioni', icon: <Settings className="w-5 h-5" /> }
];
