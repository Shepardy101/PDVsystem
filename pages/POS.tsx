import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../components/AuthContext';
import { ShoppingCart, CreditCard, DollarSign, Zap, Ticket, Command, X, ArrowRight, Minus, Plus, Trash2, Printer, CheckCircle2, ShieldCheck, Cpu, Wallet, Lock, Unlock, AlertTriangle, Calculator, BarChart3, TrendingUp, Clock, Target, Users } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Button, Badge, Modal, Input } from '../components/UI';
import { Product, CartItem, Client, Category, Sale, Supplier, CashTransaction, CashSession } from '../types';
import { listClients } from '../services/client';
import PaymentModal from '../components/modals/PaymentModal';
import ClientModal from '../components/modals/ClientModal';
import DiscountModal from '../components/modals/DiscountModal';
import ReceiptModal from '../components/modals/ReceiptModal';
import ClosingModal from '../components/modals/ClosingModal';
import OpeningModal from '../components/modals/OpeningModal';


interface POSProps {
  
   cashOpen: boolean;
   onOpenCash: (balance: number) => void;
  
}


const POS: React.FC<POSProps> = ({ cashOpen, onOpenCash }) => {

   const [searchTerm, setSearchTerm] = useState('');
   const [isSearchFocused, setIsSearchFocused] = useState(false);
   const [cart, setCart] = useState<CartItem[]>([]);
   const [manualDiscount, setManualDiscount] = useState(0);
   const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
   const [multiMode, setMultiMode] = useState(false);
   const [isClientModalOpen, setIsClientModalOpen] = useState(false);
   const [clientSearch, setClientSearch] = useState('');
   const [clientResults, setClientResults] = useState<Client[]>([]);
   const [selectedClientIndex, setSelectedClientIndex] = useState(0);
   const [selectedClient, setSelectedClient] = useState<Client | null>(null);



   // Discount Modal State
   const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
   const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
   const [lastSaleData, setLastSaleData] = useState<any>(null);
   const [selectedIndex, setSelectedIndex] = useState(0);
   const [tempDiscount, setTempDiscount] = useState('0');

   // Cash session state
   const [cashSessionId, setCashSessionId] = useState<string | null>(null);
   const { user } = useAuth();
   const [operatorId, setOperatorId] = useState<string>('');
   const [isLoadingSession, setIsLoadingSession] = useState(true);

   // Modais de Estado do Caixa
   const [isOpeningModalOpen, setIsOpeningModalOpen] = useState(false);
   const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
   const [closeResult, setCloseResult] = useState<any>(null);
   const [closeLoading, setCloseLoading] = useState(false);
   const [closeError, setCloseError] = useState('');
   const [initialBalance, setInitialBalance] = useState('');
   const [physicalCashInput, setPhysicalCashInput] = useState('');


   // Notification State
   const [notification, setNotification] = useState<{ show: boolean, msg: string, sub: string } | null>(null);

   const inputRef = useRef<HTMLInputElement>(null);
   const searchRef = useRef<HTMLDivElement>(null);



   const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.product.salePrice * item.quantity), 0), [cart]);
   const autoDiscountsTotal = useMemo(() => cart.reduce((acc, item) => acc + (item.appliedDiscount * item.quantity), 0), [cart]);
   const total = useMemo(() => Math.max(0, subtotal - autoDiscountsTotal - manualDiscount), [subtotal, autoDiscountsTotal, manualDiscount]);



   // Fetch open cash session on mount or when cashOpen changes
   useEffect(() => {
      if (user && user.id) {
         setOperatorId(user.id);
      } else {
         setOperatorId('');
      }
   }, [user]);


