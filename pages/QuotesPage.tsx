
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Quote, QuoteStatus, Client, Product, QuoteItem, Warehouse } from '../types';
import { mockClients, mockProducts, mockWarehouses, mockQuotes as initialMockQuotes } from '../data/mockData';
import Pagination from '../components/Pagination';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import Modal from '../components/Modal';
import ClientQuoteForm from '../components/QuoteForm'; // Renamed to avoid conflict

const ITEMS_PER_PAGE = 10;

const getStatusClass = (status: QuoteStatus) => {
    switch (status) {
        case QuoteStatus.Draft: return 'bg-gray-100 text-gray-700';
        case QuoteStatus.Sent: return 'bg-blue-100 text-blue-700';
        case QuoteStatus.Accepted: return 'bg-green-100 text-green-700';
        case QuoteStatus.Rejected: return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-700';
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
            (currentItem[field] as any) = Number(value) || 0;
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

    const formInputClasses = "w-full p-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800";
    const itemInputClasses = "w-full p-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";


    return (
        <form onSubmit={handleSubmit} className="flex flex-col" style={{ height: '75vh' }}>
            <div className="flex-grow overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                       <label className="block text-sm font-medium text-gray-600 mb-1">Cliente</label>
                       <select value={clientId} onChange={e => setClientId(e.target.value)} required className={formInputClasses}>
                            <option value="">Seleccionar Cliente</option>
                            {mockClients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                        </select>
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-600 mb-1">Estado</label>
                       <select value={status} onChange={e => setStatus(e.target.value as QuoteStatus)} className={formInputClasses}>
                            {Object.values(QuoteStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                <div className="space-y-4 rounded-lg border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-700">Ítems de la Cotización</h3>
                    <div className="mb-4 relative">
                        <label htmlFor="productSearch" className="block text-sm font-medium text-gray-600 mb-1">Agregar Producto</label>
                        <div className="relative">
                            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input
                                id="productSearch"
                                type="text"
                                value={productSearch}
                                onChange={handleProductSearchChange}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                                placeholder="Buscar por nombre o SKU..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                                autoComplete="off"
                            />
                        </div>
                        {isSearchFocused && productSearch && (
                            <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-300 rounded-b-lg shadow-lg max-h-60 overflow-y-auto mt-1">
                                {searchResults.length > 0 ? (
                                    <ul>
                                        {searchResults.map(product => (
                                            <li
                                                key={product.id}
                                                onClick={() => handleAddItem(product)}
                                                className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                            >
                                                <p className="font-semibold text-gray-800">{product.name}</p>
                                                <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="p-3 text-center text-sm text-gray-500">No se encontraron productos.</div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {items.length > 0 && (
                        <div className="space-y-3">
                             <div className="grid grid-cols-12 gap-x-4 px-2 pb-2 border-b">
                                <label className="col-span-3 text-xs font-medium text-gray-500">Producto</label>
                                <label className="col-span-3 text-xs font-medium text-gray-500">Bodega</label>
                                <label className="col-span-1 text-xs font-medium text-gray-500">Cant.</label>
                                <label className="col-span-2 text-xs font-medium text-gray-500">P. Unitario</label>
                                <label className="col-span-2 text-xs font-medium text-gray-500 text-right">Subtotal</label>
                            </div>
                            {items.map((item, index) => {
                                const product = mockProducts.find(p => p.id === item.productId);
                                if (!product) return null;
                                
                                const availableWarehouses = product.locations;

                                return (
                                    <div key={index} className="grid grid-cols-12 gap-x-4 items-center">
                                        <div className="col-span-3 font-medium text-gray-800 text-sm">{product.name}</div>
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
                                        <div className="col-span-2 text-sm text-gray-600 text-right">${(item.quantity * item.unitPrice).toLocaleString()}</div>
                                        <div className="col-span-1 text-right">
                                            <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50" title="Eliminar ítem"><i className="fas fa-trash-alt text-sm"></i></button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {items.length === 0 && <p className="text-center text-sm text-gray-500 py-4">No hay productos en la cotización.</p>}
                </div>
            </div>
            <div className="mt-auto pt-6 border-t border-gray-200">
                <p className="text-2xl font-bold text-right mb-4 text-gray-800">Total: ${total.toLocaleString()}</p>
                <div className="flex justify-end space-x-4">
                    <button type="button" onClick={onCancel} className="px-6 py-2 bg-white text-gray-700 font-semibold rounded-md border border-gray-300 hover:bg-gray-50 transition-colors">Cancelar</button>
                    <button type="submit" onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors">Guardar Cotización</button>
                </div>
            </div>
        </form>
    );
};


const QuotesPage: React.FC = () => {
    const [quotes, setQuotes] = useState<Quote[]>(initialMockQuotes);
    const [filter, setFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'All'>('All');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingQuote, setEditingQuote] = useState<Quote | undefined>(undefined);
    const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const location = useLocation();

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

    useEffect(() => {
        setCurrentPage(1);
    }, [filter, statusFilter]);

    useEffect(() => {
        if (location.state?.editQuoteId) {
            const quoteToEdit = quotes.find(q => q.id === location.state.editQuoteId);
            if (quoteToEdit) {
                handleEdit(quoteToEdit);
                // Clear state after using it to prevent re-triggering on back navigation
                window.history.replaceState({}, document.title);
            }
        }
    }, [location.state, quotes]);

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

    const filterButtons: { label: string, value: QuoteStatus | 'All' }[] = [
        { label: 'Todos', value: 'All' },
        { label: QuoteStatus.Draft, value: QuoteStatus.Draft },
        { label: QuoteStatus.Sent, value: QuoteStatus.Sent },
        { label: QuoteStatus.Accepted, value: QuoteStatus.Accepted },
        { label: QuoteStatus.Rejected, value: QuoteStatus.Rejected },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Cotizaciones</h1>
                <button onClick={handleAddNew} className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 transition duration-300 flex items-center font-medium text-sm">
                    <i className="fas fa-plus mr-2"></i> Nueva Cotización
                </button>
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-2">
                {filterButtons.map(({ label, value }) => (
                     <button 
                        key={value}
                        onClick={() => setStatusFilter(value)} 
                        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 shadow-sm
                            ${statusFilter === value 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
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
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                 <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 font-semibold">ID Cotización</th>
                            <th scope="col" className="px-6 py-3 font-semibold">Cliente</th>
                            <th scope="col" className="px-6 py-3 font-semibold">Fecha</th>
                            <th scope="col" className="px-6 py-3 font-semibold">Total</th>
                            <th scope="col" className="px-6 py-3 font-semibold">Estado</th>
                            <th scope="col" className="px-6 py-3 font-semibold text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedQuotes.map(quote => (
                            <tr key={quote.id} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{quote.id}</td>
                                <td className="px-6 py-4">{mockClients.find(c => c.id === quote.clientId)?.companyName}</td>
                                <td className="px-6 py-4">{quote.createdAt}</td>
                                <td className="px-6 py-4">${quote.total.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(quote.status)}`}>{quote.status}</span>
                                </td>
                                <td className="px-6 py-4 space-x-4 text-lg text-right">
                                    <button onClick={() => handleSendEmail(quote.id)} title="Enviar por Email" className="text-gray-400 hover:text-blue-500"><i className="fas fa-envelope"></i></button>
                                    <button onClick={() => handleDownloadPdf(quote.id)} title="Descargar PDF" className="text-gray-400 hover:text-red-500"><i className="fas fa-file-pdf"></i></button>
                                    <button onClick={() => handleSendWhatsApp(quote.id)} title="Enviar por WhatsApp" className="text-gray-400 hover:text-green-500"><i className="fab fa-whatsapp"></i></button>
                                    <button onClick={() => handleEdit(quote)} title="Editar" className="text-gray-400 hover:text-indigo-600"><i className="fas fa-edit"></i></button>
                                    <button onClick={() => setQuoteToDelete(quote)} title="Eliminar" className="text-gray-400 hover:text-red-600"><i className="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredQuotes.length === 0 && <p className="text-center p-6 text-gray-500">No se encontraron cotizaciones.</p>}
            </div>

            {filteredQuotes.length > 0 && totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}

            <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingQuote ? 'Editar Cotización' : 'Nueva Cotización'}>
                <QuoteForm quote={editingQuote} onSave={handleSave} onCancel={() => setIsFormOpen(false)} />
            </Modal>
        
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
