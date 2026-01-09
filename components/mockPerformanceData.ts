// Mock de dados para CashPerformanceTrends
// Estrutura igual à resposta da API /api/cash/sessions-movements

const mockPerformanceData = {
  sessions: [
    {
      id: 1,
      opened_at: '2025-12-28T08:00:00Z',
      closed_at: '2025-12-28T18:00:00Z',
      operator_id: 'user1',
      initial_balance: 10000,
      sales_total: 35000,
      sangrias_total: 5000,
    },
    {
      id: 2,
      opened_at: '2025-12-29T08:00:00Z',
      closed_at: '2025-12-29T18:00:00Z',
      operator_id: 'user2',
      initial_balance: 12000,
      sales_total: 42000,
      sangrias_total: 7000,
    },
    {
      id: 3,
      opened_at: '2026-01-01T08:00:00Z',
      closed_at: '2026-01-01T18:00:00Z',
      operator_id: 'user1',
      initial_balance: 15000,
      sales_total: 50000,
      sangrias_total: 8000,
    },
    {
      id: 4,
      opened_at: '2026-01-02T08:00:00Z',
      closed_at: '2026-01-02T18:00:00Z',
      operator_id: 'user2',
      initial_balance: 11000,
      sales_total: 38000,
      sangrias_total: 6000,
    },
    // ...mais sessões para cobrir semanas e meses
  ],
  sales: [
    {
      id: 101,
      timestamp: '2025-12-28T09:15:00Z',
      total: 1200,
      payments: [
        { method: 'cash', amount: 1200 }
      ],
      items: [
        { id: 1, name: 'Cerveja', line_total: 1200, quantity: 2 }
      ]
    },
    {
      id: 102,
      timestamp: '2025-12-28T10:30:00Z',
      total: 2500,
      payments: [
        { method: 'card', amount: 2500 }
      ],
      items: [
        { id: 2, name: 'Refrigerante', line_total: 2500, quantity: 5 }
      ]
    },
    {
      id: 103,
      timestamp: '2025-12-29T11:00:00Z',
      total: 3000,
      payments: [
        { method: 'pix', amount: 3000 }
      ],
      items: [
        { id: 1, name: 'Cerveja', line_total: 1800, quantity: 3 }, { id: 3, name: 'Água', line_total: 1200, quantity: 4 }
      ]
    },
    {
      id: 104,
      timestamp: '2026-01-01T12:00:00Z',
      total: 5000,
      payments: [
        { method: 'cash', amount: 2000 }, { method: 'card', amount: 3000 }
      ],
      items: [
        { id: 2, name: 'Refrigerante', line_total: 5000, quantity: 10 }
      ]
    },
    {
      id: 105,
      timestamp: '2026-01-02T13:30:00Z',
      total: 4000,
      payments: [
        { method: 'pix', amount: 4000 }
      ],
      items: [
        { id: 3, name: 'Água', line_total: 4000, quantity: 8 }
      ]
    },
    // ...mais vendas para cobrir diferentes dias, semanas e meses
  ]
};

export default mockPerformanceData;
