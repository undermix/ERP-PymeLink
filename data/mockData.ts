import { Client, Product, Warehouse, Quote, Invoice, Transaction, Check, Payment, SiiDocument, QuoteStatus, InvoiceStatus, TransactionType, CheckStatus, PaymentMethod, SiiDocumentType, CashRegisterSession, StockMovement } from '../types';

export const mockClients: Client[] = [
    { id: '1', rut: '76.123.456-7', companyName: 'Tech Solutions Inc.', address: 'Av. Providencia 123', website: 'techsolutions.com', phone: '+56 9 1234 5678', contactName: 'Juan Pérez' },
    { id: '2', rut: '99.876.543-2', companyName: 'Global Web Services', address: 'Calle Falsa 456', website: 'globalweb.com', phone: '+56 9 8765 4321', contactName: 'Maria Rodriguez' },
    { id: '3', rut: '88.765.432-1', companyName: 'Innovate Corp', address: 'Av. Vitacura 789', website: 'innovate.cl', phone: '+56 9 1122 3344', contactName: 'Carlos Soto' },
    { id: '4', rut: '77.654.321-K', companyName: 'Digital Flow', address: 'Los Leones 100', website: 'digitalflow.com', phone: '+56 9 5566 7788', contactName: 'Ana Gomez' },
    { id: '5', rut: '66.543.210-9', companyName: 'Marketplace Online', address: 'Moneda 1010', website: 'mponline.cl', phone: '+56 9 9988 7766', contactName: 'Luis Martinez' },
    { id: '6', rut: '91.234.567-8', companyName: 'Logistics Pro', address: 'Ruta 5 Sur Km 100', website: 'logisticspro.com', phone: '+56 9 4433 2211', contactName: 'Sofia Fernandez' },
    { id: '7', rut: '82.345.678-9', companyName: 'Creative Minds', address: 'Merced 300', website: 'creativeminds.com', phone: '+56 9 8877 6655', contactName: 'Diego Lopez' },
    { id: '8', rut: '73.456.789-0', companyName: 'Andes Foods', address: 'Av. Kennedy 5000', website: 'andesfoods.cl', phone: '+56 9 2211 3344', contactName: 'Camila Diaz' },
    { id: '9', rut: '64.567.890-1', companyName: 'Patagonia Exports', address: 'El Bosque Norte 200', website: 'patagoniaexp.com', phone: '+56 9 6655 4433', contactName: 'Javier Morales' },
    { id: '10', rut: '95.678.901-2', companyName: 'Quantum Devs', address: 'Apoquindo 3000', website: 'quantumdevs.io', phone: '+56 9 3344 5566', contactName: 'Valentina Reyes' },
    { id: '11', rut: '86.789.012-3', companyName: 'Health First', address: 'La Dehesa 1234', website: 'healthfirst.cl', phone: '+56 9 7788 9900', contactName: 'Matias Castro' },
    { id: '12', rut: '77.890.123-4', companyName: 'SecureNet', address: 'Bandera 500', website: 'securenet.com', phone: '+56 9 1231 2312', contactName: 'Isidora Silva' },
    { id: '13', rut: '76.123.456-7', companyName: 'Tech Solutions Inc.', address: 'Av. Providencia 123', website: 'techsolutions.com', phone: '+56 9 1234 5678', contactName: 'Juan Pérez' },
    { id: '14', rut: '99.876.543-2', companyName: 'Global Web Services', address: 'Calle Falsa 456', website: 'globalweb.com', phone: '+56 9 8765 4321', contactName: 'Maria Rodriguez' },
    { id: '15', rut: '88.765.432-1', companyName: 'Innovate Corp', address: 'Av. Vitacura 789', website: 'innovate.cl', phone: '+56 9 1122 3344', contactName: 'Carlos Soto' },
    { id: '16', rut: '77.654.321-K', companyName: 'Digital Flow', address: 'Los Leones 100', website: 'digitalflow.com', phone: '+56 9 5566 7788', contactName: 'Ana Gomez' },
    { id: '17', rut: '66.543.210-9', companyName: 'Marketplace Online', address: 'Moneda 1010', website: 'mponline.cl', phone: '+56 9 9988 7766', contactName: 'Luis Martinez' },
];

