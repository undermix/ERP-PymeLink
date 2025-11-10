


import React, { useState, useMemo } from 'react';
import { Invoice, InvoiceStatus, Client, Quote, QuoteStatus, QuoteItem, Product, Warehouse } from '../types';
import { mockClients, mockProducts, mockWarehouses, mockQuotes } from '../data/mockData';


interface InvoiceFormProps {
    invoice?: Invoice;
    client?: Client;
    quotes?: Quote[];
    onSave: (invoiceData: Invoice) => void;
    onCancel: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoice, client, quotes = mockQuotes, onSave, onCancel }) => {
    
    const [creationMode, setCreationMode] = useState<'quote' | 'manual'>(invoice && !invoice.quoteId ? 'manual' : 'quote');
    const [items, setItems] = useState<QuoteItem[]>(invoice?.items || []);
    const [selectedClientId, setSelectedClientId] = useState<string>(client?.id || invoice?.clientId || '');

    const [formState, setFormState] = useState({
        createdAt: invoice?.createdAt || new Date().toLocaleDateString('en-CA'),
        dueDate: invoice?.dueDate || new Date(new Date().setDate(new Date().getDate() + 30)).toLocaleDateString('en-CA'),
        status: invoice?.status || InvoiceStatus.Draft,
    });

    // State for quote selection mode
    const [quoteSearch, setQuoteSearch] = useState('');
    const [quoteSearchResults, setQuoteSearchResults] = useState<Quote[]>([]);
    const [isQuoteSearchFocused, setIsQuoteSearchFocused] = useState(false);
    const [selectedQuoteId, setSelectedQuoteId] = useState<string | undefined>(invoice?.quoteId);

    // State for manual item entry mode
    const [productSearch, setProductSearch] = useState('');
    const [productSearchResults, setProductSearchResults] = useState<Product[]>([]);
    const [isProductSearchFocused, setIsProductSearchFocused] = useState(false);

    const availableQuotes = useMemo(() => {
        const targetClientId = client?.id || selectedClientId;
        return quotes.filter(q => q.status === QuoteStatus.Accepted && q.clientId === targetClientId);
    }, [client, selectedClientId, quotes]);

    const total = useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0), [items]);

    const handleFormStateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectQuote = (quote: Quote) => {
        setSelectedQuoteId(quote.id);
        setItems(quote.items);
        setQuoteSearch('');
        setQuoteSearchResults([]);
        setIsQuoteSearchFocused(false);
    };

    // Item management logic (for manual mode)
    const handleProductSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value;
        setProductSearch(searchTerm);
        if (!searchTerm) {
            setProductSearchResults([]);
            return;
        }
        setProductSearchResults(mockProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())));
    };

    const handleAddItem = (product: Product) => {
        if (product.locations.length > 0) {
            const firstLocation = product.locations[0];
            setItems(prev => [...prev, { productId: product.id, warehouseId: firstLocation.warehouseId, quantity: 1, unitPrice: firstLocation.price }]);
            setProductSearch('');
            setProductSearchResults([]);
            setIsProductSearchFocused(false);
        }
    };
    
    const handleItemChange = (index: number, field: keyof QuoteItem, value: string | number) => {
        const newItems = [...items];
        const currentItem = { ...newItems[index] };
        if (field === 'warehouseId') {
            const product = mockProducts.find(p => p.id === currentItem.productId);
            currentItem.warehouseId = value as string;
            currentItem.unitPrice = product?.locations.find(l => l.warehouseId === value)?.price || currentItem.unitPrice;
        } else {
            (currentItem[field] as any) = Number(value) || 0;
        }
        newItems[index] = currentItem;
        setItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalClientId = client?.id || selectedClientId;
        if (!finalClientId) {
            alert("Por favor, seleccione un cliente.");
            return;
        }
        if (items.length === 0) {
            alert("La orden debe tener al menos un ítem.");
            return;
        }

        onSave({
            clientId: finalClientId,
            items,
            total,
            ...formState,
            quoteId: creationMode === 'quote' ? selectedQuoteId : undefined,
            id: invoice?.id || '',
        });
    };
    
    const inputClasses = "w-full p-3 bg-slate-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800";
    const itemInputClasses = "w-full py-1 px-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-center space-x-4 p-1 bg-slate-100 rounded-lg">
                <button type="button" onClick={() => { setCreationMode('quote'); setItems([]); setSelectedQuoteId(undefined); }} className={`px-4 py-2 text-sm font-semibold rounded-md w-full transition-all ${creationMode === 'quote' ? 'bg-white text-indigo-600 shadow' : 'text-slate-600'}`} disabled={!!invoice}>Desde Cotización</button>
                <button type="button" onClick={() => { setCreationMode('manual'); setItems([]); setSelectedQuoteId(undefined); }} className={`px-4 py-2 text-sm font-semibold rounded-md w-full transition-all ${creationMode === 'manual' ? 'bg-white text-indigo-600 shadow' : 'text-slate-600'}`} disabled={!!invoice}>Entrada Manual</button>
            </div>

            {creationMode === 'quote' ? (
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Cotización Aceptada</label>
                    <div className="relative">
                        <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10"></i>
                        <input type="text" value={quoteSearch} onChange={e => setQuoteSearch(e.target.value)} onFocus={() => setIsQuoteSearchFocused(true)} onBlur={() => setTimeout(() => setIsQuoteSearchFocused(false), 200)} placeholder="Buscar en cotizaciones aceptadas..." className={inputClasses + " pl-10"} autoComplete="off" disabled={!!selectedQuoteId} />
                        {isQuoteSearchFocused && quoteSearch && (
                            <div className="absolute top-full left-0 right-0 z-20 bg-white border border-slate-300 rounded-b-lg shadow-lg max-h-60 overflow-y-auto mt-1">
                                {availableQuotes.filter(q => q.id.toLowerCase().includes(quoteSearch.toLowerCase())).map(quote => (
                                    <li key={quote.id} onClick={() => handleSelectQuote(quote)} className="p-3 hover:bg-indigo-50 cursor-pointer list-none">
                                        <p className="font-semibold text-slate-800">{quote.id} - ${quote.total.toLocaleString()}</p>
                                    </li>
                                ))}
                            </div>
                        )}
                    </div>
                    {selectedQuoteId && <p className="mt-2 text-sm text-slate-600">Seleccionada: <span className="font-semibold">{selectedQuoteId}</span></p>}
                </div>
            ) : (
                <div className="space-y-4">
                    {!client && (
                        <div>
                            <label htmlFor="client-selector" className="block text-sm font-medium text-slate-600 mb-1">Cliente</label>
                            <select id="client-selector" value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} required className={inputClasses}>
                                <option value="">Seleccionar Cliente</option>
                                {mockClients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                            </select>
                        </div>
                    )}
                </div>
            )}
            
            <div className="space-y-4 rounded-lg border border-slate-200 p-4">
                 <h3 className="font-semibold text-slate-700">Ítems de la Orden</h3>
                 {creationMode === 'manual' && (
                     <div className="relative">
                         <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                         <input type="text" value={productSearch} onChange={handleProductSearchChange} onFocus={() => setIsProductSearchFocused(true)} onBlur={() => setTimeout(() => setIsProductSearchFocused(false), 200)} placeholder="Buscar producto por nombre o SKU..." className="w-full pl-10 pr-4 py-3 bg-slate-50 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                         {isProductSearchFocused && productSearch && (
                             <div className="absolute top-full left-0 right-0 z-10 bg-white border border-slate-300 rounded-b-lg shadow-lg max-h-60 overflow-y-auto mt-1">
                                 {productSearchResults.map(product => <li key={product.id} onClick={() => handleAddItem(product)} className="p-3 hover:bg-indigo-50 cursor-pointer list-none">{product.name}</li>)}
                             </div>
                         )}
                     </div>
                 )}
                {items.length > 0 ? (
                    <div className="space-y-3">
                         <div className="hidden md:grid grid-cols-12 gap-x-4 px-2 pb-2 border-b">
                            <label className="col-span-3 text-xs font-medium text-slate-500">Producto</label>
                            <label className="col-span-3 text-xs font-medium text-slate-500">Bodega</label>
                            <label className="col-span-2 text-xs font-medium text-slate-500">Cant.</label>
                            <label className="col-span-2 text-xs font-medium text-slate-500">P. Unitario</label>
                            <label className="col-span-1 text-xs font-medium text-slate-500 text-right">Subtotal</label>
                             <label className="col-span-1 text-xs font-medium text-slate-500 text-right">Acción</label>
                        </div>
                        {items.map((item, index) => {
                            const product = mockProducts.find(p => p.id === item.productId);
                            if (!product) return null;
                            return (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-2 items-center">
                                    <div className="col-span-12 md:col-span-3 font-medium text-slate-800 text-sm">{product.name}</div>
                                    <div className="col-span-12 md:col-span-3"><select value={item.warehouseId} onChange={e => handleItemChange(index, 'warehouseId', e.target.value)} className={itemInputClasses} disabled={creationMode !== 'manual'}>{product.locations.map(loc => <option key={loc.warehouseId} value={loc.warehouseId}>{mockWarehouses.find(w=>w.id === loc.warehouseId)?.name}</option>)}</select></div>
                                    <div className="col-span-6 md:col-span-2"><input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} min="1" className={itemInputClasses} disabled={creationMode !== 'manual'} /></div>
                                    <div className="col-span-6 md:col-span-2"><input type="number" value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', e.target.value)} min="0" className={itemInputClasses} disabled={creationMode !== 'manual'} /></div>
                                    <div className="hidden md:block md:col-span-1 text-sm text-slate-600 text-right">${(item.quantity * item.unitPrice).toLocaleString()}</div>
                                    <div className="col-span-12 md:col-span-1 text-right">{creationMode === 'manual' && <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700" title="Eliminar ítem"><i className="fas fa-trash-alt text-sm"></i></button>}</div>
                                </div>
                            );
                        })}
                        <p className="text-xl font-bold text-right pt-2 text-slate-800">Total: ${total.toLocaleString()}</p>
                    </div>
                ) : <p className="text-center text-sm text-slate-500 py-4">No hay productos en la orden.</p>}
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label htmlFor="createdAt" className="block text-sm font-medium text-slate-600 mb-1">Fecha de Creación</label>
                   <input id="createdAt" type="date" name="createdAt" value={formState.createdAt} onChange={handleFormStateChange} className={inputClasses}/>
                </div>
                <div>
                   <label htmlFor="dueDate" className="block text-sm font-medium text-slate-600 mb-1">Fecha de Vencimiento</label>
                   <input id="dueDate" type="date" name="dueDate" value={formState.dueDate} onChange={handleFormStateChange} className={inputClasses}/>
                </div>
            </div>
            <div>
               <label htmlFor="status" className="block text-sm font-medium text-slate-600 mb-1">Estado</label>
               <select id="status" name="status" value={formState.status} onChange={handleFormStateChange} className={inputClasses}>
                    {Object.values(InvoiceStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={onCancel} className="px-6 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">Guardar Orden</button>
            </div>
        </form>
    );
};

export default InvoiceForm;