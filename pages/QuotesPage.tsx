
import React, { useState, useMemo } from 'react';
import { Quote, QuoteStatus, Client, Product, QuoteItem } from '../types';

// Mock data, in a real app this would come from an API
const mockClients: Client[] = [
    { id: '1', rut: '76.123.456-7', companyName: 'Tech Solutions Inc.', address: 'Av. Providencia 123', website: 'techsolutions.com', phone: '+56912345678', contactName: 'Juan Pérez' },
    { id: '2', rut: '99.876.543-2', companyName: 'Global Web Services', address: 'Calle Falsa 456', website: 'globalweb.com', phone: '+56987654321', contactName: 'Maria Rodriguez' },
];

const mockProducts: Product[] = [
    { id: '1', sku: 'TS-001', imageUrl: '', name: 'Laptop Pro X', price: 1200, warehouseId: '1', stock: 50, description: '' },
    { id: '2', sku: 'TS-002', imageUrl: '', name: 'Wireless Mouse', price: 45, warehouseId: '2', stock: 200, description: '' },
];

const mockQuotes: Quote[] = [
    { id: 'Q-001', clientId: '1', items: [{ productId: '1', quantity: 2, unitPrice: 1200 }], status: QuoteStatus.Sent, createdAt: '2023-10-26', total: 2400 },
    { id: 'Q-002', clientId: '2', items: [{ productId: '2', quantity: 10, unitPrice: 40 }], status: QuoteStatus.Draft, createdAt: '2023-10-27', total: 400 },
];

const getStatusClass = (status: QuoteStatus) => {
    switch (status) {
        case QuoteStatus.Draft: return 'bg-slate-200 text-slate-800';
        case QuoteStatus.Sent: return 'bg-blue-200 text-blue-800';
        case QuoteStatus.Accepted: return 'bg-green-200 text-green-800';
        case QuoteStatus.Rejected: return 'bg-red-200 text-red-800';
        default: return 'bg-slate-200 text-slate-800';
    }
};