// se cashSessionId for null, entao ao pressionar 'enter' ou 'space' abre o modal de abertura de caixa
// se pressionar 'esc' com o modal de abertura de caixa aberto, ele será fechado
useEffect(() => {
   const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && !cashSessionId && !isOpeningModalOpen && !isClosingModalOpen) {
         e.preventDefault();
         setIsOpeningModalOpen(true);
      }
      if (e.key === 'Escape' && isOpeningModalOpen) {
         e.preventDefault();
         setIsOpeningModalOpen(false);
      }
   };
   window.addEventListener('keydown', handleKeyDown);
   return () => window.removeEventListener('keydown', handleKeyDown);
}, [cashSessionId, isOpeningModalOpen, isClosingModalOpen]);

   // Função para limpar o carrinho e focar no input
   const handleClearCart = () => {
      setCart([]);
      setSelectedClient(null);
      setTimeout(() => {
         if (inputRef.current) inputRef.current.focus();
      }, 50);
   };
   // Funções auxiliares para controle do PaymentModal
   const openPaymentModal = () => {
      setIsPaymentModalOpen(true);
   };
   const closePaymentModal = () => {
      setIsPaymentModalOpen(false);
      setMultiMode(false);
   };
   const toggleMultiMode = () => {
      setMultiMode(prev => !prev);
   };





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









   useEffect(() => {
      if (!cashOpen || !operatorId) {
         setIsLoadingSession(true);
         setCashSessionId(null);
         setTimeout(() => {
            setIsLoadingSession(false);
         }, 500); // Garante spinner mínimo
         return;
      }
      setIsLoadingSession(true);
      console.log('[PDV] Verificando se existe caixa aberto para operador:', operatorId);
      fetch(`/api/cash/open?operatorId=${operatorId}`)
         .then(async res => {
            if (res.ok) {
               const data = await res.json();
               if (data && data.session && data.session.id) {
                  setCashSessionId(data.session.id);
                  setIsOpeningModalOpen(false); // Não abre modal, já existe caixa aberto
                  console.log('[PDV] Caixa aberto encontrado:', data.session.id);
               } else {
                  setCashSessionId(null);
                  // NÃO abrir modal automaticamente!
                  console.log('[PDV] Nenhum caixa aberto encontrado.');
               }
            } else {
               setCashSessionId(null);
               // NÃO abrir modal automaticamente!
               console.log('[PDV] Erro ao consultar caixa aberto.');
            }
         })
         .catch((err) => {
            setCashSessionId(null);
            // NÃO abrir modal automaticamente!
            console.log('[PDV] Falha ao consultar caixa aberto:', err);
         })
         .finally(() => {
            setTimeout(() => {
               setIsLoadingSession(false);
            }, 500); // Garante spinner mínimo
         });
   }, [cashOpen, operatorId]);


   useEffect(() => {
      if (cashOpen && !isClosingModalOpen) {
         setTimeout(() => {
            inputRef.current?.focus();
            if (inputRef.current) inputRef.current.value = '';
         }, 50);
      }
   }, [cashOpen, isClosingModalOpen]);

   


   const triggerNotification = (msg: string, sub: string) => {
      setNotification({ show: true, msg, sub });
      setTimeout(() => {
         setNotification(null);
      }, 4000);
   };











   const handlePrint = useCallback(() => {
      window.print();
   }, []);





   // Função para finalizar venda real
   const finalizeSale = useCallback(async (payments: { method: string, amount: number }[]) => {
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
         manualDiscountApplied: 0,
         finalUnitPrice: Math.round((item.product.salePrice - (item.product.autoDiscount || 0)) * 100),
         lineTotal: Math.round((item.product.salePrice - (item.product.autoDiscount || 0)) * item.quantity * 100)
      }));
      const paymentsPayload = payments.map(p => ({
         method: p.method,
         amount: p.amount,
         metadataJson: null
      }));
      const payload = {
         operatorId,
         cashSessionId,
         items,
         payments: paymentsPayload,
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
         // Adiciona dados do cliente ao recibo, se houver
         let clientName = null, clientCpf = null;
         if (selectedClient) {
            clientName = selectedClient.name;
            clientCpf = selectedClient.cpf;
         }
         setLastSaleData({ ...payload, id: saleId, payments: paymentsPayload, clientName, clientCpf });
         console.log('-----', { ...payload, id: saleId, payments: paymentsPayload, clientName, clientCpf })
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


   // Gerenciamento de atalhos de teclado
   useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
         // Bloqueia todos os atalhos do POS enquanto o modal de fechamento de caixa está aberto
         if (isClosingModalOpen) return;

         // Abrir modal de desconto com Ctrl + D se houver venda no buffer
         if (e.ctrlKey && e.key.toLowerCase() === 'd') {
            if (cart && cart.length > 0) {
               e.preventDefault();
               setIsDiscountModalOpen(true);
               return;
            }
         }
         // 🚨 CORREÇÃO PRINCIPAL:
         // Se o PaymentModal está aberto E está no multipagamento,
         // nada do pai pode capturar teclas.
         if (isPaymentModalOpen && multiMode) {
            // Não deixa o POS capturar nada, inclusive atalhos de pagamento integral
            return;
         }

      
         // Atalho para abrir modal de cliente
         if (isPaymentModalOpen && e.key.toLowerCase() === 'c') {
            console.log('[POS] Abrindo modal de cliente via tecla c');
            setIsClientModalOpen(true);
            return;
         }

         // Sempre previne o padrão do navegador para F10
         if (e.key === 'F10') {
            e.preventDefault();
            if (!isPaymentModalOpen) {
               openPaymentModal();
               return;
            }
         }

         // Finalizar com atalho quando NÃO está no multiMode
         if (isPaymentModalOpen && !multiMode) {
            const key = e.key.toLowerCase();
            if (["1", "2", "3"].includes(key)) {
               e.preventDefault();
               if (key === "1") finalizeSale("card");
               if (key === "2") finalizeSale("pix");
               if (key === "3") finalizeSale("cash");
               return;
            }
         }

         // Alternar modo multi pagamento (caso exista)
         if (e.key === 'm' && isPaymentModalOpen) {
            e.preventDefault();
            toggleMultiMode();
            return;
         }

         // Escape fecha modal
         if (e.key === 'Escape' && isPaymentModalOpen) {
            e.preventDefault();
            closePaymentModal();
            return;
         }

         // Focar input principal se apertar qualquer número
         if (!isPaymentModalOpen && /^[0-9]$/.test(e.key)) {
            inputRef.current?.focus();
         }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   }, [
      isPaymentModalOpen,
      multiMode,
      finalizeSale,
      openPaymentModal,
      closePaymentModal,
      toggleMultiMode,
      isClosingModalOpen
   ]);


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
         .catch((e) => {
            setSearchError('Erro ao buscar produtos', e.message);
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
                           autoFocus={true}
                           value={initialBalance}
                           onChange={(e) => setInitialBalance(e.target.value)}
                           placeholder="0.00"
                           className="text-center text-3xl font-mono text-accent bg-dark-950/50"
                           onKeyDown={async (e) => {
                              if (e.key === 'Enter') {
                                 const value = parseFloat(initialBalance.replace(',', '.')) || 0;
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
                                       setCashSessionId(data.session.id); // Atualiza o estado para mostrar o terminal imediatamente
                                    } else {
                                       throw new Error('Sessão de caixa não foi aberta.');
                                    }
                                 } catch (err) {
                                    alert('Erro ao abrir caixa. Tente novamente.');
                                 }
                              }
                           }}
                        />
                       
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
                                    setCashSessionId(data.session.id); // Atualiza o estado para mostrar o terminal imediatamente
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

   if (searchError) {
      return (
         <div className="flex-1 flex flex-col items-center justify-center bg-dark-950 bg-cyber-grid p-6 relative overflow-hidden assemble-view">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] animate-pulse" />
            <div className="relative z-10 flex flex-col items-center text-center space-y-8 max-w-lg">
               <div className="flex flex-col items-center gap-6">
                  <AlertTriangle size={48} className="text-red-500" />
                  <span className="text-red-400 text-sm font-bold tracking-widest uppercase">Erro ao buscar produtos</span>
                  <p className="text-slate-500 text-xs">Verifique sua conexão com a internet e tente novamente.</p>
               </div>
            </div>
         </div>
      );
   }


 

   return (
      <div className="flex-1 flex flex-col h-full overflow-hidden assemble-view bg-dark-950 bg-cyber-grid p-6 gap-6 relative">
         {/* Search Header */}
         <div className="relative z-50 max-w-3xl mx-auto w-full" ref={searchRef}>
            <div className={`gradient-border-wrapper flex items-center gap-4 transition-all duration-300 rounded-2xl p-2 bg-dark-900/60 backdrop-blur-xl border border-white/10 ${isSearchFocused ? 'border-accent/50 shadow-accent-glow' : ''
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
                        className={`w-full flex items-center justify-between p-4 transition-all ${selectedIndex === index ? 'bg-accent/10 border-l-4 border-accent' : 'hover:bg-white/5 border-l-4 border-transparent'
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



                     {/* MODAL DE FECHAMENTO DE CAIXA */}
                     



                     <div className="flex items-center gap-2">
                        <Badge variant="info">{cart.length} Ativos</Badge>
                        <button
                           title="Limpar carrinho"
                           onClick={handleClearCart}
                           className="ml-1 p-1  rounded hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors text-slate-400 hover:text-red-400"
                           style={{ display: cart.length > 0 ? 'inline-flex' : 'none', alignItems: 'center', justifyContent: 'center' }}
                        >
                           <span className='mr-1'>Limpar</span> <Trash2 size={14} />
                        </button>
                     </div>
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
                        Ctrl + D = Aplicar Desconto  
                     </p>
                  </div>
               </div>
            </div>
         </div>

         {/* PAYMENT MODAL */}
         <PaymentModal
            isOpen={isPaymentModalOpen}
            total={total}
            multiMode={multiMode}
            setMultiMode={setMultiMode}
            onClose={() => setIsPaymentModalOpen(false)}
            onFinalize={payments => finalizeSale(payments)}
            selectedClient={selectedClient}
         />

         <ClientModal
            isOpen={isClientModalOpen}
            clientSearch={clientSearch}
            clientResults={clientResults}
            selectedClientIndex={selectedClientIndex}
            setSelectedClientIndex={setSelectedClientIndex}
            onClose={() => setIsClientModalOpen(false)}
            onSearch={setClientSearch}
            onSelect={client => {
               setSelectedClient(client);
               setIsClientModalOpen(false);
            }}
         />


         {/* DISCOUNT MODAL */}
         <DiscountModal
            isOpen={isDiscountModalOpen}
            tempDiscount={tempDiscount}
            onClose={() => setIsDiscountModalOpen(false)}
            onChange={setTempDiscount}
            onApply={applyManualDiscount}
         />

         {/* RECEIPT MODAL */}
         <ReceiptModal
                  isOpen={isReceiptModalOpen}
                  lastSaleData={lastSaleData}
                  onClose={() => {
                     setIsReceiptModalOpen(false);
                     setCart([]);
                     setLastSaleData(null);
                     setSearchTerm('');
                     setManualDiscount(0);
                     setTempDiscount('0');
                     setSelectedClient(null);
                     //focar input de busca após fechar o recibo
                     setTimeout(() => {
                        inputRef.current?.focus();
                     }, 100);
                  }}
                  onPrint={handlePrint}
         />

         {/* CLOSING MODAL */}
         <ClosingModal
            isOpen={isClosingModalOpen}
            physicalCashInput={physicalCashInput}
            closeError={closeError}
            closeLoading={closeLoading}
            closeResult={closeResult}
                  onClose={() => {
                      setIsClosingModalOpen(false);
                      setPhysicalCashInput('');
                      setCloseError('');
                      // Só setar cashSessionId como null se o modal está mostrando o resumo (closeResult existe)
                      if (closeResult) {
                         setCashSessionId(null);
                         setCloseResult(null);
                         setInitialBalance('');
                      } else {
                         setCloseResult(null);
                      }
                  }}
            onInputChange={setPhysicalCashInput}
            onConfirm={async () => {
               setCloseLoading(true);
               setCloseError('');
               try {
                  // Corrige vírgula para ponto para aceitar 9,90 e 9.90
                  const value = parseFloat(physicalCashInput.replace(',', '.')) || 0;
                  const res = await fetch('/api/cash/close', {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({ sessionId: cashSessionId, physicalCount: Math.round(value * 100) })
                  });
                  if (!res.ok) throw new Error('Erro ao fechar caixa');
                  const data = await res.json();
                  setCloseResult(data.closeResult);
                  // NÃO setar cashSessionId(null) aqui! Só depois que fechar o modal de resumo.
               } catch (err) {
                  setCloseError('Erro ao fechar caixa. Tente novamente.');
               } finally {
                  setCloseLoading(false);
               }
            }}
         />

         

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
