
import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Wallet, PlusCircle, Sparkles, Loader2, Calendar, 
  Stethoscope, AlertCircle, RefreshCw, Home, FileText, Lightbulb, Settings,
  Database, ShieldCheck, LogIn, LogOut, CheckCircle2, Activity,
  Search, PieChart as PieChartIcon, ChevronRight, ArrowUpRight, ArrowDownRight, 
  User, Building, GraduationCap
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';
import { Transaction, TransactionType, AIInsight, DoctorProfile, HealthStatus, User as UserType } from './types.ts';
import { NAV_ITEMS, CHART_COLORS } from './constants.tsx';
import { StatCard } from './components/StatCard.tsx';
import { TransactionForm } from './components/TransactionForm.tsx';
import { analyzeBudget } from './services/geminiService.ts';
import { apiService } from './services/apiService.ts';

const App: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [dbStatus, setDbStatus] = useState<HealthStatus & { message?: string }>({ status: 'offline' });
  const [isCheckingDb, setIsCheckingDb] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | TransactionType>('ALL');

  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [regData, setRegData] = useState<DoctorProfile>({
    firstName: '', lastName: '', specialization: '', studioName: ''
  });

  const checkConnection = async () => {
    setIsCheckingDb(true);
    const status = await apiService.checkHealth();
    setDbStatus(status);
    setIsCheckingDb(false);
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('medbudget_user');
    if (storedUser) {
      const u = JSON.parse(storedUser);
      setUser(u);
      loadAppData(u);
    } else {
      setIsInitializing(false);
    }
  }, []);

  const loadAppData = async (currUser: UserType) => {
    setIsLoading(true);
    try {
      const [prof, trans] = await Promise.all([
        apiService.getProfile(),
        apiService.getTransactions()
      ]);
      setProfile(prof);
      setTransactions(trans);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setIsLoading(false);
      setIsInitializing(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = authMode === 'login' 
        ? await apiService.login(authForm)
        : await apiService.register(authForm);
      
      setUser(res.user);
      localStorage.setItem('medbudget_user', JSON.stringify(res.user));
      await loadAppData(res.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const saved = await apiService.saveProfile(regData);
      setProfile(saved);
      if (activeTab === 'settings') {
        alert("Profilo aggiornato con successo!");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    setTransactions([]);
    localStorage.removeItem('medbudget_user');
  };

  const summary = useMemo(() => {
    const inc = transactions.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
    const exp = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);
    return { totalIncome: inc, totalExpenses: exp, balance: inc - exp };
  }, [transactions]);

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      });
    return Object.entries(categories).map(([name, value], idx) => ({
      name,
      value,
      color: CHART_COLORS[idx % CHART_COLORS.length]
    })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [transactions, searchTerm, typeFilter]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <Loader2 className="animate-spin text-blue-500 w-16 h-16" />
          <Stethoscope className="absolute inset-0 m-auto text-blue-300 w-6 h-6" />
        </div>
        <p className="text-blue-200/40 font-bold uppercase tracking-widest text-xs animate-pulse">Caricamento MedBudget Pro...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-white/95 backdrop-blur-2xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-white/20 relative overflow-hidden">
          
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-6 rotate-3">
              <ShieldCheck className="text-white w-10 h-10 -rotate-3" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">MedBudget<span className="text-blue-600">Pro</span></h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] mt-2">Professional Financial Suite</p>
          </div>

          <div className={`mb-8 p-5 rounded-3xl flex flex-col gap-4 border transition-all duration-700 ${dbStatus.status === 'online' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${dbStatus.status === 'online' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-rose-500 text-white shadow-lg shadow-rose-200'}`}>
                  <Database size={18} className={isCheckingDb ? 'animate-spin' : ''} />
                </div>
                <div className="flex flex-col">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${dbStatus.status === 'online' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    Cloud VPS
                  </span>
                  <span className={`text-sm font-bold ${dbStatus.status === 'online' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {dbStatus.status === 'online' ? 'Connesso' : 'Disconnesso'}
                  </span>
                </div>
              </div>
              <button onClick={checkConnection} className="p-2.5 rounded-xl hover:bg-white transition-colors">
                <RefreshCw size={16} className={isCheckingDb ? 'animate-spin' : 'text-slate-400'} />
              </button>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
              <input required type="text" placeholder="Nome utente" value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <input required type="password" placeholder="••••••••" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 font-bold" />
            </div>
            
            {error && (
              <div className="flex items-start gap-3 text-rose-600 text-[11px] font-bold bg-rose-50 p-4 rounded-2xl border border-rose-100">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={isLoading || dbStatus.status !== 'online'} className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-3 mt-6 disabled:opacity-50">
              {isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : <LogIn className="w-6 h-6" />}
              {authMode === 'login' ? 'Accedi allo Studio' : 'Crea Nuovo Studio'}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-blue-600 text-[11px] font-black hover:underline transition-colors tracking-widest uppercase">
              {authMode === 'login' ? "Non hai un account? Registrati" : "Hai già un account? Accedi"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (user && !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl w-full max-w-2xl border border-slate-100">
          <div className="flex items-center gap-6 mb-12">
             <div className="p-5 bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-200"><Building size={32} /></div>
             <div>
               <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Configura Studio</h2>
               <p className="text-slate-500 font-semibold text-lg">Dr. {user.username}, completa il tuo profilo professionale.</p>
             </div>
          </div>
          <form onSubmit={handleProfileUpdate} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome</label>
                <input required type="text" placeholder="Es. Mario" value={regData.firstName} onChange={e => setRegData({...regData, firstName: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-800" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cognome</label>
                <input required type="text" placeholder="Es. Rossi" value={regData.lastName} onChange={e => setRegData({...regData, lastName: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-800" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Specializzazione</label>
              <div className="relative">
                <Stethoscope className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input required type="text" placeholder="Es. Odontoiatria..." value={regData.specialization} onChange={e => setRegData({...regData, specialization: e.target.value})} className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-800" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Studio</label>
              <div className="relative">
                <Building className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input required type="text" placeholder="Es. Clinica Sanitas" value={regData.studioName} onChange={e => setRegData({...regData, studioName: e.target.value})} className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-800" />
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-3xl shadow-2xl shadow-blue-200 transition-all flex items-center justify-center gap-3 text-xl active:scale-[0.98]">
               {isLoading ? <Loader2 className="animate-spin w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
               Salva e Inizia
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans selection:bg-blue-100 selection:text-blue-900">
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-100 p-8 fixed h-full z-40">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200 rotate-3">
            <TrendingUp className="text-white w-7 h-7 -rotate-3" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-2xl text-slate-900 tracking-tighter leading-none">MedBudget</span>
            <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em] mt-1.5">PRO EDITION</span>
          </div>
        </div>
        
        <nav className="space-y-2 flex-1">
          {NAV_ITEMS.map((item) => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)} 
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all group ${
                activeTab === item.id 
                ? 'bg-slate-900 text-white shadow-2xl shadow-slate-200' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className={`transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="mt-auto space-y-6">
           <div className={`p-5 rounded-3xl border transition-all duration-700 ${dbStatus.status === 'online' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Database size={16} className={isCheckingDb ? 'animate-spin' : ''} />
                  <span className="text-[10px] uppercase font-black tracking-[0.1em]">Database VPS</span>
                </div>
                <button onClick={checkConnection} className="hover:rotate-180 transition-transform duration-500">
                   <RefreshCw size={12} className={isCheckingDb ? 'animate-spin' : ''} />
                </button>
              </div>
              <p className="text-[11px] font-black">{dbStatus.status === 'online' ? `Online (${dbStatus.latency}ms)` : 'Disconnesso'}</p>
           </div>
           
           <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold shrink-0">
                  {profile?.lastName.charAt(0)}
                </div>
                <div className="truncate">
                   <p className="text-xs text-slate-900 font-black truncate leading-tight">Dr. {profile?.lastName}</p>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">{profile?.specialization}</p>
                </div>
              </div>
              <button onClick={logout} className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all" title="Esci">
                <LogOut size={20} />
              </button>
           </div>
        </div>
      </aside>

      <main className="flex-1 md:ml-72 p-6 md:p-12 pb-32 md:pb-12">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">{profile?.studioName}</h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="flex items-center gap-2 text-slate-500 font-bold">
                <Calendar className="w-4 h-4" /> {new Date().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              <span className="text-blue-600 font-black text-xs uppercase tracking-widest">{activeTab}</span>
            </div>
          </div>
          <button 
            onClick={() => setIsFormOpen(true)} 
            className="flex items-center justify-center gap-4 bg-slate-900 text-white px-10 py-5 rounded-3xl font-black shadow-2xl shadow-slate-200 transition-all active:scale-[0.97] hover:bg-black group"
          >
            <PlusCircle className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" /> 
            Nuovo Movimento
          </button>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StatCard title="Entrate Totali" amount={summary.totalIncome} icon={<TrendingUp />} type="income" />
              <StatCard title="Uscite Totali" amount={summary.totalExpenses} icon={<TrendingDown />} type="expense" />
              <StatCard title="Margine Netto" amount={summary.balance} icon={<Wallet />} type="balance" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
              <div className="lg:col-span-3 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-900 text-2xl flex items-center gap-4 mb-10">
                  <Activity className="text-blue-600" /> Flusso Finanziario
                </h3>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Entrate', value: summary.totalIncome, color: '#3b82f6' },
                      { name: 'Uscite', value: summary.totalExpenses, color: '#f43f5e' }
                    ]}>
                      <CartesianGrid strokeDasharray="12 12" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 800}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 800}} />
                      <Tooltip cursor={{fill: '#f8fafc', radius: 24}} contentStyle={{borderRadius: '32px', border: 'none', boxShadow: '0 25px 50px rgba(0,0,0,0.1)', padding: '24px'}} />
                      <Bar dataKey="value" radius={[24, 24, 24, 24]} barSize={120}>
                        <Cell fill="#3b82f6" />
                        <Cell fill="#f43f5e" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-2 bg-slate-900 text-white p-12 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col">
                 <div className="relative z-10 flex-1 flex flex-col">
                   <div className="flex items-center gap-4 mb-10">
                     <div className="w-10 h-10 rounded-2xl bg-blue-600/20 flex items-center justify-center">
                       <Sparkles className="w-6 h-6 text-blue-400" />
                     </div>
                     <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-400">Gemini AI Studio</span>
                   </div>
                   
                   {aiInsights.length > 0 ? (
                     <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[500px]">
                       {aiInsights.map((i, idx) => (
                         <div key={idx} className="p-6 rounded-3xl bg-white/5 border border-white/10">
                           <p className="text-[11px] font-black text-white uppercase tracking-widest mb-2">{i.title}</p>
                           <p className="text-sm text-slate-400 leading-relaxed font-semibold">{i.content}</p>
                         </div>
                       ))}
                       <button 
                        onClick={() => { setIsAnalyzing(true); analyzeBudget(transactions, profile).then(res => { setAiInsights(res); setIsAnalyzing(false); }); }} 
                        className="w-full py-4 text-xs font-black text-blue-400 uppercase tracking-widest hover:text-white"
                       >
                         Aggiorna Analisi
                       </button>
                     </div>
                   ) : (
                     <div className="flex-1 flex flex-col justify-center items-center text-center">
                       <Lightbulb size={40} className="text-blue-500 mb-6" />
                       <p className="text-slate-300 mb-8 font-bold">Ottieni insight strategici sui tuoi dati reali.</p>
                       <button 
                        onClick={() => { setIsAnalyzing(true); analyzeBudget(transactions, profile).then(res => { setAiInsights(res); setIsAnalyzing(false); }); }} 
                        disabled={isAnalyzing || transactions.length === 0} 
                        className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-black flex items-center justify-center gap-4 disabled:opacity-50"
                       >
                         {isAnalyzing ? <Loader2 className="animate-spin" /> : <Sparkles />} 
                         Genera Analisi AI
                       </button>
                     </div>
                   )}
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-900 text-2xl mb-10 flex items-center gap-4">
                  <PieChartIcon className="text-rose-500" /> Analisi Uscite
                </h3>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} innerRadius={100} outerRadius={150} paddingAngle={8} dataKey="value">
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: number) => `€ ${val.toLocaleString('it-IT')}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-900 text-2xl mb-10 flex items-center gap-4">
                  <ArrowUpRight className="text-emerald-500" /> Top Entrate
                </h3>
                <div className="space-y-6">
                   {/* // Explicitly cast entries to [string, number][] to fix arithmetic type errors and toLocaleString argument issues */}
                   {(Object.entries(
                     transactions
                      .filter(t => t.type === TransactionType.INCOME)
                      .reduce((acc, t) => ({...acc, [t.category]: (acc[t.category] || 0) + t.amount}), {} as Record<string, number>)
                   ) as [string, number][]).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([cat, amount], idx) => (
                     <div key={cat}>
                        <div className="flex justify-between items-center mb-2">
                           <span className="font-black text-slate-800">{cat}</span>
                           <span className="font-black text-emerald-600">€ {amount.toLocaleString('it-IT')}</span>
                        </div>
                        <div className="w-full h-3 bg-slate-50 rounded-full">
                           <div className="h-full bg-emerald-500 rounded-full" style={{width: `${(amount / (summary.totalIncome || 1)) * 100}%`}}></div>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-12 border-b border-slate-100 bg-slate-50/20">
              <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
                <h3 className="font-black text-3xl text-slate-900">Archivio Movimenti</h3>
                <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                  <div className="relative flex-1 lg:w-80">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Cerca movimenti..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                    <button onClick={() => setTypeFilter('ALL')} className={`px-5 py-2.5 rounded-xl text-xs font-black ${typeFilter === 'ALL' ? 'bg-white text-slate-900' : 'text-slate-500'}`}>TUTTI</button>
                    <button onClick={() => setTypeFilter(TransactionType.INCOME)} className={`px-5 py-2.5 rounded-xl text-xs font-black ${typeFilter === TransactionType.INCOME ? 'bg-emerald-500 text-white' : 'text-slate-500'}`}>ENTRATE</button>
                    <button onClick={() => setTypeFilter(TransactionType.EXPENSE)} className={`px-5 py-2.5 rounded-xl text-xs font-black ${typeFilter === TransactionType.EXPENSE ? 'bg-rose-500 text-white' : 'text-slate-500'}`}>USCITE</button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="text-left py-6 px-12 text-[11px] font-black text-slate-400 uppercase tracking-widest">Dettagli</th>
                    <th className="text-left py-6 px-12 text-[11px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                    <th className="text-right py-6 px-12 text-[11px] font-black text-slate-400 uppercase tracking-widest">Importo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-all">
                      <td className="py-8 px-12">
                        <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-3xl flex items-center justify-center ${t.type === TransactionType.INCOME ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                            {t.type === TransactionType.INCOME ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-lg">{t.description}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-black px-2 py-1 bg-slate-100 inline-block rounded-lg mt-1">{t.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-8 px-12 text-sm font-black text-slate-500">
                        {new Date(t.date).toLocaleDateString('it-IT')}
                      </td>
                      <td className={`py-8 px-12 text-right font-black text-2xl ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {t.type === TransactionType.INCOME ? '+' : '-'} € {t.amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredTransactions.length === 0 && (
                <div className="py-40 text-center flex flex-col items-center gap-4">
                  <FileText size={80} className="text-slate-100" />
                  <p className="text-slate-500 font-bold">Nessun movimento trovato.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-12 animate-in fade-in duration-700">
             <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-14 rounded-[3rem] shadow-2xl">
                <div className="max-w-3xl">
                   <h2 className="text-6xl font-black tracking-tighter mb-8 leading-tight">Analisi Strategica</h2>
                   <p className="text-xl text-slate-300 font-semibold mb-12">
                      Analizziamo la salute finanziaria del tuo studio individuando opportunità di crescita e ottimizzazione fiscale.
                   </p>
                   <button 
                      onClick={() => { setIsAnalyzing(true); analyzeBudget(transactions, profile).then(res => { setAiInsights(res); setIsAnalyzing(false); }); }} 
                      disabled={isAnalyzing || transactions.length === 0}
                      className="px-10 py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-black text-xl flex items-center gap-4 transition-all shadow-2xl disabled:opacity-50"
                   >
                      {isAnalyzing ? <Loader2 className="animate-spin" /> : <Activity />}
                      {isAnalyzing ? 'Elaborazione...' : 'Avvia Audit AI'}
                   </button>
                </div>
             </div>

             {aiInsights.length > 0 && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {aiInsights.map((insight, idx) => (
                    <div key={idx} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                       <h4 className="font-black text-2xl text-slate-900 mb-4">{insight.title}</h4>
                       <p className="text-slate-500 text-lg font-semibold leading-relaxed mb-6">{insight.content}</p>
                       <div className={`w-2 h-2 rounded-full ${insight.type === 'success' ? 'bg-emerald-400' : insight.type === 'warning' ? 'bg-rose-400' : 'bg-blue-400'}`}></div>
                    </div>
                  ))}
               </div>
             )}
          </div>
        )}

        {activeTab === 'settings' && (
           <div className="max-w-4xl">
              <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-12">
                 <h3 className="text-4xl font-black text-slate-900">Impostazioni</h3>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <section className="space-y-6">
                       <h4 className="text-xs font-black uppercase text-blue-600">Dati Studio</h4>
                       <div className="p-5 bg-slate-50 rounded-2xl font-bold">{profile?.studioName}</div>
                       <div className="p-5 bg-slate-50 rounded-2xl font-bold">{profile?.specialization}</div>
                    </section>
                    <section className="space-y-6">
                       <h4 className="text-xs font-black uppercase text-blue-600">Account</h4>
                       <div className="p-5 bg-slate-50 rounded-2xl font-bold">{user.username}</div>
                       <button onClick={logout} className="w-full py-5 bg-rose-50 text-rose-600 rounded-3xl font-black flex items-center justify-center gap-3">
                          <LogOut size={20} /> Esci
                       </button>
                    </section>
                 </div>
              </div>
           </div>
        )}
      </main>

      <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-slate-900/95 backdrop-blur-xl rounded-[2.5rem] p-3 flex justify-around shadow-2xl z-50 border border-white/10">
        {NAV_ITEMS.map((item) => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} className={`p-4 rounded-3xl ${activeTab === item.id ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
            {item.icon}
          </button>
        ))}
      </nav>

      {isFormOpen && (
        <TransactionForm 
          onAdd={async (nt) => { 
            const saved = await apiService.addTransaction(nt); 
            setTransactions([saved, ...transactions]); 
          }} 
          onClose={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
};

export default App;
