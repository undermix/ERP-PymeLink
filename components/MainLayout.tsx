import React, { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { useCompany } from '../App';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(true);
  const auth = useAuth();
  const { companyInfo } = useCompany();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  const NavItem: React.FC<{ to: string, icon: string, label: string, isSubItem?: boolean }> = ({ to, icon, label, isSubItem = false }) => (
    <NavLink
      to={to}
      end
      className={({ isActive }) => 
        `flex items-center px-4 py-1 rounded-lg transition-colors duration-200 text-sm font-medium ${isSubItem ? 'pl-8' : ''} ${
          isActive 
            ? 'bg-gray-100 text-blue-600' 
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
      onClick={() => setSidebarOpen(false)}
    >
      <i className={`fas ${icon} w-6 text-center text-base`}></i>
      <span className="ml-2 whitespace-nowrap">{label}</span>
    </NavLink>
  );

  return (
    <div className="flex h-screen bg-slate-50 text-gray-800 font-sans">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 border-r border-gray-200 flex flex-col`}>
        <div className="flex items-center h-16 px-6 border-b border-gray-200 flex-shrink-0">
            {companyInfo.logoUrl ? (
              <img src={companyInfo.logoUrl} alt="Company Logo" className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <i className="fab fa-google text-3xl text-blue-500"></i>
            )}
            <div className="ml-3">
                <h1 className="text-lg font-bold text-gray-800">{companyInfo.name}</h1>
                <p className="text-xs text-gray-500">ERP para Pymes</p>
            </div>
        </div>
        
        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
          <div>
            <h2 className="px-4 py-2 text-sm font-bold text-gray-400 uppercase tracking-wider">Menú Principal</h2>
            <NavItem to="/dashboard" icon="fa-th-large" label="Dashboard" />
            <NavItem to="/clients" icon="fa-users" label="Clientes" />
          </div>

           <div>
            <h2 className="px-4 py-2 text-sm font-bold text-gray-400 uppercase tracking-wider">Ventas</h2>
             <NavItem to="/quotes" icon="fa-file-invoice" label="Cotizaciones" />
             <NavItem to="/invoices" icon="fa-file-invoice-dollar" label="Órdenes" />
             <NavItem to="/pos-history" icon="fa-history" label="Venta POS" />
          </div>
          
          <div>
            <h2 className="px-4 py-2 text-sm font-bold text-gray-400 uppercase tracking-wider">Logística</h2>
            <button 
              onClick={() => setIsInventoryOpen(!isInventoryOpen)}
              className="flex items-center w-full px-4 py-1 rounded-lg transition-colors duration-200 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <i className="fas fa-truck w-6 text-center text-base"></i>
              <span className="ml-2 whitespace-nowrap">Gestión de Inventario</span>
              <i className={`fas fa-chevron-up ml-auto transition-transform duration-200 ${isInventoryOpen ? '' : 'rotate-180'}`}></i>
            </button>
            {isInventoryOpen && (
              <div className="mt-1 space-y-1">
                <NavItem to="/warehouses" icon="fa-warehouse" label="Bodegas" isSubItem />
                <NavItem to="/stock-movements" icon="fa-history" label="Movimientos de Stock" isSubItem />
                <NavItem to="/products" icon="fa-box-open" label="Productos" isSubItem />
                <NavItem to="/price-lists" icon="fa-dollar-sign" label="Listas de Precios" isSubItem />
              </div>
            )}
          </div>
        </nav>
        
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
            <NavItem to="/settings" icon="fa-cog" label="Configuración" />
            <button onClick={handleLogout} className="flex items-center w-full px-4 py-1 mt-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200 text-sm font-medium">
                <i className="fas fa-sign-out-alt w-6 text-center"></i>
                <span className="ml-2 whitespace-nowrap">Cerrar Sesión</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 focus:outline-none md:hidden">
            <i className="fas fa-bars text-2xl"></i>
          </button>
           <div className="flex-1"></div>
          <div className="flex items-center">
            <Link to="/pos" className="text-xl text-gray-500 hover:text-blue-500 cursor-pointer" title="Punto de Venta (POS)">
              <i className="fas fa-cash-register"></i>
            </Link>
            <i className="fas fa-bell text-xl text-gray-500 hover:text-blue-500 cursor-pointer ml-6"></i>
             <div className="ml-6 flex items-center">
                <Link to="/profile" className="flex items-center focus:outline-none">
                    <img src="https://picsum.photos/40/40" alt="User" className="w-10 h-10 rounded-full" />
                </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;