// Função para buscar vendas e movimentações de caixa de uma sessão
import { SaleTransaction, MovementTransaction } from '../types';

export async function fetchSessionTransactions(cashSessionId: string): Promise<{ sales: SaleTransaction[]; movements: MovementTransaction[] }> {
   // Buscar vendas
   const salesRes = await fetch(`/api/pos/sales?cashSessionId=${cashSessionId}`);
   if (!salesRes.ok) throw new Error('Erro ao buscar vendas do caixa');
   const salesData = await salesRes.json();
   // Buscar movimentações da sessão específica
   const movementsRes = await fetch(`/api/cash/movements/${cashSessionId}`);
   if (!movementsRes.ok) throw new Error('Erro ao buscar movimentações do caixa');
   const movementsData = await movementsRes.json();
   return {
      sales: salesData.sales || [],
      movements: movementsData.movements || []
   };
}