export const mockProducts: Product[] = [
    { id: '1', sku: 'TS-001', imageUrl: 'https://picsum.photos/seed/p1/400/400', name: 'Laptop Pro X', brand: 'TechBrand', model: 'X-Pro 15', locations: [{ warehouseId: '1', price: 1200, stock: 30 }, { warehouseId: '2', price: 1250, stock: 20 }], description: 'High performance laptop for professionals.' },
    { id: '2', sku: 'TS-002', imageUrl: 'https://picsum.photos/seed/p2/400/400', name: 'Wireless Mouse', brand: 'ClickFast', model: 'CF-200', locations: [{ warehouseId: '1', stock: 150, price: 50 }, { warehouseId: '2', stock: 200, price: 45 }], description: 'Ergonomic wireless mouse.' },
    { id: '3', sku: 'TS-003', imageUrl: 'https://picsum.photos/seed/p3/400/400', name: 'Mechanical Keyboard', brand: 'GamerGear', model: 'Mech-RGB', locations: [{ warehouseId: '1', price: 150, stock: 100 }], description: 'RGB mechanical keyboard for gaming.' },
    { id: '4', sku: 'MON-01', imageUrl: 'https://picsum.photos/seed/p4/400/400', name: '4K UltraWide Monitor', brand: 'ViewSonic', model: 'VX3211-4K-MHD', locations: [{ warehouseId: '1', price: 750, stock: 50 }], description: 'A 32-inch 4K monitor with HDR support.' },
    { id: '5', sku: 'CAM-01', imageUrl: 'https://picsum.photos/seed/p5/400/400', name: 'Webcam HD 1080p', brand: 'Logitech', model: 'C920', locations: [{ warehouseId: '2', price: 80, stock: 150 }], description: 'HD 1080p webcam for video conferencing.' },
    { id: '6', sku: 'HDD-01', imageUrl: 'https://picsum.photos/seed/p6/400/400', name: 'External SSD 1TB', brand: 'Samsung', model: 'T7', locations: [{ warehouseId: '1', price: 110, stock: 80 }, { warehouseId: '2', price: 115, stock: 40 }], description: 'Portable 1TB SSD with fast transfer speeds.' },
    { id: '7', sku: 'PRN-01', imageUrl: 'https://picsum.photos/seed/p7/400/400', name: 'Laser Printer Pro', brand: 'HP', model: 'LaserJet M209dwe', locations: [{ warehouseId: '1', price: 250, stock: 25 }], description: 'Monochrome laser printer for small offices.' },
    { id: '8', sku: 'SPK-01', imageUrl: 'https://picsum.photos/seed/p8/400/400', name: 'Bluetooth Speaker', brand: 'JBL', model: 'Flip 6', locations: [{ warehouseId: '2', price: 130, stock: 300 }], description: 'Portable and waterproof Bluetooth speaker.' },
    { id: '9', sku: 'ROU-01', imageUrl: 'https://picsum.photos/seed/p9/400/400', name: 'WiFi 6 Router', brand: 'TP-Link', model: 'Archer AX10', locations: [{ warehouseId: '1', price: 80, stock: 60 }], description: 'Next-gen WiFi 6 router for faster speeds.' },
    { id: '10', sku: 'USB-01', imageUrl: 'https://picsum.photos/seed/p10/400/400', name: 'USB-C Hub', brand: 'Anker', model: 'PowerExpand+', locations: [{ warehouseId: '2', price: 40, stock: 250 }], description: '7-in-1 USB-C hub with HDMI and SD card reader.' },
    { id: '11', sku: 'HDP-01', imageUrl: 'https://picsum.photos/seed/p11/400/400', name: 'Noise Cancelling Headphones', brand: 'Sony', model: 'WH-1000XM5', locations: [{ warehouseId: '1', price: 400, stock: 70 }], description: 'Industry-leading noise cancelling headphones.' },
    { id: '12', sku: 'ERG-01', imageUrl: 'https://picsum.photos/seed/p12/400/400', name: 'Ergonomic Office Chair', brand: 'Herman Miller', model: 'Aeron', locations: [{ warehouseId: '1', price: 1500, stock: 15 }], description: 'The gold standard in ergonomic seating.' },
    { id: '13', sku: 'UPS-01', imageUrl: 'https://picsum.photos/seed/p13/400/400', name: 'UPS Battery Backup', brand: 'APC', model: 'BE600M1', locations: [{ warehouseId: '2', price: 70, stock: 90 }], description: 'Uninterruptible power supply for essential electronics.' },
];

export const mockWarehouses: Warehouse[] = [
    { id: '1', name: 'Bodega Principal', location: 'Santiago Centro' },
    { id: '2', name: 'Bodega Secundaria', location: 'Pudahuel' },
];

