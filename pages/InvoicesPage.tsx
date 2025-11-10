

import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Invoice, InvoiceStatus, Client } from '../types';
import { mockClients, mockInvoices as initialMockInvoices } from '../data/mockData';
import Pagination from '../components/Pagination';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import Modal from '../components/Modal';
import InvoiceForm from '../components/InvoiceForm';

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

const InvoicesPage: React.FC = () => {
    const [invoices, setInvoices] = useState<Invoice[]>(initialMockInvoices);
    const [filter, setFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'All'>('All');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | undefined>(undefined);
    const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const location = useLocation();

    const generateNextOrderId = (allInvoices: Invoice[]): string => {
        const lastIdNumber = allInvoices
            .map(inv => parseInt(inv.id.split('-')[1], 10))
            .filter(num => !isNaN(num))
            .sort((a, b) => b - a)[0] || 0;
        return `O-${String(lastIdNumber + 1).padStart(3, '0')}`;
    };

    const handleSave = (invoice: Invoice) => {
        const isEditing = invoices.some(i => i.id === invoice.id);
        if (isEditing) {
            setInvoices(invoices.map(i => i.id === invoice.id ? invoice : i));
        } else {
            const newId = generateNextOrderId(invoices);
            setInvoices([{ ...invoice, id: newId }, ...invoices]);
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

    useEffect(() => {
        setCurrentPage(1);
    }, [filter, statusFilter]);
    
    useEffect(() => {
        if (location.state?.editInvoiceId) {
            const invoiceToEdit = invoices.find(i => i.id === location.state.editInvoiceId);
            if (invoiceToEdit) {
                handleEdit(invoiceToEdit);
                window.history.replaceState({}, document.title);
            }
        }
    }, [location.state, invoices]);

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

    const handleSendEmail = (invoiceId: string) => alert(`Simulando envío por email de la orden ${invoiceId}...`);
    const handleDownloadPdf = (invoiceId: string) => alert(`Simulando descarga de PDF para la orden ${invoiceId}...`);

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
                <h1 className="text-3xl font-bold text-slate-800">Ordenes</h1>
                <button onClick={handleAddNew} className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition duration-300 flex items-center">
                    <i className="fas fa-plus mr-2"></i> Generar Orden
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
                            <th scope="col" className="px-6 py-3">ID Orden</th>
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
                 {filteredInvoices.length === 0 && <p className="text-center p-6 text-slate-500">No se encontraron ordenes.</p>}
            </div>

            {filteredInvoices.length > 0 && totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}

            <Modal
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setEditingInvoice(undefined);
                }}
                title={editingInvoice ? 'Editar Orden' : 'Crear Nueva Orden'}
            >
                <InvoiceForm 
                    invoice={editingInvoice} 
                    onSave={handleSave} 
                    onCancel={() => {
                        setIsFormOpen(false);
                        setEditingInvoice(undefined);
                    }} 
                />
            </Modal>
        
            <DeleteConfirmationModal
                isOpen={!!invoiceToDelete}
                onClose={() => setInvoiceToDelete(null)}
                onConfirm={handleConfirmDelete}
                itemName={invoiceToDelete?.id || ''}
                itemType="Orden"
            />
        </div>
    );
};

export default InvoicesPage;