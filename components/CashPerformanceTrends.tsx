import React, { useEffect, useState } from 'react';

// Função utilitária para buscar dados do backend (ajuste a rota conforme seu backend)
async function fetchSessionsAndMovements() {
  // Exemplo de endpoint, ajuste conforme sua API real
  const res = await fetch('/api/cash/sessions-movements');
  if (!res.ok) throw new Error('Erro ao buscar dados do backend');
  return res.json();
}

const CashPerformanceTrends: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessionsAndMovements()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold text-accent mb-4">Desempenho ao Longo do Tempo</h2>
      <div className="text-slate-400 text-sm mb-4">
        Visualize o JSON bruto de todas as sessões e movimentações do banco de dados.<br />
        <span className="text-xs text-slate-500">(Apenas para debug e documentação interna)</span>
      </div>

      {loading && <div className="text-slate-500">Carregando dados...</div>}
      {error && <div className="text-red-500">Erro: {error}</div>}

      {data && (
        <pre className="rounded-xl bg-dark-900/80 border border-white/10 p-4 text-xs text-slate-200 overflow-x-auto max-h-[400px] mb-8">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}

      <div className="mt-10 p-6 bg-dark-950/60 border border-white/10 rounded-xl">
        <h3 className="text-lg font-bold text-accent mb-2">Documentação dos Objetos</h3>
        <ul className="text-slate-300 text-sm list-disc pl-6 space-y-2">
          <li><b>Sessão de Caixa</b>: Objeto que representa um turno de caixa. Campos típicos:
            <ul className="pl-4 list-disc">
              <li><b>id</b>: identificador único da sessão</li>
              <li><b>opened_at</b>, <b>closed_at</b>: datas de abertura/fechamento</li>
              <li><b>operator_id</b>: operador responsável</li>
              <li><b>initial_balance</b>: saldo inicial (centavos)</li>
              <li><b>sales_total</b>: total de vendas (centavos)</li>
              <li><b>sangrias_total</b>: total de sangrias (centavos)</li>
              <li><b>movements</b>: array de movimentações vinculadas</li>
            </ul>
          </li>
          <li><b>Movimentação</b>: Evento financeiro vinculado à sessão. Campos típicos:
            <ul className="pl-4 list-disc">
              <li><b>id</b>: identificador único</li>
              <li><b>type</b>: tipo (ex: "suprimento", "sangria", "pagamento", "sale")</li>
              <li><b>amount</b>: valor da movimentação (centavos)</li>
              <li><b>description</b>: descrição textual</li>
              <li><b>timestamp</b>: data/hora do evento</li>
              <li><b>payments</b>: (para vendas) array de métodos de pagamento</li>
              <li><b>items</b>: (para vendas) array de produtos vendidos</li>
            </ul>
          </li>
          <li><b>Pagamento</b>: Objeto dentro de uma venda:
            <ul className="pl-4 list-disc">
              <li><b>method</b>: método (ex: "cash", "card", "pix")</li>
              <li><b>amount</b>: valor pago (centavos)</li>
            </ul>
          </li>
          <li><b>Item</b>: Produto vendido em uma venda:
            <ul className="pl-4 list-disc">
              <li><b>id</b>: identificador do produto</li>
              <li><b>name</b>: nome do produto</li>
              <li><b>line_total</b>: valor total da linha (centavos)</li>
              <li><b>quantity</b>: quantidade</li>
            </ul>
          </li>
        </ul>
        <div className="text-xs text-slate-500 mt-4">Consulte o backend para detalhes completos dos campos.</div>
      </div>
    </div>
  );
};

export default CashPerformanceTrends;
