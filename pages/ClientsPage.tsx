import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Client } from '../types';
import { mockClients } from '../data/mockData';
import Modal from '../components/Modal';
import ClientForm from '../components/ClientForm';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import Pagination from '../components/Pagination';

const ITEMS_PER_PAGE = 14;

const ClientsPage: React.FC = () => {
    const [clients, setClients] = useState<Client[]>(mockClients);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const filteredClients = useMemo(() => 
        clients.filter(client =>
            client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.contactName.toLowerCase().includes(searchTerm.toLowerCase())
        ), [clients, searchTerm]);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
    const paginatedClients = useMemo(() =>
        filteredClients.slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            currentPage * ITEMS_PER_PAGE
        ), [filteredClients, currentPage]);

    const handleSave = (client: Client) => {
        if (editingClient) {
            setClients(clients.map(c => c.id === client.id ? client : c));
        } else {
            setClients([...clients, { ...client, id: new Date().toISOString() }]);
        }
        setIsFormOpen(false);
        setEditingClient(undefined);
    };

    const handleEdit = (client: Client) => {
        setEditingClient(client);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingClient(undefined);
        setIsFormOpen(true);
    }
    
    const handleConfirmDelete = () => {
        if (clientToDelete) {
            setClients(clients.filter(c => c.id !== clientToDelete.id));
            setClientToDelete(null); 
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Clientes</h1>
                <button onClick={handleAddNew} className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition duration-300 flex items-center">
                    <i className="fas fa-plus mr-2"></i> Agregar Cliente
                </button>
            </div>

            <div className="mb-6 relative">
                 <input
                    type="text"
                    placeholder="Buscar por nombre, RUT o contacto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                 <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">RUT</th>
                            <th scope="col" className="px-6 py-3">Empresa</th>
                            <th scope="col" className="px-6 py-3">Contacto</th>
                            <th scope="col" className="px-6 py-3">Teléfono</th>
                            <th scope="col" className="px-6 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedClients.map(client => (
                            <tr key={client.id} className="bg-white border-b border-slate-200 hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">{client.rut}</td>
                                <td className="px-6 py-4">{client.companyName}</td>
                                <td className="px-6 py-4">{client.contactName}</td>
                                <td className="px-6 py-4">{client.phone}</td>
                                <td className="px-6 py-4 space-x-4">
                                    <Link to={`/clients/${client.id}`} className="text-blue-500 hover:text-blue-700" title="Ver Detalles" aria-label={`Ver detalles de ${client.companyName}`}><i className="fas fa-eye"></i></Link>
                                    <button onClick={() => handleEdit(client)} className="text-indigo-500 hover:text-indigo-700" title="Editar" aria-label={`Editar ${client.companyName}`}><i className="fas fa-edit"></i></button>
                                    <button onClick={() => setClientToDelete(client)} className="text-red-500 hover:text-red-700" title="Eliminar" aria-label={`Eliminar ${client.companyName}`}><i className="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredClients.length === 0 && <p className="text-center p-6 text-slate-500">No se encontraron clientes.</p>}
            </div>

            {filteredClients.length > 0 && totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}

            <Modal 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                title={editingClient ? 'Editar Cliente' : 'Agregar Cliente'}
            >
                <ClientForm 
                    client={editingClient} 
                    onSave={handleSave} 
                    onCancel={() => setIsFormOpen(false)} 
                />
            </Modal>
            
            <DeleteConfirmationModal
                isOpen={!!clientToDelete}
                onClose={() => setClientToDelete(null)}
                onConfirm={handleConfirmDelete}
                itemName={clientToDelete?.companyName || ''}
                itemType="Cliente"
            />
        </div>
    );
};

export default ClientsPage;