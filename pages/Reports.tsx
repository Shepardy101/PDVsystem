// Função utilitária para agrupar todos os produtos vendidos e somar as quantidades
function getAllSoldProducts(sales: any[]): any[] {
  const productMap: Record<string, { product_id: string, product_name: string, quantidade: number }> = {};
  sales.forEach((sale: any) => {
    const items = Array.isArray(sale.items) ? sale.items : (Array.isArray(sale.itens) ? sale.itens : []);
    items.forEach((item: any) => {
      if (!item.product_id) return;
      if (!productMap[item.product_id]) {
        productMap[item.product_id] = {
          product_id: item.product_id,
          product_name: item.product_name || item.product_name_snapshot || item.nome || '-',
          quantidade: 0
        };
      }
      productMap[item.product_id].quantidade += item.quantity || 0;
    });
  });
  return Object.values(productMap);
}


// Componente para exibir todos os produtos do banco de dados em JSON
const AllProductsJsonViewer: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/products?limit=1000')
      .then(res => res.json())
      .then(data => setProducts(data.items || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-xs text-slate-400">Carregando produtos do banco...</div>;
  if (error) return <div className="text-xs text-red-400">Erro: {error}</div>;
  return (
    <div className="bg-dark-900/60 rounded-xl p-4 mb-8 overflow-x-auto border border-white/10">
      <div className="text-xs text-slate-400 font-mono mb-2">Todos Produtos (JSON):</div>
      <pre className="text-xs text-white whitespace-pre-wrap break-all max-h-96 overflow-y-auto">{JSON.stringify(products, null, 2)}</pre>
    </div>
  );
};

// Componente para exibir produtos vendidos em JSON
const ProductsSoldJsonViewer: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/report/sold-products')
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-xs text-slate-400">Carregando produtos vendidos...</div>;
  if (error) return <div className="text-xs text-red-400">Erro: {error}</div>;
  return (
    <div className="bg-dark-900/60 rounded-xl p-4 mb-8 overflow-x-auto border border-white/10">
      <div className="text-xs text-slate-400 font-mono mb-2">Produtos Vendidos (JSON):</div>
      <pre className="text-xs text-white whitespace-pre-wrap break-all max-h-96 overflow-y-auto">{JSON.stringify(products, null, 2)}</pre>
    </div>
  );
};
// Componente para exibir vendas em JSON
const SalesJsonViewer: React.FC = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/cash/sessions-movements')
      .then(res => res.json())
      .then(data => setSales(data.sales || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-xs text-slate-400">Carregando vendas...</div>;
  if (error) return <div className="text-xs text-red-400">Erro: {error}</div>;
  return (
    <div className="bg-dark-900/60 rounded-xl p-4 mb-8 overflow-x-auto border border-white/10">
      <div className="text-xs text-slate-400 font-mono mb-2">Vendas (JSON):</div>
      <pre className="text-xs text-white whitespace-pre-wrap break-all max-h-96 overflow-y-auto">{JSON.stringify(sales, null, 2)}</pre>
    </div>
  );
};

import { Button } from '@/components/UI';
import { Calendar, Download, Filter, Layers } from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';


import ProductMixQuadrantsTab from '@/components/reports/ProductMixQuadrantsTab';
import SoldProductsDetailedTable from '@/components/reports/SoldProductsDetailedTable';
import SoldProductsResumoTable from '@/components/reports/SoldProductsResumoTable';





const Reports: React.FC = () => {
  const [activeReport, setActiveReport] = useState<any | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState('Últimos 30 dias');


  // Estado para alternar entre os componentes
  const [selectedViewer, setSelectedViewer] = useState<'mixQuadrants' | 'soldProductsDetailed' | 'soldProductsResumo'>('mixQuadrants');

  return (
    <div className="p-8 flex flex-col h-full overflow-hidden assemble-view bg-dark-950 bg-cyber-grid relative">

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 shrink-0 mb-8 relative z-10">
        <div>
         <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
           <Layers className="text-accent" /> Inteligência de Dados
         </h1>
         <p className="text-slate-500 text-sm font-medium uppercase tracking-widest text-[10px]">Núcleo de Processamento Estratégico // NovaBev Analytics</p>
        </div>
      <div>
        {/* Indicador discreto de inteligência de dados */}
        <div className="flex items-center gap-2 bg-transparent px-2 py-1">
          <span className="w-2 h-2 rounded-full bg-cyan-400/70" />
          <span className="text-[11px] text-cyan-300 font-mono tracking-tight opacity-70">Analytics ativo</span>
        </div>
      </div>
      </div>




      {/* Botões para alternar entre Mix(Quadrantes) e Produtos Vendidos Detalhado */}
      <div className="flex gap-3 mb-6">
        <Button variant={selectedViewer === 'mixQuadrants' ? 'primary' : 'secondary'} onClick={() => setSelectedViewer('mixQuadrants')}>Mix (Quadrantes)</Button>
        <Button variant={selectedViewer === 'soldProductsDetailed' ? 'primary' : 'secondary'} onClick={() => setSelectedViewer('soldProductsDetailed')}>Produtos Vendidos Detalhado</Button>
        <Button variant={selectedViewer === 'soldProductsResumo' ? 'primary' : 'secondary'} onClick={() => setSelectedViewer('soldProductsResumo')}>Resumo Produtos Vendidos</Button>
      </div>

      {/* Renderização condicional do componente selecionado */}
      <div>
        {selectedViewer === 'mixQuadrants' && <ProductMixQuadrantsTab />}
        {selectedViewer === 'soldProductsDetailed' && <SoldProductsDetailedTable />}
        {selectedViewer === 'soldProductsResumo' && <SoldProductsResumoTable />}
      </div>



    </div>
  );
};

export default Reports;
