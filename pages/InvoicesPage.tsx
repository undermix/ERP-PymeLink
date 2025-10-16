import React, { useState, useMemo, useEffect } from 'react';
import { Invoice, InvoiceStatus, Client, Quote, QuoteStatus } from '../types';
import Pagination from '../components/Pagination';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

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

const mockQuotes: Quote[] = [
    { id: 'Q-001', clientId: '1', items: [{ productId: '1', warehouseId: '1', quantity: 2, unitPrice: 1200 }], status: QuoteStatus.Sent, createdAt: '2023-10-26', total: 2400 },
    { id: 'Q-002', clientId: '2', items: [{ productId: '2', warehouseId: '2', quantity: 10, unitPrice: 40 }], status: QuoteStatus.Draft, createdAt: '2023-10-27', total: 400 },
    { id: 'Q-003', clientId: '1', items: [{ productId: '2', warehouseId: '1', quantity: 5, unitPrice: 45 }], status: QuoteStatus.Accepted, createdAt: '2023-10-25', total: 225 },
    { id: 'Q-004', clientId: '3', items: [{ productId: '1', warehouseId: '2', quantity: 1, unitPrice: 1250 }], status: QuoteStatus.Rejected, createdAt: '2023-10-24', total: 1250 },
    { id: 'Q-005', clientId: '4', items: [{ productId: '1', warehouseId: '1', quantity: 5, unitPrice: 1180 }, { productId: '2', warehouseId: '2', quantity: 20, unitPrice: 42 }], status: QuoteStatus.Sent, createdAt: '2023-10-23', total: 6740 },
    { id: 'Q-007', clientId: '6', items: [{ productId: '1', warehouseId: '1', quantity: 10, unitPrice: 1150 }], status: QuoteStatus.Sent, createdAt: '2023-10-21', total: 11500 },
    { id: 'Q-008', clientId: '7', items: [{ productId: '2', warehouseId: '1', quantity: 2, unitPrice: 50 }], status: QuoteStatus.Accepted, createdAt: '2023-10-20', total: 100 },
    { id: 'Q-011', clientId: '10', items: [{ productId: '1', warehouseId: '1', quantity: 1, unitPrice: 1300 }], status: QuoteStatus.Accepted, createdAt: '2023-10-17', total: 1300 },
];

const mockInvoices: Invoice[] = [
    { id: 'F-001', quoteId: 'Q-003', clientId: '1', status: InvoiceStatus.Paid, createdAt: '2023-10-28', dueDate: '2023-11-28', total: 225 },
    { id: 'F-002', quoteId: 'Q-002', clientId: '2', status: InvoiceStatus.Sent, createdAt: '2023-10-29', dueDate: '2023-11-29', total: 400 },
    { id: 'F-003', quoteId: 'Q-008', clientId: '7', status: InvoiceStatus.Paid, createdAt: '2023-10-30', dueDate: '2023-11-30', total: 100 },
    { id: 'F-004', quoteId: 'Q-004', clientId: '4', status: InvoiceStatus.Overdue, createdAt: '2023-09-01', dueDate: '2023-10-01', total: 1250 },
    { id: 'F-005', quoteId: 'Q-005', clientId: '5', status: InvoiceStatus.Sent, createdAt: '2023-11-01', dueDate: '2023-12-01', total: 6740 },
    { id: 'F-006', quoteId: 'Q-006', clientId: '6', status: InvoiceStatus.Draft, createdAt: '2023-11-02', dueDate: '2023-12-02', total: 2000 },
    { id: 'F-007', quoteId: 'Q-011', clientId: '10', status: InvoiceStatus.Paid, createdAt: '2023-10-15', dueDate: '2023-11-15', total: 1300 },
    { id: 'F-008', quoteId: 'Q-008', clientId: '8', status: InvoiceStatus.Sent, createdAt: '2023-11-03', dueDate: '2023-12-03', total: 100 },
    { id: 'F-009', quoteId: 'Q-009', clientId: '9', status: InvoiceStatus.Overdue, createdAt: '2023-09-10', dueDate: '2023-10-10', total: 3660 },
    { id: 'F-010', quoteId: 'Q-010', clientId: '10', status: InvoiceStatus.Paid, createdAt: '2023-10-20', dueDate: '2023-11-20', total: 645 },
    { id: 'F-011', quoteId: 'Q-011', clientId: '11', status: InvoiceStatus.Sent, createdAt: '2023-11-05', dueDate: '2023-12-05', total: 1300 },
    { id: 'F-012', quoteId: 'Q-012', clientId: '12', status: InvoiceStatus.Draft, createdAt: '2023-11-06', dueDate: '2023-12-06', total: 384 },
];

