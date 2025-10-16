import React, { useState } from 'react';
import { Product, WarehouseStock } from '../types';

// Mock data, in a real app this would come from an API or context
const mockWarehouses = [
    { id: '1', name: 'Bodega Principal', location: 'Santiago Centro' },
    { id: '2', name: 'Bodega Secundaria', location: 'Pudahuel' },
];

interface ProductFormProps {
    product?: Product;
    onSave: (product: Product) => void;
    onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Omit<Product, 'id'>>({
        sku: product?.sku || '',
        name: product?.name || '',
        brand: product?.brand || '',
        model: product?.model || '',
        imageUrl: product?.imageUrl || 'https://picsum.photos/400/400',
        locations: product?.locations || [],
        description: product?.description || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLocationChange = (index: number, field: keyof WarehouseStock, value: string) => {
        const newLocations = [...formData.locations];
        if (field === 'warehouseId') {
            newLocations[index] = { ...newLocations[index], [field]: value };
        } else if (field === 'price') {
            // Parse CLP formatted string to a number
            const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
            newLocations[index] = { ...newLocations[index], price: numericValue };
        } else { // 'stock'
            // Parse stock as an integer
            const numericValue = parseInt(value, 10) || 0;
            newLocations[index] = { ...newLocations[index], stock: numericValue };
        }
        setFormData(prev => ({ ...prev, locations: newLocations }));
    };


    const addLocation = () => {
        const availableWarehouse = mockWarehouses.find(w => !formData.locations.some(l => l.warehouseId === w.id));
        if (availableWarehouse) {
            setFormData(prev => ({
                ...prev,
                locations: [...prev.locations, { warehouseId: availableWarehouse.id, stock: 0, price: 0 }]
            }));
        } else {
            alert("Todas las bodegas disponibles ya han sido agregadas.");
        }
    };

    const removeLocation = (index: number) => {
        const newLocations = formData.locations.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, locations: newLocations }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: product?.id || new Date().toISOString() });
    };
    
    const inputClasses = "w-full pl-10 pr-4 py-3 bg-slate-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800";
    const locationInputClasses = "w-full p-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500";

    const availableWarehousesForNewLocation = mockWarehouses.filter(w => !formData.locations.some(l => l.warehouseId === w.id));

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre Producto */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-1">Nombre del Producto</label>
                    <div className="relative">
                        <i className="fas fa-box absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} required className={inputClasses}/>
                    </div>
                </div>
                 {/* SKU */}
                <div>
                    <label htmlFor="sku" className="block text-sm font-medium text-slate-600 mb-1">SKU</label>
                    <div className="relative">
                        <i className="fas fa-barcode absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input id="sku" type="text" name="sku" value={formData.sku} onChange={handleChange} required className={inputClasses}/>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Marca */}
                <div>
                    <label htmlFor="brand" className="block text-sm font-medium text-slate-600 mb-1">Marca</label>
                    <div className="relative">
                        <i className="fas fa-tag absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input id="brand" type="text" name="brand" value={formData.brand} onChange={handleChange} required className={inputClasses}/>
                    </div>
                </div>
                 {/* Modelo */}
                <div>
                    <label htmlFor="model" className="block text-sm font-medium text-slate-600 mb-1">Modelo</label>
                    <div className="relative">
                        <i className="fas fa-cogs absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input id="model" type="text" name="model" value={formData.model} onChange={handleChange} required className={inputClasses}/>
                    </div>
                </div>
            </div>

            {/* Warehouse Locations */}
            <div className="space-y-4 rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-700">Inventario por Bodega</h3>
                
                {formData.locations.length > 0 && (
                    <div className="grid grid-cols-12 gap-x-3 px-2">
                        <label className="col-span-4 text-xs font-medium text-slate-500">Bodega</label>
                        <label className="col-span-3 text-xs font-medium text-slate-500">Precio</label>
                        <label className="col-span-3 text-xs font-medium text-slate-500">Stock</label>
                    </div>
                )}

                {formData.locations.length === 0 && <p className="text-sm text-slate-500 text-center py-4">Agregue una ubicación para definir el precio y stock.</p>}
                
                <div className="space-y-3">
                    {formData.locations.map((loc, index) => {
                        const availableWarehousesForThis = mockWarehouses.filter(w => w.id === loc.warehouseId || !formData.locations.some(l => l.warehouseId === w.id));
                        return(
                            <div key={index} className="grid grid-cols-12 gap-x-3 items-center">
                                <div className="col-span-4">
                                    <select value={loc.warehouseId} onChange={(e) => handleLocationChange(index, 'warehouseId', e.target.value)} className={locationInputClasses} aria-label="Bodega">
                                        {availableWarehousesForThis.map(w => (
                                            <option key={w.id} value={w.id}>{w.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-3 relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">$</span>
                                    <input type="text" inputMode="numeric" placeholder="56.000" value={loc.price > 0 ? loc.price.toLocaleString('es-CL') : ''} onChange={(e) => handleLocationChange(index, 'price', e.target.value)} required className={`${locationInputClasses} pl-7`} aria-label="Precio" />
                                </div>
                                <div className="col-span-3">
                                    <input type="number" placeholder="5" value={loc.stock > 0 ? loc.stock : ''} onChange={(e) => handleLocationChange(index, 'stock', e.target.value)} min="0" required className={locationInputClasses} aria-label="Stock" />
                                </div>
                                <div className="col-span-2 text-right">
                                     <button type="button" onClick={() => removeLocation(index)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100" title="Eliminar ubicación">
                                        <i className="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
                 <button type="button" onClick={addLocation} disabled={availableWarehousesForNewLocation.length === 0} className="w-full mt-2 px-4 py-2 bg-indigo-100 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <i className="fas fa-plus mr-2"></i>Agregar Ubicación
                </button>
            </div>
            
            {/* Description */}
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-600 mb-1">Descripción</label>
                 <div className="relative">
                    <i className="fas fa-align-left absolute left-3 top-4 text-slate-400"></i>
                    <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className={inputClasses + ' pt-3'}></textarea>
                </div>
            </div>
            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={onCancel} className="px-6 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Guardar</button>
            </div>
        </form>
    );
};

export default ProductForm;