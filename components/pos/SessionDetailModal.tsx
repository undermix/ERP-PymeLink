import React, { useMemo } from 'react';
import { CashRegisterSession, PaymentMethod } from '../../types';

const DetailRow: React.FC<{ label: string; value: string | number; isBold?: boolean; className?: string }> = ({ label, value, isBold = false, className = '' }) => (
    <div className={`flex justify-between py-2 border-b border-gray-100 last:border-b-0 ${isBold ? 'font-bold' : ''} ${className}`}>
        <span className="text-gray-600">{label}</span>
        <span>{typeof value === 'number' ? `$${value.toLocaleString('es-CL')}` : value}</span>
    </div>
);


const SessionDetailModal: React.FC<{ session: CashRegisterSession }> = ({ session }) => {
    
    const summary = useMemo(() => {
        const salesByPaymentMethod = session.sales.reduce((acc, sale) => {
            acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.total;
            return acc;
        }, {} as Record<PaymentMethod, number>);

        const totalSales = session.sales.reduce((sum, sale) => sum + sale.total, 0);
        const cashSales = salesByPaymentMethod[PaymentMethod.Cash] || 0;
        const expectedCash = session.openingBalance + cashSales;
        const difference = (session.closingBalance || 0) - expectedCash;

        return { salesByPaymentMethod, totalSales, cashSales, expectedCash, difference };
    }, [session]);
    
    const formatTime = (date: Date) => {
         return new Intl.DateTimeFormat('es-CL', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(date);
    }

    return (
        <div className="space-y-6" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Resumen Financiero</h3>
                <div className="bg-gray-50 p-4 rounded-lg text-sm">
                    <DetailRow label="Saldo Inicial" value={session.openingBalance} />
                    <h4 className="text-sm font-semibold text-gray-700 mt-3 mb-1">Desglose de Ventas</h4>
                    {Object.keys(summary.salesByPaymentMethod).length > 0 ? Object.entries(summary.salesByPaymentMethod).map(([method, total]) => (
                         <DetailRow key={method} label={`Ventas (${method})`} value={total} />
                    )) : <p className="text-gray-500 text-xs py-1">No hubo ventas en esta categoría.</p>}
                    <DetailRow label="Total Ventas" value={summary.totalSales} isBold />
                    <h4 className="text-sm font-semibold text-gray-700 mt-3 mb-1">Reconciliación</h4>
                    <DetailRow label="Efectivo Esperado" value={summary.expectedCash} />
                    <DetailRow label="Efectivo Contado" value={session.closingBalance || 0} />
                     <DetailRow 
                        label="Diferencia" 
                        value={summary.difference} 
                        isBold 
                        className={summary.difference === 0 ? 'text-green-600' : 'text-red-600'}
                    />
                </div>
            </div>

            <div>
                 <h3 className="text-lg font-semibold text-gray-800 mb-2">Listado de Ventas ({session.sales.length})</h3>
                 <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                            <tr>
                                <th scope="col" className="px-4 py-2 font-semibold">ID Venta</th>
                                <th scope="col" className="px-4 py-2 font-semibold">Hora</th>
                                <th scope="col" className="px-4 py-2 font-semibold">Método de Pago</th>
                                <th scope="col" className="px-4 py-2 font-semibold text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {session.sales.map(sale => (
                                <tr key={sale.id}>
                                    <td className="px-4 py-2 font-mono text-xs">{sale.id}</td>
                                    <td className="px-4 py-2">{formatTime(sale.createdAt)}</td>
                                    <td className="px-4 py-2">{sale.paymentMethod}</td>
                                    <td className="px-4 py-2 text-right font-semibold">${sale.total.toLocaleString('es-CL')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {session.sales.length === 0 && <p className="text-center py-4 text-gray-500">No se realizaron ventas en esta sesión.</p>}
                 </div>
            </div>
        </div>
    );
};

export default SessionDetailModal;