const ITEMS_PER_PAGE = 10;

const getStatusClass = (status: InvoiceStatus) => {
    switch (status) {
        case InvoiceStatus.Draft: return 'bg-slate-100 text-slate-700';
        case InvoiceStatus.Sent: return 'bg-blue-100 text-blue-700';
        case InvoiceStatus.Paid: return 'bg-green-100 text-green-700';
        case InvoiceStatus.Overdue: return 'bg-red-100 text-red-700';
        default: return 'bg-slate-100 text-slate-700';
    }
};

const InvoiceForm: React.FC<{ invoice?: Invoice; onSave: (invoice: Invoice) => void; onCancel: () => void; }> = ({ invoice, onSave, onCancel }) => {
    
    const availableQuotes = useMemo(() => mockQuotes.filter(q => q.status === QuoteStatus.Accepted), []);
    const clientMap = useMemo(() => new Map(mockClients.map(c => [c.id, c.companyName])), []);

    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(() => {
        return invoice ? mockQuotes.find(q => q.id === invoice.quoteId) || null : null;
    });

    const [formState, setFormState] = useState({
        createdAt: invoice?.createdAt || new Date().toLocaleDateString('en-CA'),
        dueDate: invoice?.dueDate || new Date(new Date().setDate(new Date().getDate() + 30)).toLocaleDateString('en-CA'),
        status: invoice?.status || InvoiceStatus.Draft,
    });
    
    const [quoteSearch, setQuoteSearch] = useState('');
    const [searchResults, setSearchResults] = useState<Quote[]>([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const handleQuoteSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value;
        setQuoteSearch(searchTerm);

        if (searchTerm.trim() === '') {
            setSearchResults([]);
            return;
        }
        
        const filtered = availableQuotes.filter(q => {
            const clientName = clientMap.get(q.clientId)?.toLowerCase() || '';
            return q.id.toLowerCase().includes(searchTerm.toLowerCase()) || clientName.includes(searchTerm.toLowerCase());
        });
        setSearchResults(filtered);
    };

    const handleSelectQuote = (quote: Quote) => {
        setSelectedQuote(quote);
        setQuoteSearch('');
        setSearchResults([]);
        setIsSearchFocused(false);
    };
    
    const handleFormStateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedQuote) {
            alert("Por favor, seleccione una cotización para facturar.");
            return;
        }
        onSave({
            id: invoice?.id || `F-${new Date().getTime()}`,
            quoteId: selectedQuote.id,
            clientId: selectedQuote.clientId,
            total: selectedQuote.total,
            ...formState
        });
    };
    
    const formInputClasses = "w-full p-3 bg-slate-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-800">{invoice ? 'Editar Factura' : 'Nueva Factura'}</h2>
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-600"><i className="fas fa-times text-2xl"></i></button>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto py-6 pr-2 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Cotización a Facturar</label>
                        {selectedQuote && !invoice ? (
                            <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                <div>
                                    <p className="font-semibold text-indigo-800">{selectedQuote.id} - {clientMap.get(selectedQuote.clientId)}</p>
                                    <p className="text-sm text-indigo-600">Total: ${selectedQuote.total.toLocaleString()}</p>
                                </div>
                                <button type="button" onClick={() => setSelectedQuote(null)} className="text-indigo-500 hover:text-indigo-700 font-semibold text-sm">Cambiar</button>
                            </div>
                        ) : (
                            <div className="relative">
                                <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10"></i>
                                <input
                                    type="text"
                                    value={quoteSearch}
                                    onChange={handleQuoteSearchChange}
                                    onFocus={() => setIsSearchFocused(true)}
                                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                                    placeholder="Buscar por ID de cotización o cliente..."
                                    className="w-full pl-10 pr-4 py-3 bg-slate-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                                    autoComplete="off"
                                    disabled={!!invoice}
                                />
                                {isSearchFocused && quoteSearch && (
                                    <div className="absolute top-full left-0 right-0 z-20 bg-white border border-slate-300 rounded-b-lg shadow-lg max-h-60 overflow-y-auto mt-1">
                                        {searchResults.length > 0 ? (
                                            <ul>{searchResults.map(quote => (
                                                <li key={quote.id} onClick={() => handleSelectQuote(quote)} className="p-3 hover:bg-indigo-50 cursor-pointer border-b border-slate-100 last:border-b-0">
                                                    <p className="font-semibold text-slate-800">{quote.id} - {clientMap.get(quote.clientId)}</p>
                                                    <p className="text-sm text-slate-500">Total: ${quote.total.toLocaleString()}</p>
                                                </li>))}
                                            </ul>
                                        ) : ( <div className="p-3 text-center text-sm text-slate-500">No se encontraron cotizaciones aceptadas.</div> )}
                                    </div>
                                )}
                            </div>
                        )}
                        {invoice && selectedQuote && (
                            <div className="mt-4 p-3 bg-slate-100 rounded-lg border">
                                <p className="font-semibold text-slate-800">Facturando Cotización: {selectedQuote.id}</p>
                                <p className="text-sm text-slate-600">Cliente: {clientMap.get(selectedQuote.clientId)}</p>
                                <p className="text-sm text-slate-600">Total: ${selectedQuote.total.toLocaleString()}</p>
                            </div>
                        )}
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-sm font-medium text-slate-600 mb-1">Fecha de Creación</label>
                           <input type="date" name="createdAt" value={formState.createdAt} onChange={handleFormStateChange} className={formInputClasses}/>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-600 mb-1">Fecha de Vencimiento</label>
                           <input type="date" name="dueDate" value={formState.dueDate} onChange={handleFormStateChange} className={formInputClasses}/>
                        </div>
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-slate-600 mb-1">Estado</label>
                       <select name="status" value={formState.status} onChange={handleFormStateChange} className={formInputClasses}>
                            {Object.values(InvoiceStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </form>
                <div className="mt-auto pt-6 border-t border-slate-200 flex justify-end space-x-4">
                    <button type="button" onClick={onCancel} className="px-6 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors">Cancelar</button>
                    <button type="submit" onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">Guardar Factura</button>
                </div>
            </div>
        </div>
    );
};


