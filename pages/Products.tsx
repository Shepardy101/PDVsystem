   
// @ts-ignore
import React, { useState, useMemo, useRef } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Search, Plus, Filter, Edit2, Grid2X2, List, Info, ChevronRight, Package, DollarSign, Tag, TrendingUp, X, Check, Image as ImageIcon, Archive, Cpu, Zap, ShieldAlert, UploadCloud, FileSpreadsheet, FileText, AlertCircle, RefreshCcw, Layers, Hash, Activity, FolderPlus, Trash2 } from 'lucide-react';
import { Input, Button, Badge, Modal, Switch } from '../components/UI';
import { Product } from '../types';

const Products: React.FC = () => {
   const [searchTerm, setSearchTerm] = useState('');
   const [showImages, setShowImages] = useState(false);
   const [showFilters, setShowFilters] = useState(false);
   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
   // Estado para auto-ativação do produto
   const [autoActive, setAutoActive] = useState(true);
   // Estados de Categoria
   const [categories, setCategories] = useState<Category[]>([]);
   const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
   const [newCategoryName, setNewCategoryName] = useState('');
   // Estados de Importação
   const [isImportModalOpen, setIsImportModalOpen] = useState(false);
   const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
   const [isUploading, setIsUploading] = useState(false);
   const [importResults, setImportResults] = useState<any[]>([]);
   // Estados de Filtro
   const [selectedCategory, setSelectedCategory] = useState<string>('all');
   const [stockStatus, setStockStatus] = useState<'all' | 'low' | 'normal'>('all');
   const fileInputRef = useRef<HTMLInputElement>(null);

   // --- NOVO: Produtos da API ---
   const [products, setProducts] = useState<Product[]>([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   React.useEffect(() => {
      setLoading(true);
      // Buscar categorias do backend
      fetch('/api/categories')
        .then(res => res.json())
        .then(data => {
          setCategories(data.items || []);
        });
      // Buscar produtos
      fetch('/api/products')
         .then(res => {
            if (!res.ok) throw new Error('Erro ao buscar produtos');
            return res.json();
         })
         .then(data => {
            // Mapeia todos os produtos vindos da API para o formato esperado
            const items = (data.items || data.products || []).map((product: any) => ({
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
            setProducts(items);
            setError(null);
         })
         .catch(err => {
            setError('Erro ao carregar produtos da API.');
            setProducts([]);
         })
         .finally(() => setLoading(false));
   }, []);

   const filtered = useMemo(() => {
      return products.filter(p => {
         const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.gtin || '').includes(searchTerm);
         const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
         const matchesStock = stockStatus === 'all' || (stockStatus === 'low' ? p.stock < (p.minStock || 20) : p.stock >= (p.minStock || 20));
         return matchesSearch && matchesCategory && matchesStock;
      });
   }, [products, searchTerm, selectedCategory, stockStatus]);
// Função para deletar produto
   async function handleDeleteProduct(productId: string) {
      if (!window.confirm('Tem certeza que deseja remover este produto?')) return;
      try {
         const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
         if (!res.ok && res.status !== 204) throw new Error('Erro ao remover produto');
         setProducts(prev => prev.filter(p => p.id !== productId));
         setSelectedProduct(null);
      } catch (err) {
         alert('Erro ao remover produto. Tente novamente.');
      }
   }

// --- Adicionar no início do componente Products ---
               // Função para submit do novo produto

               async function handleProductSubmit(e: React.FormEvent<HTMLFormElement>) {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const formData = new FormData(form);
                  const payload: any = {
                     name: formData.get('name'),
                     ean: formData.get('gtin'),
                     internalCode: formData.get('internalCode'),
                     unit: formData.get('unit') || 'unit',
                     status: autoActive ? 'active' : 'inactive',
                     costPrice: Number(formData.get('costPrice')) || 0,
                     salePrice: Number(formData.get('salePrice')) || 0,
                     stockOnHand: Number(formData.get('stockOnHand')) || 0,
                     minStock: Number(formData.get('minStock')) || 0,
                     autoDiscountEnabled: formData.get('autoDiscountEnabled') === 'on' ? true : false,
                     autoDiscountValue: Number(formData.get('autoDiscountValue')) || 0,
                     imageUrl: formData.get('imageUrl') || '',
                     categoryId: formData.get('categoryId') || null,
                     supplierId: formData.get('supplier') || null
                  };
                  try {
                     let res;
                     let product;
                     if (selectedProduct) {
                       // Atualização (PUT)
                       res = await fetch(`/api/products/${selectedProduct.id}`, {
                         method: 'PUT',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify(payload)
                       });
                     } else {
                       // Criação (POST)
                       res = await fetch('/api/products', {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify(payload)
                       });
                     }
                     if (!res.ok) {
                        const errData = await res.json().catch(() => ({}));
                        throw new Error(errData?.error?.message || 'Erro ao salvar produto');
                     }
                     ({ product } = await res.json());
                     // Mapeia campos do backend para o formato do frontend
                     const mappedProduct = {
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
                     };
                     setProducts(prev => {
                       // Se for update, substitui, se for create, adiciona
                       if (selectedProduct) {
                         return prev.map(p => p.id === mappedProduct.id ? mappedProduct : p);
                       } else {
                         return [...prev, mappedProduct];
                       }
                     });
                     setIsCreateModalOpen(false);
                     setSelectedProduct(null);
                  } catch (err) {
                     alert('Erro ao salvar produto. Verifique os campos e tente novamente.');
                  }
               }


  // Simulação de Importação

   // Função para importar CSV ou XLSX
   const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsUploading(true);
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'csv' || ext === 'txt') {
         Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results: any) => processImportRows(results.data),
            error: () => {
               setIsUploading(false);
               alert('Erro ao ler arquivo.');
            }
         });
      } else if (ext === 'xlsx') {
         const reader = new FileReader();
         reader.onload = (evt) => {
            const data = new Uint8Array(evt.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
            processImportRows(json);
         };
         reader.onerror = () => {
            setIsUploading(false);
            alert('Erro ao ler arquivo XLSX.');
         };
         reader.readAsArrayBuffer(file);
      } else {
         setIsUploading(false);
         alert('Formato de arquivo não suportado. Use .csv, .txt ou .xlsx');
      }
   };

   // Função para processar linhas importadas
   function processImportRows(data: any[]) {
      // Esperado: internalCode, gtin, name, costPrice, salePrice, stock, [supplier], [category]
      const rows = data.map((row: any, idx: number) => {
         const errors = [];
         if (!row.internalCode) errors.push('Código interno obrigatório');
         if (!row.gtin) errors.push('EAN obrigatório');
         if (!row.name) errors.push('Descrição obrigatória');
         if (!row.costPrice) errors.push('Preço de custo obrigatório');
         if (!row.salePrice) errors.push('Preço de venda obrigatório');
         if (!row.stock) errors.push('Quantidade obrigatória');
         return {
            id: `import-${idx}`,
            internalCode: row.internalCode,
            gtin: row.gtin,
            name: row.name,
            costPrice: parseFloat(row.costPrice),
            salePrice: parseFloat(row.salePrice),
            stock: parseInt(row.stock),
            supplier: row.supplier || '',
            category: row.category || '',
            status: errors.length ? 'error' : 'valid',
            message: errors.join(', ')
         };
      });
      setImportResults(rows);
      setIsUploading(false);
      setIsImportModalOpen(false);
      setIsPreviewModalOpen(true);
   }

   const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
         // Cria um evento fake para reutilizar handleImportFile
         const fakeEvent = {
            target: { files: e.dataTransfer.files }
         } as unknown as React.ChangeEvent<HTMLInputElement>;
         handleImportFile(fakeEvent);
         e.dataTransfer.clearData();
      }
   };

   const handleCreateCategory = async () => {
      if (!newCategoryName.trim()) return;
      try {
         const res = await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newCategoryName.trim() })
         });
         if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            alert(err?.error?.message || 'Erro ao criar categoria');
            return;
         }
         setNewCategoryName('');
         setIsCategoryModalOpen(false);
         // Atualizar lista de categorias do backend
         const cats = await fetch('/api/categories').then(r => r.json());
         setCategories(cats.items || []);
      } catch (e) {
         alert('Erro ao criar categoria');
      }
   };

  React.useEffect(() => {
     // Reset autoActive when opening/closing modal
     if (isCreateModalOpen && !selectedProduct) setAutoActive(true);
     if (!isCreateModalOpen) setAutoActive(true);
  }, [isCreateModalOpen, selectedProduct]);

  return (
    <div className="p-8 flex flex-col h-full overflow-hidden assemble-view bg-dark-950 bg-cyber-grid">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0 mb-8 relative z-10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
             <Package className="text-accent" /> Gestão de Ativos
          </h1>
          <p className="text-slate-500 text-sm font-medium">Controle granular do inventário e precificação dinâmica.</p>
            </div>

            {/* Botão temporário para deletar todos os produtos */}
            <div className="mt-6 flex justify-end">
               <Button
                  variant="danger"
                  className="py-3 px-6 text-xs font-bold uppercase tracking-widest"
                  onClick={async () => {
                     if (!window.confirm('Tem certeza que deseja excluir TODOS os produtos? Esta ação não pode ser desfeita.')) return;
                     try {
                        const res = await fetch('/api/products', { method: 'DELETE' });
                        if (res.ok) {
                           setProducts([]);
                           alert('Todos os produtos foram excluídos.');
                        } else {
                           alert('Erro ao excluir todos os produtos.');
                        }
                     } catch {
                        alert('Erro ao excluir todos os produtos.');
                     }
                  }}
               >
                  Excluir TODOS os produtos (TESTE)
               </Button>
            </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center bg-dark-900/50 p-1 rounded-xl border border-white/5 mr-2">
              <button 
                onClick={() => setShowImages(false)} 
                className={`p-2 rounded-lg transition-all ${!showImages ? 'bg-accent/20 text-accent' : 'text-slate-500 hover:text-slate-300'}`}
                title="Visualização em Lista"
              >
                <List size={18} />
              </button>
              <button 
                onClick={() => setShowImages(true)} 
                className={`p-2 rounded-lg transition-all ${showImages ? 'bg-accent/20 text-accent' : 'text-slate-500 hover:text-slate-300'}`}
                title="Visualização em Cards"
              >
                <Grid2X2 size={18} />
              </button>
           </div>
           <Button variant="secondary" onClick={() => setShowFilters(!showFilters)} icon={<Filter size={18} />} className={showFilters ? 'border-accent text-accent' : ''}>Filtros</Button>
           <Button variant="secondary" onClick={() => setIsImportModalOpen(true)} icon={<UploadCloud size={18} />}>Importar</Button>
           <Button onClick={() => setIsCreateModalOpen(true)} icon={<Plus size={18} />}>Novo Produto</Button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-8 p-6 bg-dark-900/40 border border-accent/10 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-6 animate-in slide-in-from-top-4 duration-300 relative z-10 items-end">
           <div className="md:col-span-4">
              <Input label="Pesquisa Global" placeholder="Busca por nome ou GTIN..." icon={<Search size={18}/>} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
           </div>
           <div className="md:col-span-3 space-y-2">
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-slate-500 ml-1">Filtro por Categoria</label>
              <div className="flex gap-2">
                <select 
                  value={selectedCategory} 
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="flex-1 bg-dark-950/50 border border-white/10 rounded-xl p-3 text-sm text-slate-200 focus:border-accent outline-none transition-all"
                >
                  <option value="all">Todas Categorias</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button 
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="p-3 bg-accent/10 border border-accent/30 rounded-xl text-accent hover:bg-accent/20 hover:border-accent transition-all group"
                  title="Nova Categoria"
                >
                  <FolderPlus size={18} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>
           </div>
           <div className="md:col-span-3">
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-slate-500 ml-1 mb-2">Estado do Estoque</label>
              <select 
                value={stockStatus} 
                onChange={e => setStockStatus(e.target.value as any)}
                className="w-full bg-dark-950/50 border border-white/10 rounded-xl p-3 text-sm text-slate-200 focus:border-accent outline-none h-[46px]"
              >
                <option value="all">Todo Estoque</option>
                <option value="low">Estoque Crítico</option>
                <option value="normal">Estoque Normal</option>
              </select>
           </div>
           <div className="md:col-span-2">
              <Button variant="ghost" className="w-full py-3 h-[46px] text-[10px] tracking-[0.2em]" onClick={() => {setSearchTerm(''); setSelectedCategory('all'); setStockStatus('all');}}>Limpar Filtros</Button>
           </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0 relative z-10">
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {!showImages ? (
            /* LIST VIEW */
            <div className="bg-dark-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl animate-in fade-in duration-500">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/2 border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                      <th className="px-8 py-5">Identificação</th>
                      <th className="px-8 py-5">Preço Venda</th>
                      <th className="px-8 py-5">Estoque</th>
                      <th className="px-8 py-5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filtered.map(product => (
                      <tr 
                        key={product.id} 
                        className="group hover:bg-white/5 transition-all cursor-pointer"
                        onClick={() => setSelectedProduct(product)}
                      >
                        <td className="px-8 py-5 flex items-center gap-4">
                          <div className="w-8 h-8 rounded bg-dark-800 border border-white/5 flex items-center justify-center overflow-hidden">
                              <img src={product.imageUrl} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div>
                              <div className="text-sm font-bold text-slate-200 group-hover:text-accent transition-colors">{product.name}</div>
                              <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{product.gtin}</div>
                          </div>
                        </td>
                        <td className="px-8 py-5 font-mono text-sm font-bold text-accent">R$ {product.salePrice.toFixed(2)}</td>
                        <td className="px-8 py-5 text-xs text-slate-300 font-bold">
                           <span className={product.stock < (product.minStock || 20) ? 'text-red-400' : 'text-slate-300'}>
                             {product.stock} {product.unit}
                           </span>
                        </td>
                                    <td className="px-8 py-5 text-right flex gap-2 justify-end">
                                       <button className="p-2 text-slate-500 hover:text-accent transition-colors" onClick={e => { e.stopPropagation(); setSelectedProduct(product); }} title="Editar"><Edit2 size={14}/></button>
                                       <button className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-colors" onClick={e => { e.stopPropagation(); handleDeleteProduct(product.id); }} title="Remover"><Trash2 size={14}/></button>
                                    </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          ) : (
            /* CARD GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {filtered.map(product => (
                 <div 
                   key={product.id} 
                   onClick={() => setSelectedProduct(product)}
                   className="glass-card group relative p-5 rounded-3xl border border-white/5 hover:border-accent/40 hover:bg-accent/5 transition-all cursor-pointer overflow-hidden flex flex-col gap-4 shadow-xl"
                 >
                    <div className="absolute top-3 right-3 z-10">
                       <Badge variant={product.stock < (product.minStock || 20) ? 'danger' : 'info'}>
                          {product.stock < (product.minStock || 20) ? 'Crítico' : 'Estoque'}
                       </Badge>
                    </div>
                    
                    <div className="relative h-40 w-full rounded-2xl bg-dark-950 border border-white/5 overflow-hidden flex items-center justify-center">
                       <img src={product.imageUrl} className="w-full h-full object-cover opacity-40 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700" />
                       <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent opacity-60" />
                    </div>

                    <div className="space-y-1">
                       <h4 className="text-sm font-bold text-slate-200 group-hover:text-accent transition-colors line-clamp-1 uppercase tracking-tight">{product.name}</h4>
                       <p className="text-[9px] font-mono text-slate-500 tracking-widest uppercase">{product.gtin}</p>
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
                       <div>
                          <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Preço Sugerido</p>
                          <p className="text-lg font-mono font-bold text-accent">R$ {product.salePrice.toFixed(2)}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Saldo Atual</p>
                          <p className={`text-sm font-bold ${product.stock < (product.minStock || 20) ? 'text-red-400' : 'text-slate-300'}`}>
                             {product.stock} <span className="text-[10px] uppercase">{product.unit}</span>
                          </p>
                       </div>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 h-0.5 bg-accent/40 w-0 group-hover:w-full transition-all duration-500" />
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL CRIAR CATEGORIA */}
      <Modal 
        isOpen={isCategoryModalOpen} 
        onClose={() => setIsCategoryModalOpen(false)} 
        title="Nova Categoria de Ativos"
        size="md"
      >
        <div className="space-y-8 animate-in zoom-in-95 duration-200">
           <div className="p-6 bg-accent/5 rounded-2xl border border-accent/20 flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-xl text-accent">
                 <FolderPlus size={24} />
              </div>
              <div>
                 <h4 className="text-xs font-bold text-white uppercase tracking-widest">Estrutura de Catálogo</h4>
                 <p className="text-[10px] text-slate-500">Defina uma nova classificação lógica para seus produtos.</p>
              </div>
           </div>

           <div className="space-y-4">
              <Input 
                label="Nome da Categoria" 
                placeholder="Ex: Destilados Premium" 
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                icon={<Tag size={18} className="text-accent" />}
                className="bg-dark-950/50 border-accent/10 text-lg font-bold text-slate-100"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
              />
           </div>

           <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <Button variant="secondary" className="py-4 uppercase text-[10px] font-bold tracking-widest" onClick={() => setIsCategoryModalOpen(false)}>Cancelar</Button>
              <Button className="py-4 uppercase text-[10px] font-bold tracking-widest shadow-accent-glow" icon={<Check size={18}/>} onClick={handleCreateCategory} disabled={!newCategoryName.trim()}>Salvar Categoria</Button>
           </div>
        </div>
      </Modal>

      {/* MODAL DETALHADO: NOVO/EDITAR PRODUTO (CYBER-INJECTION) */}
      {(isCreateModalOpen || !!selectedProduct) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-xl" onClick={() => { setIsCreateModalOpen(false); setSelectedProduct(null); }} />
           <div className="relative w-full max-w-2xl cyber-modal-container bg-dark-900/95 rounded-2xl border border-accent/30 shadow-2xl flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between relative z-10 bg-dark-950/80 rounded-t-2xl">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-accent/10 border border-accent/30 flex items-center justify-center">
                       <Cpu className="text-accent animate-pulse" size={20} />
                    </div>
                    <div>
                       <h2 className="text-lg font-bold text-white uppercase tracking-[0.2em] assemble-text">
                         {selectedProduct ? 'Sincronizar Ativo' : 'Injetar Novo Ativo'} <span className="text-accent">PDV-SYS</span>
                       </h2>
                       <p className="text-[9px] font-mono text-slate-500 uppercase flex items-center gap-2">
                          <Zap size={10} className="text-accent" /> Kernel Version 3.1.0-A // {selectedProduct?.id || 'NEW_SEQ'}
                       </p>
                    </div>
                 </div>
                 <button onClick={() => { setIsCreateModalOpen(false); setSelectedProduct(null); }} className="text-slate-500 hover:text-accent transition-colors p-2">
                    <X size={20} />
                 </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 overflow-y-auto custom-scrollbar space-y-8 relative z-10">
                 <form id="product-form" onSubmit={handleProductSubmit}>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-3 space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-accent/70 assemble-text" style={{animationDelay: '0.1s'}}>Nomenclatura do Produto</label>
                         <Input name="name" defaultValue={selectedProduct?.name} placeholder="Ex: Cerveja Black IPA 473ml" className="bg-dark-950/50 border-accent/20 focus:border-accent" required />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 assemble-text" style={{animationDelay: '0.2s'}}>Código GTIN / EAN</label>
                         <Input name="gtin" defaultValue={selectedProduct?.gtin} placeholder="789000000000" icon={<ShieldAlert size={14} className="text-accent/40" />} className="bg-dark-950/50" required />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 assemble-text" style={{animationDelay: '0.25s'}}>Código Interno</label>
                         <Input name="internalCode" defaultValue={selectedProduct?.internalCode} placeholder="ABC-123" icon={<Hash size={14} className="text-accent/40" />} className="bg-dark-950/50" required />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 assemble-text" style={{animationDelay: '0.3s'}}>Categoria Logic</label>
                         <select name="categoryId" defaultValue={selectedProduct?.category} className="w-full bg-dark-950/50 border border-white/10 rounded-xl p-3 text-sm text-slate-200 focus:border-accent outline-none transition-all h-[46px]">
                            <option value="">Selecione...</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 assemble-text">Unidade</label>
                         <select name="unit" defaultValue={selectedProduct?.unit || 'unit'} className="w-full bg-dark-950/50 border border-white/10 rounded-xl p-3 text-sm text-slate-200 focus:border-accent outline-none transition-all h-[46px]">
                            <option value="unit">UN</option>
                            <option value="kg">KG</option>
                            <option value="cx">CX</option>
                         </select>
                      </div>
                   </div>

                   {/* CAMPOS DE PREÇO, DESCONTO, ESTOQUE E MÍNIMO */}
                   <div className="p-6 bg-accent/5 rounded-2xl border border-accent/10 space-y-6 mt-6">
                      <div className="flex items-center gap-2 border-b border-accent/10 pb-3">
                         <DollarSign size={14} className="text-accent" />
                         <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent assemble-text" style={{animationDelay: '0.4s'}}>Algoritmo de Precificação</h4>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                         <div className="space-y-1">
                            <label className="text-[8px] font-bold text-slate-500 uppercase">Custo Médio</label>
                            <Input name="costPrice" defaultValue={selectedProduct?.costPrice} placeholder="0.00" type="number" className="bg-dark-950/80 border-white/5" step="0.01" min="0" />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[8px] font-bold text-slate-500 uppercase">Venda Público</label>
                            <Input name="salePrice" defaultValue={selectedProduct?.salePrice} placeholder="0.00" type="number" className="bg-dark-950/80 border-accent/10" step="0.01" min="0" />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[8px] font-bold text-slate-500 uppercase">Auto-Discount</label>
                            <Input name="autoDiscountValue" defaultValue={selectedProduct?.autoDiscount} placeholder="0.00" type="number" className="bg-dark-950/80 border-emerald-500/10" step="0.01" min="0" />
                            <input type="hidden" name="autoDiscountEnabled" value="on" />
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                      <div className="p-4 bg-white/2 rounded-xl border border-white/5 space-y-4">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 assemble-text" style={{animationDelay: '0.5s'}}>Inventário Atual</label>
                         <div className="flex items-center gap-4">
                            <Input name="stockOnHand" defaultValue={selectedProduct?.stock} placeholder="0" type="number" className="flex-1" min="0" />
                            <Badge variant="info">{selectedProduct?.unit || 'UN'}</Badge>
                         </div>
                      </div>
                      <div className="p-4 bg-white/2 rounded-xl border border-white/5 space-y-4">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 assemble-text" style={{animationDelay: '0.55s'}}>Estoque Mínimo</label>
                         <div className="flex items-center gap-4">
                            <Input name="minStock" defaultValue={selectedProduct?.minStock || 20} placeholder="20" type="number" icon={<Activity size={14} className="text-red-400/60" />} className="flex-1" min="0" />
                         </div>
                      </div>
                      <div className="p-4 bg-white/2 rounded-xl border border-white/5 flex items-center justify-between">
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Auto-Ativação</label>
                            <p className="text-[8px] text-slate-600 uppercase">Status no PDV: {selectedProduct?.status || (autoActive ? 'active' : 'inactive')}</p>
                         </div>
                         <input type="checkbox" name="status" checked={autoActive} onChange={e => setAutoActive(e.target.checked)} style={{display:'none'}} readOnly />
                         <Switch enabled={autoActive} onChange={setAutoActive} />
                      </div>
                   </div>

                   <div className="space-y-4 pb-4 mt-6">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 assemble-text" style={{animationDelay: '0.6s'}}>Caminho da Mídia Visual</label>
                      <div className="flex gap-4">
                         <div className="flex-1">
                            <Input name="imageUrl" defaultValue={selectedProduct?.imageUrl} placeholder="https://cdn.image-server.com/..." icon={<ImageIcon size={14} />} />
                         </div>
                         <div className="w-14 h-14 rounded-lg bg-dark-950 border border-white/10 flex items-center justify-center overflow-hidden">
                            {selectedProduct?.imageUrl ? <img src={selectedProduct.imageUrl} className="w-full h-full object-cover opacity-50"/> : <ImageIcon size={20} className="opacity-40" />}
                         </div>
                      </div>
                   </div>
                 </form>


              

                 
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-white/10 bg-dark-950/80 flex gap-4 relative z-10 rounded-b-2xl">
                         <Button variant="secondary" className="flex-1 py-4 text-xs font-bold uppercase tracking-widest" onClick={() => { setIsCreateModalOpen(false); setSelectedProduct(null); }}>
                            Abortar Sincronia
                         </Button>
                         <Button
                            form="product-form"
                            type="submit"
                            className="flex-1 py-4 text-xs font-bold uppercase tracking-widest shadow-accent-glow"
                            icon={<Check size={18} />}
                         >
                            Confirmar {selectedProduct ? 'Atualização' : 'Injeção'}
                         </Button>
            
              </div>
              <div className="border-animation absolute bottom-0 left-0 w-full z-20"></div>
           </div>
        </div>
      )}

      {/* MODAL IMPORTAÇÃO (DRAG & DROP) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-dark-950/90 backdrop-blur-xl" onClick={() => !isUploading && setIsImportModalOpen(false)} />
           <div className="relative w-full max-w-xl cyber-modal-container bg-dark-900/95 rounded-2xl border border-accent/30 shadow-2xl flex flex-col overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-dark-950/50">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-accent/10 border border-accent/30 flex items-center justify-center">
                       <UploadCloud className="text-accent" size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-white uppercase tracking-[0.2em] assemble-text">Importar Dados</h2>
                 </div>
                 {!isUploading && (
                    <button onClick={() => setIsImportModalOpen(false)} className="text-slate-500 hover:text-accent p-2"><X size={20} /></button>
                 )}
              </div>
              <div className="p-10 flex flex-col items-center justify-center text-center space-y-8">
                 {isUploading ? (
                    <div className="flex flex-col items-center space-y-6 py-12">
                       <div className="relative w-16 h-16">
                          <div className="absolute inset-0 border-4 border-accent/20 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                       </div>
                       <p className="text-accent font-mono text-xs font-bold tracking-[0.2em] uppercase">Processando Arquivo...</p>
                    </div>
                 ) : (
                              <div
                                 onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                                 onDrop={handleDrop}
                                 className="w-full p-12 border-2 border-dashed border-white/5 rounded-3xl cyber-upload-zone bg-dark-950/30 group hover:border-accent/40 transition-all cursor-pointer flex flex-col items-center gap-4"
                                 onClick={() => fileInputRef.current?.click()}
                              >
                       <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.txt,.xlsx" onChange={handleImportFile} />
                       <FileSpreadsheet className="text-accent opacity-50 group-hover:opacity-100 transition-all" size={48} />
                       <div>
                          <p className="text-sm font-bold text-slate-300">Solte o arquivo aqui ou clique</p>
                          <p className="text-[10px] text-slate-500 uppercase mt-2">Suporta .TXT, .CSV, .XLSX</p>
                       </div>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* MODAL PREVIEW DE IMPORTAÇÃO */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-dark-950/90 backdrop-blur-xl" onClick={() => setIsPreviewModalOpen(false)} />
           <div className="relative w-full max-w-4xl cyber-modal-container bg-dark-900/95 rounded-2xl border border-accent/30 shadow-2xl flex flex-col max-h-[85vh]">
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-dark-950/80">
                 <div className="flex items-center gap-4">
                    <FileSpreadsheet className="text-emerald-500" size={24} />
                    <h2 className="text-lg font-bold text-white uppercase tracking-[0.2em]">Preview de Importação</h2>
                 </div>
                 <button onClick={() => setIsPreviewModalOpen(false)} className="text-slate-500 hover:text-accent p-2"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-dark-950 z-10 border-b border-white/10 text-[10px] uppercase font-bold text-slate-500">
                        <tr>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Produto</th>
                            <th className="px-6 py-4">GTIN</th>
                            <th className="px-6 py-4 text-right">Preço</th>
                            <th className="px-6 py-4 text-right">Estoque</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {importResults.map((item, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-all text-xs">
                                <td className="px-6 py-4">{item.status === 'valid' ? <div className="w-2 h-2 rounded-full bg-emerald-500" /> : <AlertCircle size={14} className="text-amber-500" />}</td>
                                <td className="px-6 py-4 text-slate-200 font-bold">{item.name}</td>
                                <td className="px-6 py-4 text-slate-500 font-mono">{item.gtin}</td>
                                <td className="px-6 py-4 text-right font-mono text-accent">R$ {item.salePrice.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right text-slate-400">{item.stock} UN</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>
              <div className="p-6 border-t border-white/10 bg-dark-950/80 flex justify-end gap-4">
                 <Button variant="secondary" onClick={() => setIsPreviewModalOpen(false)}>Cancelar</Button>
                         <Button icon={<Check size={18}/>} onClick={async () => {
                            // Filtra apenas produtos válidos
                            const validProducts = importResults.filter((item: any) => item.status === 'valid');
                            if (validProducts.length === 0) {
                               alert('Nenhum produto válido para importar.');
                               return;
                            }
                            let importedCount = 0;
                            for (const item of validProducts) {
                               let categoryId = null;
                               let supplierId = null;
                               // Se categoria informada, tenta buscar ou criar
                               if (item.category && item.category !== 'sem categoria') {
                                  try {
                                     // Busca categoria existente
                                     let cat = categories.find(c => c.name.toLowerCase() === item.category.toLowerCase());
                                     if (!cat) {
                                        // Cria categoria se não existir
                                        const res = await fetch('/api/categories', {
                                           method: 'POST',
                                           headers: { 'Content-Type': 'application/json' },
                                           body: JSON.stringify({ name: item.category })
                                        });
                                        if (res.ok) {
                                           const data = await res.json();
                                           categoryId = data.category?.id;
                                           // Atualiza lista local
                                           setCategories(prev => [...prev, data.category]);
                                        }
                                     } else {
                                        categoryId = cat.id;
                                     }
                                  } catch {}
                               }
                               // Se fornecedor informado, tenta buscar ou criar
                               if (item.supplier && item.supplier !== 'sem fornecedor') {
                                  try {
                                     // Busca fornecedor existente
                                     // Supondo que não há endpoint de busca, sempre cria (ajuste se necessário)
                                     const res = await fetch('/api/suppliers', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ name: item.supplier })
                                     });
                                     if (res.ok) {
                                        const data = await res.json();
                                        supplierId = data.supplier?.id;
                                     }
                                  } catch {}
                               }
                               const payload = {
                                  name: item.name,
                                  ean: item.gtin,
                                  internalCode: item.internalCode,
                                  unit: 'unit',
                                  status: 'active',
                                  costPrice: item.costPrice,
                                  salePrice: item.salePrice,
                                  stockOnHand: item.stock,
                                  minStock: 0,
                                  autoDiscountEnabled: false,
                                  autoDiscountValue: 0,
                                  imageUrl: '',
                                  categoryId,
                                  supplierId,
                               };
                               try {
                                  const res = await fetch('/api/products', {
                                     method: 'POST',
                                     headers: { 'Content-Type': 'application/json' },
                                     body: JSON.stringify(payload)
                                  });
                                  if (res.ok) importedCount++;
                               } catch {}
                            }
                            alert(importedCount + ' produtos importados com sucesso!');
                            setIsPreviewModalOpen(false);
                            // Atualiza lista de produtos
                            setLoading(true);
                            fetch('/api/products')
                               .then(res => res.json())
                               .then(data => {
                                  const items = (data.items || data.products || []).map((product: any) => ({
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
                                  setProducts(items);
                                  setError(null);
                               })
                               .catch(() => {
                                  setError('Erro ao carregar produtos da API.');
                                  setProducts([]);
                               })
                               .finally(() => setLoading(false));
                         }}>Confirmar Importação</Button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Products;
