import { CashSession } from "@/types";

/**
                            * Calcula o valor total em caixa (lastro) baseado na sessão atual
                            * @param session - Sessão de caixa ativa
                            * @returns Valor em caixa em reais (número formatado com 2 casas decimais)
                            */
export function calculateCashBalance(session: CashSession | null): string {
   if (!session || !Array.isArray(session.transactions)) return '0.00';

   // Saldo inicial do caixa
   let initialBalanceCents = session.initial_balance ?? 0;
   if (initialBalanceCents < 100 && initialBalanceCents % 1 !== 0) {
      initialBalanceCents = Math.round(initialBalanceCents * 100);
   }

   // Somar todas as vendas cujo método de pagamento seja 'cash'
   let totalVendasCash = 0;
   let totalSuprimentos = 0;
   let totalSangrias = 0;

   session.transactions.forEach((tx) => {
      if ('type' in tx && tx.type === 'suprimento' && 'amount' in tx && typeof tx.amount === 'number') {
         totalSuprimentos += tx.amount;
      }
      if ('type' in tx && tx.type === 'sangria' && 'amount' in tx && typeof tx.amount === 'number') {
         totalSangrias += tx.amount;
      }
      if ('payments' in tx && Array.isArray(tx.payments)) {
         tx.payments.forEach((pay) => {
            if (pay.method === 'cash' && typeof pay.amount === 'number') {
               totalVendasCash += pay.amount;
            }
         });
      }
   });

   const lastro = initialBalanceCents + totalVendasCash + totalSuprimentos - totalSangrias;
   return (lastro / 100).toFixed(2);
}

/**
 * Calcula o valor total em caixa e retorna em centavos
 * @param session - Sessão de caixa ativa
 * @returns Valor em caixa em centavos
 */
export function calculateCashBalanceCents(session: CashSession | null): number {
   if (!session || !Array.isArray(session.transactions)) return 0;

   let initialBalanceCents = session.initial_balance ?? 0;
   if (initialBalanceCents < 100 && initialBalanceCents % 1 !== 0) {
      initialBalanceCents = Math.round(initialBalanceCents * 100);
   }

   let totalVendasCash = 0;
   let totalSuprimentos = 0;
   let totalSangrias = 0;

   session.transactions.forEach((tx) => {
      if ('type' in tx && tx.type === 'suprimento' && 'amount' in tx && typeof tx.amount === 'number') {
         totalSuprimentos += tx.amount;
      }
      if ('type' in tx && tx.type === 'sangria' && 'amount' in tx && typeof tx.amount === 'number') {
         totalSangrias += tx.amount;
      }
      if ('payments' in tx && Array.isArray(tx.payments)) {
         tx.payments.forEach((pay) => {
            if (pay.method === 'cash' && typeof pay.amount === 'number') {
               totalVendasCash += pay.amount;
            }
         });
      }
   });

   return initialBalanceCents + totalVendasCash + totalSuprimentos - totalSangrias;
}

/**
 * Calcula o total de vendas da sessão em centavos
 */
export function calculateSessionSalesTotalCents(session: CashSession | null): number {
   if (!session || !Array.isArray(session.transactions)) return 0;

   return session.transactions.reduce((acc, tx) => {
      if ('status' in tx && Array.isArray((tx as any).items)) {
         const sale = tx as any;
         if (typeof sale.total === 'number') {
            return acc + sale.total;
         }
         const itemsTotal = sale.items.reduce((sum: number, item: any) => {
            if (typeof item.line_total === 'number') return sum + item.line_total;
            if (typeof item.lineTotal === 'number') return sum + item.lineTotal;
            return sum;
         }, 0);
         return acc + itemsTotal;
      }
      return acc;
   }, 0);
}