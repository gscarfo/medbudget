
import React from 'react';

interface StatCardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  trend?: number;
  type: 'income' | 'expense' | 'balance';
}

export const StatCard: React.FC<StatCardProps> = ({ title, amount, icon, trend, type }) => {
  const styles = {
    income: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-500',
      accent: 'text-emerald-700'
    },
    expense: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'border-rose-100',
      iconBg: 'bg-rose-500',
      accent: 'text-rose-700'
    },
    balance: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-100',
      iconBg: 'bg-blue-500',
      accent: 'text-blue-700'
    }
  };

  const currentStyle = styles[type];

  return (
    <div className={`group bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 overflow-hidden relative`}>
      <div className={`absolute top-0 right-0 w-32 h-32 ${currentStyle.bg} opacity-50 rounded-bl-full transition-transform duration-700 group-hover:scale-150 -z-10`}></div>
      
      <div className="flex justify-between items-start mb-8">
        <div className={`p-4 rounded-2xl ${currentStyle.iconBg} text-white shadow-lg transition-transform duration-500 group-hover:rotate-12`}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex flex-col items-end`}>
             <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest ${trend >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {trend >= 0 ? '+' : ''}{trend}%
             </span>
             <span className="text-[8px] font-black text-slate-300 uppercase mt-1 tracking-tighter">vs mese prec.</span>
          </div>
        )}
      </div>
      
      <div>
        <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-2">{title}</p>
        <h3 className={`text-4xl font-black tracking-tighter ${currentStyle.accent}`}>
          € {amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
        </h3>
      </div>
    </div>
  );
};
