
import React, { useState, useMemo } from 'react';
import { Client } from '../types';

const mockClients: Client[] = [
    { id: '1', rut: '76.123.456-7', companyName: 'Tech Solutions Inc.', address: 'Av. Providencia 123', website: 'techsolutions.com', phone: '+56912345678', contactName: 'Juan Pérez' },
    { id: '2', rut: '99.876.543-2', companyName: 'Global Web Services', address: 'Calle Falsa 456', website: 'globalweb.com', phone: '+56987654321', contactName: 'Maria Rodriguez' },
];

// Basic RUT validation (Chile)
const validateRut = (rut: string): boolean => {
    // FIX: The original code performed arithmetic on `rutBody`, which is a string, causing a type error.
    // The logic is updated to use a number for calculations and to correctly handle RUTs that contain dots.
    const cleanRut = rut.replace(/\./g, '');
    if (!/^[0-9]+-[0-9kK]{1}$/.test(cleanRut)) return false;
    let tmp = cleanRut.split('-');
    let digv = tmp[1];
    let rutBody = tmp[0];
    if (digv === 'K') digv = 'k';

    let M = 0, S = 1;
    let rutBodyNum = parseInt(rutBody, 10);
    for (; rutBodyNum; rutBodyNum = Math.floor(rutBodyNum / 10)) {
        S = (S + rutBodyNum % 10 * (9 - M++ % 6)) % 11;
    }
    const calculatedDigv = S ? S - 1 : 'k';
    return calculatedDigv.toString() === digv.toLowerCase();
};


const ClientForm: React.FC<{ client?: Client; onSave: (client: Client) => void; onCancel: () => void; }> = ({ client, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Omit<Client, 'id'>>({
        rut: client?.rut || '',
        companyName: client?.companyName || '',
        address: client?.address || '',
        website: client?.website || '',
        phone: client?.phone || '',
        contactName: client?.contactName || '',
    });
    const [rutError, setRutError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'rut') {
            if (value && !validateRut(value)) {
                setRutError('RUT inválido. Formato: XX.XXX.XXX-X');
            } else {
                setRutError('');
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.rut && !validateRut(formData.rut)) {
            setRutError('No se puede guardar con un RUT inválido.');
            return;
        }
        onSave({ ...formData, id: client?.id || new Date().toISOString() });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-slate-800">{client ? 'Editar Cliente' : 'Agregar Cliente'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600">RUT</label>
                            <input type="text" name="rut" value={formData.rut} onChange={handleChange} placeholder="76.123.456-7" className="mt-1 block w-full bg-slate-50 border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                             {rutError && <p className="text-red-500 text-xs mt-1">{rutError}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Nombre Empresa</label>
                            <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required className="mt-1 block w-full bg-slate-50 border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Dirección</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full bg-slate-50 border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Sitio Web</label>
                            <input type="text" name="website" value={formData.website} onChange={handleChange} placeholder="ejemplo.com" className="mt-1 block w-full bg-slate-50 border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-600">Teléfono</label>
                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full bg-slate-50 border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Nombre Contacto</label>
                        <input type="text" name="contactName" value={formData.contactName} onChange={handleChange} required className="mt-1 block w-full bg-slate-50 border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ClientsPage: React.FC = () => {
    const [clients, setClients] = useState<Client[]>(mockClients);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);

    const filteredClients = useMemo(() => 
        clients.filter(client =>
            client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.contactName.toLowerCase().includes(searchTerm.toLowerCase())
        ), [clients, searchTerm]);

    const handleSave = (client: Client) => {
        if (editingClient) {
            setClients(clients.map(c => c.id === client.id ? client : c));
        } else {
            setClients([...clients, client]);
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
                        {filteredClients.map(client => (
                            <tr key={client.id} className="bg-white border-b border-slate-200 hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">{client.rut}</td>
                                <td className="px-6 py-4">{client.companyName}</td>
                                <td className="px-6 py-4">{client.contactName}</td>
                                <td className="px-6 py-4">{client.phone}</td>
                                <td className="px-6 py-4 space-x-3">
                                    <button onClick={() => handleEdit(client)} className="text-indigo-500 hover:text-indigo-700"><i className="fas fa-edit"></i></button>
                                    <button className="text-red-500 hover:text-red-700"><i className="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredClients.length === 0 && <p className="text-center p-6 text-slate-500">No se encontraron clientes.</p>}
            </div>

            {isFormOpen && <ClientForm client={editingClient} onSave={handleSave} onCancel={() => setIsFormOpen(false)} />}
        </div>
    );
};

export default ClientsPage;
