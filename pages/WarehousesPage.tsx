
import React, { useState } from 'react';
import { Warehouse } from '../types';

const mockWarehouses: Warehouse[] = [
    { id: '1', name: 'Bodega Principal', location: 'Santiago Centro' },
    { id: '2', name: 'Bodega Secundaria', location: 'Pudahuel' },
];

const WarehousesPage: React.FC = () => {
    const [warehouses, setWarehouses] = useState<Warehouse[]>(mockWarehouses);
    // Add form state and handlers here if needed
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Bodegas</h1>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700">
                    <i className="fas fa-plus mr-2"></i> Agregar Bodega
                </button>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <ul className="divide-y divide-slate-200">
                    {warehouses.map(wh => (
                        <li key={wh.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                            <div>
                                <p className="font-bold text-lg text-slate-800">{wh.name}</p>
                                <p className="text-sm text-slate-500"><i className="fas fa-map-marker-alt mr-2 text-slate-400"></i>{wh.location}</p>
                            </div>
                            <div className="space-x-3">
                                <button className="text-indigo-500 hover:text-indigo-700"><i className="fas fa-edit"></i></button>
                                <button className="text-red-500 hover:text-red-700"><i className="fas fa-trash"></i></button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default WarehousesPage;
