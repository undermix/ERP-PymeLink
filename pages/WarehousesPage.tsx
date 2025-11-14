
import React, { useState } from 'react';
import { Warehouse } from '../types';
import { mockWarehouses } from '../data/mockData';
import Modal from '../components/Modal';
import WarehouseForm from '../components/WarehouseForm';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const WarehousesPage: React.FC = () => {
    const [warehouses, setWarehouses] = useState<Warehouse[]>(mockWarehouses);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | undefined>(undefined);
    const [warehouseToDelete, setWarehouseToDelete] = useState<Warehouse | null>(null);

    const handleSave = (warehouse: Warehouse) => {
        if (editingWarehouse) {
            setWarehouses(warehouses.map(w => w.id === warehouse.id ? warehouse : w));
        } else {
            setWarehouses([...warehouses, { ...warehouse, id: new Date().toISOString() }]);
        }
        setIsFormOpen(false);
        setEditingWarehouse(undefined);
    };

    const handleEdit = (warehouse: Warehouse) => {
        setEditingWarehouse(warehouse);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingWarehouse(undefined);
        setIsFormOpen(true);
    };

    const handleConfirmDelete = () => {
        if (warehouseToDelete) {
            setWarehouses(warehouses.filter(w => w.id !== warehouseToDelete.id));
            setWarehouseToDelete(null);
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Bodegas</h1>
                <button onClick={handleAddNew} className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 transition duration-300 flex items-center font-medium text-sm">
                    <i className="fas fa-plus mr-2"></i> Agregar Bodega
                </button>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <ul className="divide-y divide-gray-200">
                    {warehouses.map(wh => (
                        <li key={wh.id} className="p-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
                            <div>
                                <p className="font-semibold text-lg text-gray-800">{wh.name}</p>
                                <p className="text-sm text-gray-500"><i className="fas fa-map-marker-alt mr-2 text-gray-400"></i>{wh.location}</p>
                            </div>
                            <div className="space-x-4">
                                <button onClick={() => handleEdit(wh)} title="Editar" className="text-gray-400 hover:text-indigo-600 text-lg" aria-label={`Editar ${wh.name}`}><i className="fas fa-edit"></i></button>
                                <button onClick={() => setWarehouseToDelete(wh)} title="Eliminar" className="text-gray-400 hover:text-red-600 text-lg" aria-label={`Eliminar ${wh.name}`}><i className="fas fa-trash"></i></button>
                            </div>
                        </li>
                    ))}
                     {warehouses.length === 0 && <p className="text-center p-6 text-gray-500">No hay bodegas registradas.</p>}
                </ul>
            </div>

            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingWarehouse ? 'Editar Bodega' : 'Agregar Bodega'}
            >
                <WarehouseForm
                    warehouse={editingWarehouse}
                    onSave={handleSave}
                    onCancel={() => setIsFormOpen(false)}
                />
            </Modal>

            <DeleteConfirmationModal
                isOpen={!!warehouseToDelete}
                onClose={() => setWarehouseToDelete(null)}
                onConfirm={handleConfirmDelete}
                itemName={warehouseToDelete?.name || ''}
                itemType="Bodega"
            />
        </div>
    );
};

export default WarehousesPage;
