import React, { useMemo } from 'react';
import SalesBreakdownChart from './SalesBreakdownChart';

interface CashSalesBreakdownProps {
  sales: any[];
  movements: any[];
}

const paymentLabels: Record<string, string> = {
  cash: 'Dinheiro',
  card: 'Cartão',
  credit: 'Cartão',
  debit: 'Cartão',
  pix: 'Pix',
};

const paymentColors: Record<string, string> = {
  cash: 'bg-green-500 text-green-100',
  card: 'bg-blue-500 text-blue-100',
  credit: 'bg-blue-500 text-blue-100',
  debit: 'bg-blue-500 text-blue-100',
  pix: 'bg-amber-500 text-amber-100',
};

const CashSalesBreakdown: React.FC<CashSalesBreakdownProps> = ({ sales, movements }) => {
  // Agrupar totais por método de pagamento (em centavos)
  const paymentTotals = useMemo(() => {
    let cashCents = 0;
    let cardCents = 0;
    let pixCents = 0;
    sales.forEach(sale => {
      if (Array.isArray(sale.payments)) {
        sale.payments.forEach((pay: any) => {
          if (pay.method === 'cash') cashCents += pay.amount || 0;
          else if (pay.method === 'card' || pay.method === 'credit' || pay.method === 'debit') cardCents += pay.amount || 0;
          else if (pay.method === 'pix') pixCents += pay.amount || 0;
        });
      }
    });
    return { cashCents, cardCents, pixCents };
  }, [sales]);

    // Gerar dados para o gráfico de vendas por minuto
    const salesByMinute = useMemo(() => {
      const byMinute: Record<string, number> = {};
      sales.forEach(sale => {
        const date = new Date(sale.timestamp || sale.created_at);
        // Formato: HH:mm
        const minute = date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
        if (!byMinute[minute]) byMinute[minute] = 0;
        byMinute[minute] += sale.total || 0;
      });
      // Ordenar por minuto
      return Object.entries(byMinute)
        .sort(([a], [b]) => {
          // Ordenação por hora:minuto
          const [ha, ma] = a.split(':').map(Number);
          const [hb, mb] = b.split(':').map(Number);
          return ha !== hb ? ha - hb : ma - mb;
        })
        .map(([minute, total]) => ({ hour: minute, totalCents: total }));
    }, [sales]);

  return (
    <div className="">
      {/* Os cards agora são renderizados pelo SalesBreakdownChart */}
        <SalesBreakdownChart totals={paymentTotals} data={salesByMinute} />
    </div>
  );
};

export default CashSalesBreakdown;
