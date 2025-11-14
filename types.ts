
export interface Client {
  id: string;
  rut: string;
  companyName: string;
  address: string;
  website: string;
  phone: string;
  contactName: string;
}

export interface WarehouseStock {
  warehouseId: string;
  stock: number;
  price: number;
}

export interface Product {
  id: string;
  sku: string;
  imageUrl: string;
  name: string;
  brand: string;
  model: string;
  locations: WarehouseStock[];
  description: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
}

export interface QuoteItem {
  productId: string;
  warehouseId: string;
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
    quoteId?: string;
    clientId: string;
    items: QuoteItem[];
    status: InvoiceStatus;
    createdAt: string;
    dueDate: string;
    total: number;
}

export enum TransactionType {
  Credit = 'Abono',
  Debit = 'Cargo',
  Adjustment = 'Ajuste',
}

export interface Transaction {
  id: string;
  clientId: string;
  date: string;
  type: TransactionType;
  description: string;
  amount: number;
}

export enum CheckStatus {
  Received = 'Recibido',
  Deposited = 'Depositado',
  Bounced = 'Protestado',
  Cleared = 'Cobrado',
}

export interface Check {
  id: string;
  clientId: string;
  number: string;
  bank: string;
  amount: number;
  paymentDate: string;
  status: CheckStatus;
}

export enum PaymentMethod {
  Transfer = 'Transferencia',
  CreditCard = 'Tarjeta de Crédito',
  DebitCard = 'Tarjeta de Débito',
  Cash = 'Efectivo',
  Check = 'Cheque',
}

export interface Payment {
  id: string;
  clientId: string;
  date: string;
  method: PaymentMethod;
  invoiceId: string;
  amount: number;
}

export enum SiiDocumentType {
  Invoice = 'Factura Electrónica',
  CreditNote = 'Nota de Crédito',
  DebitNote = 'Nota de Débito',
  ShippingGuide = 'Guía de Despacho',
}

export interface SiiDocument {
  id: string;
  clientId: string;
  type: SiiDocumentType;
  folio: number;
  date: string;
  amount: number;
  link: string;
}

// --- POS Types ---
export interface POSSaleItem {
    productId: string;
    warehouseId: string;
    quantity: number;
    unitPrice: number;
}

export interface POSSale {
    id: string;
    items: POSSaleItem[];
    total: number;
    paymentMethod: PaymentMethod;
    createdAt: Date;
}

export interface CashRegisterSession {
    id: string;
    openingTime: Date;
    closingTime?: Date;
    openingBalance: number;
    closingBalance?: number;
    sales: POSSale[];
}

// --- Stock Management Types ---
export enum StockMovementReason {
    InitialStock = 'Stock Inicial',
    POSSale = 'Venta POS',
    InvoiceSale = 'Venta Facturada',
    Purchase = 'Compra a Proveedor',
    Adjustment = 'Ajuste Manual',
    Transfer = 'Traslado entre Bodegas',
}

export interface StockMovement {
    id: string;
    productId: string;
    warehouseId: string;
    quantity: number; // Positive for entry, negative for exit
    reason: StockMovementReason;
    referenceId?: string; // e.g., POS Sale ID or Invoice ID
    createdAt: Date;
}
