import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { ShoppingCart, CreditCard, DollarSign, Zap, Ticket, Command, X, ArrowRight, Minus, Plus, Trash2, Printer, CheckCircle2, ShieldCheck, Cpu, Wallet, Lock, Unlock, AlertTriangle, Calculator, BarChart3, TrendingUp, Clock, Target, Users } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Button, Badge, Modal, Input } from '../components/UI';
import { Product, CartItem, Client } from '../types';
import { listClients } from '../services/client';


interface POSProps {
  onFinishSale: (sale: any) => void;
  cashOpen: boolean;
  onOpenCash: (balance: number) => void;
  onCloseCash: () => void;
}

// Dados mockados para o minigráfico do turno
const SHIFT_PERFORMANCE_DATA = [
  { time: '08h', sales: 120 },
  { time: '10h', sales: 450 },
  { time: '12h', sales: 980 },
  { time: '14h', sales: 600 },
  { time: '16h', sales: 850 },
  { time: '18h', sales: 1420 },
  { time: '20h', sales: 1100 },
];


const POS: React.FC<POSProps> = ({ onFinishSale, cashOpen, onOpenCash, onCloseCash }) => {
   const [searchTerm, setSearchTerm] = useState('');
   const [isSearchFocused, setIsSearchFocused] = useState(false);
   const [cart, setCart] = useState<CartItem[]>([]);
   const [manualDiscount, setManualDiscount] = useState(0);
   const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
   const [isClientModalOpen, setIsClientModalOpen] = useState(false);
   const [clientSearch, setClientSearch] = useState('');
   const [clientResults, setClientResults] = useState<Client[]>([]);
   const [selectedClientIndex, setSelectedClientIndex] = useState(0);
   const [selectedClient, setSelectedClient] = useState<Client|null>(null);
   const clientInputRef = useRef<HTMLInputElement>(null);
       // Buscar clientes ao digitar no mini modal
       useEffect(() => {
          if (!isClientModalOpen) return;
          if (!clientSearch.trim()) {
             setClientResults([]);
             return;
          }
          listClients().then(data => {
             const items = (data.items || data || []).filter((c: Client) =>
                c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
                (c.cpf && c.cpf.includes(clientSearch))
             );
             setClientResults(items);
          }).catch(() => setClientResults([]));
       }, [clientSearch, isClientModalOpen]);
   const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
   const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
   const [lastSaleData, setLastSaleData] = useState<any>(null);
   const [selectedIndex, setSelectedIndex] = useState(0);
   const [tempDiscount, setTempDiscount] = useState('0');

   // Cash session state
   const [cashSessionId, setCashSessionId] = useState<string | null>(null);
   const [operatorId, setOperatorId] = useState<string>('operador-1'); // TODO: Replace with real operator logic
   const [isLoadingSession, setIsLoadingSession] = useState(true);

   // Modais de Estado do Caixa
   const [isOpeningModalOpen, setIsOpeningModalOpen] = useState(false);
   const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
   const [initialBalance, setInitialBalance] = useState('0.00');
   const [physicalCashInput, setPhysicalCashInput] = useState('');

   // Notification State
   const [notification, setNotification] = useState<{show: boolean, msg: string, sub: string} | null>(null);

   const inputRef = useRef<HTMLInputElement>(null);
   const searchRef = useRef<HTMLDivElement>(null);
   const discountInputRef = useRef<HTMLInputElement>(null);

   // Fetch open cash session on mount or when cashOpen changes
   useEffect(() => {
      if (!cashOpen) {
         setCashSessionId(null);
         setIsLoadingSession(false);
         return;
      }
      setIsLoadingSession(true);
      fetch('/api/cash/open')
         .then(res => res.json())
         .then(data => {
            if (data && data.session && data.session.id) {
               setCashSessionId(data.session.id);
            } else {
               setCashSessionId(null);
            }
         })
         .catch(() => setCashSessionId(null))
         .finally(() => setIsLoadingSession(false));
   }, [cashOpen]);

   useEffect(() => {
      if (cashOpen) {
         setTimeout(() => {
           inputRef.current?.focus();
           if (inputRef.current) inputRef.current.value = '';
         }, 50);
      }
   }, [cashOpen]);

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.product.salePrice * item.quantity), 0), [cart]);
  const autoDiscountsTotal = useMemo(() => cart.reduce((acc, item) => acc + (item.appliedDiscount * item.quantity), 0), [cart]);
  const total = useMemo(() => Math.max(0, subtotal - autoDiscountsTotal - manualDiscount), [subtotal, autoDiscountsTotal, manualDiscount]);

  const triggerNotification = (msg: string, sub: string) => {
    setNotification({ show: true, msg, sub });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const completeSaleFlow = useCallback(() => {
    if (lastSaleData) {
      onFinishSale(lastSaleData);
      triggerNotification("VENDA PROCESSADA", `TRANS ID: ${lastSaleData.id}`);
    }
    setCart([]);
    setLastSaleData(null);
    setIsReceiptModalOpen(false);
    setSearchTerm('');
    setManualDiscount(0);
    setTempDiscount('0');
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.value = '';
      }
    }, 50);
  }, [lastSaleData, onFinishSale]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

   // Função para finalizar venda real
   const finalizeSale = useCallback(async (method: string) => {
      if (!cashSessionId) {
         alert('Nenhuma sessão de caixa aberta. Abra o caixa para registrar vendas.');
         return;
      }
      const items = cart.map(item => ({
         productId: item.product.id,
         productName: item.product.name,
         productInternalCode: item.product.internalCode,
         productEan: item.product.gtin,
         unit: item.product.unit,
         quantity: item.quantity,
         unitPrice: Math.round(item.product.salePrice * 100),
         autoDiscountApplied: Math.round((item.product.autoDiscount || 0) * 100),
         manualDiscountApplied: 0, // MVP: só desconto global
         finalUnitPrice: Math.round((item.product.salePrice - (item.product.autoDiscount || 0)) * 100),
         lineTotal: Math.round((item.product.salePrice - (item.product.autoDiscount || 0)) * item.quantity * 100)
      }));
      const payments = [
         { method, amount: Math.round(total * 100), metadataJson: null }
      ];
      const payload = {
         operatorId,
         cashSessionId,
         items,
         payments,
         subtotal: Math.round(subtotal * 100),
         discountTotal: Math.round((autoDiscountsTotal + manualDiscount) * 100),
         total: Math.round(total * 100),
         clientId: selectedClient ? selectedClient.id : null
      };
      try {
         const res = await fetch('/api/pos/finalizeSale', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
         });
         if (!res.ok) throw new Error('Erro ao registrar venda');
         const { saleId } = await res.json();
         setLastSaleData({ ...payload, id: saleId, method });
         setIsPaymentModalOpen(false);
         setIsReceiptModalOpen(true);
         setSelectedClient(null);
      } catch (err) {
         alert('Erro ao registrar venda. Tente novamente.');
      }
   }, [cart, subtotal, autoDiscountsTotal, manualDiscount, total, cashSessionId, operatorId, selectedClient]);

  const applyManualDiscount = () => {
    setManualDiscount(parseFloat(tempDiscount) || 0);
    setIsDiscountModalOpen(false);
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!cashOpen) return;
      if (isDiscountModalOpen && e.key !== 'Enter' && e.key !== 'Escape') return;
      if (isReceiptModalOpen) {
        if (e.key === 'Enter') { e.preventDefault(); completeSaleFlow(); }
        if (e.key.toLowerCase() === 'i') { e.preventDefault(); handlePrint(); }
        return;
      }
      if (e.key === '/' && document.activeElement !== inputRef.current && !isPaymentModalOpen && !isDiscountModalOpen && !isReceiptModalOpen) {
        e.preventDefault();
        inputRef.current?.focus();
        setSearchTerm('');
      }
         // F10: Sempre previne comportamento padrão e controla fluxo dos modais
         if (e.key === 'F10') {
            e.preventDefault();
            if (cart.length > 0 && !isPaymentModalOpen && !isDiscountModalOpen && !isReceiptModalOpen) {
               setIsPaymentModalOpen(true);
               return;
            }
            if (isPaymentModalOpen && !isClientModalOpen) {
               setIsClientModalOpen(true);
               setTimeout(() => clientInputRef.current?.focus(), 50);
               return;
            }
         }
      if (e.ctrlKey && e.key.toLowerCase() === 'd' && !isPaymentModalOpen && !isDiscountModalOpen && !isReceiptModalOpen) {
        e.preventDefault();
        setTempDiscount(manualDiscount.toString());
        setIsDiscountModalOpen(true);
        setTimeout(() => discountInputRef.current?.focus(), 50);
      }
      if (isPaymentModalOpen) {
        const key = e.key.toLowerCase();
      if (['1', '2', '3'].includes(key)) {
        e.preventDefault();
        if (key === '1') finalizeSale('card');
        if (key === '2') finalizeSale('pix');
        if (key === '3') finalizeSale('cash');
      }
      }
      if (e.key === 'Escape') {
        if (isPaymentModalOpen) { e.preventDefault(); setIsPaymentModalOpen(false); setTimeout(() => inputRef.current?.focus(), 10); }
        else if (isDiscountModalOpen) { e.preventDefault(); setIsDiscountModalOpen(false); setTimeout(() => inputRef.current?.focus(), 10); }
        else if (isReceiptModalOpen) { e.preventDefault(); completeSaleFlow(); }
        else { inputRef.current?.blur(); setIsSearchFocused(false); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart.length, isPaymentModalOpen, isDiscountModalOpen, isReceiptModalOpen, manualDiscount, finalizeSale, completeSaleFlow, handlePrint, cashOpen]);


   // Busca produtos na API
   const [searchResults, setSearchResults] = useState<Product[]>([]);
   const [searchLoading, setSearchLoading] = useState(false);
   const [searchError, setSearchError] = useState<string | null>(null);

   useEffect(() => {
      if (!searchTerm.trim()) {
         setSearchResults([]);
         return;
      }
      setSearchLoading(true);
      fetch(`/api/products/search?q=${encodeURIComponent(searchTerm)}`)
         .then(res => {
            if (!res.ok) throw new Error('Erro na busca');
            return res.json();
         })
         .then(data => {
            // Mapeia produtos vindos da API para o formato esperado
            const items = (data.items || []).slice(0, 6).map((product: any) => ({
              id: product.id,
              name: product.name,
              gtin: product.ean || product.gtin,
              internalCode: product.internal_code || product.internalCode,
              unit: product.unit,
              costPrice: typeof product.cost_price === 'number' ? product.cost_price / 100 : product.costPrice,
              salePrice: typeof product.sale_price === 'number' ? product.sale_price / 100 : product.salePrice,
              stock: product.stock_on_hand ?? product.stock ?? 0,
              minStock: product.min_stock ?? 20,
              category: product.category_id || product.category,
              supplier: product.supplier_id || product.supplier || '',
              status: product.status,
              imageUrl: product.imageUrl || '',
              autoDiscount: typeof product.auto_discount_value === 'number' ? product.auto_discount_value / 100 : product.autoDiscount,
            }));
            setSearchResults(items);
            setSearchError(null);
         })
         .catch(() => {
            setSearchError('Erro ao buscar produtos');
            setSearchResults([]);
         })
         .finally(() => setSearchLoading(false));
   }, [searchTerm]);

  const addToCart = (product: Product) => {
      setCart(prev => {
         const existing = prev.find(item => item.product.id === product.id);
         const discount = product.autoDiscount || 0;
         if (existing) {
            return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
         }
         return [...prev, { product, quantity: 1, appliedDiscount: discount }];
      });
      setSearchTerm('');
      setSelectedIndex(0);
      setTimeout(() => {
         inputRef.current?.focus();
         if (inputRef.current) inputRef.current.value = '';
      }, 50);
   };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (searchResults.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(prev => (prev + 1) % searchResults.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(prev => (prev - 1 + searchResults.length) % searchResults.length); }
    else if (e.key === 'Enter') { e.preventDefault(); if (searchResults[selectedIndex]) addToCart(searchResults[selectedIndex]); }
  };

   // Mostra loading enquanto está carregando status do caixa
   if (isLoadingSession) {
       return (
          <div className="flex-1 flex flex-col items-center justify-center bg-dark-950 bg-cyber-grid p-6 relative overflow-hidden assemble-view">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] animate-pulse" />
             <div className="relative z-10 flex flex-col items-center text-center space-y-8 max-w-lg">
                <div className="flex flex-col items-center gap-6">
                   <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-accent border-solid" style={{ borderLeft: '4px solid #222', borderRight: '4px solid #222' }} />
                   <span className="text-slate-500 text-xs font-bold tracking-widest uppercase">Aguardando status do terminal...</span>
                </div>
             </div>
          </div>
       );
   }
   // Se o caixa está realmente fechado
   if (!cashOpen || !cashSessionId) {
      return (
         <div className="flex-1 flex flex-col items-center justify-center bg-dark-950 bg-cyber-grid p-6 relative overflow-hidden assemble-view">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] animate-pulse" />
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-8 max-w-lg">
          <div className="w-24 h-24 rounded-3xl bg-dark-900 border-2 border-white/5 flex items-center justify-center shadow-glass relative group transition-all duration-500 hover:border-accent/30">
            <Lock size={40} className="text-slate-700 group-hover:text-accent transition-colors duration-500" />
            <div className="absolute inset-0 border border-accent/20 rounded-3xl animate-ping opacity-20" />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-white tracking-widest uppercase assemble-text">Terminal em Modo Restrito</h2>
            <p className="text-slate-500 text-sm font-medium tracking-tight">O caixa atual encontra-se encerrado. Realize a abertura para iniciar o fluxo transacional.</p>
          </div>
          
          <Button 
            onClick={() => setIsOpeningModalOpen(true)}
            size="lg"
            className="px-12 py-5 text-xs font-bold tracking-[0.4em] uppercase shadow-accent-glow"
            icon={<Unlock size={18} />}
          >
            Abrir Terminal
          </Button>
          
          <div className="flex items-center gap-6 pt-8 opacity-40">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Fator de Autenticação</span>
              <div className="h-1 w-12 bg-accent/20 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-accent w-1/3 animate-ping" />
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Abertura */}
        {isOpeningModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-xl" onClick={() => setIsOpeningModalOpen(false)} />
             <div className="relative w-full max-w-md cyber-modal-container bg-dark-900/95 rounded-2xl border border-accent/30 shadow-2xl flex flex-col overflow-hidden">
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-dark-950/80">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-accent/10 border border-accent/30 flex items-center justify-center">
                         <Unlock className="text-accent" size={20} />
                      </div>
                      <h2 className="text-lg font-bold text-white uppercase tracking-[0.2em] assemble-text">Abertura de Caixa</h2>
                   </div>
                   <button onClick={() => setIsOpeningModalOpen(false)} className="text-slate-500 hover:text-accent p-2"><X size={20} /></button>
                </div>
                <div className="p-8 space-y-6">
                   <Input 
                      label="Saldo Inicial (R$)" 
                      value={initialBalance}
                      onChange={(e) => setInitialBalance(e.target.value)}
                      placeholder="0.00" 
                      className="text-center text-3xl font-mono text-accent bg-dark-950/50"
                   />
                   <div className="grid grid-cols-2 gap-3">
                      {['50.00', '100.00', '150.00', '200.00'].map(val => (
                        <button 
                          key={val}
                          type="button"
                          onClick={() => setInitialBalance(val)}
                          className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-400 hover:border-accent hover:text-accent transition-all uppercase tracking-widest"
                        >
                          R$ {val}
                        </button>
                      ))}
                   </div>
                            <Button 
                                 onClick={async () => {
                                    const value = parseFloat(initialBalance) || 0;
                                    try {
                                       const res = await fetch('/api/cash/open', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ operatorId: operatorId || 'operador-1', initialBalance: value })
                                       });
                                       if (!res.ok) throw new Error('Erro ao abrir caixa');
                                       // Confirma se a sessão foi realmente aberta
                                       const check = await fetch('/api/cash/open');
                                       const data = await check.json();
                                       if (data && data.session && data.session.id) {
                                          onOpenCash(value); // Só libera o PDV se o backend confirmou
                                          setIsOpeningModalOpen(false);
                                       } else {
                                          throw new Error('Sessão de caixa não foi aberta.');
                                       }
                                    } catch (err) {
                                       alert('Erro ao abrir caixa. Tente novamente.');
                                    }
                                 }}
                                 className="w-full py-5 text-xs font-bold tracking-[0.2em] uppercase shadow-accent-glow"
                            >
                                 Liberar Acesso
                            </Button>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden assemble-view bg-dark-950 bg-cyber-grid p-6 gap-6 relative">
      {/* Search Header */}
      <div className="relative z-50 max-w-3xl mx-auto w-full" ref={searchRef}>
        <div className={`gradient-border-wrapper flex items-center gap-4 transition-all duration-300 rounded-2xl p-2 bg-dark-900/60 backdrop-blur-xl border border-white/10 ${
          isSearchFocused ? 'border-accent/50 shadow-accent-glow' : ''
        }`}>
          <div className="pl-4 text-slate-500">
            <Command size={20} className={isSearchFocused ? 'text-accent' : ''} />
          </div>
          <input 
            ref={inputRef}
            type="text"
            placeholder="Pressione '/' para buscar produto ou GTIN..."
            className="flex-1 bg-transparent border-none outline-none py-3 text-lg text-white placeholder-slate-600 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            onKeyDown={handleSearchKeyDown}
          />
          {searchTerm && (
            <button onClick={() => { setSearchTerm(''); inputRef.current?.focus(); }} className="p-2 text-slate-500 hover:text-white">
              <X size={18} />
            </button>
          )}
        </div>

        {isSearchFocused && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-dark-900/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {searchResults.map((product, index) => (
              <button 
                key={product.id}
                onMouseDown={(e) => { e.preventDefault(); addToCart(product); }}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full flex items-center justify-between p-4 transition-all ${
                  selectedIndex === index ? 'bg-accent/10 border-l-4 border-accent' : 'hover:bg-white/5 border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-center gap-4 text-left">
                   <div className="w-10 h-10 rounded-lg bg-dark-800 border border-white/5 overflow-hidden">
                      <img src={product.imageUrl} className="w-full h-full object-cover opacity-60" />
                   </div>
                   <div>
                      <p className={`text-sm font-bold ${selectedIndex === index ? 'text-accent' : 'text-slate-200'}`}>{product.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{product.gtin}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-sm font-mono font-bold text-accent">R$ {product.salePrice.toFixed(2)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 grid grid-cols-12 gap-8 min-h-0 relative z-10">
        {/* Cart Area */}
        <div className="col-span-12 xl:col-span-8 flex flex-col min-h-0">
           <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                 <ShoppingCart size={16} className="text-accent" /> Buffer de Venda
              </h2>
              <div className="flex items-center gap-3">
                 <button 
                   onClick={() => setIsClosingModalOpen(true)}
                   className="text-[9px] font-bold uppercase tracking-widest text-red-400/50 hover:text-red-400 px-3 py-1 bg-red-400/5 rounded-full border border-red-400/10 transition-all"
                 >
                    Encerrar Turno
                 </button>
                 <Badge variant="info">{cart.length} Ativos</Badge>
              </div>
           </div>
           
           <div className="flex-1 glass-panel rounded-3xl overflow-hidden flex flex-col border-white/5 shadow-2xl">
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                 {cart.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-20">
                      <div className="p-12 border-2 border-dashed border-white/5 rounded-full mb-6">
                         <ShoppingCart size={80} strokeWidth={1} />
                      </div>
                      <p className="text-xl font-bold tracking-widest uppercase">Sistema em Standby</p>
                   </div>
                 ) : (
                   <div className="space-y-3">
                      {cart.map(item => (
                        <div key={item.product.id} className="flex items-center gap-6 bg-dark-900/40 p-4 rounded-2xl border border-white/5 hover:border-accent/20 transition-all group animate-in slide-in-from-left-4 duration-300">
                           <div className="w-12 h-12 rounded-xl bg-dark-950 border border-white/5 overflow-hidden shrink-0">
                              <img src={item.product.imageUrl} className="w-full h-full object-cover opacity-50" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-slate-100 truncate uppercase tracking-tight">{item.product.name}</h4>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-mono text-accent">R$ {item.product.salePrice.toFixed(2)}</span>
                                {item.appliedDiscount > 0 && <Badge variant="success">-R$ {item.appliedDiscount.toFixed(2)}</Badge>}
                              </div>
                           </div>
                           <div className="flex items-center gap-3 bg-dark-950/80 rounded-xl p-1.5 border border-white/10">
                              <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1 text-slate-500 hover:text-accent"><Minus size={14} /></button>
                              <span className="w-8 text-center text-xs font-mono font-bold text-slate-200">{item.quantity}</span>
                              <button onClick={() => addToCart(item.product)} className="p-1 text-slate-500 hover:text-accent"><Plus size={14} /></button>
                           </div>
                           <div className="w-24 text-right">
                              <p className="text-sm font-mono font-bold text-white">R$ {((item.product.salePrice - item.appliedDiscount) * item.quantity).toFixed(2)}</p>
                           </div>
                           <button onClick={() => removeFromCart(item.product.id)} className="p-2 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={16} />
                           </button>
                        </div>
                      ))}
                   </div>
                 )}
              </div>
           </div>
        </div>

        {/* Totals Section */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-6 h-full min-h-0">
           <div className="flex-1 glass-panel rounded-3xl p-8 flex flex-col border-white/5 bg-dark-900/40 shadow-2xl relative overflow-hidden">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-600 mb-10">Consolidação Fiscal</h3>
              
              <div className="flex-1 space-y-6">
                 <div className="flex justify-between items-center text-slate-500">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Soma Bruta</span>
                    <span className="font-mono text-sm tracking-tight">R$ {subtotal.toFixed(2)}</span>
                 </div>
                 
                 {autoDiscountsTotal + manualDiscount > 0 && (
                    <div className="flex justify-between items-center text-emerald-500/60">
                        <span className="text-[10px] font-bold uppercase tracking-widest">Deduções Totais</span>
                        <span className="font-mono text-sm tracking-tight">- R$ {(autoDiscountsTotal + manualDiscount).toFixed(2)}</span>
                    </div>
                 )}
              </div>

              <div className="pt-8 border-t border-white/5 space-y-8 shrink-0 relative z-10">
                 <div className="flex justify-between items-end">
                    <div>
                       <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-600 mb-2">Montante Líquido</p>
                       <h2 className="text-5xl font-mono font-bold text-accent ">R$ {total.toFixed(2)}</h2>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-accent/5 border border-accent/20 flex items-center justify-center animate-pulse">
                       <ArrowRight className="text-accent" />
                    </div>
                 </div>

                 <Button 
                   className="w-full py-6 text-xs font-bold tracking-[0.4em] uppercase shadow-accent-glow transition-all active:scale-95"
                   disabled={cart.length === 0}
                   onClick={() => setIsPaymentModalOpen(true)}
                 >
                   PROCESSAR [F10]
                 </Button>
                 
                 <p className="text-[8px] text-center text-slate-600 font-bold uppercase tracking-[0.2em]">
                    PDV-SYS CORE v3.1 // READY
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {isPaymentModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               {/* MINI MODAL CLIENTE */}
               {isClientModalOpen && (
                  <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                     <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-xl" onClick={() => setIsClientModalOpen(false)} />
                     <div className="relative w-full max-w-md cyber-modal-container bg-dark-900/95 rounded-2xl border border-accent/30 shadow-2xl flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-dark-950/80">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded bg-accent/10 border border-accent/30 flex items-center justify-center">
                                 <Users className="text-accent" size={20} />
                              </div>
                              <h2 className="text-lg font-bold text-white uppercase tracking-[0.2em] assemble-text">Vincular Cliente</h2>
                           </div>
                           <button onClick={() => setIsClientModalOpen(false)} className="text-slate-500 hover:text-accent p-2"><X size={20} /></button>
                        </div>
                        <div className="p-8 space-y-4">
                           <input
                              ref={clientInputRef}
                              type="text"
                              className="w-full bg-dark-950/50 border border-white/10 rounded-lg py-3 px-4 text-slate-100 outline-none text-lg focus:border-accent transition-all"
                              placeholder="Buscar cliente por nome ou CPF..."
                              value={clientSearch}
                              onChange={e => { setClientSearch(e.target.value); setSelectedClientIndex(0); }}
                              onKeyDown={e => {
                                 if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedClientIndex(i => Math.min(i + 1, clientResults.length - 1)); }
                                 if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedClientIndex(i => Math.max(i - 1, 0)); }
                                 if (e.key === 'Enter' && clientResults[selectedClientIndex]) {
                                    setSelectedClient(clientResults[selectedClientIndex]);
                                    setIsClientModalOpen(false);
                                    setTimeout(() => { document.querySelector('body')?.focus(); }, 50);
                                 }
                              }}
                           />
                           <div className="max-h-60 overflow-y-auto divide-y divide-white/5 mt-2">
                              {clientResults.length === 0 && <div className="text-slate-500 text-sm text-center py-6">Nenhum cliente encontrado</div>}
                              {clientResults.map((c, idx) => (
                                 <button
                                    key={c.id}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${idx === selectedClientIndex ? 'bg-accent/10 text-accent' : 'hover:bg-white/5 text-slate-200'}`}
                                    onMouseDown={e => {
                                       e.preventDefault();
                                       setSelectedClient(c);
                                       setIsClientModalOpen(false);
                                       setTimeout(() => { document.querySelector('body')?.focus(); }, 50);
                                    }}
                                 >
                                    <div className="font-bold text-base">{c.name}</div>
                                    <div className="text-xs text-slate-400">CPF: {c.cpf}</div>
                                    <div className="text-xs text-slate-400">{c.email}</div>
                                 </button>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               )}
           <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-xl" onClick={() => setIsPaymentModalOpen(false)} />
           <div className="relative w-full max-w-xl cyber-modal-container bg-dark-900/95 rounded-2xl border border-accent/30 shadow-2xl flex flex-col overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-dark-950/80 rounded-t-2xl">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-accent/10 border border-accent/30 flex items-center justify-center">
                       <Wallet className="text-accent animate-pulse" size={20} />
                    </div>
                    <div>
                       <h2 className="text-lg font-bold text-white uppercase tracking-[0.2em] assemble-text">
                         Liquidação de Buffer
                       </h2>
                       <p className="text-[9px] font-mono text-slate-500 uppercase flex items-center gap-2">
                          <Zap size={10} className="text-accent" /> Selecione o Protocolo de Saída
                       </p>
                    </div>
                 </div>
                 <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-500 hover:text-accent p-2">
                    <X size={20} />
                 </button>
              </div>

              <div className="p-8 space-y-10">
                 <div className="text-center space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Crédito Exigido</p>
                    <h3 className="text-5xl font-mono font-bold text-accent shadow-accent-glow">R$ {total.toFixed(2)}</h3>
                 </div>

                 <div className="grid grid-cols-3 gap-6">
                    {[
                       { id: 'card', label: 'Cartão', key: '1', icon: CreditCard, color: 'text-purple-400', delay: '0.3s' },
                       { id: 'pix', label: 'Pix', key: '2', icon: Zap, color: 'text-blue-400', delay: '0.2s' },
                      { id: 'cash', label: 'Dinheiro', key: '3', icon: DollarSign, color: 'text-emerald-400', delay: '0.1s' },
                    ].map(m => (
                      <div key={m.id} className="space-y-3 assemble-text" style={{ animationDelay: m.delay }}>
                         <button 
                          onClick={() => finalizeSale(m.id)}
                          className="w-full flex flex-col items-center gap-4 p-8 border border-white/5 bg-dark-950/50 rounded-2xl hover:border-accent/40 hover:bg-accent/5 transition-all group relative overflow-hidden"
                         >
                            <m.icon size={28} className={`${m.color} group-hover:scale-110 transition-transform relative z-10`} />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-200 relative z-10">{m.label}</span>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                         </button>
                         <p className="text-center text-[8px] font-bold text-slate-600 tracking-widest uppercase">[{m.key}]</p>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="p-6 border-t border-white/10 bg-dark-950/80 rounded-b-2xl text-center">
                 <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.3em]">Protocolo de Segurança Ativo // ESC para cancelar</p>
              </div>
              <div className="border-animation absolute bottom-0 left-0 w-full"></div>
           </div>
        </div>
      )}

      {/* MODAL FECHAMENTO DE TURNO - VERSÃO FINAL SIMPLIFICADA */}
      {isClosingModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-dark-950/85 backdrop-blur-xl" onClick={() => setIsClosingModalOpen(false)} />
           <div className="relative w-full max-w-xl cyber-modal-container bg-dark-900 border border-red-500/30 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden rounded-3xl">
              
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-dark-950/80">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                       <Lock className="text-red-400" size={20} />
                    </div>
                    <div>
                       <h2 className="text-lg font-bold text-white uppercase tracking-[0.2em] assemble-text">Resumo de Encerramento</h2>
                       <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Audit ID: {new Date().toLocaleDateString()}-A</p>
                    </div>
                 </div>
                 <button onClick={() => setIsClosingModalOpen(false)} className="text-slate-500 hover:text-red-400 p-2 transition-colors"><X size={20} /></button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
                 
                 {/* Indicadores do Turno */}
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-dark-950/50 rounded-xl border border-white/5 space-y-1">
                       <p className="text-[8px] font-bold text-slate-500 uppercase">Faturamento Bruto</p>
                       <p className="text-xl font-mono font-bold text-white">R$ 5.750,45</p>
                    </div>
                    <div className="p-4 bg-dark-950/50 rounded-xl border border-white/5 space-y-1">
                       <p className="text-[8px] font-bold text-slate-500 uppercase">Total de Vendas</p>
                       <p className="text-xl font-mono font-bold text-accent">142 Operações</p>
                    </div>
                    <div className="p-4 bg-dark-950/50 rounded-xl border border-white/5 space-y-1">
                       <p className="text-[8px] font-bold text-slate-500 uppercase">Suprimentos</p>
                       <p className="text-lg font-mono font-bold text-blue-400">R$ 100,00</p>
                    </div>
                    <div className="p-4 bg-dark-950/50 rounded-xl border border-white/5 space-y-1">
                       <p className="text-[8px] font-bold text-slate-500 uppercase">Sangrias</p>
                       <p className="text-lg font-mono font-bold text-red-400">R$ 50,00</p>
                    </div>
                 </div>

                 {/* Curva de Vendas por Horário */}
                 <div className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                       <BarChart3 size={14} className="text-accent" /> Performance Temporal
                    </h4>
                    <div className="h-40 w-full bg-dark-950/50 rounded-2xl border border-white/5 p-4 overflow-hidden relative">
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={SHIFT_PERFORMANCE_DATA}>
                             <defs>
                                <linearGradient id="shiftGrad" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#00e0ff" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#00e0ff" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <Tooltip 
                                contentStyle={{ backgroundColor: '#080812', border: '1px solid #ffffff10', borderRadius: '8px', fontSize: '10px' }}
                                itemStyle={{ color: '#00e0ff' }}
                                labelStyle={{ color: '#64748b' }}
                             />
                             <XAxis dataKey="time" hide />
                             <Area type="monotone" dataKey="sales" stroke="#00e0ff" strokeWidth={2} fill="url(#shiftGrad)" />
                          </AreaChart>
                       </ResponsiveContainer>
                       <div className="absolute bottom-2 left-4 right-4 flex justify-between text-[8px] font-bold text-slate-600 uppercase tracking-tighter">
                          <span>Abertura Turno</span>
                          <span>Pico Operacional</span>
                          <span>Fechamento</span>
                       </div>
                    </div>
                 </div>

                 {/* Conferência Dinheiro Físico */}
                 <div className="p-6 bg-dark-950/80 rounded-2xl border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                          <Calculator size={14} className="text-accent" /> Conferência Dinheiro Físico
                       </h4>
                       <span className="text-[10px] font-mono text-slate-500 uppercase">Esperado: R$ 1.250,45</span>
                    </div>
                    <div className="flex gap-4">
                       <div className="flex-1">
                          <Input 
                            value={physicalCashInput}
                            onChange={(e) => setPhysicalCashInput(e.target.value)}
                            placeholder="Valor na gaveta..." 
                            className="text-xl font-mono text-white bg-dark-900/50" 
                            icon={<DollarSign size={18} className="text-accent" />}
                          />
                       </div>
                       <div className={`w-32 p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                          !physicalCashInput ? 'border-white/5 bg-white/2' :
                          (Math.abs(parseFloat(physicalCashInput) - 1250.45) < 0.01) ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'
                       }`}>
                          <p className="text-[8px] font-bold text-slate-600 uppercase mb-0.5">Diferença</p>
                          <p className={`text-xs font-mono font-bold ${
                             !physicalCashInput ? 'text-slate-600' :
                             (Math.abs(parseFloat(physicalCashInput) - 1250.45) < 0.01) ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                             {physicalCashInput ? (parseFloat(physicalCashInput) - 1250.45).toFixed(2) : '0.00'}
                          </p>
                       </div>
                    </div>
                 </div>

                 {/* Botões de Ação */}
                 <div className="flex gap-4 pt-2">
                    <Button variant="secondary" className="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest" onClick={() => setIsClosingModalOpen(false)}>Voltar</Button>
                    <Button 
                      onClick={() => { onCloseCash(); setIsClosingModalOpen(false); }}
                      variant="danger"
                      className="flex-1 py-4 text-[10px] font-bold tracking-[0.2em] uppercase shadow-lg shadow-red-500/20"
                      icon={<ShieldCheck size={18}/>}
                    >
                      Confirmar Fechamento
                    </Button>
                 </div>
              </div>

              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
           </div>
        </div>
      )}

      {/* Receipt Modal */}
      <Modal isOpen={isReceiptModalOpen} onClose={completeSaleFlow} title="Recibo de Transação">
         <div className="flex flex-col items-center gap-6">
            <div className="bg-white text-black p-8 rounded shadow-2xl w-full max-w-[80mm] font-mono receipt-assemble" id="thermal-receipt">
               <div className="text-center mb-4">
                  <h2 className="text-lg font-bold">NOVABEV POS</h2>
                  <p className="text-[10px]">DISTRIBUIDORA DE BEBIDAS LTDA</p>
                  <div className="border-b border-black border-dashed my-2"></div>
                  <p className="text-[10px] font-bold">CUPOM FISCAL VIRTUAL</p>
                  <p className="text-[9px]">{new Date().toLocaleString()}</p>
               </div>
               <div className="text-[9px] space-y-1 mb-4 border-b border-black border-dashed pb-2">
                  <div className="flex justify-between font-bold">
                     <span>ITEM</span>
                     <span>TOTAL</span>
                  </div>
                  {lastSaleData?.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between">
                       <span>{item.quantity}x {item.productName}</span>
                       <span>{((item.unitPrice / 100) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
               </div>
               <div className="text-right text-xs font-bold uppercase">
                  Total: R$ {lastSaleData?.total ? (lastSaleData.total / 100).toFixed(2) : '0.00'}
               </div>
            </div>
            <div className="w-full flex gap-4 no-print">
               <Button variant="secondary" className="flex-1 py-4" icon={<Printer size={18} />} onClick={handlePrint}>Imprimir [I]</Button>
               <Button className="flex-1 py-4 shadow-accent-glow" icon={<CheckCircle2 size={18} />} onClick={completeSaleFlow}>Finalizar [ENTER]</Button>
            </div>
         </div>
      </Modal>

      {/* Manual Discount Modal */}
      <Modal isOpen={isDiscountModalOpen} onClose={() => setIsDiscountModalOpen(false)} title="Abatimento de Buffer">
         <div className="space-y-6">
            <div className="p-6 bg-dark-950/80 rounded-2xl border border-white/10">
                <Input 
                    ref={discountInputRef}
                    label="Crédito de Desconto (R$)"
                    type="number"
                    step="0.01"
                    className="text-center text-3xl font-mono text-accent"
                    value={tempDiscount}
                    onChange={(e) => setTempDiscount(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyManualDiscount()}
                />
            </div>
            <div className="flex gap-4">
               <Button variant="secondary" className="flex-1" onClick={() => setIsDiscountModalOpen(false)}>Cancelar</Button>
               <Button className="flex-1" onClick={applyManualDiscount}>Injetar Desconto</Button>
            </div>
         </div>
      </Modal>

      {/* NOTIFICATION TOAST (SALE PROCESSED FEEDBACK) */}
      {notification && notification.show && (
        <div className="fixed bottom-8 right-8 z-[200] cyber-toast bg-dark-900/90 border border-accent/40 rounded-2xl p-6 shadow-accent-glow max-w-sm backdrop-blur-xl animate-in slide-in-from-right-10 duration-500">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-widest assemble-text">{notification.msg}</h4>
              <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-tight">{notification.sub}</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 bg-accent/40 border-animation" />
        </div>
      )}
    </div>
  );
};

export default POS;
