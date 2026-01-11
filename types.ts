// Helpers para checagem de role de usuário
export type UserRole = 'admin' | 'manager' | 'operator';
export type UserStatus = 'active' | 'inactive' | 'blocked';

export function isOperator(user: { role?: string } | null | undefined): boolean {
  return !!user && user.role === 'operator';
}

export function isAdmin(user: { role?: string } | null | undefined): boolean {
  return !!user && user.role === 'admin';
}

export function isManager(user: { role?: string } | null | undefined): boolean {
  return !!user && user.role === 'manager';
}
export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  gtin: string;
  internalCode: string;
  unit: 'cx' | 'unit' | 'kg' | 'serv';
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock?: number; // Estoque mínimo para alertas
  category: string;
  supplier: string;
  status: 'active' | 'inactive';
  imageUrl?: string;
  autoDiscount?: number; // Valor fixo de desconto automático
}


export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface Client {
  id: string;
  name: string;
  cpf: string;
  address: string;
  phone: string;
  email: string;
  created_at: number;
  updated_at: number;
  totalSpent: number;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
}

export interface Product {
  id: string;
  name: string;
  ean: string;
  internal_code: string;
  unit: 'cx' | 'unit' | 'kg' | 'serv';
  cost_price: number;
  sale_price: number;
  auto_discount_enabled: number;
  auto_discount_value: number;
  category_id?: string;
  supplier_id?: string;
  status: 'active' | 'inactive';
  stock_on_hand: number;
  created_at: number;
  updated_at: number;
  imageUrl?: string;
  type: 'product' | 'service';
}


export interface CartItem {
  product: Product;
  quantity: number;
  appliedDiscount: number;
}


// Venda detalhada (completa)
export interface SaleTransaction {
  id: string;
  timestamp: number;
  operator_id: string;
  cash_session_id: string;
  subtotal: number;
  discount_total: number;
  total: number;
  status: string;
  created_at: number;
  client_id: string | null;
  items: SaleItem[];
  payments: Payment[];
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name_snapshot: string;
  product_internal_code_snapshot: string;
  product_ean_snapshot: string;
  unit_snapshot: string;
  quantity: number;
  unit_price_at_sale: number;
  auto_discount_applied: number;
  manual_discount_applied: number;
  final_unit_price: number;
  line_total: number;
}

export interface Payment {
  id: string;
  sale_id: string;
  method: string;
  amount: number;
  metadata_json: string;
  created_at: number;
}

// Movimentação de caixa (não-venda)
export interface MovementTransaction {
  id: string;
  cash_session_id: string;
  type: string;
  direction: string;
  amount: number;
  description: string;
  timestamp: number;
  reference_type: string;
  reference_id: string | null;
  metadata_json: string;
  created_at: number;
  category: string | null;
  operator_id: string | null;
}


export interface CashSession {
  id: string;
  operator_id: string;
  opened_at: number;
  closed_at: number | null;
  initial_balance: number;
  is_open: number;
  physical_count_at_close: number | null;
  difference_at_close: number | null;
  created_at: number;
  updated_at: number;
  transactions: (SaleTransaction | MovementTransaction)[];
}




// CashTransaction antigo removido, pois agora usamos SaleTransaction | MovementTransaction

export type AppView = 'login' | 'pos' | 'products' | 'entities' | 'cash' | 'reports' | 'settings';
