
import React from 'react';

const StatCard: React.FC<{ icon: string; title: string; value: string; color: string; }> = ({ icon, title, value, color }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 flex items-center space-x-6 transform hover:scale-105 transition-transform duration-300">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${color}`}>
            <i className={`fas ${icon} text-3xl text-white`}></i>
        </div>
        <div>
            <p className="text-slate-500 font-medium">{title}</p>
            <p className="text-3xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

const DashboardPage: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-slate-800">Dashboard</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <StatCard icon="fa-file-invoice-dollar" title="Total Cotizaciones" value="1,250" color="bg-blue-500" />
                <StatCard icon="fa-dollar-sign" title="Total Facturado" value="$89,400" color="bg-green-500" />
                <StatCard icon="fa-users" title="Total Clientes" value="320" color="bg-indigo-500" />
                <StatCard icon="fa-box-open" title="Productos Activos" value="5,480" color="bg-yellow-500" />
            </div>

            <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-slate-800">Actividad Reciente</h2>
                <ul className="divide-y divide-slate-200">
                    <li className="py-3 flex items-center">
                        <i className="fas fa-plus-circle text-green-500 mr-4"></i>
                        <div>
                            <p className="font-semibold text-slate-700">Nueva cotización #C01250 creada para 'Tech Solutions Inc.'</p>
                            <p className="text-sm text-slate-500">hace 2 minutos</p>
                        </div>
                    </li>
                    <li className="py-3 flex items-center">
                        <i className="fas fa-check-circle text-blue-500 mr-4"></i>
                        <div>
                            <p className="font-semibold text-slate-700">Factura #F0894 pagada por 'Global Web Services'.</p>
                            <p className="text-sm text-slate-500">hace 1 hora</p>
                        </div>
                    </li>
                     <li className="py-3 flex items-center">
                        <i className="fas fa-user-plus text-indigo-500 mr-4"></i>
                        <div>
                            <p className="font-semibold text-slate-700">Nuevo cliente 'Innovate Corp' ha sido agregado.</p>
                            <p className="text-sm text-slate-500">hace 3 horas</p>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default DashboardPage;
