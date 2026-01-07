export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  gtin: string;
  internalCode: string;
  unit: string;
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

export type UserRole = 'admin' | 'operator' | 'manager';
export type UserStatus = 'active' | 'inactive' | 'blocked';

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
}

export interface Client {
  id: string;
  name: string;
  cpf: string;
  address: string;
  phone: string;
  email?: string;
  totalSpent: number;
}

export interface Supplier {
  id: string;
  name: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  category: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  appliedDiscount: number;
}

export interface Sale {
  id: string;
  timestamp: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'pix' | 'card' | 'credit';
  clientId?: string;
}

export interface CashSession {
  isOpen: boolean;
  openedAt?: string;
  initialBalance: number;
  currentBalance: number;
  transactions: CashTransaction[];
}

export interface CashTransaction {
  id: string;
  type: 'sale' | 'sangria' | 'suprimento' | 'pagamento';
  amount: number;
  description: string;
  timestamp: string;
  // Detalhes estendidos para o modal
  metadata?: {
    items?: { name: string; qty: number; price: number }[];
    operator?: string;
    method?: string;
    category?: string;
  };
}

export type AppView = 'login' | 'pos' | 'products' | 'entities' | 'cash' | 'reports' | 'settings';
