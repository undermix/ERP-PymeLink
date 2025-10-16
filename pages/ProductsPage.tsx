import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';
import Modal from '../components/Modal';
import ProductForm from '../components/ProductForm';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import Pagination from '../components/Pagination';

const mockProducts: Product[] = [
    { id: '1', sku: 'TS-001', imageUrl: 'https://picsum.photos/seed/p1/400/400', name: 'Laptop Pro X', brand: 'TechBrand', model: 'X-Pro 15', locations: [{ warehouseId: '1', price: 1200, stock: 30 }, { warehouseId: '2', price: 1250, stock: 20 }], description: 'High performance laptop for professionals.' },
    { id: '2', sku: 'TS-002', imageUrl: 'https://picsum.photos/seed/p2/400/400', name: 'Wireless Mouse', brand: 'ClickFast', model: 'CF-200', locations: [{ warehouseId: '2', price: 45, stock: 200 }], description: 'Ergonomic wireless mouse.' },
    { id: '3', sku: 'TS-003', imageUrl: 'https://picsum.photos/seed/p3/400/400', name: 'Mechanical Keyboard', brand: 'GamerGear', model: 'Mech-RGB', locations: [{ warehouseId: '1', price: 150, stock: 100 }], description: 'RGB mechanical keyboard for gaming.' },
    { id: '4', sku: 'MON-01', imageUrl: 'https://picsum.photos/seed/p4/400/400', name: '4K UltraWide Monitor', brand: 'ViewSonic', model: 'VX3211-4K-MHD', locations: [{ warehouseId: '1', price: 750, stock: 50 }], description: 'A 32-inch 4K monitor with HDR support.' },
    { id: '5', sku: 'CAM-01', imageUrl: 'https://picsum.photos/seed/p5/400/400', name: 'Webcam HD 1080p', brand: 'Logitech', model: 'C920', locations: [{ warehouseId: '2', price: 80, stock: 150 }], description: 'HD 1080p webcam for video conferencing.' },
    { id: '6', sku: 'HDD-01', imageUrl: 'https://picsum.photos/seed/p6/400/400', name: 'External SSD 1TB', brand: 'Samsung', model: 'T7', locations: [{ warehouseId: '1', price: 110, stock: 80 }, { warehouseId: '2', price: 115, stock: 40 }], description: 'Portable 1TB SSD with fast transfer speeds.' },
    { id: '7', sku: 'PRN-01', imageUrl: 'https://picsum.photos/seed/p7/400/400', name: 'Laser Printer Pro', brand: 'HP', model: 'LaserJet M209dwe', locations: [{ warehouseId: '1', price: 250, stock: 25 }], description: 'Monochrome laser printer for small offices.' },
    { id: '8', sku: 'SPK-01', imageUrl: 'https://picsum.photos/seed/p8/400/400', name: 'Bluetooth Speaker', brand: 'JBL', model: 'Flip 6', locations: [{ warehouseId: '2', price: 130, stock: 300 }], description: 'Portable and waterproof Bluetooth speaker.' },
    { id: '9', sku: 'ROU-01', imageUrl: 'https://picsum.photos/seed/p9/400/400', name: 'WiFi 6 Router', brand: 'TP-Link', model: 'Archer AX10', locations: [{ warehouseId: '1', price: 80, stock: 60 }], description: 'Next-gen WiFi 6 router for faster speeds.' },
    { id: '10', sku: 'USB-01', imageUrl: 'https://picsum.photos/seed/p10/400/400', name: 'USB-C Hub', brand: 'Anker', model: 'PowerExpand+', locations: [{ warehouseId: '2', price: 40, stock: 250 }], description: '7-in-1 USB-C hub with HDMI and SD card reader.' },
    { id: '11', sku: 'HDP-01', imageUrl: 'https://picsum.photos/seed/p11/400/400', name: 'Noise Cancelling Headphones', brand: 'Sony', model: 'WH-1000XM5', locations: [{ warehouseId: '1', price: 400, stock: 70 }], description: 'Industry-leading noise cancelling headphones.' },
    { id: '12', sku: 'ERG-01', imageUrl: 'https://picsum.photos/seed/p12/400/400', name: 'Ergonomic Office Chair', brand: 'Herman Miller', model: 'Aeron', locations: [{ warehouseId: '1', price: 1500, stock: 15 }], description: 'The gold standard in ergonomic seating.' },
    { id: '13', sku: 'UPS-01', imageUrl: 'https://picsum.photos/seed/p13/400/400', name: 'UPS Battery Backup', brand: 'APC', model: 'BE600M1', locations: [{ warehouseId: '2', price: 70, stock: 90 }], description: 'Uninterruptible power supply for essential electronics.' },
];

const GRID_ITEMS_PER_PAGE = 12;
const LIST_ITEMS_PER_PAGE = 10;

