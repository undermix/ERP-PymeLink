
import React, { useState, useMemo } from 'react';
import { Product } from '../types';

const mockProducts: Product[] = [
    { id: '1', sku: 'TS-001', imageUrl: 'https://picsum.photos/seed/p1/400/400', name: 'Laptop Pro X', price: 1200, warehouseId: '1', stock: 50, description: 'High performance laptop for professionals.' },
    { id: '2', sku: 'TS-002', imageUrl: 'https://picsum.photos/seed/p2/400/400', name: 'Wireless Mouse', price: 45, warehouseId: '2', stock: 200, description: 'Ergonomic wireless mouse.' },
    { id: '3', sku: 'TS-003', imageUrl: 'https://picsum.photos/seed/p3/400/400', name: 'Mechanical Keyboard', price: 150, warehouseId: '1', stock: 100, description: 'RGB mechanical keyboard for gaming.' },
];

const ProductForm: React.FC<{ product?: Product; onSave: (product: Product) => void; onCancel: () => void; }> = ({ product, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Omit<Product, 'id'>>({
        sku: product?.sku || '',
        name: product?.name || '',
        imageUrl: product?.imageUrl || 'https://picsum.photos/400/400',
        price: product?.price || 0,
        warehouseId: product?.warehouseId || '1',
        stock: product?.stock || 0,
        description: product?.description || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'price' || name === 'stock' ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: product?.id || new Date().toISOString() });
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-slate-800">{product ? 'Editar Producto' : 'Agregar Producto'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nombre" required className="mt-1 block w-full bg-slate-50 border-slate-300 rounded-md shadow-sm"/>
                        <input type="text" name="sku" value={formData.sku} onChange={handleChange} placeholder="SKU" required className="mt-1 block w-full bg-slate-50 border-slate-300 rounded-md shadow-sm"/>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Precio" required className="mt-1 block w-full bg-slate-50 border-slate-300 rounded-md shadow-sm"/>
                        <input type="number" name="stock" value={formData.stock} onChange={handleChange} placeholder="Stock" required className="mt-1 block w-full bg-slate-50 border-slate-300 rounded-md shadow-sm"/>
                        <select name="warehouseId" value={formData.warehouseId} onChange={handleChange} className="mt-1 block w-full bg-slate-50 border-slate-300 rounded-md shadow-sm">
                            <option value="1">Bodega Principal</option>
                            <option value="2">Bodega Secundaria</option>
                        </select>
                    </div>
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Descripción" rows={3} className="mt-1 block w-full bg-slate-50 border-slate-300 rounded-md shadow-sm"></textarea>
                    {/* Image upload could be implemented here */}
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 rounded-md">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const ProductCard: React.FC<{ product: Product; onEdit: (product: Product) => void; }> = ({ product, onEdit }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden group relative">
        <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover"/>
        <div className="p-4">
            <h3 className="font-bold text-lg text-slate-800">{product.name}</h3>
            <p className="text-sm text-slate-500">SKU: {product.sku}</p>
            <div className="flex justify-between items-center mt-4">
                <p className="text-xl font-bold text-indigo-500">${product.price.toLocaleString()}</p>
                <p className="text-sm font-semibold bg-slate-100 text-slate-700 px-2 py-1 rounded">Stock: {product.stock}</p>
            </div>
            <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(product)} className="bg-white text-indigo-500 w-8 h-8 rounded-full shadow flex items-center justify-center hover:bg-slate-100"><i className="fas fa-edit"></i></button>
                <button className="bg-white text-red-500 w-8 h-8 rounded-full shadow flex items-center justify-center hover:bg-slate-100"><i className="fas fa-trash"></i></button>
            </div>
        </div>
    </div>
);

const ProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>(mockProducts);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

    const filteredProducts = useMemo(() =>
        products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchTerm.toLowerCase())
        ),
    [products, searchTerm]);

    const handleSave = (product: Product) => {
        if (editingProduct) {
            setProducts(products.map(p => p.id === product.id ? product : p));
        } else {
            setProducts([...products, product]);
        }
        setIsFormOpen(false);
        setEditingProduct(undefined);
    };
    
    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingProduct(undefined);
        setIsFormOpen(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Productos</h1>
                <button onClick={handleAddNew} className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700">
                    <i className="fas fa-plus mr-2"></i> Agregar Producto
                </button>
            </div>
             <div className="mb-6 relative">
                 <input
                    type="text"
                    placeholder="Buscar por nombre o SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm"
                />
                 <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} onEdit={handleEdit} />
                ))}
            </div>
            {filteredProducts.length === 0 && <p className="text-center p-6 text-slate-500">No se encontraron productos.</p>}
            {isFormOpen && <ProductForm product={editingProduct} onSave={handleSave} onCancel={() => setIsFormOpen(false)} />}
        </div>
    );
};

export default ProductsPage;
