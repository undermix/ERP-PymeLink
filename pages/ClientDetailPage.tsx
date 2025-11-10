


import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Client, Quote, Invoice, QuoteStatus, InvoiceStatus, Transaction, TransactionType, Check, CheckStatus, Payment, PaymentMethod, SiiDocument, SiiDocumentType, QuoteItem } from '../types';
import { mockClients, mockQuotes, mockInvoices, mockTransactions, mockChecks, mockPayments, mockSiiDocs } from '../data/mockData';
import Modal from '../components/Modal';
import PaymentForm from '../components/PaymentForm';
import InvoiceForm from '../components/InvoiceForm';
import QuoteForm from '../components/QuoteForm';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const getQuoteStatusClass = (status: QuoteStatus) => {
    switch (status) {
        case QuoteStatus.Draft: return 'bg-slate-100 text-slate-700';
        case QuoteStatus.Sent: return 'bg-blue-100 text-blue-700';
        case QuoteStatus.Accepted: return 'bg-green-100 text-green-700';
        case QuoteStatus.Rejected: return 'bg-red-100 text-red-700';
        default: return 'bg-slate-100 text-slate-700';
    }
};

const getInvoiceStatusClass = (status: InvoiceStatus) => {
    switch (status) {
        case InvoiceStatus.Draft: return 'bg-slate-100 text-slate-700';
        case InvoiceStatus.Sent: return 'bg-blue-100 text-blue-700';
        case InvoiceStatus.Paid: return 'bg-green-100 text-green-700';
        case InvoiceStatus.Overdue: return 'bg-red-100 text-red-700';
        default: return 'bg-slate-100 text-slate-700';
    }
};

const getCheckStatusClass = (status: CheckStatus) => {
    switch(status) {
        case CheckStatus.Received: return 'bg-slate-100 text-slate-700';
        case CheckStatus.Deposited: return 'bg-blue-100 text-blue-700';
        case CheckStatus.Cleared: return 'bg-green-100 text-green-700';
        case CheckStatus.Bounced: return 'bg-red-100 text-red-700';
        default: return 'bg-slate-100 text-slate-700';
    }
};

const getTransactionTypeClass = (type: TransactionType) => {
    switch(type) {
        case TransactionType.Credit: return 'text-green-600';
        case TransactionType.Debit: return 'text-red-600';
        default: return 'text-slate-600';
    }
};


const InfoItem: React.FC<{ icon: string, label: string, value: string | React.ReactNode }> = ({ icon, label, value }) => (
    <div>
        <dt className="text-sm font-medium text-slate-500 flex items-center">
            <i className={`fas ${icon} w-5 text-center text-slate-400 mr-2`}></i>
            {label}
        </dt>
        <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2 ml-7">{value}</dd>
    </div>
);

type ActiveTab = 'quotes' | 'invoices' | 'transactions' | 'checks' | 'payments' | 'documents';

