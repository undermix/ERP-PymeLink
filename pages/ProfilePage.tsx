
import React from 'react';

const ProfilePage: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Perfil y Usuarios</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <img src="https://picsum.photos/128/128" alt="Admin" className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-200"/>
                        <h2 className="text-xl font-bold text-gray-800">Admin User</h2>
                        <p className="text-gray-500">administrator</p>
                        <button className="mt-4 w-full bg-gray-100 text-gray-600 px-4 py-2 rounded-md hover:bg-gray-200 text-sm font-medium">
                            Cambiar Foto
                        </button>
                    </div>
                </div>

                {/* Profile Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-bold border-b border-gray-200 pb-4 mb-6 text-gray-800">Configuración de Perfil</h3>
                        <form className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-600">Nombre Completo</label>
                                <input type="text" defaultValue="Admin User" className="mt-1 block w-full bg-gray-50 border-gray-300 rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Email</label>
                                <input type="email" defaultValue="admin@example.com" className="mt-1 block w-full bg-gray-50 border-gray-300 rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-600">Nueva Contraseña</label>
                                <input type="password" placeholder="********" className="mt-1 block w-full bg-gray-50 border-gray-300 rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"/>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 font-medium text-sm">
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* User Management Table */}
            <div className="mt-8 bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Administrar Usuarios</h3>
                    <button className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 font-medium"><i className="fas fa-user-plus mr-2"></i>Invitar Usuario</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="py-3 px-6 font-semibold">Usuario</th>
                                <th className="py-3 px-6 font-semibold">Rol</th>
                                <th className="py-3 px-6 font-semibold">Último Acceso</th>
                                <th className="py-3 px-6 font-semibold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            <tr>
                                <td className="py-3 px-6 flex items-center">
                                    <img src="https://picsum.photos/40/40" alt="User" className="w-10 h-10 rounded-full mr-3"/>
                                    <div>
                                        <p className="font-semibold text-gray-800">Admin User</p>
                                        <p className="text-sm text-gray-500">admin@example.com</p>
                                    </div>
                                </td>
                                <td className="py-3 px-6">Administrador</td>
                                <td className="py-3 px-6">Hoy</td>
                                <td className="py-3 px-6 space-x-4 text-right">
                                    <button title="Editar" className="text-gray-400 hover:text-indigo-600"><i className="fas fa-edit"></i></button>
                                    <button title="Eliminar" className="text-gray-400 hover:text-red-600"><i className="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default ProfilePage;