export const mockQuotes: Quote[] = [
    { id: 'Q-001', clientId: '1', items: [{ productId: '1', warehouseId: '1', quantity: 2, unitPrice: 1200 }], status: QuoteStatus.Sent, createdAt: '2023-10-26', total: 2400 },
    { id: 'Q-002', clientId: '2', items: [{ productId: '2', warehouseId: '2', quantity: 10, unitPrice: 40 }], status: QuoteStatus.Draft, createdAt: '2023-10-27', total: 400 },
    { id: 'Q-003', clientId: '1', items: [{ productId: '2', warehouseId: '1', quantity: 5, unitPrice: 45 }], status: QuoteStatus.Accepted, createdAt: '2023-10-25', total: 225 },
    { id: 'Q-004', clientId: '3', items: [{ productId: '1', warehouseId: '2', quantity: 1, unitPrice: 1250 }], status: QuoteStatus.Rejected, createdAt: '2023-10-24', total: 1250 },
    { id: 'Q-005', clientId: '4', items: [{ productId: '1', warehouseId: '1', quantity: 5, unitPrice: 1180 }, { productId: '2', warehouseId: '2', quantity: 20, unitPrice: 42 }], status: QuoteStatus.Sent, createdAt: '2023-10-23', total: 6740 },
    { id: 'Q-006', clientId: '5', items: [{ productId: '2', warehouseId: '2', quantity: 50, unitPrice: 40 }], status: QuoteStatus.Draft, createdAt: '2023-10-22', total: 2000 },
    { id: 'Q-007', clientId: '6', items: [{ productId: '1', warehouseId: '1', quantity: 10, unitPrice: 1150 }], status: QuoteStatus.Sent, createdAt: '2023-10-21', total: 11500 },
    { id: 'Q-008', clientId: '7', items: [{ productId: '2', warehouseId: '1', quantity: 2, unitPrice: 50 }], status: QuoteStatus.Accepted, createdAt: '2023-10-20', total: 100 },
    { id: 'Q-009', clientId: '8', items: [{ productId: '1', warehouseId: '1', quantity: 3, unitPrice: 1220 }], status: QuoteStatus.Draft, createdAt: '2023-10-19', total: 3660 },
    { id: 'Q-010', clientId: '9', items: [{ productId: '2', warehouseId: '2', quantity: 15, unitPrice: 43 }], status: QuoteStatus.Sent, createdAt: '2023-10-18', total: 645 },
    { id: 'Q-011', clientId: '10', items: [{ productId: '1', warehouseId: '1', quantity: 1, unitPrice: 1300 }], status: QuoteStatus.Accepted, createdAt: '2023-10-17', total: 1300 },
    { id: 'Q-012', clientId: '11', items: [{ productId: '2', warehouseId: '2', quantity: 8, unitPrice: 48 }], status: QuoteStatus.Rejected, createdAt: '2023-10-16', total: 384 },
    { id: 'Q-013', clientId: '12', items: [{ productId: '1', warehouseId: '1', quantity: 2, unitPrice: 1200 }, { productId: '2', warehouseId: '2', quantity: 5, unitPrice: 45 }], status: QuoteStatus.Sent, createdAt: '2023-10-15', total: 2625 },
];

export const mockInvoices: Invoice[] = [
    { id: 'O-001', quoteId: 'Q-003', clientId: '1', items: [{ productId: '2', warehouseId: '1', quantity: 5, unitPrice: 45 }], status: InvoiceStatus.Paid, createdAt: '2023-10-28', dueDate: '2023-11-28', total: 225 },
    { id: 'O-002', clientId: '2', items: [{ productId: '2', warehouseId: '2', quantity: 10, unitPrice: 40 }], status: InvoiceStatus.Sent, createdAt: '2023-10-29', dueDate: '2023-11-29', total: 400 },
    { id: 'O-003', quoteId: 'Q-008', clientId: '7', items: [{ productId: '2', warehouseId: '1', quantity: 2, unitPrice: 50 }], status: InvoiceStatus.Paid, createdAt: '2023-10-30', dueDate: '2023-11-30', total: 100 },
    { id: 'O-004', clientId: '1', items: [{ productId: '1', warehouseId: '2', quantity: 1, unitPrice: 1250 }], status: InvoiceStatus.Overdue, createdAt: '2023-09-01', dueDate: '2023-10-01', total: 1250 },
    { id: 'O-005', quoteId: 'Q-005', clientId: '4', items: [{ productId: '1', warehouseId: '1', quantity: 5, unitPrice: 1180 }, { productId: '2', warehouseId: '2', quantity: 20, unitPrice: 42 }], status: InvoiceStatus.Sent, createdAt: '2023-11-01', dueDate: '2023-12-01', total: 6740 },
    { id: 'O-006', clientId: '5', items: [], status: InvoiceStatus.Draft, createdAt: '2023-11-02', dueDate: '2023-12-02', total: 2000 },
    { id: 'O-007', quoteId: 'Q-011', clientId: '10', items: [{ productId: '1', warehouseId: '1', quantity: 1, unitPrice: 1300 }], status: InvoiceStatus.Paid, createdAt: '2023-10-15', dueDate: '2023-11-15', total: 1300 },
    { id: 'O-008', clientId: '6', items: [], status: InvoiceStatus.Sent, createdAt: '2023-11-03', dueDate: '2023-12-03', total: 100 },
    { id: 'O-009', clientId: '8', items: [], status: InvoiceStatus.Overdue, createdAt: '2023-09-10', dueDate: '2023-10-10', total: 3660 },
    { id: 'O-010', clientId: '9', items: [], status: InvoiceStatus.Paid, createdAt: '2023-10-20', dueDate: '2023-11-20', total: 645 },
    { id: 'O-011', clientId: '11', items: [], status: InvoiceStatus.Sent, createdAt: '2023-11-05', dueDate: '2023-12-05', total: 1300 },
    { id: 'O-012', clientId: '12', items: [], status: InvoiceStatus.Draft, createdAt: '2023-11-06', dueDate: '2023-12-06', total: 384 },
];

