// Mock de dados para CashPerformanceTrends
// Estrutura igual à resposta da API /api/cash/sessions-movements

const mockPerformanceData = {
  sessions: [
    // Sessões para todos os meses de 2026, 2 sessões por mês em dias diferentes
    ...Array.from({ length: 12 }, (_, i) => [
      {
        id: i * 2 + 1,
        opened_at: `2026-${String(i + 1).padStart(2, '0')}-05T08:00:00Z`,
        closed_at: `2026-${String(i + 1).padStart(2, '0')}-05T18:00:00Z`,
        operator_id: i % 2 === 0 ? 'user1' : 'user2',
        initial_balance: 10000 + i * 1000,
        sales_total: 30000 + i * 2000,
        sangrias_total: 5000 + i * 500,
      },
      {
        id: i * 2 + 2,
        opened_at: `2026-${String(i + 1).padStart(2, '0')}-18T08:00:00Z`,
        closed_at: `2026-${String(i + 1).padStart(2, '0')}-18T18:00:00Z`,
        operator_id: i % 2 === 1 ? 'user1' : 'user2',
        initial_balance: 12000 + i * 900,
        sales_total: 35000 + i * 1800,
        sangrias_total: 6000 + i * 400,
      }
    ]).flat(),
    // Sessões originais
    {
      id: 25,
      opened_at: '2025-12-28T08:00:00Z',
      closed_at: '2025-12-28T18:00:00Z',
      operator_id: 'user1',
      initial_balance: 10000,
      sales_total: 35000,
      sangrias_total: 5000,
    },
    {
      id: 26,
      opened_at: '2025-12-29T08:00:00Z',
      closed_at: '2025-12-29T18:00:00Z',
      operator_id: 'user2',
      initial_balance: 12000,
      sales_total: 42000,
      sangrias_total: 7000,
    },
  ],
  sales: [
    // Vendas para todos os meses de 2026, 3 vendas por mês em dias diferentes
    ...Array.from({ length: 12 }, (_, i) => [
      {
        id: 200 + i * 3 + 1,
        timestamp: `2026-${String(i + 1).padStart(2, '0')}-05T09:15:00Z`,
        total: 1200 + i * 100,
        payments: [ { method: 'cash', amount: 1200 + i * 100 } ],
        items: [ { id: 1, name: 'Cerveja', line_total: 1200 + i * 100, quantity: 2 + i % 3 } ]
      },
      {
        id: 200 + i * 3 + 2,
        timestamp: `2026-${String(i + 1).padStart(2, '0')}-18T10:30:00Z`,
        total: 2500 + i * 120,
        payments: [ { method: 'card', amount: 2500 + i * 120 } ],
        items: [ { id: 2, name: 'Refrigerante', line_total: 2500 + i * 120, quantity: 5 + (i % 2) } ]
      },
      {
        id: 200 + i * 3 + 3,
        timestamp: `2026-${String(i + 1).padStart(2, '0')}-25T11:00:00Z`,
        total: 3000 + i * 150,
        payments: [ { method: 'pix', amount: 3000 + i * 150 } ],
        items: [ { id: 3, name: 'Água', line_total: 3000 + i * 150, quantity: 4 + (i % 4) } ]
      }
    ]).flat(),
    // Vendas originais
    {
      id: 101,
      timestamp: '2025-12-28T09:15:00Z',
      total: 1200,
      payments: [ { method: 'cash', amount: 1200 } ],
      items: [ { id: 1, name: 'Cerveja', line_total: 1200, quantity: 2 } ]
    },
    {
      id: 102,
      timestamp: '2025-12-28T10:30:00Z',
      total: 2500,
      payments: [ { method: 'card', amount: 2500 } ],
      items: [ { id: 2, name: 'Refrigerante', line_total: 2500, quantity: 5 } ]
    },
    {
      id: 103,
      timestamp: '2025-12-29T11:00:00Z',
      total: 3000,
      payments: [ { method: 'pix', amount: 3000 } ],
      items: [ { id: 1, name: 'Cerveja', line_total: 1800, quantity: 3 }, { id: 3, name: 'Água', line_total: 1200, quantity: 4 } ]
    },
    {
      id: 104,
      timestamp: '2026-01-01T12:00:00Z',
      total: 5000,
      payments: [ { method: 'cash', amount: 2000 }, { method: 'card', amount: 3000 } ],
      items: [ { id: 2, name: 'Refrigerante', line_total: 5000, quantity: 10 } ]
    },
    {
      id: 105,
      timestamp: '2026-01-02T13:30:00Z',
      total: 4000,
      payments: [ { method: 'pix', amount: 4000 } ],
      items: [ { id: 3, name: 'Água', line_total: 4000, quantity: 8 } ]
    },
  ]
};

export default mockPerformanceData;