const ProductCard: React.FC<{ product: Product; onEdit: (product: Product) => void; onDelete: (product: Product) => void; }> = ({ product, onEdit, onDelete }) => {
    const totalStock = product.locations.reduce((acc, loc) => acc + loc.stock, 0);
    const displayPrice = product.locations.length > 0 ? Math.min(...product.locations.map(l => l.price)) : 0;
    
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden group relative">
            <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover"/>
            <div className="p-4">
                <h3 className="font-bold text-lg text-slate-800">{product.name}</h3>
                <p className="text-sm text-slate-500">{product.brand} / {product.model}</p>
                <p className="text-sm text-slate-500">SKU: {product.sku}</p>
                <div className="flex justify-between items-center mt-4">
                    <p className="text-xl font-bold text-indigo-500">
                        {product.locations.length > 0 ? `$${displayPrice.toLocaleString()}`: 'N/A'}
                        {product.locations.length > 1 ? <span className="text-sm" title="Precio varía por bodega">+</span> : ''}
                    </p>
                    <p className="text-sm font-semibold bg-slate-100 text-slate-700 px-2 py-1 rounded">Stock Total: {totalStock}</p>
                </div>
                <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(product)} title="Editar" className="bg-white text-indigo-500 w-8 h-8 rounded-full shadow flex items-center justify-center hover:bg-slate-100"><i className="fas fa-edit"></i></button>
                    <button onClick={() => onDelete(product)} title="Eliminar" className="bg-white text-red-500 w-8 h-8 rounded-full shadow flex items-center justify-center hover:bg-slate-100"><i className="fas fa-trash"></i></button>
                </div>
            </div>
        </div>
    );
}

const ProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>(mockProducts);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const filteredProducts = useMemo(() =>
        products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchTerm.toLowerCase())
        ),
    [products, searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, viewMode]);

    const itemsPerPage = viewMode === 'grid' ? GRID_ITEMS_PER_PAGE : LIST_ITEMS_PER_PAGE;
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = useMemo(() => 
        filteredProducts.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        ), [filteredProducts, currentPage, itemsPerPage]);

    const handleSave = (product: Product) => {
        if (editingProduct) {
            setProducts(products.map(p => p.id === product.id ? product : p));
        } else {
            setProducts([{ ...product, id: new Date().toISOString() }, ...products]);
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

    const handleConfirmDelete = () => {
        if (productToDelete) {
            setProducts(products.filter(p => p.id !== productToDelete.id));
            setProductToDelete(null); 
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Productos</h1>
                <div className="flex items-center space-x-4">
                     <div className="hidden sm:flex items-center rounded-lg bg-slate-100 p-1 border">
                        <button onClick={() => setViewMode('grid')} className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'grid' ? 'bg-indigo-500 text-white shadow' : 'text-slate-500 hover:bg-slate-200'}`} aria-label="Vista de cuadrícula" title="Vista de cuadrícula">
                            <i className="fas fa-th-large"></i>
                        </button>
                        <button onClick={() => setViewMode('list')} className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'list' ? 'bg-indigo-500 text-white shadow' : 'text-slate-500 hover:bg-slate-200'}`} aria-label="Vista de lista" title="Vista de lista">
                             <i className="fas fa-bars"></i>
                        </button>
                    </div>
                    <button onClick={handleAddNew} className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 flex items-center">
                        <i className="fas fa-plus mr-2"></i> Agregar Producto
                    </button>
                </div>
            </div>
             <div className="mb-6 relative">
                 <input
                    type="text"
                    placeholder="Buscar por nombre o SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                 <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            </div>
            
            {filteredProducts.length > 0 ? (
                <>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {paginatedProducts.map(product => (
                                <ProductCard key={product.id} product={product} onEdit={handleEdit} onDelete={setProductToDelete} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-500">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Producto</th>
                                        <th scope="col" className="px-6 py-3">SKU</th>
                                        <th scope="col" className="px-6 py-3">Marca/Modelo</th>
                                        <th scope="col" className="px-6 py-3">Precio Desde</th>
                                        <th scope="col" className="px-6 py-3">Stock Total</th>
                                        <th scope="col" className="px-6 py-3">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedProducts.map(product => {
                                        const totalStock = product.locations.reduce((acc, loc) => acc + loc.stock, 0);
                                        const displayPrice = product.locations.length > 0 ? Math.min(...product.locations.map(l => l.price)) : 0;
                                        return (
                                        <tr key={product.id} className="bg-white border-b border-slate-200 hover:bg-slate-50">
                                            <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                            <div className="flex items-center">
                                                    <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-md object-cover mr-4" />
                                                    <span>{product.name}</span>
                                                </div>
                                            </th>
                                            <td className="px-6 py-4">{product.sku}</td>
                                            <td className="px-6 py-4">{product.brand} / {product.model}</td>
                                            <td className="px-6 py-4">
                                                {product.locations.length > 0 ? `$${displayPrice.toLocaleString()}` : 'N/A'}
                                                {product.locations.length > 1 ? <span title="Precio varía por bodega">+</span> : ''}
                                            </td>
                                            <td className="px-6 py-4">{totalStock}</td>
                                            <td className="px-6 py-4 space-x-3">
                                                <button onClick={() => handleEdit(product)} className="text-indigo-500 hover:text-indigo-700" title="Editar"><i className="fas fa-edit"></i></button>
                                                <button onClick={() => setProductToDelete(product)} className="text-red-500 hover:text-red-700" title="Eliminar"><i className="fas fa-trash"></i></button>
                                            </td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                        </div>
                    )}
                    
                    {totalPages > 1 && (
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </>
            ) : (
                <p className="text-center p-6 text-slate-500">No se encontraron productos.</p>
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