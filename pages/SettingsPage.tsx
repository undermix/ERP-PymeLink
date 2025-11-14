
import React, { useState, useRef, useEffect } from 'react';
import { useCompany } from '../App';

// A reusable component for the card sections
const SettingsCard: React.FC<{ title: string; icon: string; children: React.ReactNode; description?: string }> = ({ title, icon, description, children }) => (
    <div className="bg-white rounded-lg shadow p-6 lg:p-8 mb-8">
        <div className="flex items-start mb-4">
            <i className={`fas ${icon} text-xl text-gray-500 mr-4 mt-1`}></i>
            <div>
                <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
            </div>
        </div>
        <div className="mt-6">
            {children}
        </div>
    </div>
);

// A reusable component for input fields with icons
const InputField: React.FC<{ label: string; name: string; type: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; icon: string; placeholder?: string; required?: boolean; hasValidation?: boolean; isValid?: boolean; formatText?: string, error?: string }> = ({ label, name, type, value, onChange, icon, placeholder, required, hasValidation, isValid, formatText, error }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-600 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            <i className={`fas ${icon} absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400`}></i>
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 text-gray-800 ${error ? 'border-red-500 focus:ring-red-500' : (isValid ? 'border-green-500 focus:ring-green-500' : 'border-gray-300 focus:ring-blue-500')}`}
            />
            {hasValidation && isValid && (
                <i className="fas fa-check-circle absolute right-3.5 top-1/2 -translate-y-1/2 text-green-500"></i>
            )}
        </div>
        {formatText && <p className="text-xs text-gray-400 mt-1">{formatText}</p>}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
);

const Notification: React.FC<{ message: string; type: 'success' | 'error'; onDismiss: () => void }> = ({ message, type, onDismiss }) => {
    React.useEffect(() => {
        const timer = setTimeout(onDismiss, 3000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    const baseClasses = "fixed top-5 right-5 z-50 p-4 rounded-lg shadow-lg text-white text-sm font-semibold transition-all duration-300";
    const typeClasses = {
        success: 'bg-green-500',
        error: 'bg-red-500',
    };
    const iconClasses = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
    };

    return (
        <div className={`${baseClasses} ${typeClasses[type]}`}>
            <i className={`fas ${iconClasses[type]} mr-2`}></i>
            {message}
        </div>
    );
};


const SettingsPage: React.FC = () => {
    const { companyInfo: globalCompanyInfo, updateCompanyInfo } = useCompany();
    const [localCompanyInfo, setLocalCompanyInfo] = useState(globalCompanyInfo);
    
    useEffect(() => {
        setLocalCompanyInfo(globalCompanyInfo);
    }, [globalCompanyInfo]);

    const logoInputRef = useRef<HTMLInputElement>(null);

    const [integrationInfo, setIntegrationInfo] = useState({
        apiKey: '',
        branchId: '',
        environment: 'testing',
        isActive: false,
    });

    const [passwordInfo, setPasswordInfo] = useState({ newPassword: '', confirmPassword: '' });
    const [passwordErrors, setPasswordErrors] = useState({ newPassword: '', confirmPassword: '' });
    
    const [notifications, setNotifications] = useState<{ id: number; message: string; type: 'success' | 'error' }[]>([]);
    const [loading, setLoading] = useState<Record<string, boolean>>({});

    const addNotification = (message: string, type: 'success' | 'error') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 3500);
    };

    const handleAction = (key: string, actionFn: () => Promise<any>) => {
        setLoading(prev => ({ ...prev, [key]: true }));
        actionFn().finally(() => {
            setTimeout(() => {
                setLoading(prev => ({ ...prev, [key]: false }));
            }, 500); // give a bit of time for animation
        });
    };

    // Company Info Handlers
    const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => setLocalCompanyInfo({ ...localCompanyInfo, [e.target.name]: e.target.value });
    
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const newLogoUrl = URL.createObjectURL(e.target.files[0]);
            setLocalCompanyInfo(prev => ({ ...prev, logoUrl: newLogoUrl }));
            addNotification("Previsualización del logo actualizada. Haz clic en 'Guardar' para confirmar.", "success");
        }
    };
    
    const handleSaveCompanyInfo = () => handleAction('company', async () => {
        await new Promise(res => setTimeout(res, 1000)); // Simulate API call
        updateCompanyInfo(localCompanyInfo);
        addNotification("Información de la empresa guardada.", "success");
    });
    

    // Integration Handlers
    const handleIntegrationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        setIntegrationInfo({
            ...integrationInfo,
            [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
        });
    };
    const handleTestConnection = () => handleAction('connection', async () => {
        await new Promise(res => setTimeout(res, 1500));
        if(integrationInfo.apiKey && integrationInfo.branchId) {
             addNotification("Conexión exitosa con SimpliFactura.", "success");
        } else {
             addNotification("Error: API Key y Sucursal ID son requeridos.", "error");
        }
    });
    const handleSaveIntegration = () => handleAction('integration', async () => {
        await new Promise(res => setTimeout(res, 1000));
        addNotification("Configuración de integración guardada.", "success");
    });

    // Password Handlers
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordInfo({ ...passwordInfo, [e.target.name]: e.target.value });
        if(passwordErrors.newPassword || passwordErrors.confirmPassword) {
            setPasswordErrors({ newPassword: '', confirmPassword: '' });
        }
    };
    const handleSavePassword = () => handleAction('password', async () => {
        let errors = { newPassword: '', confirmPassword: ''};
        if (!passwordInfo.newPassword) {
            errors.newPassword = 'La nueva contraseña es requerida.';
        } else if (passwordInfo.newPassword.length < 8) {
             errors.newPassword = 'La contraseña debe tener al menos 8 caracteres.';
        }
        if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
            errors.confirmPassword = 'Las contraseñas no coinciden.';
        }
        
        if(errors.newPassword || errors.confirmPassword) {
            setPasswordErrors(errors);
            addNotification("Por favor, corrija los errores.", "error");
            return;
        }

        await new Promise(res => setTimeout(res, 1000));
        addNotification("Contraseña cambiada exitosamente.", "success");
        setPasswordInfo({ newPassword: '', confirmPassword: '' });
        setPasswordErrors({ newPassword: '', confirmPassword: '' });
    });

    return (
        <div>
             {notifications.map(n => (
                <Notification key={n.id} message={n.message} type={n.type} onDismiss={() => setNotifications(prev => prev.filter(notif => notif.id !== n.id))} />
            ))}

            <h1 className="text-3xl font-bold text-gray-800 mb-8">Configuración</h1>

            <SettingsCard
                title="Información de la Empresa"
                icon="fa-building"
                description="Configure los datos de su empresa que aparecerán en cotizaciones y facturas."
            >
                <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <input type="file" ref={logoInputRef} onChange={handleLogoChange} className="hidden" accept="image/png, image/jpeg, image/gif"/>
                        {localCompanyInfo.logoUrl ? 
                             <img src={localCompanyInfo.logoUrl} alt="Company Logo" className="w-16 h-16 rounded-lg object-cover" />
                             :
                             <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center">
                                <i className="fab fa-google text-white text-3xl"></i>
                             </div>
                        }
                        <div>
                             <button onClick={() => logoInputRef.current?.click()} className="px-4 py-2 bg-white text-gray-700 font-semibold rounded-md border border-gray-300 hover:bg-gray-50 transition-colors text-sm">
                                Cambiar Logo
                             </button>
                             <p className="text-xs text-gray-400 mt-1">JPG, PNG o GIF. Máximo 2MB.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Nombre del Negocio" name="name" type="text" value={localCompanyInfo.name} onChange={handleCompanyChange} icon="fa-briefcase" required />
                        <InputField label="RUT" name="rut" type="text" value={localCompanyInfo.rut} onChange={handleCompanyChange} icon="fa-id-card" required hasValidation isValid formatText="Formato: 12.345.678-9"/>
                    </div>
                     <InputField label="Giro / Actividad Económica" name="activity" type="text" value={localCompanyInfo.activity} onChange={handleCompanyChange} icon="fa-store" />
                     <InputField label="Dirección" name="address" type="text" value={localCompanyInfo.address} onChange={handleCompanyChange} icon="fa-map-marker-alt" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Sitio Web" name="website" type="text" value={localCompanyInfo.website} onChange={handleCompanyChange} icon="fa-globe" />
                        <InputField label="Email" name="email" type="email" value={localCompanyInfo.email} onChange={handleCompanyChange} icon="fa-envelope" />
                    </div>
                    <div className="pt-4 flex justify-start">
                        <button onClick={handleSaveCompanyInfo} disabled={loading['company']} className="px-6 py-2.5 bg-gray-800 text-white font-semibold rounded-md hover:bg-gray-900 transition-colors w-full sm:w-auto disabled:opacity-50 flex items-center justify-center">
                             {loading['company'] ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-save mr-2"></i>}
                            {loading['company'] ? 'Guardando...' : 'Guardar Información'}
                        </button>
                    </div>
                </div>
            </SettingsCard>

            <SettingsCard
                title="Integración Facturación Electrónica (SII)"
                icon="fa-file-invoice-dollar"
                description="Configure la integración con SimpliFactura para emitir documentos tributarios electrónicos."
            >
                <div className="space-y-6">
                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-md border border-gray-200">
                        <div><p className="text-sm font-medium text-gray-600">Estado de conexión</p><p className="text-gray-800 font-semibold">Integración desconectada</p></div>
                        <span className="px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-200 rounded-full">Desconectado</span>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-600 mb-1">Proveedor</label><input type="text" value="SimpliFactura" disabled className="w-full p-2.5 bg-gray-200 border border-gray-300 rounded-md cursor-not-allowed text-gray-500" /></div>
                    <InputField label="API Key" name="apiKey" type="password" value={integrationInfo.apiKey} onChange={e => setIntegrationInfo({...integrationInfo, apiKey: e.target.value})} icon="fa-key" placeholder="Ingresa tu API Key de SimpliFactura" required />
                    <InputField label="Sucursal ID" name="branchId" type="text" value={integrationInfo.branchId} onChange={e => setIntegrationInfo({...integrationInfo, branchId: e.target.value})} icon="fa-building" placeholder="ID de tu sucursal" required />
                     <div>
                        <label htmlFor="environment" className="block text-sm font-medium text-gray-600 mb-1">Ambiente</label>
                         <div className="relative"><i className="fas fa-server absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"></i><select id="environment" name="environment" value={integrationInfo.environment} onChange={handleIntegrationChange} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"><option value="testing">Testing (Pruebas)</option><option value="production">Producción</option></select><i className="fas fa-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i></div>
                    </div>
                    <div className="flex items-center"><input type="checkbox" id="isActive" name="isActive" checked={integrationInfo.isActive} onChange={handleIntegrationChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" /><label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Activar integración</label></div>
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg"><p className="font-semibold text-sm text-gray-700">Requisitos:</p><ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1"><li>Cuenta activa en SimpliFactura</li><li>Certificado digital subido en SimpliFactura</li><li>API Key y Sucursal ID obtenidos de tu panel SimpliFactura</li></ul></div>
                    <div className="pt-4 flex items-center justify-between flex-wrap gap-4">
                         <button onClick={handleTestConnection} disabled={loading['connection']} className="px-6 py-2.5 bg-white text-gray-700 font-semibold rounded-md border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center">
                           {loading['connection'] ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-plug mr-2"></i>}
                           {loading['connection'] ? 'Probando...' : 'Probar Conexión'}
                        </button>
                        <button onClick={handleSaveIntegration} disabled={loading['integration']} className="px-6 py-2.5 bg-gray-800 text-white font-semibold rounded-md hover:bg-gray-900 transition-colors disabled:opacity-50 flex items-center justify-center">
                            {loading['integration'] ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-save mr-2"></i>}
                            {loading['integration'] ? 'Guardando...' : 'Guardar Configuración'}
                        </button>
                    </div>
                </div>
            </SettingsCard>

            <SettingsCard title="Cambiar Contraseña" icon="fa-lock">
                <div className="space-y-6">
                    <InputField label="Nueva Contraseña" name="newPassword" type="password" value={passwordInfo.newPassword} onChange={handlePasswordChange} icon="fa-key" placeholder="Ingrese nueva contraseña" error={passwordErrors.newPassword} />
                    <InputField label="Confirmar Contraseña" name="confirmPassword" type="password" value={passwordInfo.confirmPassword} onChange={handlePasswordChange} icon="fa-key" placeholder="Confirme su nueva contraseña" error={passwordErrors.confirmPassword}/>
                    <div className="pt-4 flex justify-start">
                         <button onClick={handleSavePassword} disabled={loading['password']} className="px-6 py-2.5 bg-gray-800 text-white font-semibold rounded-md hover:bg-gray-900 transition-colors disabled:opacity-50 flex items-center justify-center">
                             {loading['password'] ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-key mr-2"></i>}
                             {loading['password'] ? 'Cambiando...' : 'Cambiar Contraseña'}
                        </button>
                    </div>
                </div>
            </SettingsCard>
        </div>
    );
};

export default SettingsPage;
