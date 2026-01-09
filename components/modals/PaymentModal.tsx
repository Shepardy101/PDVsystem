import React, { useState, useEffect, useRef } from 'react';
import { Wallet, X, Zap, CreditCard, DollarSign } from 'lucide-react';
import { Button, Input } from '../UI';
import { useState as useReactState, useEffect as useReactEffect, useRef as useReactRef, useContext } from 'react';
import POSContext from '../../pages/POS';
export interface PaymentModalProps {
    isOpen: boolean;
    total: number;
    multiMode: boolean;
    setMultiMode: (v: boolean) => void;
    onClose: () => void;
    onFinalize: (payments: { method: string, amount: number, metadata?: any }[]) => void;
    selectedClient?: { name: string; cpf?: string } | null;
}

const paymentOptions = [
    { id: 'card', label: 'Cartão', key: '1', icon: CreditCard, color: 'text-purple-400' },
    { id: 'pix', label: 'Pix', key: '2', icon: Zap, color: 'text-blue-400' },
    { id: 'cash', label: 'Dinheiro', key: '3', icon: DollarSign, color: 'text-emerald-400' },
];



const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, total, multiMode, setMultiMode, onClose, onFinalize, selectedClient }) => {
        // Mini modal para dinheiro
        const [showCashChangeModal, setShowCashChangeModal] = useState(false);
        const [cashReceived, setCashReceived] = useState('');
        const [cashError, setCashError] = useState('');
        const cashInputRef = useRef<HTMLInputElement>(null);

        const totalCents = Math.round(total * 100);
        const cashReceivedCents = Math.round(parseFloat(cashReceived.replace(',', '.')) * 100) || 0;
        const changeCents = cashReceivedCents - totalCents;

        // Abre mini modal ao clicar ou pressionar '3'
        const openCashChangeModal = () => {
            setCashReceived((total).toFixed(2));
            setShowCashChangeModal(true);
            setTimeout(() => {
                cashInputRef.current?.focus();
                cashInputRef.current?.select();
            }, 10);
        };

        // Fecha mini modal
        const closeCashChangeModal = () => {
            setShowCashChangeModal(false);
            setCashError('');
        };

        // Confirma pagamento dinheiro
        const confirmCashPayment = () => {
            if (cashReceivedCents < totalCents) {
                setCashError('Valor recebido deve ser maior ou igual ao total da venda.');
                return;
            }
            setCashError('');
            setShowCashChangeModal(false);
            onFinalize([{ method: 'cash', amount: totalCents, metadata: { cashReceivedCents, changeCents } }]);
        };
    const [partialPayments, setPartialPayments] = useState<{ method: string, amount: number }[]>([]);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentAmount, setPaymentAmount] = useState('');
    // refs para ciclo de foco
    const inputRef = useRef<HTMLInputElement>(null);
    const selectRef = useRef<HTMLSelectElement>(null);
    const addBtnRef = useRef<HTMLButtonElement>(null);
    const finalizeBtnRef = useRef<HTMLButtonElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            console.log('[PaymentModal] MONTADO/ABERTO');
            setPartialPayments([]);
            setPaymentAmount('');
            setPaymentMethod('cash');
            setMultiMode(false);
            setTimeout(() => {
                modalRef.current?.focus();
            }, 10);
        }
    }, [isOpen, setMultiMode]);



    // controle de etapa do ciclo: 'input' | 'select' | 'add' | 'finalize'
    const [focusStep, setFocusStep] = useState<'input' | 'select' | 'add' | 'finalize'>('input');
    // Estado para evitar duplo submit
    const [isSubmitting, setIsSubmitting] = useState(false);




    const remaining = Math.round(total * 100) - partialPayments.reduce((acc, p) => acc + p.amount, 0);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // console.log('[PaymentModal] keydown:', e.key, 'multiMode:', multiMode, 'isInputFocused:', document.activeElement);
            const isInputFocused = (
                inputRef.current && document.activeElement === inputRef.current
            ) || (
                    selectRef.current && document.activeElement === selectRef.current
                ) || (
                    (document.activeElement as HTMLElement)?.closest("input, select")
                );

            // 🚨 IMPORTANTE:
            // Se está digitando → NÃO BLOQUEIE 1,2,3 e nem atalhos
            if (isInputFocused) return;

            // ======================
            // MODO MULTIPAGAMENTOS
            // ======================
            if (multiMode) {
                if (e.key === "/") {
                    e.preventDefault();
                    setMultiMode(false);
                    setFocusStep("input");
                    return;
                }
                if (e.key === "Escape") {
                    e.preventDefault();
                    setMultiMode(false);
                    setFocusStep("input");
                    setTimeout(() => {
                        inputRef.current?.focus();
                        inputRef.current?.select();
                    }, 10);
                    return;
                }
                if (e.key === "Enter") {
                    e.preventDefault();
                    if (focusStep === "input") setFocusStep("select");
                    else if (focusStep === "select") setFocusStep("add");
                    else if (focusStep === "add") addBtnRef.current?.click();
                    else if (focusStep === "finalize") finalizeBtnRef.current?.click();
                }
                // Não bloquear 'c' para POS
                // Não retorna aqui, deixa o evento seguir normalmente
                return; // impede de cair no modo simples
            }

            // ======================
            // MODO NORMAL (1,2,3)
            // ======================
            if (["1", "2", "3"].includes(e.key)) {
                e.preventDefault();
                const opt = paymentOptions.find(o => o.key === e.key);
                if (opt?.id === 'cash') {
                    openCashChangeModal();
                } else if (opt) {
                    onFinalize([{ method: opt.id, amount: Math.round(total * 100) }]);
                }
                return;
            }

            if (e.key === "/") {
                e.preventDefault();
                setMultiMode(true);
                setFocusStep("input");
                return;
            }
            // Não bloquear 'c' para POS
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);

    }, [isOpen, multiMode, total, focusStep, onFinalize]);

    // Quando entrar no multiMode, foca o input imediatamente
    useEffect(() => {
        if (multiMode) {
            setTimeout(() => {
                setFocusStep("input");
                inputRef.current?.focus();
                inputRef.current?.select();
            }, 10); // pequeno delay evita conflito com o modalRef.focus()
        }
    }, [multiMode]);


    // Foco automático conforme etapa
    useEffect(() => {
        if (!multiMode) return;
        if (focusStep === 'input' && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        } else if (focusStep === 'select' && selectRef.current) {
            selectRef.current.focus();
        } else if (focusStep === 'add' && addBtnRef.current) {
            addBtnRef.current.focus();
        } else if (focusStep === 'finalize' && finalizeBtnRef.current) {
            finalizeBtnRef.current.focus();
        }
    }, [multiMode, focusStep]);

    if (!isOpen) return null;


    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-xl" onClick={onClose} />
            <div
                ref={modalRef}
                tabIndex={-1}
                className="relative w-full max-w-xl cyber-modal-container bg-dark-900/95 rounded-2xl border border-accent/30 shadow-2xl flex flex-col overflow-hidden"
            >
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
                    <button onClick={onClose} className="text-slate-500 hover:text-accent p-2">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-8 space-y-8">
                    <div className="text-center space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Crédito Exigido</p>
                        <h3 className="text-5xl font-mono font-bold text-accent ">R$ {total.toFixed(2)}</h3>
                        {multiMode && (
                            <p className="text-xs text-slate-400 mt-2">Valor restante: <span className="font-bold text-accent">R$ {(remaining / 100).toFixed(2)}</span></p>
                        )}
                    </div>
                    {!multiMode ? (
                        <>
                        <div className="grid grid-cols-3 gap-6">
                            {paymentOptions.map(m => (
                                <div key={m.id} className="space-y-3 assemble-text">
                                    <button
                                        onClick={() => m.id === 'cash' ? openCashChangeModal() : onFinalize([{ method: m.id, amount: Math.round(total * 100) }])}
                                        className="w-full flex flex-col items-center gap-4 p-8 border border-white/5 bg-dark-950/50 rounded-2xl hover:border-accent/40 hover:bg-accent/5 transition-all group relative overflow-hidden"
                                    >
                                        <m.icon size={28} className={`${m.color} group-hover:scale-110 transition-transform relative z-10`} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-200 relative z-10">{m.label}</span>
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                    <p className="text-center text-[8px] font-bold text-slate-600 tracking-widest uppercase">[{m.key}]</p>
                                </div>
                            ))}
                            <div className="col-span-3 text-center mt-4 flex flex-col items-center gap-2">
                                <span className="text-xs text-slate-400">Pressione <b>/</b> para adicionar múltiplos pagamentos</span>
                                <span className="text-xs text-slate-400">Pressione <b>C</b> para adicionar cliente</span>
                            </div>
                        </div>
                        {/* MINI MODAL DINHEIRO */}
                        {showCashChangeModal && (
                            <div className="fixed inset-0 z-[200] flex items-center justify-center">
                                <div className="absolute inset-0 bg-black/60" onClick={closeCashChangeModal} />
                                <div className="relative bg-dark-900 rounded-xl border border-accent/30 shadow-2xl p-8 min-w-[320px] flex flex-col items-center">
                                    <h3 className="text-lg font-bold text-accent mb-4">Pagamento em Dinheiro</h3>
                                    <label className="w-full mb-2 text-xs text-slate-400">Valor recebido</label>
                                    <input
                                        ref={cashInputRef}
                                        type="number"
                                        step="0.01"
                                        min={total.toFixed(2)}
                                        className="w-full p-3 text-xl font-mono text-center rounded border border-accent/30 focus:outline-none focus:ring-2 focus:ring-accent text-slate-800 placeholder:text-slate-500"
                                        value={cashReceived}
                                        onChange={e => {
                                            setCashReceived(e.target.value);
                                            setCashError('');
                                        }}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') confirmCashPayment();
                                            if (e.key === 'Escape') closeCashChangeModal();
                                        }}
                                        autoFocus
                                    />
                                    <div className="w-full text-center mt-2 text-lg font-bold text-emerald-400">
                                        Troco: R$ {(changeCents > 0 ? (changeCents / 100).toFixed(2) : '0,00')}
                                    </div>
                                    {cashError && <div className="text-red-400 text-xs mt-2">{cashError}</div>}
                                    <div className="flex gap-4 mt-6">
                                        <Button
                                            className="px-6 py-2 font-bold"
                                            disabled={cashReceivedCents < totalCents}
                                            onClick={confirmCashPayment}
                                        >Confirmar</Button>
                                        <Button
                                            className="px-6 py-2"
                                            variant="secondary"
                                            onClick={closeCashChangeModal}
                                        >Cancelar</Button>
                                    </div>
                                </div>
                            </div>
                        )}
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex gap-4 items-end">
                                <Input
                                    ref={inputRef}
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    value={paymentAmount}
                                    onChange={e => setPaymentAmount(e.target.value)}
                                    placeholder="Valor"
                                    className="text-center text-xl font-mono text-accent"
                                    onFocus={() => setFocusStep('input')}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') setFocusStep('select');
                                        // Permitir ESC sair do multipagamento mesmo com input focado
                                        if (e.key === 'Tab') {
                                            e.preventDefault();
                                            setMultiMode(false);
                                            setFocusStep('input');
                                            setTimeout(() => {
                                                inputRef.current?.focus();
                                                inputRef.current?.select();
                                            }, 10);
                                        }
                                    }}
                                />
                                <select
                                    ref={selectRef}
                                    value={paymentMethod}
                                    onChange={e => setPaymentMethod(e.target.value)}
                                    className="p-3 rounded-xl border border-white/10 bg-dark-950/50 text-xs font-bold text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/40 custom-select"
                                    onFocus={() => setFocusStep('select')}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') setFocusStep('add');
                                    }}
                                    style={{
                                        minWidth: '140px',
                                        appearance: 'none',
                                        WebkitAppearance: 'none',
                                        MozAppearance: 'none',
                                        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'16\' height=\'16\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M4 6l4 4 4-4\' stroke=\'%23a78bfa\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 0.75rem center',
                                        backgroundSize: '1.25em',
                                        color: '#a5b4fc',
                                    }}
                                >
                                    <option value="cash" className="bg-dark-950 text-emerald-400">Dinheiro</option>
                                    <option value="card" className="bg-dark-950 text-purple-400">Cartão</option>
                                    <option value="pix" className="bg-dark-950 text-blue-400">Pix</option>
                                </select>
                                <style>{`
                                    select.custom-select option {
                                        background: #181926;
                                        color: #a5b4fc;
                                    }
                                    select.custom-select:focus {
                                        outline: none;
                                        box-shadow: 0 0 0 2px #a78bfa44;
                                    }
                                `}</style>
                                <Button
                                    ref={addBtnRef}
                                    className="py-3 px-6"
                                    disabled={parseFloat(paymentAmount) <= 0 || (parseFloat(paymentAmount) * 100) > remaining}
                                    onClick={() => {
                                        setPartialPayments(prev => [...prev, { method: paymentMethod, amount: Math.round(parseFloat(paymentAmount) * 100) }]);
                                        setPaymentAmount('');
                                        setTimeout(() => {
                                            if ((remaining - Math.round(parseFloat(paymentAmount) * 100)) > 0) {
                                                setFocusStep('input');
                                            } else {
                                                setFocusStep('finalize');
                                            }
                                        }, 0);
                                    }}
                                    onFocus={() => setFocusStep('add')}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            if (addBtnRef.current) addBtnRef.current.click();
                                        }
                                    }}
                                >Adicionar</Button>
                            </div>
                            {partialPayments.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-xs font-bold text-slate-400 mb-2">Pagamentos adicionados:</h4>
                                    <ul className="space-y-1">
                                        {partialPayments.map((p, idx) => (
                                            <li key={idx} className="flex justify-between text-xs text-slate-300">
                                                <span>{p.method === 'cash' ? 'Dinheiro' : p.method === 'card' ? 'Cartão' : 'Pix'}</span>
                                                <span>R$ {(p.amount / 100).toFixed(2)}</span>
                                                <button className="ml-2 text-red-400" onClick={() => setPartialPayments(prev => prev.filter((_, i) => i !== idx))}>Remover</button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <Button
                                ref={finalizeBtnRef}
                                className="w-full py-4 mt-6 font-bold text-xs uppercase tracking-widest shadow-accent-glow"
                                disabled={isSubmitting || partialPayments.reduce((acc, p) => acc + p.amount, 0) !== Math.round(total * 100)}
                                onClick={() => {
                                    if (isSubmitting) return;
                                    setIsSubmitting(true);
                                    Promise.resolve(onFinalize(partialPayments)).finally(() => {
                                        setIsSubmitting(false);
                                    });
                                }}
                                onFocus={() => setFocusStep('finalize')}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        if (finalizeBtnRef.current && !isSubmitting) finalizeBtnRef.current.click();
                                    }
                                }}
                            >{isSubmitting ? 'Processando...' : 'Finalizar Venda'}</Button>
                            <div className="text-center mt-4">
                                <span className="text-xs text-slate-400">TAB para voltar ao modo rápido</span>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-6 border-t border-white/10 bg-dark-950/80 rounded-b-2xl text-center">
                    {selectedClient ? (
                        <div className="flex flex-col items-center justify-center gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Cliente Vinculado</span>
                            <span className="text-xs font-mono text-slate-300">{selectedClient.name}</span>
                            {selectedClient.cpf && <span className="text-xs font-mono text-slate-400">CPF: {selectedClient.cpf}</span>}
                        </div>
                    ) : (
                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.3em]">Protocolo de Segurança Ativo // ESC para cancelar</p>
                    )}
                </div>
                <div className="border-animation absolute bottom-0 left-0 w-full"></div>
            </div>
        </div>
    );
};

export default PaymentModal;
