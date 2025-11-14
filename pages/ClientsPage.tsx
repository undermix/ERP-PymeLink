
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Client } from '../types';
import { mockClients } from '../data/mockData';
import Modal from '../components/Modal';
import ClientForm from '../components/ClientForm';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import Pagination from '../components/Pagination';

const ITEMS_PER_PAGE = 10;

const ClientsPage: React.FC = () => {
    const [clients, setClients] = useState<Client[]>(mockClients);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
    const [filter, setFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const handleSave = (client: Client) => {
        const isEditing = clients.some(c => c.id === client.id);
        if (isEditing) {
            setClients(clients.map(c => (c.id === client.id ? client : c)));
        } else {
            setClients([client, ...clients]);
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

    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    const filteredClients = useMemo(() =>
        clients.filter(client =>
            client.companyName.toLowerCase().includes(filter.toLowerCase()) ||
            client.rut.includes(filter) ||
            client.contactName.toLowerCase().includes(filter.toLowerCase())
        ), [clients, filter]);
    
    const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
    const paginatedClients = useMemo(() =>
        filteredClients.slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            currentPage * ITEMS_PER_PAGE
        ), [filteredClients, currentPage]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>
                <button onClick={handleAddNew} className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 transition duration-300 flex items-center font-medium text-sm">
                    <i className="fas fa-plus mr-2"></i> Agregar Cliente
                </button>
            </div>

            <div className="mb-6 relative">
                <input
                    type="text"
                    placeholder="Filtrar por nombre, RUT o contacto..."
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
                            <th scope="col" className="px-6 py-3 font-semibold">Empresa</th>
                            <th scope="col" className="px-6 py-3 font-semibold">Contacto</th>
                            <th scope="col" className="px-6 py-3 font-semibold">Teléfono</th>
                            <th scope="col" className="px-6 py-3 font-semibold">RUT</th>
                            <th scope="col" className="px-6 py-3 font-semibold text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedClients.map(client => (
                            <tr key={client.id} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    <Link to={`/client/${client.id}`} className="hover:text-blue-600 hover:underline">
                                        {client.companyName}
                                    </Link>
                                </td>
                                <td className="px-6 py-4">{client.contactName}</td>
                                <td className="px-6 py-4">{client.phone}</td>
                                <td className="px-6 py-4">{client.rut}</td>
                                <td className="px-6 py-4 space-x-4 text-lg text-right">
                                    <button onClick={() => handleEdit(client)} title="Editar" className="text-gray-400 hover:text-indigo-600"><i className="fas fa-edit"></i></button>
                                    <button onClick={() => setClientToDelete(client)} title="Eliminar" className="text-gray-400 hover:text-red-600"><i className="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredClients.length === 0 && <p className="text-center p-6 text-gray-500">No se encontraron clientes.</p>}
            </div>
            
             {totalPages > 1 && (
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
