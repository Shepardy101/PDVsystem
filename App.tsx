
import React, { useState, useEffect } from 'react';
import { useAuth } from './components/AuthContext';
import { ShoppingCart, Package, Users, Wallet, BarChart3, LogOut, Settings as SettingsIcon, Bell, Menu, X, Command } from 'lucide-react';
import { AppView } from './types';
import Login from './pages/Login';
import POS from './pages/POS';
import Products from './pages/Products';
import CashManagement from './pages/CashManagement';
import Reports from './pages/Reports';
import Entities from './pages/Entities';
import Settings from './pages/Settings';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('login');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [cashOpen, setCashOpen] = useState(false);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Restaurar sessão do usuário e caixa aberto ao recarregar
  useEffect(() => {
    setLoading(true);
    // Simula delay para UX melhor (pode ser removido ou ajustado)
    setTimeout(() => {
      if (user && user.id) {
        setView('pos');
        setCashOpen(true);
      } else {
        setView('login');
        setCashOpen(false);
      }
      setLoading(false);
    }, 600);
  }, [user]);

  const handleOpenCash = (balance: number) => {
    setCashOpen(true);
    setView('pos');
  };


  const handleLogout = () => {
    //limpar chave auth_user
    localStorage.removeItem('auth_user');
    setView('login');
    
    setCashOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="flex flex-col items-center gap-6">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent" />
          <span className="text-slate-400 text-lg font-bold tracking-tight">Carregando sistema...</span>
        </div>
      </div>
    );
  }

  if (view === 'login') {
    return <Login onOpenCash={handleOpenCash} />;
  }

  const NavItem = ({ target, icon: Icon, label }: { target: AppView, icon: any, label: string }) => {
    const isActive = view === target;
    return (
      <button
        onClick={() => setView(target)}
        className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 group relative ${
          isActive 
            ? 'bg-accent/10 text-accent shadow-accent-glow' 
            : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
        }`}
      >
        <Icon size={18} className={`${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'} transition-opacity`} />
        <span className={`text-[11px] font-bold uppercase tracking-[0.15em] ${!isSidebarOpen && 'hidden'}`}>{label}</span>
        {isActive && (
          <div className="absolute left-0 w-1 h-6 bg-accent rounded-r-full" />
        )}
      </button>
    );
  };

  return (
    <div className="flex h-screen w-screen bg-dark-950 text-slate-100 overflow-hidden font-sans selection:bg-accent/30">
      {/* Floating Glass Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-24'} bg-dark-900/40 backdrop-blur-xl border-r border-white/5 flex flex-col transition-all duration-500 ease-in-out z-30`}
      >
        <div className="p-8 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-accent-glow">
             <Command size={22} className="text-dark-950" />
          </div>
          <span className={`text-xl font-bold tracking-tight text-white ${!isSidebarOpen && 'hidden'}`}>NovaBev<span className="text-accent opacity-50">.</span></span>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-6 overflow-y-auto">
          <NavItem target="pos" icon={ShoppingCart} label="Terminal" />
          <NavItem target="products" icon={Package} label="Inventário" />
          <NavItem target="entities" icon={Users} label="Entidades" />
          <NavItem target="cash" icon={Wallet} label="Financeiro" />
          <NavItem target="reports" icon={BarChart3} label="Analíticos" />
        </nav>

        <div className="p-6 border-t border-white/5 space-y-3 bg-white/2">
          <button 
            onClick={() => {
              if (user.role === 'operador') {
                // Aqui você deve abrir o modal de solicitação de senha admin
                // Exemplo: setShowAdminPasswordModal(true)
              } else {
                setView('settings');
              }
            }}
            className={`w-full flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-300 ${
              view === 'settings' 
                ? 'bg-accent/10 text-accent border border-accent/20' 
                : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            <SettingsIcon size={18} />
            <span className={`text-[10px] font-bold uppercase tracking-widest ${!isSidebarOpen && 'hidden'}`}>Painel de Controle</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-3 text-red-400/60 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all"
          >
            <LogOut size={18} />
            <span className={`text-[10px] font-bold uppercase tracking-widest ${!isSidebarOpen && 'hidden'}`}>Encerrar</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden h-full">
        {/* Minimalist Top Nav */}
        <header className="h-20 bg-dark-950/20 backdrop-blur-md border-b border-white/5 px-10 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 bg-white/2 border border-white/5 hover:border-accent/40 rounded-lg text-slate-500 hover:text-accent transition-all"
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
               <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_#00e0ff]" />
               <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Canal Ativo: {view}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="flex items-center gap-1">
                <button className="p-2.5 text-slate-500 hover:text-accent transition-colors relative">
                   <Bell size={20} />
                   <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-accent rounded-full border-2 border-dark-950" />
                </button>
             </div>
             <div className="flex items-center gap-4 pl-6 border-l border-white/5">
                <div className="text-right hidden lg:block">
                   <p className="text-xs font-bold text-slate-200 tracking-tight">{user.name}</p>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{user.role}</p>
                </div>
                <div className="w-10 h-10 rounded-xl glass-card flex items-center justify-center font-bold text-xs text-accent shadow-glass border-accent/20">
                   OA
                </div>
             </div>
          </div>
        </header>

        {/* View Layout Container */}
        <div className="flex-1 relative overflow-hidden bg-dark-950">
          <div className="h-full relative z-10 flex flex-col">
            {view === 'pos' && (
              <POS 
                cashOpen={cashOpen}
                onOpenCash={handleOpenCash}
                
              />
            )}
            {view === 'products' && <Products />}
            {view === 'entities' && <Entities />}
            {view === 'cash' && <CashManagement />}
            {view === 'reports' && <Reports />}
            {view === 'settings' && <Settings />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
