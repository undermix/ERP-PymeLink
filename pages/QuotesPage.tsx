import React, { useState, useMemo, useEffect } from 'react';
import { Quote, QuoteStatus, Client, Product, QuoteItem, Warehouse } from '../types';
import Pagination from '../components/Pagination';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';


// Mock data, in a real app this would come from an API
const mockClients: Client[] = [
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
];

const mockProducts: Product[] = [
    { id: '1', sku: 'TS-001', imageUrl: '', name: 'Laptop Pro X', brand: 'TechBrand', model: 'X-Pro 15', locations: [{ warehouseId: '1', stock: 30, price: 1200 }, { warehouseId: '2', stock: 20, price: 1250 }], description: 'High performance laptop for professionals.' },
    { id: '2', sku: 'TS-002', imageUrl: '', name: 'Wireless Mouse', brand: 'ClickFast', model: 'CF-200', locations: [{ warehouseId: '1', stock: 150, price: 50 }, { warehouseId: '2', stock: 200, price: 45 }], description: 'Ergonomic wireless mouse.' },
];

const mockWarehouses: Warehouse[] = [
    { id: '1', name: 'Bodega Principal', location: 'Santiago Centro' },
    { id: '2', name: 'Bodega Secundaria', location: 'Pudahuel' },
];