const QuoteForm: React.FC<{ quote?: Quote; onSave: (quote: Quote) => void; onCancel: () => void; }> = ({ quote, onSave, onCancel }) => {
    const [clientId, setClientId] = useState(quote?.clientId || '');
    const [items, setItems] = useState<QuoteItem[]>(quote?.items || []);
    const [status, setStatus] = useState<QuoteStatus>(quote?.status || QuoteStatus.Draft);

    const handleAddItem = (productId: string) => {
        const product = mockProducts.find(p => p.id === productId);
        if (product && !items.find(item => item.productId === productId)) {
            setItems([...items, { productId: product.id, quantity: 1, unitPrice: product.price }]);
        }
    };
    
    const handleItemChange = (productId: string, field: 'quantity' | 'unitPrice', value: number) => {
        setItems(items.map(item => item.productId === productId ? { ...item, [field]: value } : item));
    };

    const total = useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0), [items]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientId || items.length === 0) return;
        onSave({ id: quote?.id || `Q-${new Date().getTime()}`, clientId, items, status, createdAt: new Date().toLocaleDateString('en-CA'), total });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
                <h2 className="text-2xl font-bold mb-4 text-slate-800">{quote ? 'Editar Cotización' : 'Nueva Cotización'}</h2>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <select value={clientId} onChange={e => setClientId(e.target.value)} required className="w-full bg-slate-50 p-2 border rounded">
                            <option value="">Seleccionar Cliente</option>
                            {mockClients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                        </select>
                        <select value={status} onChange={e => setStatus(e.target.value as QuoteStatus)} className="w-full bg-slate-50 p-2 border rounded">
                            {Object.values(QuoteStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="font-semibold text-slate-700">Agregar Productos</label>
                        <select onChange={e => handleAddItem(e.target.value)} className="w-full bg-slate-50 p-2 border rounded mt-1">
                            <option>Seleccionar Producto</option>
                            {mockProducts.map(p => <option key={p.id} value={p.id}>{p.name} - ${p.price}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        {items.map(item => {
                            const product = mockProducts.find(p => p.id === item.productId);
                            return (
                                <div key={item.productId} className="grid grid-cols-5 gap-2 items-center p-2 bg-slate-100 rounded">
                                    <span className="col-span-2 text-slate-800">{product?.name}</span>
                                    <input type="number" value={item.quantity} onChange={e => handleItemChange(item.productId, 'quantity', parseInt(e.target.value))} className="w-full p-1 bg-white border rounded"/>
                                    <input type="number" value={item.unitPrice} onChange={e => handleItemChange(item.productId, 'unitPrice', parseFloat(e.target.value))} className="w-full p-1 bg-white border rounded"/>
                                    <span className="text-slate-800">${(item.quantity * item.unitPrice).toLocaleString()}</span>
                                </div>
                            );
                        })}
                    </div>
                </form>
                <div className="mt-auto pt-4 border-t border-slate-200">
                    <p className="text-xl font-bold text-right mb-4 text-slate-800">Total: ${total.toLocaleString()}</p>
                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 rounded">Cancelar</button>
                        <button type="submit" onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded">Guardar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const QuotesPage: React.FC = () => {
    const [quotes, setQuotes] = useState<Quote[]>(mockQuotes);
    const [filter, setFilter] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingQuote, setEditingQuote] = useState<Quote | undefined>(undefined);

    const filteredQuotes = useMemo(() => quotes.filter(q => q.id.toLowerCase().includes(filter.toLowerCase()) || mockClients.find(c => c.id === q.clientId)?.companyName.toLowerCase().includes(filter.toLowerCase())), [quotes, filter]);
    
    const handleSave = (quote: Quote) => {
        if(editingQuote) {
            setQuotes(quotes.map(q => q.id === quote.id ? quote : q));
        } else {
            setQuotes([...quotes, quote]);
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

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Cotizaciones</h1>
                <button onClick={handleAddNew} className="bg-indigo-600 text-white px-4 py-2 rounded-lg"><i className="fas fa-plus mr-2"></i> Nueva Cotización</button>
            </div>
            <input type="text" placeholder="Filtrar por ID o cliente..." value={filter} onChange={e => setFilter(e.target.value)} className="w-full p-2 mb-4 border rounded bg-white"/>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full text-slate-600">
                    <thead className="text-slate-700">
                        <tr className="bg-slate-50">
                            <th className="p-3 text-left">ID</th><th className="p-3 text-left">Cliente</th><th className="p-3 text-left">Fecha</th><th className="p-3 text-left">Total</th><th className="p-3 text-left">Estado</th><th className="p-3 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredQuotes.map(quote => (
                            <tr key={quote.id} className="border-b border-slate-200 hover:bg-slate-50">
                                <td className="p-3 font-bold text-slate-800">{quote.id}</td>
                                <td className="p-3">{mockClients.find(c => c.id === quote.clientId)?.companyName}</td>
                                <td className="p-3">{quote.createdAt}</td>
                                <td className="p-3">${quote.total.toLocaleString()}</td>
                                <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(quote.status)}`}>{quote.status}</span></td>
                                <td className="p-3 space-x-2">
                                    <button onClick={() => alert('Enviar por Email')} className="text-slate-500 hover:text-blue-500"><i className="fas fa-envelope"></i></button>
                                    <button onClick={() => alert('Descargar PDF')} className="text-slate-500 hover:text-red-500"><i className="fas fa-file-pdf"></i></button>
                                    <button onClick={() => alert('Enviar por WhatsApp')} className="text-slate-500 hover:text-green-500"><i className="fab fa-whatsapp"></i></button>
                                    <button onClick={() => handleEdit(quote)} className="text-slate-500 hover:text-indigo-500"><i className="fas fa-edit"></i></button>
                                    <button className="text-slate-500 hover:text-red-500"><i className="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredQuotes.length === 0 && <p className="text-center p-6 text-slate-500">No se encontraron cotizaciones.</p>}
            </div>
            {isFormOpen && <QuoteForm quote={editingQuote} onSave={handleSave} onCancel={() => setIsFormOpen(false)} />}
        </div>
    );
};

export default QuotesPage;