export const mockTransactions: Transaction[] = [
    { id: 'T-001', clientId: '1', date: '2023-10-28', type: TransactionType.Credit, description: 'Pago orden O-001', amount: 225 },
    { id: 'T-002', clientId: '1', date: '2023-09-01', type: TransactionType.Debit, description: 'Orden O-004', amount: 1250 },
    { id: 'T-003', clientId: '1', date: '2023-11-01', type: TransactionType.Adjustment, description: 'Ajuste por redondeo', amount: -0.5 },
];
export const mockChecks: Check[] = [
    { id: 'CH-001', clientId: '1', number: '12345', bank: 'Banco de Chile', amount: 500, paymentDate: '2023-11-15', status: CheckStatus.Deposited },
    { id: 'CH-002', clientId: '1', number: '12346', bank: 'Santander', amount: 750, paymentDate: '2023-11-30', status: CheckStatus.Received },
];
export const mockPayments: Payment[] = [
    { id: 'P-001', clientId: '1', date: '2023-10-28', method: PaymentMethod.Transfer, invoiceId: 'O-001', amount: 225 },
];
export const mockSiiDocs: SiiDocument[] = [
    { id: 'SII-001', clientId: '1', type: SiiDocumentType.Invoice, folio: 123, date: '2023-10-28', amount: 225, link: '#' },
    { id: 'SII-002', clientId: '1', type: SiiDocumentType.ShippingGuide, folio: 456, date: '2023-10-27', amount: 0, link: '#' },
];

export const mockSessions: CashRegisterSession[] = [
    {
        id: 'S-1721480400000',
        openingTime: new Date('2024-07-20T09:00:00'),
        closingTime: new Date('2024-07-20T17:05:00'),
        openingBalance: 50000,
        closingBalance: 85100,
        sales: [
            { id: 'SALE-1', items: [{ productId: '3', warehouseId: '1', quantity: 1, unitPrice: 150 }], total: 150, paymentMethod: PaymentMethod.CreditCard, createdAt: new Date('2024-07-20T10:15:00') },
            { id: 'SALE-2', items: [{ productId: '2', warehouseId: '1', quantity: 2, unitPrice: 50 }], total: 100, paymentMethod: PaymentMethod.DebitCard, createdAt: new Date('2024-07-20T11:30:00') },
            { id: 'SALE-3', items: [{ productId: '4', warehouseId: '1', quantity: 1, unitPrice: 750 }], total: 750, paymentMethod: PaymentMethod.Cash, createdAt: new Date('2024-07-20T14:00:00') },
        ]
    },
    {
        id: 'S-1721566800000',
        openingTime: new Date('2024-07-21T09:02:00'),
        closingTime: new Date('2024-07-21T17:00:00'),
        openingBalance: 50000,
        closingBalance: 130000,
        sales: [
            { id: 'SALE-4', items: [{ productId: '5', warehouseId: '2', quantity: 1, unitPrice: 80 }], total: 80, paymentMethod: PaymentMethod.Cash, createdAt: new Date('2024-07-21T12:05:00') },
            { id: 'SALE-5', items: [{ productId: '10', warehouseId: '2', quantity: 2, unitPrice: 40 }], total: 80, paymentMethod: PaymentMethod.Transfer, createdAt: new Date('2024-07-21T15:20:00') },
        ]
    }
];

export const mockStockMovements: StockMovement[] = [];
