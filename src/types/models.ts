// Models
export interface Product {
  id: string;
  name: string;
  description?: string;
  barcode?: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  maxStock: number;
  status: 'active' | 'inactive';
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  name: string;
  document: string; // CPF or CNPJ
  email?: string;
  phone?: string;
  address?: Address;
  notes?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Sale {
  id: string;
  number: number;
  client?: Client;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'cancelled';
  operator: string;
  cashSession: string;
  createdAt: Date;
}

export interface SaleItem {
  id: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface CashSession {
  id: string;
  operator: string;
  openedAt: Date;
  closedAt?: Date;
  openingBalance: number;
  closingBalance?: number;
  expectedBalance?: number;
  difference?: number;
  sales: number;
  withdrawals: number;
  deposits: number;
  status: 'open' | 'closed';
}

export interface CashMovement {
  id: string;
  session: string;
  type: 'sale' | 'withdrawal' | 'deposit';
  description: string;
  value: number;
  operator: string;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator';
  permissions: string[];
  avatar?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface Store {
  id: string;
  name: string;
  tradeName: string;
  document: string;
  stateRegistration?: string;
  email?: string;
  phone?: string;
  address: Address;
  logo?: string;
}