const mockQuotes: Quote[] = [
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

const ITEMS_PER_PAGE = 10;

const getStatusClass = (status: QuoteStatus) => {
    switch (status) {
        case QuoteStatus.Draft: return 'bg-slate-100 text-slate-700';
        case QuoteStatus.Sent: return 'bg-blue-100 text-blue-700';
        case QuoteStatus.Accepted: return 'bg-green-100 text-green-700';
        case QuoteStatus.Rejected: return 'bg-red-100 text-red-700';
        default: return 'bg-slate-100 text-slate-700';
    }
};

const QuoteForm: React.FC<{ quote?: Quote; onSave: (quote: Quote) => void; onCancel: () => void; }> = ({ quote, onSave, onCancel }) => {
    const [clientId, setClientId] = useState(quote?.clientId || '');
    const [items, setItems] = useState<QuoteItem[]>(quote?.items || []);
    const [status, setStatus] = useState<QuoteStatus>(quote?.status || QuoteStatus.Draft);
    const [productSearch, setProductSearch] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const handleAddItem = (product: Product) => {
        if (product && product.locations.length > 0) {
            const firstLocation = product.locations[0];
            setItems(prevItems => [...prevItems, {
                productId: product.id,
                warehouseId: firstLocation.warehouseId,
                quantity: 1,
                unitPrice: firstLocation.price
            }]);
            setProductSearch('');
            setSearchResults([]);
            setIsSearchFocused(false);
        }
    };

    const handleProductSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value;
        setProductSearch(searchTerm);

        if (searchTerm.trim() === '') {
            setSearchResults([]);
            return;
        }

        const filtered = mockProducts.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(filtered);
    };
    
    const handleItemChange = (index: number, field: keyof QuoteItem, value: string | number) => {
        const newItems = [...items];
        const currentItem = { ...newItems[index] };

        if (field === 'warehouseId') {
            const product = mockProducts.find(p => p.id === currentItem.productId);
            const newLocation = product?.locations.find(l => l.warehouseId === value);
            currentItem.warehouseId = value as string;
            currentItem.unitPrice = newLocation?.price || currentItem.unitPrice;
        } else if (field === 'quantity' || field === 'unitPrice') {
            currentItem[field] = Number(value) || 0;
        }
        
        newItems[index] = currentItem;
        setItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const total = useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0), [items]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientId || items.length === 0) {
            alert("Por favor, seleccione un cliente y agregue al menos un producto.");
            return;
        }
        onSave({ id: quote?.id || `Q-${new Date().getTime()}`, clientId, items, status, createdAt: new Date().toLocaleDateString('en-CA'), total });
    };

    const formInputClasses = "w-full p-3 bg-slate-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800";
    const itemInputClasses = "w-full p-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500";


    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-800">{quote ? 'Editar Cotización' : 'Nueva Cotización'}</h2>
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-600"><i className="fas fa-times text-2xl"></i></button>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto py-6 pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                           <label className="block text-sm font-medium text-slate-600 mb-1">Cliente</label>
                           <select value={clientId} onChange={e => setClientId(e.target.value)} required className={formInputClasses}>
                                <option value="">Seleccionar Cliente</option>
                                {mockClients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                            </select>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-600 mb-1">Estado</label>
                           <select value={status} onChange={e => setStatus(e.target.value as QuoteStatus)} className={formInputClasses}>
                                {Object.values(QuoteStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4 rounded-lg border border-slate-200 p-4">
                        <h3 className="font-semibold text-slate-700">Ítems de la Cotización</h3>
                        <div className="mb-4 relative">
                            <label htmlFor="productSearch" className="block text-sm font-medium text-slate-600 mb-1">Agregar Producto</label>
                            <div className="relative">
                                <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                <input
                                    id="productSearch"
                                    type="text"
                                    value={productSearch}
                                    onChange={handleProductSearchChange}
                                    onFocus={() => setIsSearchFocused(true)}
                                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                                    placeholder="Buscar por nombre o SKU..."
                                    className="w-full pl-10 pr-4 py-3 bg-slate-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                                    autoComplete="off"
                                />
                            </div>
                            {isSearchFocused && productSearch && (
                                <div className="absolute top-full left-0 right-0 z-10 bg-white border border-slate-300 rounded-b-lg shadow-lg max-h-60 overflow-y-auto mt-1">
                                    {searchResults.length > 0 ? (
                                        <ul>
                                            {searchResults.map(product => (
                                                <li
                                                    key={product.id}
                                                    onClick={() => handleAddItem(product)}
                                                    className="p-3 hover:bg-indigo-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                                                >
                                                    <p className="font-semibold text-slate-800">{product.name}</p>
                                                    <p className="text-sm text-slate-500">SKU: {product.sku}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="p-3 text-center text-sm text-slate-500">No se encontraron productos.</div>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {items.length > 0 && (
                            <div className="space-y-3">
                                 <div className="grid grid-cols-12 gap-x-4 px-2 pb-2 border-b">
                                    <label className="col-span-3 text-xs font-medium text-slate-500">Producto</label>
                                    <label className="col-span-3 text-xs font-medium text-slate-500">Bodega</label>
                                    <label className="col-span-1 text-xs font-medium text-slate-500">Cant.</label>
                                    <label className="col-span-2 text-xs font-medium text-slate-500">P. Unitario</label>
                                    <label className="col-span-2 text-xs font-medium text-slate-500">Subtotal</label>
                                </div>
                                {items.map((item, index) => {
                                    const product = mockProducts.find(p => p.id === item.productId);
                                    if (!product) return null;
                                    
                                    const availableWarehouses = product.locations;

                                    return (
                                        <div key={index} className="grid grid-cols-12 gap-x-4 items-center">
                                            <div className="col-span-3 font-medium text-slate-800 text-sm">{product.name}</div>
                                            <div className="col-span-3">
                                                <select value={item.warehouseId} onChange={e => handleItemChange(index, 'warehouseId', e.target.value)} className={itemInputClasses}>
                                                    {availableWarehouses.map(loc => {
                                                        const warehouse = mockWarehouses.find(w => w.id === loc.warehouseId);
                                                        return <option key={loc.warehouseId} value={loc.warehouseId}>{warehouse?.name} (Stock: {loc.stock})</option>
                                                    })}
                                                </select>
                                            </div>
                                            <div className="col-span-1">
                                                <input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} min="1" className={itemInputClasses} />
                                            </div>
                                            <div className="col-span-2">
                                                <input type="number" value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', e.target.value)} min="0" className={itemInputClasses} />
                                            </div>
                                            <div className="col-span-2 text-sm text-slate-600 text-right">${(item.quantity * item.unitPrice).toLocaleString()}</div>
                                            <div className="col-span-1 text-right">
                                                <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100" title="Eliminar ítem"><i className="fas fa-trash-alt text-sm"></i></button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {items.length === 0 && <p className="text-center text-sm text-slate-500 py-4">No hay productos en la cotización.</p>}
                    </div>
                </form>
                <div className="mt-auto pt-6 border-t border-slate-200">
                    <p className="text-2xl font-bold text-right mb-4 text-slate-800">Total: ${total.toLocaleString()}</p>
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onCancel} className="px-6 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors">Cancelar</button>
                        <button type="submit" onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">Guardar Cotización</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const QuotesPage: React.FC = () => {
    const [quotes, setQuotes] = useState<Quote[]>(mockQuotes);
    const [filter, setFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'All'>('All');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingQuote, setEditingQuote] = useState<Quote | undefined>(undefined);
    const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [filter, statusFilter]);

    const filteredQuotes = useMemo(() => 
        quotes
            .filter(q => statusFilter === 'All' || q.status === statusFilter)
            .filter(q => 
                q.id.toLowerCase().includes(filter.toLowerCase()) || 
                mockClients.find(c => c.id === q.clientId)?.companyName.toLowerCase().includes(filter.toLowerCase())
            ), 
    [quotes, filter, statusFilter]);
    
    const totalPages = Math.ceil(filteredQuotes.length / ITEMS_PER_PAGE);
    const paginatedQuotes = useMemo(() =>
        filteredQuotes.slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            currentPage * ITEMS_PER_PAGE
        ), [filteredQuotes, currentPage]);

    const handleSave = (quote: Quote) => {
        if(editingQuote) {
            setQuotes(quotes.map(q => q.id === quote.id ? quote : q));
        } else {
            setQuotes([quote, ...quotes]);
        }
        setIsFormOpen(false);
        setEditingQuote(undefined);
    }
    
    const handleEdit = (quote: Quote) => {
        setEditingQuote(quote);
        setIsFormOpen(true);
    }
    
    const handleAddNew = () => {
        setEditingQuote(undefined);
        setIsFormOpen(true);
    }

    const handleConfirmDelete = () => {
        if (quoteToDelete) {
            setQuotes(quotes.filter(q => q.id !== quoteToDelete.id));
            setQuoteToDelete(null); 
        }
    };
    
    const handleSendEmail = (quoteId: string) => alert(`Simulando envío por email de la cotización ${quoteId}...`);
    const handleDownloadPdf = (quoteId: string) => alert(`Simulando descarga de PDF para la cotización ${quoteId}...`);
    const handleSendWhatsApp = (quoteId: string) => alert(`Simulando envío por WhatsApp de la cotización ${quoteId}...`);

    const filterButtons: { label: string, value: QuoteStatus | 'All', activeClass: string }[] = [
        { label: 'Todos', value: 'All', activeClass: 'bg-indigo-600 text-white' },
        { label: QuoteStatus.Draft, value: QuoteStatus.Draft, activeClass: 'bg-slate-500 text-white' },
        { label: QuoteStatus.Sent, value: QuoteStatus.Sent, activeClass: 'bg-blue-500 text-white' },
        { label: QuoteStatus.Accepted, value: QuoteStatus.Accepted, activeClass: 'bg-green-500 text-white' },
        { label: QuoteStatus.Rejected, value: QuoteStatus.Rejected, activeClass: 'bg-red-500 text-white' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Cotizaciones</h1>
                <button onClick={handleAddNew} className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition duration-300 flex items-center">
                    <i className="fas fa-plus mr-2"></i> Nueva Cotización
                </button>
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-2">
                {filterButtons.map(({ label, value, activeClass }) => (
                     <button 
                        key={value}
                        onClick={() => setStatusFilter(value)} 
                        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 shadow-sm
                            ${statusFilter === value 
                                ? activeClass 
                                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

             <div className="mb-6 relative">
                 <input
                    type="text"
                    placeholder="Filtrar por ID o cliente..."
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                 <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            </div>
            <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">ID Cotización</th>
                            <th scope="col" className="px-6 py-3">Cliente</th>
                            <th scope="col" className="px-6 py-3">Fecha</th>
                            <th scope="col" className="px-6 py-3">Total</th>
                            <th scope="col" className="px-6 py-3">Estado</th>
                            <th scope="col" className="px-6 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedQuotes.map(quote => (
                            <tr key={quote.id} className="bg-white border-b border-slate-200 hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">{quote.id}</td>
                                <td className="px-6 py-4">{mockClients.find(c => c.id === quote.clientId)?.companyName}</td>
                                <td className="px-6 py-4">{quote.createdAt}</td>
                                <td className="px-6 py-4">${quote.total.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(quote.status)}`}>{quote.status}</span>
                                </td>
                                <td className="px-6 py-4 space-x-3 text-lg">
                                    <button onClick={() => handleSendEmail(quote.id)} title="Enviar por Email" className="text-slate-500 hover:text-blue-500"><i className="fas fa-envelope"></i></button>
                                    <button onClick={() => handleDownloadPdf(quote.id)} title="Descargar PDF" className="text-slate-500 hover:text-red-500"><i className="fas fa-file-pdf"></i></button>
                                    <button onClick={() => handleSendWhatsApp(quote.id)} title="Enviar por WhatsApp" className="text-slate-500 hover:text-green-500"><i className="fab fa-whatsapp"></i></button>
                                    <button onClick={() => handleEdit(quote)} title="Editar" className="text-indigo-500 hover:text-indigo-700"><i className="fas fa-edit"></i></button>
                                    <button onClick={() => setQuoteToDelete(quote)} title="Eliminar" className="text-red-500 hover:text-red-700"><i className="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredQuotes.length === 0 && <p className="text-center p-6 text-slate-500">No se encontraron cotizaciones.</p>}
            </div>

            {filteredQuotes.length > 0 && totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}

            {isFormOpen && <QuoteForm quote={editingQuote} onSave={handleSave} onCancel={() => setIsFormOpen(false)} />}
        
            <DeleteConfirmationModal
                isOpen={!!quoteToDelete}
                onClose={() => setQuoteToDelete(null)}
                onConfirm={handleConfirmDelete}
                itemName={quoteToDelete?.id || ''}
                itemType="Cotización"
            />
        </div>
    );
};

export default QuotesPage;