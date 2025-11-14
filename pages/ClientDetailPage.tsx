

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Client, Quote, Invoice, QuoteStatus, InvoiceStatus, Transaction, TransactionType, Check, CheckStatus, Payment, PaymentMethod, SiiDocument, StockMovementReason } from '../types';
import { mockClients, mockQuotes, mockTransactions, mockChecks, mockPayments, mockSiiDocs } from '../data/mockData';
import { useInvoices } from '../App';
import { useStock } from '../App';
import Modal from '../components/Modal';
import PaymentForm from '../components/PaymentForm';
import InvoiceForm from '../components/InvoiceForm';
import QuoteForm from '../components/QuoteForm';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const getQuoteStatusClass = (status: QuoteStatus) => {
    switch (status) {
        case QuoteStatus.Draft: return 'bg-gray-100 text-gray-700';
        case QuoteStatus.Sent: return 'bg-blue-100 text-blue-700';
        case QuoteStatus.Accepted: return 'bg-green-100 text-green-700';
        case QuoteStatus.Rejected: return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

const getInvoiceStatusClass = (status: InvoiceStatus) => {
    switch (status) {
        case InvoiceStatus.Draft: return 'bg-gray-100 text-gray-700';
        case InvoiceStatus.Sent: return 'bg-blue-100 text-blue-700';
        case InvoiceStatus.Paid: return 'bg-green-100 text-green-700';
        case InvoiceStatus.Overdue: return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

const getCheckStatusClass = (status: CheckStatus) => {
    switch(status) {
        case CheckStatus.Received: return 'bg-gray-100 text-gray-700';
        case CheckStatus.Deposited: return 'bg-blue-100 text-blue-700';
        case CheckStatus.Cleared: return 'bg-green-100 text-green-700';
        case CheckStatus.Bounced: return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

const getTransactionTypeClass = (type: TransactionType) => {
    switch(type) {
        case TransactionType.Credit: return 'text-green-600';
        case TransactionType.Debit: return 'text-red-600';
        default: return 'text-gray-600';
    }
};


const InfoItem: React.FC<{ icon: string, label: string, value: string | React.ReactNode }> = ({ icon, label, value }) => (
    <div>
        <dt className="text-sm font-medium text-gray-500 flex items-center">
            <i className={`fas ${icon} w-5 text-center text-gray-400 mr-2`}></i>
            {label}
        </dt>
        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 ml-7">{value}</dd>
    </div>
);

type ActiveTab = 'quotes' | 'invoices' | 'transactions' | 'checks' | 'payments' | 'documents';

const ClientDetailPage: React.FC = () => {
    const { clientId } = useParams<{ clientId: string }>();
    const { invoices, saveInvoice, deleteInvoice, addSiiDocumentToInvoice } = useInvoices();
    const { addStockMovement } = useStock();

    const [activeTab, setActiveTab] = useState<ActiveTab>('quotes');
    
    // Manage data in state to allow updates
    const [allQuotes, setAllQuotes] = useState(mockQuotes);
    const [payments, setPayments] = useState(() => mockPayments.filter(p => p.clientId === clientId));
    const [checks, setChecks] = useState(() => mockChecks.filter(c => c.clientId === clientId));
    
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
    const clientInvoices = useMemo(() => invoices.filter(i => i.clientId === clientId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [invoices, clientId]);
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
        const totalPaid = clientPayments.reduce((sum, p) => sum + p.amount, 0);
        const totalDebt = totalBilled - totalPaid;
        return { totalBilled, totalPaid, totalDebt };
    }, [clientInvoices, clientPayments]);

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
    const handleSaveInvoice = (invoice: Invoice) => {
        const oldInvoice = invoices.find(i => i.id === invoice.id);
        
        saveInvoice(invoice);
        
        const wasDraft = oldInvoice ? oldInvoice.status === InvoiceStatus.Draft : true;
        const isNowConfirmed = invoice.status !== InvoiceStatus.Draft;

        if (wasDraft && isNowConfirmed) {
            invoice.items.forEach(item => {
                addStockMovement(
                    item.productId,
                    item.warehouseId,
                    -item.quantity,
                    StockMovementReason.InvoiceSale,
                    invoice.id
                );
            });
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
            deleteInvoice(invoiceToDelete.id);
            setInvoiceToDelete(null);
        }
    };
    
    const handleCreateSiiDoc = (invoiceId: string, docType: string) => {
        addSiiDocumentToInvoice(invoiceId, docType);
        setOpenDropdown(null);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    if (!client) {
        return (
            <div className="text-center p-10">
                <h1 className="text-2xl font-bold text-gray-700 mb-4">Cliente no encontrado</h1>
                <Link to="/clients" className="text-blue-600 hover:underline">
                    <i className="fas fa-arrow-left mr-2"></i>Volver a la lista de Clientes
                </Link>
            </div>
        );
    }

    const tabs: { id: ActiveTab; label: string; count: number; }[] = [
        { id: 'quotes', label: 'Cotizaciones', count: clientQuotes.length },
        { id: 'invoices', label: 'Órdenes', count: clientInvoices.length },
        { id: 'transactions', label: 'Transacciones', count: clientTransactions.length },
        { id: 'checks', label: 'Cheques', count: clientChecks.length },
        { id: 'payments', label: 'Pagos', count: clientPayments.length },
        { id: 'documents', label: 'Documentos SII', count: clientSiiDocs.length },
    ];
    
    const quoteFilterButtons: { label: string, value: QuoteStatus | 'All' }[] = [
        { label: 'Todos', value: 'All' },
        { label: QuoteStatus.Draft, value: QuoteStatus.Draft },
        { label: QuoteStatus.Sent, value: QuoteStatus.Sent },
        { label: QuoteStatus.Accepted, value: QuoteStatus.Accepted },
        { label: QuoteStatus.Rejected, value: QuoteStatus.Rejected },
    ];
    
    const SiiDropdown: React.FC<{ invoice: Invoice }> = ({ invoice }) => (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button 
                type="button" 
                onClick={() => setOpenDropdown(openDropdown === invoice.id ? null : invoice.id)}
                className="inline-flex justify-center items-center w-full rounded-md border border-gray-300 shadow-sm px-3 py-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                SII
                <i className="fas fa-chevron-down -mr-1 ml-2 h-5 w-5" aria-hidden="true"></i>
            </button>
            {openDropdown === invoice.id && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        <a href="#" onClick={(e) => { e.preventDefault(); handleCreateSiiDoc(invoice.id, 'Factura Electrónica')}} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                            <i className="fas fa-file-alt w-5 mr-3 text-gray-400"></i> Factura Electrónica
                        </a>
                        <a href="#" onClick={(e) => { e.preventDefault(); handleCreateSiiDoc(invoice.id, 'Boleta Electrónica')}} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                            <i className="fas fa-file-invoice-dollar w-5 mr-3 text-gray-400"></i> Boleta Electrónica
                        </a>
                        <a href="#" onClick={(e) => { e.preventDefault(); handleCreateSiiDoc(invoice.id, 'Guía Despacho Electrónica')}} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                            <i className="fas fa-file-signature w-5 mr-3 text-gray-400"></i> Guía Despacho Electrónica
                        </a>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div>
            <div className="flex items-center mb-6">
                 <Link to="/clients" className="text-gray-500 hover:text-blue-600 mr-4 p-2 rounded-full hover:bg-gray-200">
                    <i className="fas fa-arrow-left text-xl"></i>
                 </Link>
                 <h1 className="text-3xl font-bold text-gray-800">{client.companyName}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Client Info Card */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-3 mb-4">Datos de Facturación</h2>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                        <InfoItem icon="fa-id-card" label="RUT" value={client.rut} />
                        <InfoItem icon="fa-user" label="Contacto" value={client.contactName} />
                        <InfoItem icon="fa-phone" label="Teléfono" value={client.phone} />
                        <InfoItem icon="fa-map-marker-alt" label="Dirección" value={client.address} />
                         <InfoItem icon="fa-globe" label="Sitio Web" value={
                             <a href={`http://${client.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{client.website}</a>
                         }/>
                    </dl>
                </div>

                {/* Financial Summary Card */}
                <div className="bg-white rounded-lg shadow p-6 space-y-4">
                    <div className="flex items-center">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100 mr-4">
                             <i className="fas fa-file-invoice-dollar text-xl text-blue-500"></i>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Facturado</p>
                            <p className="text-2xl font-bold text-gray-800">${financialSummary.totalBilled.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100 mr-4">
                             <i className="fas fa-check-circle text-xl text-green-500"></i>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Pagado</p>
                            <p className="text-2xl font-bold text-gray-800">${financialSummary.totalPaid.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center">
                         <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${financialSummary.totalDebt > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                             <i className={`fas fa-exclamation-circle text-xl ${financialSummary.totalDebt > 0 ? 'text-red-500' : 'text-gray-500'}`}></i>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Deuda Total</p>
                            <p className="text-2xl font-bold text-gray-800">${financialSummary.totalDebt.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs for Quotes and Invoices */}
            <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200 overflow-x-auto">
                    <nav className="flex space-x-2 px-6 -mb-px" aria-label="Tabs">
                        {tabs.map(tab => (
                             <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)} 
                                className={`px-3 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                               {tab.label} <span className="ml-1 bg-gray-200 text-gray-600 rounded-full px-2 py-0.5 text-xs">{tab.count}</span>
                            </button>
                        ))}
                    </nav>
                </div>
                
                <div className="p-6">
                    {activeTab === 'quotes' && (
                        <div>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    {quoteFilterButtons.map(({ label, value }) => (
                                        <button 
                                            key={value}
                                            onClick={() => setQuoteStatusFilter(value)} 
                                            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-200 shadow-sm ${quoteStatusFilter === value ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={handleAddNewQuote} className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 transition duration-300 flex items-center w-full sm:w-auto justify-center text-sm font-medium">
                                    <i className="fas fa-plus mr-2"></i> Nueva Cotización
                                </button>
                            </div>
                            <div className="mb-6 relative">
                                <input
                                    type="text"
                                    placeholder="Filtrar por ID de cotización..."
                                    value={quoteFilter}
                                    onChange={e => setQuoteFilter(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 font-semibold">ID Cotización</th>
                                            <th scope="col" className="px-6 py-3 font-semibold">Fecha</th>
                                            <th scope="col" className="px-6 py-3 font-semibold">Total</th>
                                            <th scope="col" className="px-6 py-3 font-semibold">Estado</th>
                                            <th scope="col" className="px-6 py-3 font-semibold text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredClientQuotes.map(quote => (
                                            <tr key={quote.id} className="bg-white border-b last:border-b-0 border-gray-200 hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900">{quote.id}</td>
                                                <td className="px-6 py-4">{quote.createdAt}</td>
                                                <td className="px-6 py-4">${quote.total.toLocaleString()}</td>
                                                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getQuoteStatusClass(quote.status)}`}>{quote.status}</span></td>
                                                <td className="px-6 py-4 space-x-4 text-right text-base">
                                                     <button onClick={() => {}} title="Enviar por Email" className="text-gray-400 hover:text-blue-500"><i className="fas fa-envelope"></i></button>
                                                     <button onClick={() => {}} title="Descargar PDF" className="text-gray-400 hover:text-red-500"><i className="fas fa-file-pdf"></i></button>
                                                     <button onClick={() => handleEditQuote(quote)} title="Editar" className="text-gray-400 hover:text-indigo-600"><i className="fas fa-edit"></i></button>
                                                     <button onClick={() => setQuoteToDelete(quote)} title="Eliminar" className="text-gray-400 hover:text-red-600"><i className="fas fa-trash"></i></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredClientQuotes.length === 0 && <p className="text-center py-6 text-gray-500">No hay cotizaciones para este cliente.</p>}
                            </div>
                        </div>
                    )}
                    {activeTab === 'invoices' && (
                         <div>
                            <div className="flex justify-end mb-4">
                                <button onClick={() => { setEditingInvoice(undefined); setIsInvoiceFormOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 transition duration-300 flex items-center text-sm font-medium">
                                    <i className="fas fa-plus mr-2"></i> Generar Orden
                                </button>
                            </div>
                             <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 font-semibold">ID Orden</th>
                                            <th scope="col" className="px-6 py-3 font-semibold">Origen</th>
                                            <th scope="col" className="px-6 py-3 font-semibold">F. Creación</th>
                                            <th scope="col" className="px-6 py-3 font-semibold">F. Venc.</th>
                                            <th scope="col" className="px-6 py-3 font-semibold">Total</th>
                                            <th scope="col" className="px-6 py-3 font-semibold">Estado</th>
                                            <th scope="col" className="px-6 py-3 font-semibold text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clientInvoices.map(invoice => (
                                            <tr key={invoice.id} className={`bg-white border-b last:border-b-0 border-gray-200 hover:bg-gray-50 ${openDropdown === invoice.id ? 'relative z-10' : ''}`}>
                                                <td className="px-6 py-4 font-medium text-gray-900 align-top">
                                                     <div>{invoice.id}</div>
                                                    {invoice.siiDocument && (
                                                        <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            <svg className="mr-1.5 h-2 w-2 text-green-500" fill="currentColor" viewBox="0 0 8 8"><circle cx={4} cy={4} r={3} /></svg>
                                                            {invoice.siiDocument.type} #{invoice.siiDocument.folio}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 align-top">{invoice.origin || 'Manual'}</td>
                                                <td className="px-6 py-4 align-top">{invoice.createdAt}</td>
                                                <td className="px-6 py-4 align-top">{invoice.dueDate}</td>
                                                <td className="px-6 py-4 align-top">${invoice.total.toLocaleString()}</td>
                                                <td className="px-6 py-4 align-top"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getInvoiceStatusClass(invoice.status)}`}>{invoice.status}</span></td>
                                                <td className="px-6 py-4 text-right space-x-2 align-top">
                                                    <SiiDropdown invoice={invoice} />
                                                    <button onClick={() => {}} title="Descargar PDF" className="text-gray-400 hover:text-green-600 p-2"><i className="fas fa-file-pdf"></i></button>
                                                    <button onClick={() => handleEditInvoice(invoice)} className="text-gray-400 hover:text-indigo-600 p-2" title="Editar Orden"><i className="fas fa-edit"></i></button>
                                                    <button onClick={() => setInvoiceToDelete(invoice)} className="text-gray-400 hover:text-red-600 p-2" title="Eliminar Orden"><i className="fas fa-trash"></i></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {clientInvoices.length === 0 && <p className="text-center py-6 text-gray-500">No hay órdenes para este cliente.</p>}
                            </div>
                        </div>
                    )}
                     {activeTab === 'transactions' && (
                        <div className="overflow-x-auto">
                             <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 font-semibold">ID Trans.</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">Fecha</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">Tipo</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">Descripción</th>
                                        <th scope="col" className="px-6 py-3 font-semibold text-right">Monto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clientTransactions.map(trans => (
                                        <tr key={trans.id} className="bg-white border-b last:border-b-0 border-gray-200 hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{trans.id}</td>
                                            <td className="px-6 py-4">{trans.date}</td>
                                            <td className="px-6 py-4">{trans.type}</td>
                                            <td className="px-6 py-4">{trans.description}</td>
                                            <td className={`px-6 py-4 text-right font-semibold ${getTransactionTypeClass(trans.type)}`}>${trans.amount.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                             </table>
                             {clientTransactions.length === 0 && <p className="text-center py-6 text-gray-500">No hay transacciones para este cliente.</p>}
                        </div>
                     )}
                     {activeTab === 'checks' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 font-semibold">Número</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">Banco</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">Monto</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">Fecha Pago</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clientChecks.map(check => (
                                        <tr key={check.id} className="bg-white border-b last:border-b-0 border-gray-200 hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{check.number}</td>
                                            <td className="px-6 py-4">{check.bank}</td>
                                            <td className="px-6 py-4">${check.amount.toLocaleString()}</td>
                                            <td className="px-6 py-4">{check.paymentDate}</td>
                                            <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCheckStatusClass(check.status)}`}>{check.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {clientChecks.length === 0 && <p className="text-center py-6 text-gray-500">No hay cheques registrados para este cliente.</p>}
                        </div>
                     )}
                     {activeTab === 'payments' && (
                        <div>
                            <div className="flex justify-end mb-4">
                                <button onClick={() => setIsPaymentFormOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 transition duration-300 flex items-center text-sm font-medium">
                                    <i className="fas fa-plus mr-2"></i> Registrar Pago
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 font-semibold">ID Pago</th>
                                            <th scope="col" className="px-6 py-3 font-semibold">Fecha</th>
                                            <th scope="col" className="px-6 py-3 font-semibold">Método</th>
                                            <th scope="col" className="px-6 py-3 font-semibold">Orden Asociada</th>
                                            <th scope="col" className="px-6 py-3 font-semibold text-right">Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clientPayments.map(payment => (
                                            <tr key={payment.id} className="bg-white border-b last:border-b-0 border-gray-200 hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900">{payment.id}</td>
                                                <td className="px-6 py-4">{payment.date}</td>
                                                <td className="px-6 py-4">{payment.method}</td>
                                                <td className="px-6 py-4">{payment.invoiceId}</td>
                                                <td className="px-6 py-4 text-right">${payment.amount.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {clientPayments.length === 0 && <p className="text-center py-6 text-gray-500">No hay pagos registrados para este cliente.</p>}
                            </div>
                        </div>
                     )}
                      {activeTab === 'documents' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 font-semibold">Tipo</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">Folio</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">Fecha</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">Monto</th>
                                        <th scope="col" className="px-6 py-3 font-semibold text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clientSiiDocs.map(doc => (
                                        <tr key={doc.id} className="bg-white border-b last:border-b-0 border-gray-200 hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{doc.type}</td>
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
                            {clientSiiDocs.length === 0 && <p className="text-center py-6 text-gray-500">No hay documentos SII para este cliente.</p>}
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
            
            {isQuoteFormOpen && (
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
            )}

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
