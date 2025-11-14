import React, { useState, useMemo } from 'react';
import { CashRegisterSession, PaymentMethod } from '../../types';

interface CloseRegisterModalProps {
    session: CashRegisterSession;
    onClose: () => void;
    onConfirm: (countedCash: number) => void;
}

const SummaryRow: React.FC<{ label: string; value: string | number; isBold?: boolean }> = ({ label, value, isBold = false }) => (
    <div className={`flex justify-between py-2 ${isBold ? 'font-bold' : ''}`}>
        <span className="text-gray-600">{label}</span>
        <span className="text-gray-900">{typeof value === 'number' ? `$${value.toLocaleString()}` : value}</span>
    </div>
);


const CloseRegisterModal: React.FC<CloseRegisterModalProps> = ({ session, onClose, onConfirm }) => {
    const [countedCash, setCountedCash] = useState('');
    
    const summary = useMemo(() => {
        const salesByPaymentMethod = session.sales.reduce((acc, sale) => {
            acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.total;
            return acc;
        }, {} as Record<PaymentMethod, number>);

        const totalSales = session.sales.reduce((sum, sale) => sum + sale.total, 0);
        const cashSales = salesByPaymentMethod[PaymentMethod.Cash] || 0;
        const expectedCash = session.openingBalance + cashSales;

        return { salesByPaymentMethod, totalSales, cashSales, expectedCash };
    }, [session]);

    const difference = useMemo(() => {
        const counted = parseFloat(countedCash);
        if (isNaN(counted)) return 0;
        return counted - summary.expectedCash;
    }, [countedCash, summary.expectedCash]);

    const handleConfirm = () => {
        const counted = parseFloat(countedCash);
        if (isNaN(counted) || counted < 0) {
            alert('Por favor, ingrese un monto válido.');
            return;
        }
        onConfirm(counted);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md text-gray-900">
                 <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-bold text-gray-800">Cierre de Caja</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><i className="fas fa-times text-xl"></i></button>
                </div>
                <div className="p-6">
                    <h3 className="font-semibold mb-4">Resumen de Ventas</h3>
                    <div className="bg-gray-50 p-4 rounded-lg divide-y divide-gray-200 text-sm">
                        {Object.entries(summary.salesByPaymentMethod).map(([method, total]) => (
                             <SummaryRow key={method} label={`Ventas con ${method}`} value={total} />
                        ))}
                        <SummaryRow label="Total Ventas" value={summary.totalSales} isBold />
                    </div>
                    
                    <h3 className="font-semibold mt-6 mb-4">Reconciliación de Efectivo</h3>
                    <div className="bg-gray-50 p-4 rounded-lg divide-y divide-gray-200 text-sm">
                        <SummaryRow label="Saldo Inicial" value={session.openingBalance} />
                        <SummaryRow label="Ventas en Efectivo" value={summary.cashSales} />
                        <SummaryRow label="Efectivo Esperado" value={summary.expectedCash} isBold />
                    </div>
                    
                    <div className="mt-6">
                        <label htmlFor="countedCash" className="block text-sm font-medium text-gray-700 mb-1">Efectivo Contado</label>
                         <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                            <input
                                type="number"
                                id="countedCash"
                                value={countedCash}
                                onChange={(e) => setCountedCash(e.target.value)}
                                className="w-full pl-7 pr-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {countedCash && (
                         <div className={`mt-4 p-3 rounded-lg text-center font-bold ${difference === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                             Diferencia: ${difference.toLocaleString()}
                         </div>
                    )}
                </div>
                <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-4 border-t">
                    <button onClick={onClose} className="px-4 py-2 bg-white text-gray-700 font-semibold rounded-md border border-gray-300 hover:bg-gray-50">Cancelar</button>
                    <button onClick={handleConfirm} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700">Confirmar Cierre</button>
                </div>
            </div>
        </div>
    );
};

export default CloseRegisterModal;