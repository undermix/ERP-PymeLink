
import React, { useState } from 'react';
import { Warehouse } from '../types';

interface WarehouseFormProps {
    warehouse?: Warehouse;
    onSave: (warehouse: Warehouse) => void;
    onCancel: () => void;
}

const WarehouseForm: React.FC<WarehouseFormProps> = ({ warehouse, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Omit<Warehouse, 'id'>>({
        name: warehouse?.name || '',
        location: warehouse?.location || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: warehouse?.id || new Date().toISOString() });
    };

    const inputClasses = "w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre Bodega */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1">Nombre de la Bodega</label>
                <div className="relative">
                    <i className="fas fa-warehouse absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} required className={inputClasses} placeholder="Ej: Bodega Central"/>
                </div>
            </div>

             {/* Ubicación */}
            <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-600 mb-1">Ubicación</label>
                <div className="relative">
                    <i className="fas fa-map-marker-alt absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input id="location" type="text" name="location" value={formData.location} onChange={handleChange} required className={inputClasses} placeholder="Ej: Santiago, Chile"/>
                </div>
            </div>
            
            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={onCancel} className="px-6 py-2 bg-white text-gray-700 font-medium text-sm rounded-md border border-gray-300 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-medium text-sm rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Guardar</button>
            </div>
        </form>
    );
};

export default WarehouseForm;
