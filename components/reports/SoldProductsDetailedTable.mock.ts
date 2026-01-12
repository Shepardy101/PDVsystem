// SoldProductsDetailedTable.mock.ts
// Mock de dados para SoldProductsDetailedTable
// Basta trocar a importação para usar dados reais da API

export interface SoldProductMock {
    product_id: string;
    product_name: string;
    total_quantity: number;
    total_value: number; // centavos
    sale_date: number; // epoch ms
    stock_on_hand: number;
    cost_price: number; // centavos
}

// Função utilitária para gerar datas de janeiro de 2025 até hoje
function randomDateFrom2025ToNow() {
    const start = new Date('2025-01-01T08:00:00').getTime();
    const end = Date.now();
    return new Date(start + Math.random() * (end - start)).getTime();
}

export const soldProductsMock: SoldProductMock[] = [
    {
        product_id: '5e693a07-429d-49b7-bc91-4e912ce18cad',
        product_name: 'Vinho Tinto Seco 750ml',
        total_quantity: 1,
        total_value: 2990,
        sale_date: new Date('2025-01-11T19:58:00').getTime(),
        stock_on_hand: 34,
        cost_price: 1850,
    },
    {
        product_id: 'b83cba91-70a8-4d43-911a-0c7b199cc860',
        product_name: 'Vinho Branco Suave 750ml',
        total_quantity: 1,
        total_value: 2790,
        sale_date: new Date('2025-01-11T19:58:00').getTime(),
        stock_on_hand: 27,
        cost_price: 1690,
    },
    {
        product_id: 'a2af0a08-1265-4347-b1bd-cb1cd78926b3',
        product_name: 'Vodka 1L',
        total_quantity: 1,
        total_value: 3990,
        sale_date: new Date('2025-01-11T19:56:00').getTime(),
        stock_on_hand: 24,
        cost_price: 2400,
    },
    {
        product_id: '72268a18-dbf5-4e9f-85fa-2b70fc5f3960',
        product_name: 'Refrigerante Limão 350ml',
        total_quantity: 1,
        total_value: 349,
        sale_date: new Date('2025-01-11T19:56:00').getTime(),
        stock_on_hand: 199,
        cost_price: 210,
    },
    {
        product_id: '9258e567-cc52-422d-b05b-deed7a0855b0',
        product_name: 'Refrigerante Cola 2L',
        total_quantity: 1,
        total_value: 799,
        sale_date: new Date('2025-01-11T19:56:00').getTime(),
        stock_on_hand: 89,
        cost_price: 520,
    },
    {
        product_id: '10d3b9a4-7099-4fa5-a235-f091565e3cda',
        product_name: 'Suco Uva Integral 1L',
        total_quantity: 1,
        total_value: 1099,
        sale_date: new Date('2025-01-11T19:55:00').getTime(),
        stock_on_hand: 59,
        cost_price: 680,
    },
    // Exemplos adicionais para o período de 2025 até hoje:
    ...Array.from({ length: 40 }).map((_, i) => ({
        product_id: `prod-mock-${i}`,
        product_name: [
            'Cerveja Pilsen 600ml',
            'Whisky 12 anos',
            'Gin Importado',
            'Água Mineral 500ml',
            'Energético 250ml',
            'Cachaça Artesanal',
            'Espumante Brut',
            'Rum Branco',
            'Licor de Café',
            'Tequila Silver',
        ][i % 10],
        total_quantity: Math.floor(Math.random() * 5) + 1,
        total_value: (Math.floor(Math.random() * 5000) + 500),
        sale_date: randomDateFrom2025ToNow(),
        stock_on_hand: Math.floor(Math.random() * 200),
        cost_price: (Math.floor(Math.random() * 3000) + 200),
    })),
];
