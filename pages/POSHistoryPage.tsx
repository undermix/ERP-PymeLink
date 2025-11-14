import React, { useState, useMemo } from 'react';
import { useCashRegister } from '../App';
import { CashRegisterSession, PaymentMethod } from '../types';
import Modal from '../components/Modal';
import SessionDetailModal from '../components/pos/SessionDetailModal';

const POSHistoryPage: React.FC = () => {
    const { sessions } = useCashRegister();
    const [selectedSession, setSelectedSession] = useState<CashRegisterSession | null>(null);

    const sessionsWithSummary = useMemo(() => {
        return sessions.map(session => {
            const totalSales = session.sales.reduce((sum, sale) => sum + sale.total, 0);
            const cashSales = session.sales
                .filter(sale => sale.paymentMethod === PaymentMethod.Cash)
                .reduce((sum, sale) => sum + sale.total, 0);
            const expectedCash = session.openingBalance + cashSales;
            const difference = (session.closingBalance || 0) - expectedCash;
            return { ...session, totalSales, difference };
        }).sort((a, b) => b.openingTime.getTime() - a.openingTime.getTime());
    }, [sessions]);

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('es-CL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Historial de Cajas (Venta POS)</h1>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 font-semibold">Apertura</th>
                            <th scope="col" className="px-6 py-3 font-semibold">Cierre</th>
                            <th scope="col" className="px-6 py-3 font-semibold">Saldo Inicial</th>
                            <th scope="col" className="px-6 py-3 font-semibold">Total Ventas</th>
                            <th scope="col" className="px-6 py-3 font-semibold">Efectivo Contado</th>
                            <th scope="col" className="px-6 py-3 font-semibold">Diferencia</th>
                            <th scope="col" className="px-6 py-3 font-semibold text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessionsWithSummary.map(session => (
                            <tr key={session.id} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-6 py-4">{formatDate(session.openingTime)}</td>
                                <td className="px-6 py-4">{session.closingTime ? formatDate(session.closingTime) : 'N/A'}</td>
                                <td className="px-6 py-4">${session.openingBalance.toLocaleString('es-CL')}</td>
                                <td className="px-6 py-4">${session.totalSales.toLocaleString('es-CL')}</td>
                                <td className="px-6 py-4">${session.closingBalance?.toLocaleString('es-CL') || 'N/A'}</td>
                                <td className={`px-6 py-4 font-bold ${session.difference === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ${session.difference.toLocaleString('es-CL')}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => setSelectedSession(session)} 
                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Ver Detalles
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {sessionsWithSummary.length === 0 && <p className="text-center p-6 text-gray-500">No hay historial de cajas.</p>}
            </div>

            {selectedSession && (
                <Modal
                    isOpen={!!selectedSession}
                    onClose={() => setSelectedSession(null)}
                    title={`Detalles de Sesión - ${formatDate(selectedSession.openingTime)}`}
                >
                    <SessionDetailModal session={selectedSession} />
                </Modal>
            )}
        </div>
    );
};

export default POSHistoryPage;