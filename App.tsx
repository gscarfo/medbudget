
import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PlusCircle, 
  Menu, 
  Bell, 
  Search,
  ChevronRight,
  Sparkles,
  Loader2,
  Calendar,
  Stethoscope
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Transaction, TransactionType, AIInsight, DoctorProfile } from './types';
import { NAV_ITEMS, CATEGORIES } from './constants';
import { StatCard } from './components/StatCard';
import { TransactionForm } from './components/TransactionForm';
import { analyzeBudget } from './services/geminiService';
import { apiService } from './services/apiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [registrationData, setRegistrationData] = useState<DoctorProfile>({
    firstName: '',
    lastName: '',
    specialization: '',
    studioName: ''
  });

  // Caricamento iniziale dei dati dal DB della VPS
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [prof, trans] = await Promise.all([
          apiService.getProfile(),
          apiService.getTransactions()
        ]);
        setProfile(prof);
        setTransactions(trans);
      } catch (error) {
        console.error("Errore nel caricamento dati:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const summary = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses
    };
  }, [transactions]);

  const chartData = useMemo(() => {
    const expensesByCategory = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((acc: any, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

    return Object.keys(expensesByCategory).map(name => ({
      name,
      value: expensesByCategory[name]
    }));
  }, [transactions]);

  const monthlyExpensesTrend = useMemo(() => {
    const last6Months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({
        month: d.toLocaleString('it-IT', { month: 'short' }),
        key: `${d.getFullYear()}-${d.getMonth()}`,
        amount: 0
      });
    }
    transactions.forEach(t => {
      if (t.type === TransactionType.EXPENSE) {
        const d = new Date(t.date);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const monthItem = last6Months.find(m => m.key === key);
        if (monthItem) monthItem.amount += t.amount;
      }
    });
    return last6Months;
  }, [transactions]);

  const barData = [
    { name: 'Entrate', value: summary.totalIncome, color: '#10b981' },
    { name: 'Uscite', value: summary.totalExpenses, color: '#f43f5e' }
  ];

  const handleAddTransaction = async (newT: Omit<Transaction, 'id'>) => {
    const savedTransaction = await apiService.addTransaction(newT);
    setTransactions([savedTransaction, ...transactions]);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const saved = await apiService.saveProfile(registrationData);
    setProfile(saved);
  };

  const runAIAnalysis = async () => {
    if (transactions.length === 0) return;
    setIsAnalyzing(true);
    const insights = await analyzeBudget(transactions);
    setAiInsights(insights);
    setIsAnalyzing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-emerald-50">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-lg border border-white">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200">
              <Stethoscope className="text-white w-8 h-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 text-center mb-2">MedBudget Pro</h1>
          <p className="text-slate-500 text-center mb-8">Configura il tuo studio medico per iniziare (Dati salvati su VPS).</p>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input required type="text" placeholder="Nome" value={registrationData.firstName} onChange={e => setRegistrationData({...registrationData, firstName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              <input required type="text" placeholder="Cognome" value={registrationData.lastName} onChange={e => setRegistrationData({...registrationData, lastName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
            <input required type="text" placeholder="Specializzazione" value={registrationData.specialization} onChange={e => setRegistrationData({...registrationData, specialization: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            <input required type="text" placeholder="Nome Studio" value={registrationData.studioName} onChange={e => setRegistrationData({...registrationData, studioName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all">Collega Studio</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 p-6 fixed h-full">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg"><TrendingUp className="text-white w-6 h-6" /></div>
          <span className="font-bold text-2xl text-slate-800">MedBudget</span>
        </div>
        <nav className="space-y-2 flex-1">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === item.id ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}>{item.icon}{item.label}</button>
          ))}
        </nav>
        <div className="mt-auto pt-6 border-t">
          <p className="text-xs text-slate-400 font-medium">Dr. {profile.lastName}</p>
          <p className="text-sm font-semibold truncate">{profile.studioName}</p>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div><h1 className="text-2xl font-bold text-slate-800">Dashboard {profile.studioName}</h1><p className="text-slate-500">Analisi in tempo reale da Database VPS.</p></div>
          <button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-100 transition-all active:scale-95"><PlusCircle className="w-5 h-5" />Nuovo Movimento</button>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Entrate" amount={summary.totalIncome} icon={<TrendingUp />} type="income" trend={5} />
              <StatCard title="Uscite" amount={summary.totalExpenses} icon={<TrendingDown />} type="expense" trend={-2} />
              <StatCard title="Saldo" amount={summary.balance} icon={<Wallet />} type="balance" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-6 text-sm uppercase tracking-wider">Flusso Cassa Consolidato</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)'}} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={60}>
                        {barData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                 <div className="flex items-center gap-2 mb-4 text-blue-600"><Sparkles className="w-5 h-5" /><span className="text-xs font-bold uppercase">AI Insight</span></div>
                 {aiInsights.length > 0 ? (
                   <div className="space-y-4">
                     {aiInsights.slice(0, 2).map((i, idx) => (
                       <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                         <p className="text-xs font-bold text-slate-800 mb-1">{i.title}</p>
                         <p className="text-xs text-slate-500 leading-relaxed">{i.content}</p>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center py-6">
                     <p className="text-xs text-slate-400 mb-4">Ottieni suggerimenti dal tuo budget tramite Gemini AI.</p>
                     <button onClick={runAIAnalysis} disabled={isAnalyzing} className="text-xs bg-slate-900 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 mx-auto">
                       {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Analizza
                     </button>
                   </div>
                 )}
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-500" />Andamento Mensile</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyExpensesTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none'}} />
                    <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 4, 4]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100"><h3 className="font-bold">Database Transazioni</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Descrizione</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Data</th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Importo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${t.type === TransactionType.INCOME ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {t.type === TransactionType.INCOME ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          </div>
                          <div><p className="font-medium text-slate-800 text-sm">{t.description}</p><p className="text-[10px] text-slate-400 uppercase font-bold">{t.category}</p></div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-500">{t.date}</td>
                      <td className={`py-4 px-6 text-right font-bold text-sm ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'}`}>€{t.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {isFormOpen && <TransactionForm onAdd={handleAddTransaction} onClose={() => setIsFormOpen(false)} />}
    </div>
  );
};

export default App;
