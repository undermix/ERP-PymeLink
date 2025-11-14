
import React from 'react';
import { mockClients, mockProducts, mockQuotes, mockInvoices } from '../data/mockData';
import { InvoiceStatus } from '../types';

const StatCard: React.FC<{ icon: string; title: string; value: string | number; color: string }> = ({ icon, title, value, color }) => {
    const colorClasses: { [key: string]: string } = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
        yellow: 'bg-yellow-100 text-yellow-600',
    };

    return (
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
                <i className={`fas ${icon} text-2xl`}></i>
            </div>
            <div className="ml-4">
                <p className="text-gray-500 text-sm font-medium">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
};

const ActivityItem: React.FC<{ color: string; text: string; time: string }> = ({ color, text, time }) => {
    const colorDotClasses: { [key: string]: string } = {
        green: 'bg-green-500',
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
    };

    return (
        <div className="flex items-start">
            <div className="flex-shrink-0 mt-1.5">
                <span className={`block h-2.5 w-2.5 rounded-full ${colorDotClasses[color]}`}></span>
            </div>
            <div className="ml-3">
                <p className="text-sm text-gray-700">{text}</p>
                <p className="text-xs text-gray-400">{time}</p>
            </div>
        </div>
    );
};


const DashboardPage: React.FC = () => {
    const totalCotizaciones = mockQuotes.length;
    const totalFacturado = mockInvoices.filter(i => i.status === InvoiceStatus.Paid).reduce((sum, i) => sum + i.total, 0);
    const totalClientes = mockClients.length;
    const productosActivos = mockProducts.length;

    const recentActivity = [
        { color: 'green', text: "Nueva cotización #COT-00004 creada para 'Undermix'.", time: 'hace 2 días' },
        { color: 'blue', text: "Factura #O-007 pagada por 'Undermix'.", time: 'hace 2 días' },
        { color: 'purple', text: "Nuevo cliente 'Undermix' ha sido agregado.", time: 'hace 3 días' },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon="fa-file-alt" title="Total Cotizaciones" value={totalCotizaciones} color="blue" />
                <StatCard icon="fa-dollar-sign" title="Total Facturado" value={`$${totalFacturado.toLocaleString()}`} color="green" />
                <StatCard icon="fa-users" title="Total Clientes" value={totalClientes} color="purple" />
                <StatCard icon="fa-box" title="Productos Activos" value={productosActivos} color="yellow" />
            </div>
            <div className="mt-8 bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Actividad Reciente</h2>
                <div className="space-y-4">
                     {recentActivity.map((item, index) => <ActivityItem key={index} {...item} />)}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
