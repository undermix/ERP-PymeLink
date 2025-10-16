
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  const navItems = [
    { to: "/dashboard", icon: "fa-tachometer-alt", label: "Dashboard" },
    { to: "/clients", icon: "fa-users", label: "Clientes" },
    { to: "/products", icon: "fa-box-open", label: "Productos" },
    { to: "/warehouses", icon: "fa-warehouse", label: "Bodegas" },
    { to: "/quotes", icon: "fa-file-invoice-dollar", label: "Cotizaciones" },
    { to: "/invoices", icon: "fa-receipt", label: "Facturas" },
    { to: "/profile", icon: "fa-user-cog", label: "Perfil y Usuarios" },
  ];

  const NavItem: React.FC<{ to: string, icon: string, label: string }> = ({ to, icon, label }) => (
    <NavLink
      to={to}
      className={({ isActive }) => 
        `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 ${isActive ? 'bg-indigo-50 text-indigo-600 font-semibold' : ''}`
      }
      onClick={() => setSidebarOpen(false)}
    >
      {/* FIX: Use NavLink's children render prop to access `isActive` for styling child elements. */}
      {({ isActive }) => (
        <>
          <i className={`fas ${icon} w-6 text-center text-lg ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}></i>
          <span className="ml-4">{label}</span>
        </>
      )}
    </NavLink>
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 border-r border-slate-200`}>
        <div className="flex items-center justify-center h-20 border-b border-slate-200">
          <i className="fas fa-cubes text-3xl text-indigo-500"></i>
          <h1 className="text-2xl font-bold ml-3 text-slate-800">ERP System</h1>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map(item => <NavItem key={item.to} {...item} />)}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-200">
          <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors duration-200">
            <i className="fas fa-sign-out-alt w-6 text-center text-slate-400"></i>
            <span className="ml-4 font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-500 focus:outline-none md:hidden">
            <i className="fas fa-bars text-2xl"></i>
          </button>
          <div className="flex items-center">
             <div className="relative">
                <input type="text" placeholder="Buscar..." className="w-full sm:w-64 pl-4 pr-10 py-2 rounded-full bg-slate-100 border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <i className="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
             </div>
          </div>
          <div className="flex items-center">
            <i className="fas fa-bell text-xl text-slate-500 hover:text-indigo-500 cursor-pointer"></i>
            <div className="ml-6 flex items-center">
                <img src="https://picsum.photos/40/40" alt="User" className="w-10 h-10 rounded-full" />
                <div className="ml-3 hidden sm:block">
                    <p className="font-semibold text-sm text-slate-700">Admin</p>
                    <p className="text-xs text-slate-500">administrator</p>
                </div>
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
