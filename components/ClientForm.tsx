
import React, { useState } from 'react';
import { Client } from '../types';

// Basic RUT validation (Chile)
const validateRut = (rut: string): boolean => {
    const cleanRut = rut.replace(/\./g, '');
    if (!/^[0-9]+-[0-9kK]{1}$/.test(cleanRut)) return false;
    let tmp = cleanRut.split('-');
    let digv = tmp[1];
    let rutBody = tmp[0];
    if (digv === 'K') digv = 'k';

    let M = 0, S = 1;
    let rutBodyNum = parseInt(rutBody, 10);
    for (; rutBodyNum; rutBodyNum = Math.floor(rutBodyNum / 10)) {
        S = (S + rutBodyNum % 10 * (9 - M++ % 6)) % 11;
    }
    const calculatedDigv = S ? S - 1 : 'k';
    return calculatedDigv.toString() === digv.toLowerCase();
};

const formatRut = (rut: string): string => {
  const cleanRut = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  const len = cleanRut.length;
  if (len < 2) return cleanRut;

  const dv = cleanRut.substring(len - 1, len);
  let body = cleanRut.substring(0, len - 1);
  
  body = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
  return `${body}-${dv}`;
};

interface ClientFormProps {
    client?: Client;
    onSave: (client: Client) => void;
    onCancel: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ client, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Omit<Client, 'id'>>({
        rut: client?.rut || '',
        companyName: client?.companyName || '',
        address: client?.address || '',
        website: client?.website || '',
        phone: client?.phone || '',
        contactName: client?.contactName || '',
    });
    const [rutError, setRutError] = useState('');

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        let digits = input.replace(/\D/g, '');

        if (digits.startsWith('569')) {
            digits = digits.substring(2);
        }
        
        const number = digits.substring(0, 9);
        const len = number.length;

        let formatted = '';
        if (len > 0) {
            formatted = '+56';
            if (len > 0) {
                formatted += ` ${number.substring(0, 1)}`;
            }
            if (len > 1) {
                formatted += ` ${number.substring(1, 5)}`;
            }
            if (len > 5) {
                formatted += ` ${number.substring(5, 9)}`;
            }
        }
        
        setFormData(prev => ({ ...prev, phone: formatted }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'rut') {
            const formattedRut = formatRut(value);
            setFormData(prev => ({ ...prev, [name]: formattedRut }));
            if (formattedRut && !validateRut(formattedRut)) {
                setRutError('RUT inválido.');
            } else {
                setRutError('');
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.rut && !validateRut(formData.rut)) {
            setRutError('No se puede guardar con un RUT inválido.');
            return;
        }
        onSave({ ...formData, id: client?.id || new Date().toISOString() });
    };

    const inputClasses = "w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre Empresa */}
            <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-600 mb-1">Nombre Empresa</label>
                <div className="relative">
                    <i className="fas fa-building absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input id="companyName" type="text" name="companyName" value={formData.companyName} onChange={handleChange} required className={inputClasses}/>
                </div>
            </div>
            {/* RUT and Contacto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="rut" className="block text-sm font-medium text-gray-600 mb-1">RUT</label>
                    <div className="relative">
                        <i className="fas fa-id-card absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input id="rut" type="text" name="rut" value={formData.rut} onChange={handleChange} placeholder="12.345.678-9" className={inputClasses}/>
                    </div>
                    {rutError && <p className="text-red-500 text-xs mt-1">{rutError}</p>}
                </div>
                <div>
                    <label htmlFor="contactName" className="block text-sm font-medium text-gray-600 mb-1">Nombre Contacto</label>
                     <div className="relative">
                        <i className="fas fa-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input id="contactName" type="text" name="contactName" value={formData.contactName} onChange={handleChange} required className={inputClasses}/>
                    </div>
                </div>
            </div>
            {/* Telefono and Sitio Web */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-600 mb-1">Teléfono</label>
                     <div className="relative">
                        <i className="fas fa-phone absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input id="phone" type="tel" name="phone" value={formData.phone} onChange={handlePhoneChange} placeholder="+56 9 1234 5678" className={inputClasses}/>
                    </div>
                </div>
                <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-600 mb-1">Sitio Web</label>
                     <div className="relative">
                        <i className="fas fa-globe absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input id="website" type="text" name="website" value={formData.website} onChange={handleChange} placeholder="ejemplo.com" className={inputClasses}/>
                    </div>
                </div>
            </div>
            {/* Dirección */}
            <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-600 mb-1">Dirección</label>
                 <div className="relative">
                    <i className="fas fa-map-marker-alt absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input id="address" type="text" name="address" value={formData.address} onChange={handleChange} className={inputClasses}/>
                </div>
            </div>
            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={onCancel} className="px-6 py-2 bg-white text-gray-700 font-medium text-sm rounded-md border border-gray-300 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-medium text-sm rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Guardar</button>
            </div>
        </form>
    );
};

export default ClientForm;
