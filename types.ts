
export interface Client {
  id: string;
  rut: string;
  companyName: string;
  address: string;
  website: string;
  phone: string;
  contactName: string;
}

export interface Product {
  id: string;
  sku: string;
  imageUrl: string;
  name: string;
  price: number;
  warehouseId: string;
  stock: number;
  description: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
}

export interface QuoteItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export enum QuoteStatus {
  Draft = 'Borrador',
  Sent = 'Enviada',
  Accepted = 'Aceptada',
  Rejected = 'Rechazada',
}

export interface Quote {
  id: string;
  clientId: string;
  items: QuoteItem[];
  status: QuoteStatus;
  createdAt: string;
  total: number;
}

export enum InvoiceStatus {
  Draft = 'Borrador',
  Sent = 'Enviada',
  Paid = 'Pagada',
  Overdue = 'Vencida',
}

export interface Invoice {
    id: string;
    quoteId: string;
    clientId: string;
    status: InvoiceStatus;
    createdAt: string;
    dueDate: string;
    total: number;
}
