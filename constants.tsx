
import React from 'react';
import { 
  Home, 
  FileText,
  Lightbulb,
  Settings
} from 'lucide-react';
import { TransactionType } from './types.ts';

export const CATEGORIES = {
  INCOME: [
    'Visite Specialistiche',
    'Interventi Chirurgici',
    'Esami Diagnostici',
    'Consulenze',
    'Rimborsi Assicurativi',
    'Certificazioni Mediche',
    'Altro'
  ],
  EXPENSE: [
    'Affitto Studio',
    'Materiale Sanitario e Monouso',
    'Stipendi Personale',
    'Utenze (Luce, Gas, Web)',
    'Assicurazioni Professionali',
    'Manutenzione Apparecchiature',
    'Marketing e Sito Web',
    'Software Gestionale',
    'Formazione ECM',
    'Tasse e Imposte',
    'Altro'
  ]
};

export const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1'
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
  { id: 'transactions', label: 'Movimenti', icon: <FileText className="w-5 h-5" /> },
  { id: 'analytics', label: 'Analisi AI Pro', icon: <Lightbulb className="w-5 h-5" /> },
  { id: 'settings', label: 'Impostazioni', icon: <Settings className="w-5 h-5" /> }
];
