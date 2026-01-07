
import { Product, Client, SystemUser, Supplier } from './types';

export const CATEGORIES = ['Cervejas', 'Refrigerantes', 'Vinhos', 'Águas', 'Energéticos', 'Destilados', 'Sucos', 'Isotônicos'];

export const MOCK_USERS: SystemUser[] = [
  { id: '1', name: 'Operador Alfa', email: 'alfa@novabev.com', role: 'operator', status: 'active', lastLogin: '2023-10-27T10:30:00Z' },
  { id: '2', name: 'Gerente Comercial', email: 'gerente@novabev.com', role: 'manager', status: 'active', lastLogin: '2023-10-27T08:15:00Z' },
  { id: '3', name: 'Admin Root', email: 'admin@novabev.com', role: 'admin', status: 'active', lastLogin: '2023-10-26T22:00:00Z' },
  { id: '4', name: 'Operador Beta', email: 'beta@novabev.com', role: 'operator', status: 'inactive', lastLogin: '2023-09-15T14:20:00Z' }
];

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: '1', name: 'Ambev S.A.', cnpj: '02.261.666/0001-34', address: 'Av. Brasil, 1000, SP', phone: '(11) 3333-4444', email: 'vendas@ambev.com.br', category: 'Bebidas' },
  { id: '2', name: 'Coca-Cola FEMSA', cnpj: '45.997.418/0001-53', address: 'Rodovia Anhanguera, KM 20', phone: '(11) 4004-2000', email: 'atendimento@femsa.com.br', category: 'Refrigerantes' },
  { id: '3', name: 'Vinícola Aurora', cnpj: '88.131.189/0001-44', address: 'Rua Olavo Bilac, 500, RS', phone: '(54) 3455-2000', email: 'contato@vinicolaaurora.com.br', category: 'Vinhos' }
];

