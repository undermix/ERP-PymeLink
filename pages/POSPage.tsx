import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, POSSaleItem, POSSale, CashRegisterSession, PaymentMethod, StockMovementReason } from '../types';
import { useCashRegister, useStock } from '../App';
import OpenRegisterModal from '../components/pos/OpenRegisterModal';
import CloseRegisterModal from '../components/pos/CloseRegisterModal';
import PaymentModal from '../components/pos/PaymentModal';

const POSPage: React.FC = () => {
    const navigate = useNavigate();
    const { addSession } = useCashRegister();
    const { products, addStockMovement } = useStock();
    const [session, setSession] = useState<CashRegisterSession | null>(null);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [cart, setCart] = useState<POSSaleItem[]>([]);
    const [filter, setFilter] = useState('');
    
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    useEffect(() => {
        const activeSession = sessionStorage.getItem('pos_session');
        if (activeSession) {
            setSession(JSON.parse(activeSession));
            setIsRegisterOpen(true);
        }
    }, []);

    const handleOpenRegister = (openingBalance: number) => {
        const newSession: CashRegisterSession = {
            id: `S-${Date.now()}`,
            openingTime: new Date(),
            openingBalance,
            sales: [],
        };
        setSession(newSession);
        sessionStorage.setItem('pos_session', JSON.stringify(newSession));
        setIsRegisterOpen(true);
    };

    const handleCloseRegister = (closingBalance: number) => {
        if (session) {
            const closedSession = { ...session, closingTime: new Date(), closingBalance };
            addSession(closedSession);
            sessionStorage.removeItem('pos_session');
            setSession(null);
            setIsRegisterOpen(false);
            setShowCloseModal(false);
            navigate('/dashboard');
        }
    };
    
    const handleAddProduct = (product: Product) => {
        const location = product.locations[0];
        if (!location || location.stock <= 0) {
            alert("Producto sin stock.");
            return;
        }

        const price = location.price;

        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.productId === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prevCart, { productId: product.id, quantity: 1, unitPrice: price, warehouseId: location.warehouseId }];
            }
        });
    };
    
    const handleUpdateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            setCart(cart.filter(item => item.productId !== productId));
        } else {
            setCart(cart.map(item => item.productId === productId ? { ...item, quantity } : item));
        }
    };
    
    const handleConfirmSale = (paymentMethod: PaymentMethod) => {
        if (session) {
            const newSale: POSSale = {
                id: `SALE-${Date.now()}`,
                items: cart,
                total: cartTotal,
                paymentMethod,
                createdAt: new Date(),
            };

            cart.forEach(item => {
                addStockMovement(
                    item.productId,
                    item.warehouseId,
                    -item.quantity, // Negative quantity for deduction
                    StockMovementReason.POSSale,
                    newSale.id
                );
            });

            const updatedSession = { ...session, sales: [...session.sales, newSale] };
            setSession(updatedSession);
            sessionStorage.setItem('pos_session', JSON.stringify(updatedSession));
            setCart([]);
            setShowPaymentModal(false);
        }
    };

    const filteredProducts = useMemo(() =>
        products.filter(p =>
            p.name.toLowerCase().includes(filter.toLowerCase()) ||
            p.sku.toLowerCase().includes(filter.toLowerCase())
        ), [products, filter]);
    
    const cartTotal = useMemo(() =>
        cart.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
    [cart]);

    if (!isRegisterOpen) {
        return <OpenRegisterModal onOpen={handleOpenRegister} />;
    }

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Main content */}
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-md p-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Punto de Venta (POS)</h1>
                    <div className="flex items-center space-x-4">
                        <button onClick={() => setShowCloseModal(true)} className="px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition-colors text-sm">
                            <i className="fas fa-door-closed mr-2"></i>Cerrar Caja
                        </button>
                        <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 transition-colors text-sm">
                            <i className="fas fa-arrow-left mr-2"></i>Volver al ERP
                        </button>
                    </div>
                </header>
                
                <div className="flex-1 flex overflow-hidden">
                    {/* Products Grid */}
                    <div className="w-3/5 p-4 flex flex-col">
                        <div className="mb-4 relative">
                            <input
                                type="text"
                                placeholder="Buscar producto por nombre o SKU..."
                                value={filter}
                                onChange={e => setFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                             <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {filteredProducts.map(product => (
                                    <div key={product.id} onClick={() => handleAddProduct(product)} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 flex flex-col">
                                        <img src={product.imageUrl} alt={product.name} className="w-full h-32 object-cover rounded-t-lg"/>
                                        <div className="p-3 flex flex-col flex-grow">
                                            <h3 className="font-semibold text-gray-800 text-sm flex-grow">{product.name}</h3>
                                            <p className="text-lg font-bold text-blue-600 mt-2">${product.locations[0]?.price.toLocaleString() || 'N/A'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Cart */}
                    <div className="w-2/5 bg-white p-4 flex flex-col shadow-lg border-l border-gray-200">
                        <h2 className="text-xl font-bold border-b pb-3 mb-4 text-gray-700">Venta Actual</h2>
                        <div className="flex-1 overflow-y-auto">
                           {cart.length > 0 ? (
                                <ul className="divide-y divide-gray-200">
                                    {cart.map(item => {
                                        const product = products.find(p => p.id === item.productId);
                                        return (
                                            <li key={item.productId} className="py-3 flex items-center">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-800">{product?.name}</p>
                                                    <p className="text-sm text-gray-500">${item.unitPrice.toLocaleString()}</p>
                                                </div>
                                                <div className="flex items-center">
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => handleUpdateQuantity(item.productId, parseInt(e.target.value))}
                                                        className="w-16 text-center border border-gray-300 rounded-md p-1 mx-2"
                                                        min="0"
                                                    />
                                                </div>
                                                <p className="w-20 text-right font-semibold">${(item.quantity * item.unitPrice).toLocaleString()}</p>
                                            </li>
                                        )
                                    })}
                                </ul>
                           ) : (
                               <div className="h-full flex items-center justify-center">
                                   <p className="text-gray-500">El carrito está vacío</p>
                               </div>
                           )}
                        </div>
                        <div className="border-t pt-4 mt-4">
                            <div className="flex justify-between items-center text-2xl font-bold mb-4">
                                <span>Total</span>
                                <span>${cartTotal.toLocaleString()}</span>
                            </div>
                            <button
                                onClick={() => setShowPaymentModal(true)}
                                disabled={cart.length === 0}
                                className="w-full py-4 bg-green-500 text-white font-bold text-lg rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                               <i className="fas fa-credit-card mr-3"></i> Pagar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {showCloseModal && session && <CloseRegisterModal session={session} onClose={() => setShowCloseModal(false)} onConfirm={handleCloseRegister} />}
            {showPaymentModal && <PaymentModal total={cartTotal} onClose={() => setShowPaymentModal(false)} onConfirm={handleConfirmSale} />}

        </div>
    );
};

export default POSPage;
