
import React, { useState, useMemo } from 'react';
import { Invoice, InvoiceStatus, Client } from '../types';

const mockClients: Client[] = [
    { id: '1', rut: '76.123.456-7', companyName: 'Tech Solutions Inc.', address: 'Av. Providencia 123', website: 'techsolutions.com', phone: '+56912345678', contactName: 'Juan Pérez' },
    { id: '2', rut: '99.876.543-2', companyName: 'Global Web Services', address: 'Calle Falsa 456', website: 'globalweb.com', phone: '+56987654321', contactName: 'Maria Rodriguez' },
];

const mockInvoices: Invoice[] = [
    { id: 'F-001', quoteId: 'Q-001', clientId: '1', status: InvoiceStatus.Paid, createdAt: '2023-10-28', dueDate: '2023-11-28', total: 2400 },
    { id: 'F-002', quoteId: 'Q-002', clientId: '2', status: InvoiceStatus.Sent, createdAt: '2023-10-29', dueDate: '2023-11-29', total: 400 },
];

const getStatusClass = (status: InvoiceStatus) => {
    switch (status) {
        case InvoiceStatus.Draft: return 'bg-slate-200 text-slate-800';
        case InvoiceStatus.Sent: return 'bg-blue-200 text-blue-800';
        case InvoiceStatus.Paid: return 'bg-green-200 text-green-800';
        case InvoiceStatus.Overdue: return 'bg-red-200 text-red-800';
        default: return 'bg-slate-200 text-slate-800';
    }
};

const InvoicesPage: React.FC = () => {
    const [invoices] = useState<Invoice[]>(mockInvoices);
    const [filter, setFilter] = useState('');

    const filteredInvoices = useMemo(() =>
        invoices.filter(inv =>
            inv.id.toLowerCase().includes(filter.toLowerCase()) ||
            mockClients.find(c => c.id === inv.clientId)?.companyName.toLowerCase().includes(filter.toLowerCase())
        ), [invoices, filter]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Facturas</h1>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg"><i className="fas fa-plus mr-2"></i> Nueva Factura</button>
            </div>
            <input type="text" placeholder="Filtrar por ID o cliente..." value={filter} onChange={e => setFilter(e.target.value)} className="w-full p-2 mb-4 border rounded bg-white"/>
            
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full text-slate-600">
                    <thead className="text-slate-700">
                        <tr className="bg-slate-50">
                            <th className="p-3 text-left">ID</th>
                            <th className="p-3 text-left">Cliente</th>
                            <th className="p-3 text-left">Fecha Creación</th>
                            <th className="p-3 text-left">Fecha Venc.</th>
                            <th className="p-3 text-left">Total</th>
                            <th className="p-3 text-left">Estado</th>
                            <th className="p-3 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvoices.map(invoice => (
                            <tr key={invoice.id} className="border-b border-slate-200 hover:bg-slate-50">
                                <td className="p-3 font-bold text-slate-800">{invoice.id}</td>
                                <td className="p-3">{mockClients.find(c => c.id === invoice.clientId)?.companyName}</td>
                                <td className="p-3">{invoice.createdAt}</td>
                                <td className="p-3">{invoice.dueDate}</td>
                                <td className="p-3">${invoice.total.toLocaleString()}</td>
                                <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(invoice.status)}`}>{invoice.status}</span></td>
                                <td className="p-3 space-x-2">
                                    <button className="text-slate-500 hover:text-blue-500"><i className="fas fa-envelope"></i></button>
                                    <button className="text-slate-500 hover:text-red-500"><i className="fas fa-file-pdf"></i></button>
                                    <button className="text-slate-500 hover:text-indigo-500"><i className="fas fa-edit"></i></button>
                                    <button className="text-slate-500 hover:text-red-500"><i className="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredInvoices.length === 0 && <p className="text-center p-6 text-slate-500">No se encontraron facturas.</p>}
            </div>
        </div>
    );
};

export default InvoicesPage;