export const MOCK_PRODUCTS: Product[] = [
  // --- CERVEJAS ---
  { id: '1', name: 'Cerveja Pilsen Lata 350ml', gtin: '7891234500010', internalCode: 'CER-001', unit: 'UN', costPrice: 2.50, salePrice: 4.50, stock: 480, category: 'Cervejas', supplier: 'Ambev', status: 'active', imageUrl: 'https://picsum.photos/seed/beer1/200/200', autoDiscount: 0.50 },
  { id: '2', name: 'Heineken Long Neck 330ml', gtin: '7891234500027', internalCode: 'CER-002', unit: 'UN', costPrice: 4.20, salePrice: 7.50, stock: 240, category: 'Cervejas', supplier: 'Heineken BR', status: 'active', imageUrl: 'https://picsum.photos/seed/heineken/200/200' },
  { id: '3', name: 'Stella Artois Long Neck 330ml', gtin: '7891234500034', internalCode: 'CER-003', unit: 'UN', costPrice: 3.80, salePrice: 6.90, stock: 180, category: 'Cervejas', supplier: 'Ambev', status: 'active', imageUrl: 'https://picsum.photos/seed/stella/200/200' },
  { id: '4', name: 'Budweiser Lata 350ml', gtin: '7891234500041', internalCode: 'CER-004', unit: 'UN', costPrice: 2.80, salePrice: 4.90, stock: 320, category: 'Cervejas', supplier: 'Ambev', status: 'active', imageUrl: 'https://picsum.photos/seed/bud/200/200' },
  { id: '5', name: 'Corona Extra 330ml', gtin: '7891234500058', internalCode: 'CER-005', unit: 'UN', costPrice: 5.10, salePrice: 8.90, stock: 120, category: 'Cervejas', supplier: 'Ambev', status: 'active', imageUrl: 'https://picsum.photos/seed/corona/200/200' },
  { id: '6', name: 'Eisenbahn Pilsen 350ml', gtin: '7891234500065', internalCode: 'CER-006', unit: 'UN', costPrice: 2.90, salePrice: 5.20, stock: 200, category: 'Cervejas', supplier: 'Heineken BR', status: 'active', imageUrl: 'https://picsum.photos/seed/eisen/200/200' },
  { id: '7', name: 'Colorado Indica 600ml', gtin: '7891234500072', internalCode: 'CER-007', unit: 'UN', costPrice: 12.00, salePrice: 18.90, stock: 45, category: 'Cervejas', supplier: 'Ambev', status: 'active', imageUrl: 'https://picsum.photos/seed/colorado/200/200' },
  { id: '8', name: 'Brahma Duplo Malte 350ml', gtin: '7891234500089', internalCode: 'CER-008', unit: 'UN', costPrice: 2.60, salePrice: 4.70, stock: 500, category: 'Cervejas', supplier: 'Ambev', status: 'active', imageUrl: 'https://picsum.photos/seed/brahma/200/200' },
  { id: '9', name: 'Skol Beats Senses 269ml', gtin: '7891234500096', internalCode: 'CER-009', unit: 'UN', costPrice: 3.90, salePrice: 6.50, stock: 150, category: 'Cervejas', supplier: 'Ambev', status: 'active', imageUrl: 'https://picsum.photos/seed/beats/200/200' },
  { id: '10', name: 'Guinness Draught 440ml', gtin: '7891234500102', internalCode: 'CER-010', unit: 'UN', costPrice: 18.00, salePrice: 28.00, stock: 24, category: 'Cervejas', supplier: 'Diageo', status: 'active', imageUrl: 'https://picsum.photos/seed/guinness/200/200' },

  // --- REFRIGERANTES ---
  { id: '11', name: 'Coca-Cola Original 2L', gtin: '7891234500119', internalCode: 'REF-001', unit: 'UN', costPrice: 4.50, salePrice: 9.50, stock: 120, category: 'Refrigerantes', supplier: 'Coca-Cola', status: 'active', imageUrl: 'https://picsum.photos/seed/coke2l/200/200' },
  { id: '12', name: 'Coca-Cola Zero 2L', gtin: '7891234500126', internalCode: 'REF-002', unit: 'UN', costPrice: 4.50, salePrice: 9.50, stock: 85, category: 'Refrigerantes', supplier: 'Coca-Cola', status: 'active', imageUrl: 'https://picsum.photos/seed/cokezero/200/200' },
  { id: '13', name: 'Guaraná Antarctica 2L', gtin: '7891234500133', internalCode: 'REF-003', unit: 'UN', costPrice: 3.80, salePrice: 7.90, stock: 200, category: 'Refrigerantes', supplier: 'Ambev', status: 'active', imageUrl: 'https://picsum.photos/seed/guarana/200/200' },
  { id: '14', name: 'Fanta Laranja 2L', gtin: '7891234500140', internalCode: 'REF-004', unit: 'UN', costPrice: 3.90, salePrice: 8.20, stock: 90, category: 'Refrigerantes', supplier: 'Coca-Cola', status: 'active', imageUrl: 'https://picsum.photos/seed/fanta/200/200' },
  { id: '15', name: 'Sprite 2L', gtin: '7891234500157', internalCode: 'REF-005', unit: 'UN', costPrice: 3.90, salePrice: 8.20, stock: 60, category: 'Refrigerantes', supplier: 'Coca-Cola', status: 'active', imageUrl: 'https://picsum.photos/seed/sprite/200/200' },
  { id: '16', name: 'Pepsi Black 2L', gtin: '7891234500164', internalCode: 'REF-006', unit: 'UN', costPrice: 3.50, salePrice: 7.50, stock: 75, category: 'Refrigerantes', supplier: 'Ambev', status: 'active', imageUrl: 'https://picsum.photos/seed/pepsi/200/200' },
  { id: '17', name: 'Schweppes Tonic 350ml', gtin: '7891234500171', internalCode: 'REF-007', unit: 'UN', costPrice: 2.10, salePrice: 4.50, stock: 120, category: 'Refrigerantes', supplier: 'Coca-Cola', status: 'active', imageUrl: 'https://picsum.photos/seed/schweppes/200/200' },
  { id: '18', name: 'Itubaína Retro 355ml', gtin: '7891234500188', internalCode: 'REF-008', unit: 'UN', costPrice: 1.90, salePrice: 3.90, stock: 48, category: 'Refrigerantes', supplier: 'Heineken BR', status: 'active', imageUrl: 'https://picsum.photos/seed/itubaina/200/200' },

  // --- DESTILADOS ---
  { id: '19', name: 'Vodka Absolut 1L', gtin: '7891234500195', internalCode: 'DES-001', unit: 'UN', costPrice: 65.00, salePrice: 98.00, stock: 36, category: 'Destilados', supplier: 'Pernod Ricard', status: 'active', imageUrl: 'https://picsum.photos/seed/absolut/200/200' },
  { id: '20', name: 'Whisky Black Label 1L', gtin: '7891234500201', internalCode: 'DES-002', unit: 'UN', costPrice: 125.00, salePrice: 185.00, stock: 24, category: 'Destilados', supplier: 'Diageo', status: 'active', imageUrl: 'https://picsum.photos/seed/jwb/200/200' },
  { id: '21', name: 'Whisky Jack Daniels 1L', gtin: '7891234500218', internalCode: 'DES-003', unit: 'UN', costPrice: 110.00, salePrice: 165.00, stock: 30, category: 'Destilados', supplier: 'Brown-Forman', status: 'active', imageUrl: 'https://picsum.photos/seed/jack/200/200' },
  { id: '22', name: 'Gin Tanqueray 750ml', gtin: '7891234500225', internalCode: 'DES-004', unit: 'UN', costPrice: 75.00, salePrice: 115.00, stock: 42, category: 'Destilados', supplier: 'Diageo', status: 'active', imageUrl: 'https://picsum.photos/seed/tanqueray/200/200' },
  { id: '23', name: 'Tequila Jose Cuervo 750ml', gtin: '7891234500232', internalCode: 'DES-005', unit: 'UN', costPrice: 85.00, salePrice: 139.00, stock: 15, category: 'Destilados', supplier: 'Aurora', status: 'active', imageUrl: 'https://picsum.photos/seed/cuervo/200/200' },
  { id: '24', name: 'Rum Bacardi Carta Blanca 1L', gtin: '7891234500249', internalCode: 'DES-006', unit: 'UN', costPrice: 42.00, salePrice: 69.00, stock: 20, category: 'Destilados', supplier: 'Bacardi', status: 'active', imageUrl: 'https://picsum.photos/seed/bacardi/200/200' },
  { id: '25', name: 'Cachaça 51 965ml', gtin: '7891234500256', internalCode: 'DES-007', unit: 'UN', costPrice: 12.00, salePrice: 22.00, stock: 60, category: 'Destilados', supplier: 'Müller de Bebidas', status: 'active', imageUrl: 'https://picsum.photos/seed/c51/200/200' },
  { id: '26', name: 'Jägermeister 700ml', gtin: '7891234500263', internalCode: 'DES-008', unit: 'UN', costPrice: 85.00, salePrice: 125.00, stock: 18, category: 'Destilados', supplier: 'Aurora', status: 'active', imageUrl: 'https://picsum.photos/seed/jager/200/200' },

  // --- VINHOS ---
  { id: '27', name: 'Vinho Malbec Reservado 750ml', gtin: '7891234500270', internalCode: 'VIN-001', unit: 'UN', costPrice: 22.00, salePrice: 45.00, stock: 48, category: 'Vinhos', supplier: 'Concha y Toro', status: 'active', imageUrl: 'https://picsum.photos/seed/malbec/200/200' },
  { id: '28', name: 'Vinho Cabernet Sauvignon 750ml', gtin: '7891234500287', internalCode: 'VIN-002', unit: 'UN', costPrice: 24.00, salePrice: 48.00, stock: 36, category: 'Vinhos', supplier: 'Casillero del Diablo', status: 'active', imageUrl: 'https://picsum.photos/seed/cabernet/200/200' },
  { id: '29', name: 'Espumante Chandon Brut 750ml', gtin: '7891234500294', internalCode: 'VIN-003', unit: 'UN', costPrice: 65.00, salePrice: 95.00, stock: 24, category: 'Vinhos', supplier: 'LVMH', status: 'active', imageUrl: 'https://picsum.photos/seed/chandon/200/200' },
  { id: '30', name: 'Vinho Rose Piscine 750ml', gtin: '7891234500300', internalCode: 'VIN-004', unit: 'UN', costPrice: 75.00, salePrice: 119.00, stock: 12, category: 'Vinhos', supplier: 'Importadora X', status: 'active', imageUrl: 'https://picsum.photos/seed/piscine/200/200' },
  { id: '31', name: 'Vinho do Porto Ferreira 750ml', gtin: '7891234500317', internalCode: 'VIN-005', unit: 'UN', costPrice: 85.00, salePrice: 145.00, stock: 8, category: 'Vinhos', supplier: 'Sogrape', status: 'active', imageUrl: 'https://picsum.photos/seed/porto/200/200' },

  // --- ENERGÉTICOS ---
  { id: '32', name: 'Red Bull Energy 250ml', gtin: '7891234500324', internalCode: 'ENE-001', unit: 'UN', costPrice: 5.50, salePrice: 9.50, stock: 144, category: 'Energéticos', supplier: 'Red Bull', status: 'active', imageUrl: 'https://picsum.photos/seed/redbull/200/200' },
  { id: '33', name: 'Monster Energy 473ml', gtin: '7891234500331', internalCode: 'ENE-002', unit: 'UN', costPrice: 5.80, salePrice: 10.50, stock: 120, category: 'Energéticos', supplier: 'Coca-Cola', status: 'active', imageUrl: 'https://picsum.photos/seed/monster/200/200' },
  { id: '34', name: 'Burn Energy 250ml', gtin: '7891234500348', internalCode: 'ENE-003', unit: 'UN', costPrice: 3.50, salePrice: 6.90, stock: 72, category: 'Energéticos', supplier: 'Coca-Cola', status: 'active', imageUrl: 'https://picsum.photos/seed/burn/200/200' },
  { id: '35', name: 'TNT Energy Drink 269ml', gtin: '7891234500355', internalCode: 'ENE-004', unit: 'UN', costPrice: 3.20, salePrice: 5.50, stock: 96, category: 'Energéticos', supplier: 'Grupo Petrópolis', status: 'active', imageUrl: 'https://picsum.photos/seed/tnt/200/200' },

  // --- ÁGUAS ---
  { id: '36', name: 'Água s/ Gás Crystal 500ml', gtin: '7891234500362', internalCode: 'AGU-001', unit: 'UN', costPrice: 0.80, salePrice: 2.50, stock: 600, category: 'Águas', supplier: 'Coca-Cola', status: 'active', imageUrl: 'https://picsum.photos/seed/water1/200/200' },
  { id: '37', name: 'Água c/ Gás Crystal 500ml', gtin: '7891234500379', internalCode: 'AGU-002', unit: 'UN', costPrice: 0.90, salePrice: 2.80, stock: 300, category: 'Águas', supplier: 'Coca-Cola', status: 'active', imageUrl: 'https://picsum.photos/seed/water2/200/200' },
  { id: '38', name: 'Água Perrier 330ml', gtin: '7891234500386', internalCode: 'AGU-003', unit: 'UN', costPrice: 6.50, salePrice: 12.00, stock: 48, category: 'Águas', supplier: 'Nestle', status: 'active', imageUrl: 'https://picsum.photos/seed/perrier/200/200' },
  { id: '39', name: 'Água Evian 500ml', gtin: '7891234500393', internalCode: 'AGU-004', unit: 'UN', costPrice: 8.00, salePrice: 15.00, stock: 24, category: 'Águas', supplier: 'Danone', status: 'active', imageUrl: 'https://picsum.photos/seed/evian/200/200' },

  // --- SUCOS E ISOTÔNICOS ---
  { id: '40', name: 'Del Valle Uva 1L', gtin: '7891234500409', internalCode: 'SUC-001', unit: 'UN', costPrice: 4.50, salePrice: 8.50, stock: 80, category: 'Sucos', supplier: 'Coca-Cola', status: 'active', imageUrl: 'https://picsum.photos/seed/delvalle/200/200' },
  { id: '41', name: 'Gatorade Laranja 500ml', gtin: '7891234500416', internalCode: 'ISO-001', unit: 'UN', costPrice: 3.20, salePrice: 6.50, stock: 120, category: 'Isotônicos', supplier: 'Ambev', status: 'active', imageUrl: 'https://picsum.photos/seed/gatorade/200/200' },
  { id: '42', name: 'Powerade Mix 500ml', gtin: '7891234500423', internalCode: 'ISO-002', unit: 'UN', costPrice: 3.10, salePrice: 6.20, stock: 96, category: 'Isotônicos', supplier: 'Coca-Cola', status: 'active', imageUrl: 'https://picsum.photos/seed/powerade/200/200' },

  // --- MAIS CERVEJAS PARA CHEGAR A 50+ ---
  { id: '43', name: 'Antarctica Original 600ml', gtin: '7891234500430', internalCode: 'CER-011', unit: 'UN', costPrice: 7.00, salePrice: 11.00, stock: 120, category: 'Cervejas', supplier: 'Ambev', status: 'active', imageUrl: 'https://picsum.photos/seed/original/200/200' },
  { id: '44', name: 'Skol Lata 350ml', gtin: '7891234500447', internalCode: 'CER-012', unit: 'UN', costPrice: 2.40, salePrice: 4.20, stock: 1200, category: 'Cervejas', supplier: 'Ambev', status: 'active', imageUrl: 'https://picsum.photos/seed/skol/200/200' },
  { id: '45', name: 'Brahma Chopp 350ml', gtin: '7891234500454', internalCode: 'CER-013', unit: 'UN', costPrice: 2.40, salePrice: 4.20, stock: 1000, category: 'Cervejas', supplier: 'Ambev', status: 'active', imageUrl: 'https://picsum.photos/seed/brahmalata/200/200' },
  { id: '46', name: 'Skol Beats GT 269ml', gtin: '7891234500461', internalCode: 'CER-014', unit: 'UN', costPrice: 4.20, salePrice: 7.20, stock: 80, category: 'Cervejas', supplier: 'Ambev', status: 'active', imageUrl: 'https://picsum.photos/seed/beatsgt/200/200' },
  { id: '47', name: 'Blue Moon 355ml', gtin: '7891234500478', internalCode: 'CER-015', unit: 'UN', costPrice: 12.00, salePrice: 19.00, stock: 36, category: 'Cervejas', supplier: 'Importadora Z', status: 'active', imageUrl: 'https://picsum.photos/seed/bluemoon/200/200' },
  { id: '48', name: 'Hoegaarden 330ml', gtin: '7891234500485', internalCode: 'CER-016', unit: 'UN', costPrice: 9.00, salePrice: 15.50, stock: 48, category: 'Cervejas', supplier: 'Ambev', status: 'active', imageUrl: 'https://picsum.photos/seed/hoegaarden/200/200' },
  { id: '49', name: 'Spaten 350ml', gtin: '7891234500492', internalCode: 'CER-017', unit: 'UN', costPrice: 3.10, salePrice: 5.50, stock: 600, category: 'Cervejas', supplier: 'Ambev', status: 'active', imageUrl: 'https://picsum.photos/seed/spaten/200/200' },
  { id: '50', name: 'Amstel 350ml', gtin: '7891234500508', internalCode: 'CER-018', unit: 'UN', costPrice: 2.60, salePrice: 4.60, stock: 400, category: 'Cervejas', supplier: 'Heineken BR', status: 'active', imageUrl: 'https://picsum.photos/seed/amstel/200/200' },
  { id: '51', name: 'Therezópolis Gold 600ml', gtin: '7891234500515', internalCode: 'CER-019', unit: 'UN', costPrice: 10.50, salePrice: 16.90, stock: 50, category: 'Cervejas', supplier: 'Coca-Cola', status: 'active', imageUrl: 'https://picsum.photos/seed/therezo/200/200' },
  { id: '52', name: 'Wals Session IPA 600ml', gtin: '7891234500522', internalCode: 'CER-020', unit: 'UN', costPrice: 14.00, salePrice: 22.00, stock: 30, category: 'Cervejas', supplier: 'Ambev', status: 'active', imageUrl: 'https://picsum.photos/seed/wals/200/200' },
  { id: '53', name: 'Vinho Casillero del Diablo Reserva 750ml', gtin: '7891234500539', internalCode: 'VIN-006', unit: 'UN', costPrice: 38.00, salePrice: 65.00, stock: 24, category: 'Vinhos', supplier: 'Concha y Toro', status: 'active', imageUrl: 'https://picsum.photos/seed/casillero/200/200' },
  { id: '54', name: 'Vodka Smirnoff 998ml', gtin: '7891234500546', internalCode: 'DES-009', unit: 'UN', costPrice: 28.00, salePrice: 49.90, stock: 120, category: 'Destilados', supplier: 'Diageo', status: 'active', imageUrl: 'https://picsum.photos/seed/smirnoff/200/200' },
  { id: '55', name: 'Red Label 1L', gtin: '7891234500553', internalCode: 'DES-010', unit: 'UN', costPrice: 75.00, salePrice: 115.00, stock: 60, category: 'Destilados', supplier: 'Diageo', status: 'active', imageUrl: 'https://picsum.photos/seed/redlabel/200/200' },
  { id: '56', name: 'Suco Maguary Laranja 1L', gtin: '7891234500560', internalCode: 'SUC-002', unit: 'UN', costPrice: 3.50, salePrice: 7.20, stock: 100, category: 'Sucos', supplier: 'Maguary', status: 'active', imageUrl: 'https://picsum.photos/seed/maguary/200/200' },
  { id: '57', name: 'Ades Soja Original 1L', gtin: '7891234500577', internalCode: 'SUC-003', unit: 'UN', costPrice: 4.80, salePrice: 8.90, stock: 45, category: 'Sucos', supplier: 'Coca-Cola', status: 'active', imageUrl: 'https://picsum.photos/seed/ades/200/200' },
  { id: '58', name: 'Tial Maçã 1L', gtin: '7891234500584', internalCode: 'SUC-004', unit: 'UN', costPrice: 4.20, salePrice: 7.90, stock: 60, category: 'Sucos', supplier: 'Tial', status: 'active', imageUrl: 'https://picsum.photos/seed/tial/200/200' },
  { id: '59', name: 'Minalba Premium 330ml', gtin: '7891234500591', internalCode: 'AGU-005', unit: 'UN', costPrice: 1.20, salePrice: 4.50, stock: 200, category: 'Águas', supplier: 'Minalba', status: 'active', imageUrl: 'https://picsum.photos/seed/minalba/200/200' },
  { id: '60', name: 'Guaraná Antarctica Zero 2L', gtin: '7891234500607', internalCode: 'REF-009', unit: 'UN', costPrice: 3.80, salePrice: 7.90, stock: 110, category: 'Refrigerantes', supplier: 'Ambev', status: 'active', imageUrl: 'https://picsum.photos/seed/guaranazero/200/200' }
];

export const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'João Silva', cpf: '123.456.789-00', address: 'Rua das Flores, 123', phone: '(11) 98888-7777', email: 'joao@email.com', totalSpent: 450.50 },
  { id: '2', name: 'Maria Oliveira', cpf: '987.654.321-11', address: 'Av. Paulista, 1000', phone: '(11) 97777-6666', email: 'maria@email.com', totalSpent: 125.00 }
];
