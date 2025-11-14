
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Invoice, InvoiceStatus, Client, StockMovementReason } from '../types';
import { mockClients } from '../data/mockData';
import { useStock } from '../App';
import { useInvoices } from '../App';
import Pagination from '../components/Pagination';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import Modal from '../components/Modal';
import InvoiceForm from '../components/InvoiceForm';

const ITEMS_PER_PAGE = 10;

const getStatusClass = (status: InvoiceStatus) => {
    switch (status) {
        case InvoiceStatus.Draft: return 'bg-gray-100 text-gray-700';
        case InvoiceStatus.Sent: return 'bg-blue-100 text-blue-700';
        case InvoiceStatus.Paid: return 'bg-green-100 text-green-700';
        case InvoiceStatus.Overdue: return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

const InvoicesPage: React.FC = () => {
    const { invoices, saveInvoice, deleteInvoice, addSiiDocumentToInvoice } = useInvoices();
    const [filter, setFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'All'>('All');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | undefined>(undefined);
    const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const { addStockMovement } = useStock();

    const handleSave = (invoice: Invoice) => {
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

    const filterButtons: { label: string, value: InvoiceStatus | 'All' }[] = [
        { label: 'Todos', value: 'All' },
        { label: InvoiceStatus.Draft, value: InvoiceStatus.Draft },
        { label: InvoiceStatus.Sent, value: InvoiceStatus.Sent },
        { label: InvoiceStatus.Paid, value: InvoiceStatus.Paid },
        { label: InvoiceStatus.Overdue, value: InvoiceStatus.Overdue },
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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Órdenes</h1>
                <button onClick={handleAddNew} className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 transition duration-300 flex items-center font-medium text-sm">
                    <i className="fas fa-plus mr-2"></i> Generar Orden
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
                        {paginatedInvoices.map(invoice => (
                            <tr key={invoice.id} className={`bg-white border-b border-gray-200 hover:bg-gray-50 ${openDropdown === invoice.id ? 'relative z-10' : ''}`}>
                                <td className="px-6 py-4 font-medium text-gray-900 align-top">
                                    <div>{invoice.id}</div>
                                    {invoice.siiDocument && (
                                        <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                             <svg className="mr-1.5 h-2 w-2 text-green-500" fill="currentColor" viewBox="0 0 8 8"><circle cx={4} cy={4} r={3} /></svg>
                                            {invoice.siiDocument.type} #{invoice.siiDocument.folio}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 align-top">{invoice.origin || 'N/A'}</td>
                                <td className="px-6 py-4 align-top">{invoice.createdAt}</td>
                                <td className="px-6 py-4 align-top">{invoice.dueDate}</td>
                                <td className="px-6 py-4 align-top">${invoice.total.toLocaleString()}</td>
                                <td className="px-6 py-4 align-top"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(invoice.status)}`}>{invoice.status}</span></td>
                                <td className="px-6 py-4 space-x-2 text-right align-top">
                                    <SiiDropdown invoice={invoice} />
                                    <button onClick={() => handleDownloadPdf(invoice.id)} title="Descargar PDF" className="text-gray-400 hover:text-green-600 p-2"><i className="fas fa-file-pdf"></i></button>
                                    <button onClick={() => handleEdit(invoice)} title="Editar" className="text-gray-400 hover:text-indigo-600 p-2"><i className="fas fa-edit"></i></button>
                                    <button onClick={() => setInvoiceToDelete(invoice)} title="Eliminar" className="text-gray-400 hover:text-red-600 p-2"><i className="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredInvoices.length === 0 && <p className="text-center p-6 text-gray-500">No se encontraron órdenes.</p>}
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
