
import React, { useState, useMemo } from 'react';
import { Quote, QuoteStatus, Client, Product, QuoteItem } from '../types';
import { mockProducts, mockWarehouses } from '../data/mockData';

interface QuoteFormProps {
    quote?: Quote;
    client: Client;
    onSave: (quoteData: Omit<Quote, 'id'>) => void;
    onCancel: () => void;
}

const QuoteForm: React.FC<QuoteFormProps> = ({ quote, client, onSave, onCancel }) => {
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
        if (items.length === 0) {
            alert("Por favor, agregue al menos un producto.");
            return;
        }
        onSave({
            clientId: client.id,
            items,
            status,
            createdAt: quote?.createdAt || new Date().toLocaleDateString('en-CA'),
            total
        });
    };

    const formInputClasses = "w-full p-3 bg-slate-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800";
    const itemInputClasses = "w-full py-1 px-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500";


    return (
        <form onSubmit={handleSubmit} className="flex flex-col" style={{ height: '75vh' }}>
            <div className="flex-grow overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                       <label className="block text-sm font-medium text-slate-600 mb-1">Cliente</label>
                       <input type="text" value={client.companyName} disabled className={`${formInputClasses} bg-slate-200 cursor-not-allowed`} />
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
                                <label className="col-span-2 text-xs font-medium text-slate-500">Cant.</label>
                                <label className="col-span-2 text-xs font-medium text-slate-500">P. Unitario</label>
                                <label className="col-span-1 text-xs font-medium text-slate-500">Subtotal</label>
                                <label className="col-span-1 text-xs font-medium text-slate-500 text-right">Acción</label>
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
                                        <div className="col-span-2">
                                            <input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} min="1" className={itemInputClasses} />
                                        </div>
                                        <div className="col-span-2">
                                            <input type="number" value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', e.target.value)} min="0" className={itemInputClasses} />
                                        </div>
                                        <div className="col-span-1 text-sm text-slate-600 text-right">${(item.quantity * item.unitPrice).toLocaleString()}</div>
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
            </div>
            <div className="mt-auto pt-6 border-t border-slate-200">
                <p className="text-2xl font-bold text-right mb-4 text-slate-800">Total: ${total.toLocaleString()}</p>
                <div className="flex justify-end space-x-4">
                    <button type="button" onClick={onCancel} className="px-6 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors">Cancelar</button>
                    <button type="submit" onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">Guardar Cotización</button>
                </div>
            </div>
        </form>
    );
};

export default QuoteForm;
