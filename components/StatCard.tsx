
import React from 'react';

interface StatCardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  trend?: number;
  type: 'income' | 'expense' | 'balance';
}

export const StatCard: React.FC<StatCardProps> = ({ title, amount, icon, trend, type }) => {
  const bgColor = {
    income: 'bg-emerald-50 text-emerald-600',
    expense: 'bg-rose-50 text-rose-600',
    balance: 'bg-blue-50 text-blue-600'
  };

  const accentColor = {
    income: 'text-emerald-500',
    expense: 'text-rose-500',
    balance: 'text-blue-500'
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${bgColor[type]}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <h3 className={`text-2xl font-bold ${accentColor[type]}`}>
          € {amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
        </h3>
      </div>
    </div>
  );
};
