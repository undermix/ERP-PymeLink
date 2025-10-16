import React, { useState, useMemo, useEffect } from 'react';
import { Client } from '../types';
import Modal from '../components/Modal';
import ClientForm from '../components/ClientForm';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import Pagination from '../components/Pagination';

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
                                <td className="px-6 py-4 space-x-3">
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