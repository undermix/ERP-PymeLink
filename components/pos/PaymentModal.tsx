import React, { useState } from 'react';
import { PaymentMethod } from '../../types';

interface PaymentModalProps {
    total: number;
    onClose: () => void;
    onConfirm: (paymentMethod: PaymentMethod) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ total, onClose, onConfirm }) => {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PaymentMethod.Cash);
    const [cashReceived, setCashReceived] = useState('');
    
    const change = (parseFloat(cashReceived) || 0) - total;

    const handleConfirm = () => {
        if(selectedMethod === PaymentMethod.Cash && (parseFloat(cashReceived) || 0) < total) {
            alert("El efectivo recibido no puede ser menor que el total.");
            return;
        }
        onConfirm(selectedMethod);
    };
    
    const paymentMethods = [
        { id: PaymentMethod.Cash, label: 'Efectivo', icon: 'fa-money-bill-wave' },
        { id: PaymentMethod.DebitCard, label: 'Tarjeta de Débito', icon: 'fa-credit-card' },
        { id: PaymentMethod.CreditCard, label: 'Tarjeta de Crédito', icon: 'fa-credit-card' },
        { id: PaymentMethod.Transfer, label: 'Transferencia', icon: 'fa-exchange-alt' },
        { id: PaymentMethod.Check, label: 'Cheque', icon: 'fa-money-check-alt' },
    ];
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg text-gray-900">
                 <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-bold text-gray-800">Procesar Pago</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><i className="fas fa-times text-xl"></i></button>
                </div>
                <div className="p-6">
                    <div className="text-center mb-6">
                        <p className="text-gray-600">Total a Pagar</p>
                        <p className="text-5xl font-bold text-blue-600">${total.toLocaleString()}</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {paymentMethods.map(method => (
                             <button
                                key={method.id}
                                onClick={() => setSelectedMethod(method.id)}
                                className={`p-4 border rounded-lg text-center transition-all duration-200 ${selectedMethod === method.id ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105' : 'bg-gray-50 hover:bg-gray-100 border-gray-300'}`}
                            >
                                <i className={`fas ${method.icon} text-2xl mb-2`}></i>
                                <p className="font-semibold text-sm">{method.label}</p>
                            </button>
                        ))}
                    </div>

                    {selectedMethod === PaymentMethod.Cash && (
                        <div className="mt-6 space-y-4">
                            <div>
                                <label htmlFor="cashReceived" className="block text-sm font-medium text-gray-700 mb-1">Efectivo Recibido</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                                    <input
                                        type="number"
                                        id="cashReceived"
                                        value={cashReceived}
                                        onChange={(e) => setCashReceived(e.target.value)}
                                        className="w-full pl-7 pr-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                             {cashReceived && change >= 0 && (
                                <div className="text-center bg-gray-100 p-3 rounded-lg">
                                    <p className="text-gray-600">Vuelto</p>
                                    <p className="text-2xl font-bold text-gray-800">${change.toLocaleString()}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                 <div className="px-6 py-4 bg-gray-50 flex justify-end">
                    <button 
                        onClick={handleConfirm} 
                        className="w-full py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors"
                    >
                        Confirmar Venta
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;