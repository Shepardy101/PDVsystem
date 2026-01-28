export const PRODUCTS = [
    // Bebidas (High Volume, Moderate Margin)
    { name: 'Cerveja Skol Lata 350ml', unit: 'unit', cost: 280, sale: 450, categoryId: 'cat_bebidas', ean: '7891991000826', code: 'BEB001' },
    { name: 'Cerveja Brahma Lata 350ml', unit: 'unit', cost: 290, sale: 460, categoryId: 'cat_bebidas', ean: '7891991000000', code: 'BEB002' },
    { name: 'Coca-Cola 2L', unit: 'unit', cost: 650, sale: 950, categoryId: 'cat_bebidas', ean: '7894900011517', code: 'BEB003' },
    { name: 'Guaraná Antarctica 2L', unit: 'unit', cost: 580, sale: 850, categoryId: 'cat_bebidas', ean: '7891991000710', code: 'BEB004' },
    { name: 'Água Mineral 500ml', unit: 'unit', cost: 80, sale: 250, categoryId: 'cat_bebidas', ean: '7896007504018', code: 'BEB005' },
    { name: 'Vinho Tinto Seco 750ml', unit: 'unit', cost: 1800, sale: 3200, categoryId: 'cat_bebidas', ean: '7896008600108', code: 'BEB006' },
    { name: 'Energético Monster 473ml', unit: 'unit', cost: 650, sale: 990, categoryId: 'cat_bebidas', ean: '70847012480', code: 'BEB007' },
    { name: 'Cerveja Heineken 330ml LN', unit: 'unit', cost: 480, sale: 750, categoryId: 'cat_bebidas', ean: '7896045505435', code: 'BEB008' },
    { name: 'Suco de Laranja 1L', unit: 'unit', cost: 720, sale: 1190, categoryId: 'cat_bebidas', ean: '7896435000016', code: 'BEB009' },
    { name: 'Vodka Orloff 1L', unit: 'unit', cost: 2200, sale: 3500, categoryId: 'cat_bebidas', ean: '7891098000019', code: 'BEB010' },

    // Mercearia (Moderate Volume, Varied Margin)
    { name: 'Arroz 5kg', unit: 'unit', cost: 2200, sale: 2850, categoryId: 'cat_mercearia', ean: '7896006711110', code: 'MER001' },
    { name: 'Feijão Carioca 1kg', unit: 'unit', cost: 620, sale: 890, categoryId: 'cat_mercearia', ean: '7896006711127', code: 'MER002' },
    { name: 'Óleo de Soja 900ml', unit: 'unit', cost: 550, sale: 720, categoryId: 'cat_mercearia', ean: '7891000315104', code: 'MER003' },
    { name: 'Açúcar Refinado 1kg', unit: 'unit', cost: 380, sale: 550, categoryId: 'cat_mercearia', ean: '7896006711134', code: 'MER004' },
    { name: 'Macarrão Espaguete 500g', unit: 'unit', cost: 280, sale: 450, categoryId: 'cat_mercearia', ean: '7891000315111', code: 'MER005' },
    { name: 'Café Torrado 500g', unit: 'unit', cost: 1500, sale: 2190, categoryId: 'cat_mercearia', ean: '7896006711141', code: 'MER006' },
    { name: 'Leite Integral 1L', unit: 'unit', cost: 380, sale: 520, categoryId: 'cat_mercearia', ean: '7891000315128', code: 'MER007' },
    { name: 'Biscoito Recheado 130g', unit: 'unit', cost: 180, sale: 350, categoryId: 'cat_mercearia', ean: '7891000315135', code: 'MER008' },
    { name: 'Farofa Pronta 500g', unit: 'unit', cost: 420, sale: 750, categoryId: 'cat_mercearia', ean: '7891000315142', code: 'MER009' },
    { name: 'Salgadinho de Milho 100g', unit: 'unit', cost: 250, sale: 590, categoryId: 'cat_mercearia', ean: '7891000315159', code: 'MER010' },

    // Limpeza (Stable, Good Margin)
    { name: 'Detergente Líquido 500ml', unit: 'unit', cost: 120, sale: 280, categoryId: 'cat_limpeza', ean: '7891024111222', code: 'LIM001' },
    { name: 'Sabão em Pó 1kg', unit: 'unit', cost: 950, sale: 1590, categoryId: 'cat_limpeza', ean: '7891024111239', code: 'LIM002' },
    { name: 'Desinfetante 500ml', unit: 'unit', cost: 320, sale: 650, categoryId: 'cat_limpeza', ean: '7891024111246', code: 'LIM003' },
    { name: 'Papel Higiênico 4 un', unit: 'unit', cost: 450, sale: 890, categoryId: 'cat_limpeza', ean: '7891024111253', code: 'LIM004' },
    { name: 'Esponja de Aço 3 un', unit: 'unit', cost: 150, sale: 350, categoryId: 'cat_limpeza', ean: '7891024111260', code: 'LIM005' },

    // Pet (High Margin)
    { name: 'Ração Cães 1kg', unit: 'unit', cost: 1200, sale: 2200, categoryId: 'cat_pet', ean: '7891024111314', code: 'PET001' },
    { name: 'Ração Gatos 1kg', unit: 'unit', cost: 1400, sale: 2500, categoryId: 'cat_pet', ean: '7891024111321', code: 'PET002' },
    { name: 'Petisco para Cães', unit: 'unit', cost: 450, sale: 990, categoryId: 'cat_pet', ean: '7891024111338', code: 'PET003' },
    { name: 'Shampoo Pet 500ml', unit: 'unit', cost: 1500, sale: 2990, categoryId: 'cat_pet', ean: '7891024111345', code: 'PET004' },
    { name: 'Areia Sanitária 4kg', unit: 'unit', cost: 850, sale: 1690, categoryId: 'cat_pet', ean: '7891024111352', code: 'PET005' },

    // Padaria / Confeitaria
    { name: 'Pão de Forma', unit: 'unit', cost: 550, sale: 950, categoryId: 'cat_padaria', ean: '7891024111413', code: 'PAD001' },
    { name: 'Bolo de Chocolate', unit: 'unit', cost: 1200, sale: 2200, categoryId: 'cat_confeitaria', ean: '7891024111420', code: 'CON001' },
    { name: 'Pudim de Leite', unit: 'unit', cost: 800, sale: 1800, categoryId: 'cat_confeitaria', ean: '7891024111437', code: 'CON002' },

    // Mais itens para chegar em 50+
    { name: 'Gelo 5kg', unit: 'unit', cost: 600, sale: 1200, categoryId: 'cat_bebidas', ean: '7891024111512', code: 'BEB011' },
    { name: 'Carvão 3kg', unit: 'unit', cost: 1200, sale: 2000, categoryId: 'cat_mercearia', ean: '7891024111529', code: 'MER011' },
    { name: 'Chocolate Barra 90g', unit: 'unit', cost: 420, sale: 750, categoryId: 'cat_confeitaria', ean: '7891024111536', code: 'CON003' },
    { name: 'Leite Condensado 395g', unit: 'unit', cost: 580, sale: 890, categoryId: 'cat_mercearia', ean: '7891024111543', code: 'MER012' },
    { name: 'Creme de Leite 200g', unit: 'unit', cost: 250, sale: 450, categoryId: 'cat_mercearia', ean: '7891024111550', code: 'MER013' },
    { name: 'Milho de Pipoca 500g', unit: 'unit', cost: 320, sale: 620, categoryId: 'cat_mercearia', ean: '7891024111567', code: 'MER014' },
    { name: 'Maionese 500g', unit: 'unit', cost: 650, sale: 980, categoryId: 'cat_mercearia', ean: '7891024111574', code: 'MER015' },
    { name: 'Ketchup 500g', unit: 'unit', cost: 550, sale: 890, categoryId: 'cat_mercearia', ean: '7891024111581', code: 'MER016' },
    { name: 'Mostarda 500g', unit: 'unit', cost: 450, sale: 750, categoryId: 'cat_mercearia', ean: '7891024111598', code: 'MER017' },
    { name: 'Salsicha Congelada 500g', unit: 'unit', cost: 750, sale: 1290, categoryId: 'cat_mercearia', ean: '7891024111604', code: 'MER018' },
    { name: 'Hamburguer 12 un', unit: 'unit', cost: 1800, sale: 2800, categoryId: 'cat_mercearia', ean: '7891024111611', code: 'MER019' },
    { name: 'Queijo Muçarela 200g', unit: 'unit', cost: 1100, sale: 1690, categoryId: 'cat_mercearia', ean: '7891024111628', code: 'MER020' },
    { name: 'Presunto Fatiado 200g', unit: 'unit', cost: 850, sale: 1390, categoryId: 'cat_mercearia', ean: '7891024111635', code: 'MER021' },
    { name: 'Iogurte Grego 500g', unit: 'unit', cost: 950, sale: 1550, categoryId: 'cat_mercearia', ean: '7891024111642', code: 'MER022' },
    { name: 'Suco em Pó (Pacote)', unit: 'unit', cost: 30, sale: 150, categoryId: 'cat_bebidas', ean: '7891024111659', code: 'BEB012' },
    { name: 'Cerveja Original 600ml', unit: 'unit', cost: 650, sale: 1100, categoryId: 'cat_bebidas', ean: '7891991000001', code: 'BEB013' },
    { name: 'Cachaça Artesanal 700ml', unit: 'unit', cost: 1500, sale: 2990, categoryId: 'cat_bebidas', ean: '7891024111673', code: 'BEB014' },
    { name: 'Papinho Geriátrico', unit: 'unit', cost: 650, sale: 1200, categoryId: 'cat_mercearia', ean: '7891024111680', code: 'MER023' }
];
