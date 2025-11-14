
import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';
import { useStock } from '../App';
import Modal from '../components/Modal';
import ProductForm from '../components/ProductForm';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import Pagination from '../components/Pagination';

const ITEMS_PER_PAGE = 10;

const ProductsPage: React.FC = () => {
    const { products, saveProduct, deleteProduct } = useStock();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [filter, setFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const handleSave = (product: Product) => {
        saveProduct(product);
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
    
    const handleConfirmDelete = () => {
        if (productToDelete) {
            deleteProduct(productToDelete.id);
            setProductToDelete(null);
        }
    };
    
    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    const filteredProducts = useMemo(() =>
        products.filter(product =>
            product.name.toLowerCase().includes(filter.toLowerCase()) ||
            product.sku.toLowerCase().includes(filter.toLowerCase()) ||
            product.brand.toLowerCase().includes(filter.toLowerCase())
        ), [products, filter]);

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = useMemo(() =>
        filteredProducts.slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            currentPage * ITEMS_PER_PAGE
        ), [filteredProducts, currentPage]);
        
    const totalStock = (product: Product) => product.locations.reduce((sum, loc) => sum + loc.stock, 0);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Productos</h1>
                <button onClick={handleAddNew} className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 transition duration-300 flex items-center font-medium text-sm">
                    <i className="fas fa-plus mr-2"></i> Agregar Producto
                </button>
            </div>
            
             <div className="mb-6 relative">
                <input
                    type="text"
                    placeholder="Filtrar por nombre, SKU o marca..."
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
                            <th scope="col" className="px-6 py-3 font-semibold"></th>
                            <th scope="col" className="px-6 py-3 font-semibold">SKU</th>
                            <th scope="col" className="px-6 py-3 font-semibold">Nombre</th>
                            <th scope="col" className="px-6 py-3 font-semibold">Marca</th>
                            <th scope="col" className="px-6 py-3 font-semibold">Stock Total</th>
                            <th scope="col" className="px-6 py-3 font-semibold">Precio</th>
                            <th scope="col" className="px-6 py-3 font-semibold text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedProducts.map(product => (
                            <tr key={product.id} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-md object-cover" />
                                </td>
                                <td className="px-6 py-4 font-mono text-gray-700">{product.sku}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                                <td className="px-6 py-4">{product.brand}</td>
                                <td className="px-6 py-4 font-semibold">{totalStock(product)}</td>
                                <td className="px-6 py-4 font-bold text-blue-600">${product.locations[0]?.price.toLocaleString() || 'N/A'}</td>
                                <td className="px-6 py-4 space-x-4 text-lg text-right">
                                    <button onClick={() => handleEdit(product)} title="Editar" className="text-gray-400 hover:text-indigo-600"><i className="fas fa-edit"></i></button>
                                    <button onClick={() => setProductToDelete(product)} title="Eliminar" className="text-gray-400 hover:text-red-600"><i className="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredProducts.length === 0 && <p className="text-center p-6 text-gray-500">No se encontraron productos.</p>}
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
                title={editingProduct ? 'Editar Producto' : 'Agregar Producto'}
            >
                <ProductForm
                    product={editingProduct}
                    onSave={handleSave}
                    onCancel={() => setIsFormOpen(false)}
                />
            </Modal>
            
            <DeleteConfirmationModal
                isOpen={!!productToDelete}
                onClose={() => setProductToDelete(null)}
                onConfirm={handleConfirmDelete}
                itemName={productToDelete?.name || ''}
                itemType="Producto"
            />
        </div>
    );
};

export default ProductsPage;