const ClientDetailPage: React.FC = () => {
    const { clientId } = useParams<{ clientId: string }>();
    const [activeTab, setActiveTab] = useState<ActiveTab>('quotes');
    
    // Manage data in state to allow updates
    const [allQuotes, setAllQuotes] = useState(mockQuotes);
    const [allInvoices, setAllInvoices] = useState(mockInvoices);
    const [payments, setPayments] = useState(() => mockPayments.filter(p => p.clientId === clientId));
    const [checks, setChecks] = useState(() => mockChecks.filter(c => c.clientId === clientId));

    // Form Modals State
    const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
    const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false);
    const [isQuoteFormOpen, setIsQuoteFormOpen] = useState(false);
    const [editingQuote, setEditingQuote] = useState<Quote | undefined>(undefined);
    const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | undefined>(undefined);
    const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

    // Filters for Quotes Tab
    const [quoteFilter, setQuoteFilter] = useState('');
    const [quoteStatusFilter, setQuoteStatusFilter] = useState<QuoteStatus | 'All'>('All');

    const client = useMemo(() => mockClients.find(c => c.id === clientId), [clientId]);
    const clientQuotes = useMemo(() => allQuotes.filter(q => q.clientId === clientId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [allQuotes, clientId]);
    const clientInvoices = useMemo(() => allInvoices.filter(i => i.clientId === clientId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [allInvoices, clientId]);
    const clientTransactions = useMemo(() => mockTransactions.filter(t => t.clientId === clientId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [clientId]);
    const clientChecks = useMemo(() => checks.sort((a,b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()), [checks]);
    const clientPayments = useMemo(() => payments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [payments]);
    const clientSiiDocs = useMemo(() => mockSiiDocs.filter(d => d.clientId === clientId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [clientId]);

    const filteredClientQuotes = useMemo(() =>
        clientQuotes
            .filter(q => quoteStatusFilter === 'All' || q.status === quoteStatusFilter)
            .filter(q => q.id.toLowerCase().includes(quoteFilter.toLowerCase())),
    [clientQuotes, quoteStatusFilter, quoteFilter]);

    const financialSummary = useMemo(() => {
        const totalBilled = clientInvoices.reduce((sum, inv) => sum + inv.total, 0);
        const totalPaid = clientInvoices.filter(inv => inv.status === InvoiceStatus.Paid).reduce((sum, inv) => sum + inv.total, 0);
        const totalDebt = totalBilled - totalPaid;
        return { totalBilled, totalPaid, totalDebt };
    }, [clientInvoices]);

    // Handlers for Quotes
    const generateNextQuoteId = (): string => {
        const lastIdNumber = allQuotes
            .map(q => parseInt(q.id.split('-')[1], 10))
            .filter(num => !isNaN(num))
            .sort((a, b) => b - a)[0] || 0;
        return `Q-${String(lastIdNumber + 1).padStart(3, '0')}`;
    };

    const handleSaveQuote = (quoteData: Omit<Quote, 'id'>) => {
        if (editingQuote) {
            const updatedQuote = { ...quoteData, id: editingQuote.id };
            setAllQuotes(prev => prev.map(q => q.id === editingQuote.id ? updatedQuote : q));
        } else {
            const newQuote = { ...quoteData, id: generateNextQuoteId() };
            setAllQuotes(prev => [newQuote, ...prev]);
        }
        setIsQuoteFormOpen(false);
        setEditingQuote(undefined);
    };

    const handleAddNewQuote = () => {
        setEditingQuote(undefined);
        setIsQuoteFormOpen(true);
    };

    const handleEditQuote = (quote: Quote) => {
        setEditingQuote(quote);
        setIsQuoteFormOpen(true);
    };

    const handleConfirmDeleteQuote = () => {
        if (quoteToDelete) {
            setAllQuotes(prev => prev.filter(q => q.id !== quoteToDelete.id));
            setQuoteToDelete(null);
        }
    };

    // Handlers for Payments
    const handleSavePayment = (payment: Omit<Payment, 'id' | 'clientId'>, checkData?: Omit<Check, 'id' | 'clientId' | 'status'>) => {
        if (!client) return;

        const newPayment: Payment = {
            ...payment,
            id: `P-${Date.now()}`,
            clientId: client.id,
        };
        setPayments(prev => [newPayment, ...prev]);

        if (payment.method === PaymentMethod.Check && checkData) {
            const newCheck: Check = {
                ...checkData,
                id: `CH-${Date.now()}`,
                clientId: client.id,
                status: CheckStatus.Received,
            };
            setChecks(prev => [newCheck, ...prev]);
        }
        
        setIsPaymentFormOpen(false);
    };

    // Handlers for Invoices
    const generateNextOrderId = (allInvoices: Invoice[]): string => {
        const lastIdNumber = allInvoices
            .map(inv => parseInt(inv.id.split('-')[1], 10))
            .filter(num => !isNaN(num))
            .sort((a, b) => b - a)[0] || 0;
        return `O-${String(lastIdNumber + 1).padStart(3, '0')}`;
    };

    const handleSaveInvoice = (invoice: Invoice) => {
        const isEditing = allInvoices.some(i => i.id === invoice.id);
        if (isEditing) {
            setAllInvoices(prev => prev.map(i => (i.id === invoice.id ? invoice : i)));
        } else {
            const newId = generateNextOrderId(allInvoices);
            setAllInvoices(prev => [{ ...invoice, id: newId }, ...prev]);
        }
        setIsInvoiceFormOpen(false);
        setEditingInvoice(undefined);
    };

    const handleEditInvoice = (invoice: Invoice) => {
        setEditingInvoice(invoice);
        setIsInvoiceFormOpen(true);
    };

    const handleConfirmDeleteInvoice = () => {
        if (invoiceToDelete) {
            setAllInvoices(prev => prev.filter(i => i.id !== invoiceToDelete.id));
            setInvoiceToDelete(null);
        }
    };


    if (!client) {
        return (
            <div className="text-center p-10">
                <h1 className="text-2xl font-bold text-slate-700 mb-4">Cliente no encontrado</h1>
                <Link to="/clients" className="text-indigo-600 hover:underline">
                    <i className="fas fa-arrow-left mr-2"></i>Volver a la lista de Clientes
                </Link>
            </div>
        );
    }

    const tabs: { id: ActiveTab; label: string; count: number; }[] = [
        { id: 'quotes', label: 'Cotizaciones', count: clientQuotes.length },
        { id: 'invoices', label: 'Ordenes', count: clientInvoices.length },
        { id: 'transactions', label: 'Transacciones', count: clientTransactions.length },
        { id: 'checks', label: 'Cheques', count: clientChecks.length },
        { id: 'payments', label: 'Pagos', count: clientPayments.length },
        { id: 'documents', label: 'Documentos SII', count: clientSiiDocs.length },
    ];
    
    const quoteFilterButtons: { label: string, value: QuoteStatus | 'All', activeClass: string }[] = [
        { label: 'Todos', value: 'All', activeClass: 'bg-indigo-600 text-white' },
        { label: QuoteStatus.Draft, value: QuoteStatus.Draft, activeClass: 'bg-slate-500 text-white' },
        { label: QuoteStatus.Sent, value: QuoteStatus.Sent, activeClass: 'bg-blue-500 text-white' },
        { label: QuoteStatus.Accepted, value: QuoteStatus.Accepted, activeClass: 'bg-green-500 text-white' },
        { label: QuoteStatus.Rejected, value: QuoteStatus.Rejected, activeClass: 'bg-red-500 text-white' },
    ];

    return (
        <div>
            <div className="flex items-center mb-6">
                 <Link to="/clients" className="text-slate-500 hover:text-indigo-600 mr-4 p-2 rounded-full hover:bg-slate-100">
                    <i className="fas fa-arrow-left text-xl"></i>
                 </Link>
                 <h1 className="text-3xl font-bold text-slate-800">{client.companyName}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Client Info Card */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-3 mb-4">Datos de Facturación</h2>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                        <InfoItem icon="fa-id-card" label="RUT" value={client.rut} />
                        <InfoItem icon="fa-user" label="Contacto" value={client.contactName} />
                        <InfoItem icon="fa-phone" label="Teléfono" value={client.phone} />
                        <InfoItem icon="fa-map-marker-alt" label="Dirección" value={client.address} />
                         <InfoItem icon="fa-globe" label="Sitio Web" value={
                             <a href={`http://${client.website}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{client.website}</a>
                         }/>
                    </dl>
                </div>

                {/* Financial Summary Card */}
                <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
                    <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100 mr-4">
                             <i className="fas fa-file-invoice-dollar text-xl text-blue-500"></i>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total Facturado</p>
                            <p className="text-2xl font-bold text-slate-800">${financialSummary.totalBilled.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100 mr-4">
                             <i className="fas fa-check-circle text-xl text-green-500"></i>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total Pagado</p>
                            <p className="text-2xl font-bold text-slate-800">${financialSummary.totalPaid.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center">
                         <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${financialSummary.totalDebt > 0 ? 'bg-red-100' : 'bg-slate-100'}`}>
                             <i className={`fas fa-exclamation-circle text-xl ${financialSummary.totalDebt > 0 ? 'text-red-500' : 'text-slate-500'}`}></i>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Deuda Total</p>
                            <p className="text-2xl font-bold text-slate-800">${financialSummary.totalDebt.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs for Quotes and Invoices */}
            <div className="bg-white rounded-lg shadow-lg">
                <div className="border-b border-slate-200 overflow-x-auto">
                    <nav className="flex space-x-2 px-6" aria-label="Tabs">
                        {tabs.map(tab => (
                             <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)} 
                                className={`px-3 py-4 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                               {tab.label} ({tab.count})
                            </button>
                        ))}
                    </nav>
                </div>
                
                <div className="p-6">
                    {activeTab === 'quotes' && (
                        <div>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    {quoteFilterButtons.map(({ label, value, activeClass }) => (
                                        <button 
                                            key={value}
                                            onClick={() => setQuoteStatusFilter(value)} 
                                            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-200 shadow-sm ${quoteStatusFilter === value ? activeClass : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={handleAddNewQuote} className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition duration-300 flex items-center w-full sm:w-auto justify-center">
                                    <i className="fas fa-plus mr-2"></i> Nueva Cotización
                                </button>
                            </div>
                            <div className="mb-6 relative">
                                <input
                                    type="text"
                                    placeholder="Filtrar por ID de cotización..."
                                    value={quoteFilter}
                                    onChange={e => setQuoteFilter(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-slate-500">
                                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">ID Cotización</th>
                                            <th scope="col" className="px-6 py-3">Fecha</th>
                                            <th scope="col" className="px-6 py-3">Total</th>
                                            <th scope="col" className="px-6 py-3">Estado</th>
                                            <th scope="col" className="px-6 py-3 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredClientQuotes.map(quote => (
                                            <tr key={quote.id} className="bg-white border-b last:border-b-0 border-slate-200 hover:bg-slate-50">
                                                <td className="px-6 py-4 font-medium text-slate-900">{quote.id}</td>
                                                <td className="px-6 py-4">{quote.createdAt}</td>
                                                <td className="px-6 py-4">${quote.total.toLocaleString()}</td>
                                                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getQuoteStatusClass(quote.status)}`}>{quote.status}</span></td>
                                                <td className="px-6 py-4 space-x-4 text-right">
                                                     <button onClick={() => {}} title="Enviar por Email" className="text-slate-500 hover:text-blue-500"><i className="fas fa-envelope"></i></button>
                                                     <button onClick={() => {}} title="Descargar PDF" className="text-slate-500 hover:text-red-500"><i className="fas fa-file-pdf"></i></button>
                                                     <button onClick={() => handleEditQuote(quote)} title="Editar" className="text-indigo-500 hover:text-indigo-700"><i className="fas fa-edit"></i></button>
                                                     <button onClick={() => setQuoteToDelete(quote)} title="Eliminar" className="text-red-500 hover:text-red-700"><i className="fas fa-trash"></i></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredClientQuotes.length === 0 && <p className="text-center py-6 text-slate-500">No hay cotizaciones para este cliente.</p>}
                            </div>
                        </div>
                    )}
                    {activeTab === 'invoices' && (
                         <div>
                            <div className="flex justify-end mb-4">
                                <button onClick={() => { setEditingInvoice(undefined); setIsInvoiceFormOpen(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition duration-300 flex items-center">
                                    <i className="fas fa-plus mr-2"></i> Generar Orden
                                </button>
                            </div>
                             <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-slate-500">
                                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">ID Orden</th>
                                            <th scope="col" className="px-6 py-3">Origen</th>
                                            <th scope="col" className="px-6 py-3">F. Creación</th>
                                            <th scope="col" className="px-6 py-3">F. Venc.</th>
                                            <th scope="col" className="px-6 py-3">Total</th>
                                            <th scope="col" className="px-6 py-3">Estado</th>
                                            <th scope="col" className="px-6 py-3 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clientInvoices.map(invoice => (
                                            <tr key={invoice.id} className="bg-white border-b last:border-b-0 border-slate-200 hover:bg-slate-50">
                                                <td className="px-6 py-4 font-medium text-slate-900">{invoice.id}</td>
                                                <td className="px-6 py-4">{invoice.quoteId || 'Manual'}</td>
                                                <td className="px-6 py-4">{invoice.createdAt}</td>
                                                <td className="px-6 py-4">{invoice.dueDate}</td>
                                                <td className="px-6 py-4">${invoice.total.toLocaleString()}</td>
                                                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getInvoiceStatusClass(invoice.status)}`}>{invoice.status}</span></td>
                                                <td className="px-6 py-4 text-right space-x-4">
                                                    <button onClick={() => handleEditInvoice(invoice)} className="text-indigo-500 hover:text-indigo-700" title="Editar Orden">
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button onClick={() => setInvoiceToDelete(invoice)} className="text-red-500 hover:text-red-700" title="Eliminar Orden">
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {clientInvoices.length === 0 && <p className="text-center py-6 text-slate-500">No hay ordenes para este cliente.</p>}
                            </div>
                        </div>
                    )}
                     {activeTab === 'transactions' && (
                        <div className="overflow-x-auto">
                             <table className="w-full text-sm text-left text-slate-500">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">ID Trans.</th>
                                        <th scope="col" className="px-6 py-3">Fecha</th>
                                        <th scope="col" className="px-6 py-3">Tipo</th>
                                        <th scope="col" className="px-6 py-3">Descripción</th>
                                        <th scope="col" className="px-6 py-3 text-right">Monto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clientTransactions.map(trans => (
                                        <tr key={trans.id} className="bg-white border-b last:border-b-0 border-slate-200 hover:bg-slate-50">
                                            <td className="px-6 py-4 font-medium text-slate-900">{trans.id}</td>
                                            <td className="px-6 py-4">{trans.date}</td>
                                            <td className="px-6 py-4">{trans.type}</td>
                                            <td className="px-6 py-4">{trans.description}</td>
                                            <td className={`px-6 py-4 text-right font-semibold ${getTransactionTypeClass(trans.type)}`}>${trans.amount.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                             </table>
                             {clientTransactions.length === 0 && <p className="text-center py-6 text-slate-500">No hay transacciones para este cliente.</p>}
                        </div>
                     )}
                     {activeTab === 'checks' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-500">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Número</th>
                                        <th scope="col" className="px-6 py-3">Banco</th>
                                        <th scope="col" className="px-6 py-3">Monto</th>
                                        <th scope="col" className="px-6 py-3">Fecha Pago</th>
                                        <th scope="col" className="px-6 py-3">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clientChecks.map(check => (
                                        <tr key={check.id} className="bg-white border-b last:border-b-0 border-slate-200 hover:bg-slate-50">
                                            <td className="px-6 py-4 font-medium text-slate-900">{check.number}</td>
                                            <td className="px-6 py-4">{check.bank}</td>
                                            <td className="px-6 py-4">${check.amount.toLocaleString()}</td>
                                            <td className="px-6 py-4">{check.paymentDate}</td>
                                            <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCheckStatusClass(check.status)}`}>{check.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {clientChecks.length === 0 && <p className="text-center py-6 text-slate-500">No hay cheques registrados para este cliente.</p>}
                        </div>
                     )}
                     {activeTab === 'payments' && (
                        <div>
                            <div className="flex justify-end mb-4">
                                <button onClick={() => setIsPaymentFormOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition duration-300 flex items-center">
                                    <i className="fas fa-plus mr-2"></i> Registrar Pago
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-slate-500">
                                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">ID Pago</th>
                                            <th scope="col" className="px-6 py-3">Fecha</th>
                                            <th scope="col" className="px-6 py-3">Método</th>
                                            <th scope="col" className="px-6 py-3">Orden Asociada</th>
                                            <th scope="col" className="px-6 py-3 text-right">Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clientPayments.map(payment => (
                                            <tr key={payment.id} className="bg-white border-b last:border-b-0 border-slate-200 hover:bg-slate-50">
                                                <td className="px-6 py-4 font-medium text-slate-900">{payment.id}</td>
                                                <td className="px-6 py-4">{payment.date}</td>
                                                <td className="px-6 py-4">{payment.method}</td>
                                                <td className="px-6 py-4">{payment.invoiceId}</td>
                                                <td className="px-6 py-4 text-right">${payment.amount.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {clientPayments.length === 0 && <p className="text-center py-6 text-slate-500">No hay pagos registrados para este cliente.</p>}
                            </div>
                        </div>
                     )}
                      {activeTab === 'documents' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-500">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Tipo</th>
                                        <th scope="col" className="px-6 py-3">Folio</th>
                                        <th scope="col" className="px-6 py-3">Fecha</th>
                                        <th scope="col" className="px-6 py-3">Monto</th>
                                        <th scope="col" className="px-6 py-3 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clientSiiDocs.map(doc => (
                                        <tr key={doc.id} className="bg-white border-b last:border-b-0 border-slate-200 hover:bg-slate-50">
                                            <td className="px-6 py-4 font-medium text-slate-900">{doc.type}</td>
                                            <td className="px-6 py-4">{doc.folio}</td>
                                            <td className="px-6 py-4">{doc.date}</td>
                                            <td className="px-6 py-4">${doc.amount.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <a href={doc.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700" title="Descargar Documento">
                                                    <i className="fas fa-download"></i>
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {clientSiiDocs.length === 0 && <p className="text-center py-6 text-slate-500">No hay documentos SII para este cliente.</p>}
                        </div>
                     )}
                </div>
            </div>
            
            <Modal 
                isOpen={isPaymentFormOpen} 
                onClose={() => setIsPaymentFormOpen(false)} 
                title="Registrar Nuevo Pago"
            >
                <PaymentForm 
                    client={client} 
                    unpaidInvoices={clientInvoices.filter(inv => inv.status !== InvoiceStatus.Paid)}
                    onSave={handleSavePayment} 
                    onCancel={() => setIsPaymentFormOpen(false)} 
                />
            </Modal>
            
            <Modal 
                isOpen={isInvoiceFormOpen} 
                onClose={() => {
                    setIsInvoiceFormOpen(false);
                    setEditingInvoice(undefined);
                }} 
                title={editingInvoice ? 'Editar Orden' : 'Crear Nueva Orden'}
            >
                <InvoiceForm 
                    client={client} 
                    invoice={editingInvoice}
                    quotes={allQuotes}
                    onSave={handleSaveInvoice} 
                    onCancel={() => {
                        setIsInvoiceFormOpen(false);
                        setEditingInvoice(undefined);
                    }} 
                />
            </Modal>
            
            <Modal 
                isOpen={isQuoteFormOpen} 
                onClose={() => setIsQuoteFormOpen(false)} 
                title={editingQuote ? 'Editar Cotización' : 'Nueva Cotización'}
            >
                <QuoteForm 
                    client={client} 
                    quote={editingQuote}
                    onSave={handleSaveQuote} 
                    onCancel={() => setIsQuoteFormOpen(false)} 
                />
            </Modal>

            <DeleteConfirmationModal
                isOpen={!!quoteToDelete}
                onClose={() => setQuoteToDelete(null)}
                onConfirm={handleConfirmDeleteQuote}
                itemName={quoteToDelete?.id || ''}
                itemType="Cotización"
            />

            <DeleteConfirmationModal
                isOpen={!!invoiceToDelete}
                onClose={() => setInvoiceToDelete(null)}
                onConfirm={handleConfirmDeleteInvoice}
                itemName={invoiceToDelete?.id || ''}
                itemType="Orden"
            />
        </div>
    );
};

export default ClientDetailPage;