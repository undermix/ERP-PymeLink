import React, { useState } from 'react';

interface OpenRegisterModalProps {
    onOpen: (openingBalance: number) => void;
}

const OpenRegisterModal: React.FC<OpenRegisterModalProps> = ({ onOpen }) => {
    const [balance, setBalance] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(balance);
        if (isNaN(amount) || amount < 0) {
            setError('Por favor, ingrese un monto válido.');
            return;
        }
        onOpen(amount);
    };

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-gray-900">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Abrir Caja</h2>
                <p className="text-gray-600 mb-6 text-center">Ingrese el monto inicial en efectivo para comenzar a vender.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="openingBalance" className="block text-sm font-medium text-gray-700 mb-1">Monto de Apertura (CLP)</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                            <input
                                type="number"
                                id="openingBalance"
                                value={balance}
                                onChange={(e) => { setBalance(e.target.value); setError(''); }}
                                className="w-full pl-7 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-gray-900"
                                placeholder="0"
                                required
                                autoFocus
                            />
                        </div>
                         {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
                    >
                       <i className="fas fa-play-circle mr-2"></i> Iniciar Turno
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OpenRegisterModal;