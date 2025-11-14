import React, { useState, useMemo } from 'react';
import { useStock } from '../App';
import { mockWarehouses } from '../data/mockData';
import { StockMovement } from '../types';

const StockMovementsPage: React.FC = () => {
    const { stockMovements, products } = useStock();
    const [filter, setFilter] = useState('');

    const sortedMovements = useMemo(() => 
        [...stockMovements].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    [stockMovements]);

    const filteredMovements = useMemo(() => {
        if (!filter) return sortedMovements;
        const lowercasedFilter = filter.toLowerCase();
        return sortedMovements.filter(movement => {
            const product = products.find(p => p.id === movement.productId);
            return product?.name.toLowerCase().includes(lowercasedFilter) ||
                   product?.sku.toLowerCase().includes(lowercasedFilter);
        });
    }, [sortedMovements, products, filter]);

    const getProductName = (productId: string) => products.find(p => p.id === productId)?.name || 'Producto Desconocido';
    const getWarehouseName = (warehouseId: string) => mockWarehouses.find(w => w.id === warehouseId)?.name || 'Bodega Desconocida';

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('es-CL', {
            dateStyle: 'short',
            timeStyle: 'medium'
        }).format(date);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Movimientos de Stock</h1>
            </div>

            <div className="mb-6 relative">
                <input
                    type="text"
                    placeholder="Filtrar por nombre o SKU de producto..."
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
                            <th scope="col" className="px-6 py-3 font-semibold">Fecha</th>
                            <th scope="col" className="px-6 py-3 font-semibold">Producto</th>
                            <th scope="col" className="px-6 py-3 font-semibold">Bodega</th>
                            <th scope="col" className="px-6 py-3 font-semibold text-center">Cantidad</th>
                            <th scope="col" className="px-6 py-3 font-semibold">Motivo</th>
                            <th scope="col" className="px-6 py-3 font-semibold">Referencia</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMovements.map((movement: StockMovement) => (
                            <tr key={movement.id} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">{formatDate(movement.createdAt)}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{getProductName(movement.productId)}</td>
                                <td className="px-6 py-4">{getWarehouseName(movement.warehouseId)}</td>
                                <td className={`px-6 py-4 text-center font-bold ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}
                                </td>
                                <td className="px-6 py-4">{movement.reason}</td>
                                <td className="px-6 py-4 font-mono text-xs">{movement.referenceId || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredMovements.length === 0 && (
                    <p className="text-center p-6 text-gray-500">
                        {stockMovements.length > 0 ? 'No se encontraron movimientos con el filtro actual.' : 'No hay movimientos de stock registrados.'}
                    </p>
                )}
            </div>
        </div>
    );
};

export default StockMovementsPage;
