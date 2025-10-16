
import React from 'react';

const ProfilePage: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-slate-800">Perfil y Usuarios</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <img src="https://picsum.photos/128/128" alt="Admin" className="w-32 h-32 rounded-full mx-auto mb-4"/>
                        <h2 className="text-xl font-bold text-slate-800">Admin User</h2>
                        <p className="text-slate-500">administrator</p>
                        <button className="mt-4 w-full bg-indigo-100 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-200">
                            Cambiar Foto
                        </button>
                    </div>
                </div>

                {/* Profile Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-bold border-b border-slate-200 pb-4 mb-4 text-slate-800">Configuración de Perfil</h3>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600">Nombre Completo</label>
                                <input type="text" defaultValue="Admin User" className="mt-1 block w-full bg-slate-50 border-slate-300 rounded-md p-2"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600">Email</label>
                                <input type="email" defaultValue="admin@example.com" className="mt-1 block w-full bg-slate-50 border-slate-300 rounded-md p-2"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-600">Nueva Contraseña</label>
                                <input type="password" placeholder="********" className="mt-1 block w-full bg-slate-50 border-slate-300 rounded-md p-2"/>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700">
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* User Management Table */}
            <div className="mt-8 bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-4">
                    <h3 className="text-lg font-bold text-slate-800">Administrar Usuarios</h3>
                    <button className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600"><i className="fas fa-user-plus mr-2"></i>Invitar Usuario</button>
                </div>
                <table className="w-full text-left text-slate-600">
                    <thead>
                        <tr className="text-slate-500">
                            <th className="py-2">Usuario</th><th className="py-2">Rol</th><th className="py-2">Último Acceso</th><th className="py-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-t border-slate-200">
                            <td className="py-3 flex items-center">
                                <img src="https://picsum.photos/40/40" alt="User" className="w-10 h-10 rounded-full mr-3"/>
                                <div>
                                    <p className="font-semibold text-slate-800">Admin User</p>
                                    <p className="text-sm text-slate-500">admin@example.com</p>
                                </div>
                            </td>
                            <td className="py-3">Administrador</td>
                            <td className="py-3">Hoy</td>
                            <td className="py-3 space-x-2">
                                <button className="text-indigo-500"><i className="fas fa-edit"></i></button>
                                <button className="text-red-500"><i className="fas fa-trash"></i></button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default ProfilePage;