const InvoicesPage: React.FC = () => {
    const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
    const [filter, setFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'All'>('All');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | undefined>(undefined);
    const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [filter, statusFilter]);

    const filteredInvoices = useMemo(() =>
        invoices
            .filter(inv => statusFilter === 'All' || inv.status === statusFilter)
            .filter(inv =>
                inv.id.toLowerCase().includes(filter.toLowerCase()) ||
                mockClients.find(c => c.id === inv.clientId)?.companyName.toLowerCase().includes(filter.toLowerCase())
            ), [invoices, filter, statusFilter]);
    
    const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
    const paginatedInvoices = useMemo(() =>
        filteredInvoices.slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            currentPage * ITEMS_PER_PAGE
        ), [filteredInvoices, currentPage]);

    const handleSave = (invoice: Invoice) => {
        if (editingInvoice) {
            setInvoices(invoices.map(i => i.id === invoice.id ? invoice : i));
        } else {
            setInvoices([invoice, ...invoices]);
        }
        setIsFormOpen(false);
        setEditingInvoice(undefined);
    };

    const handleEdit = (invoice: Invoice) => {
        setEditingInvoice(invoice);
        setIsFormOpen(true);
    };
    
    const handleAddNew = () => {
        setEditingInvoice(undefined);
        setIsFormOpen(true);
    };

    const handleConfirmDelete = () => {
        if (invoiceToDelete) {
            setInvoices(invoices.filter(i => i.id !== invoiceToDelete.id));
            setInvoiceToDelete(null);
        }
    };

    const handleSendEmail = (invoiceId: string) => alert(`Simulando envío por email de la factura ${invoiceId}...`);
    const handleDownloadPdf = (invoiceId: string) => alert(`Simulando descarga de PDF para la factura ${invoiceId}...`);

    const filterButtons: { label: string, value: InvoiceStatus | 'All', activeClass: string }[] = [
        { label: 'Todos', value: 'All', activeClass: 'bg-indigo-600 text-white' },
        { label: InvoiceStatus.Draft, value: InvoiceStatus.Draft, activeClass: 'bg-slate-500 text-white' },
        { label: InvoiceStatus.Sent, value: InvoiceStatus.Sent, activeClass: 'bg-blue-500 text-white' },
        { label: InvoiceStatus.Paid, value: InvoiceStatus.Paid, activeClass: 'bg-green-500 text-white' },
        { label: InvoiceStatus.Overdue, value: InvoiceStatus.Overdue, activeClass: 'bg-red-500 text-white' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Facturas</h1>
                <button onClick={handleAddNew} className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition duration-300 flex items-center">
                    <i className="fas fa-plus mr-2"></i> Nueva Factura
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
                            <th scope="col" className="px-6 py-3">ID Factura</th>
                            <th scope="col" className="px-6 py-3">Cliente</th>
                            <th scope="col" className="px-6 py-3">F. Creación</th>
                            <th scope="col" className="px-6 py-3">F. Venc.</th>
                            <th scope="col" className="px-6 py-3">Total</th>
                            <th scope="col" className="px-6 py-3">Estado</th>
                            <th scope="col" className="px-6 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedInvoices.map(invoice => (
                            <tr key={invoice.id} className="bg-white border-b border-slate-200 hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">{invoice.id}</td>
                                <td className="px-6 py-4">{mockClients.find(c => c.id === invoice.clientId)?.companyName}</td>
                                <td className="px-6 py-4">{invoice.createdAt}</td>
                                <td className="px-6 py-4">{invoice.dueDate}</td>
                                <td className="px-6 py-4">${invoice.total.toLocaleString()}</td>
                                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(invoice.status)}`}>{invoice.status}</span></td>
                                <td className="px-6 py-4 space-x-3 text-lg">
                                    <button onClick={() => handleSendEmail(invoice.id)} title="Enviar por Email" className="text-slate-500 hover:text-blue-500"><i className="fas fa-envelope"></i></button>
                                    <button onClick={() => handleDownloadPdf(invoice.id)} title="Descargar PDF" className="text-slate-500 hover:text-red-500"><i className="fas fa-file-pdf"></i></button>
                                    <button onClick={() => handleEdit(invoice)} title="Editar" className="text-indigo-500 hover:text-indigo-700"><i className="fas fa-edit"></i></button>
                                    <button onClick={() => setInvoiceToDelete(invoice)} title="Eliminar" className="text-red-500 hover:text-red-700"><i className="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredInvoices.length === 0 && <p className="text-center p-6 text-slate-500">No se encontraron facturas.</p>}
            </div>

            {filteredInvoices.length > 0 && totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}

            {isFormOpen && <InvoiceForm invoice={editingInvoice} onSave={handleSave} onCancel={() => setIsFormOpen(false)} />}
        
            <DeleteConfirmationModal
                isOpen={!!invoiceToDelete}
                onClose={() => setInvoiceToDelete(null)}
                onConfirm={handleConfirmDelete}
                itemName={invoiceToDelete?.id || ''}
                itemType="Factura"
            />
        </div>
    );
};

export default InvoicesPage;