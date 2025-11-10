

import React, { useState } from 'react';
import { Client, Invoice, Payment, Check, PaymentMethod } from '../types';
import { banks } from '../data/banks';

interface PaymentFormProps {
    client: Client;
    unpaidInvoices: Invoice[];
    onSave: (payment: Omit<Payment, 'id' | 'clientId'>, checkData?: Omit<Check, 'id' | 'clientId' | 'status'>) => void;
    onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ client, unpaidInvoices, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        date: new Date().toLocaleDateString('en-CA'),
        method: PaymentMethod.Transfer,
        invoiceId: '',
        amount: 0,
    });

    const [checkData, setCheckData] = useState({
        number: '',
        bank: '',
        paymentDate: new Date().toLocaleDateString('en-CA'),
        amount: 0
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        let processedValue: string | number = value;
        if (name === 'amount') {
            processedValue = parseFloat(value) || 0;
        }

        setFormData(prev => ({ ...prev, [name]: processedValue }));

        // Auto-fill amount if an invoice is selected
        if (name === 'invoiceId') {
            const selectedInvoice = unpaidInvoices.find(inv => inv.id === value);
            if (selectedInvoice) {
                setFormData(prev => ({ ...prev, amount: selectedInvoice.total }));
                if (formData.method === PaymentMethod.Check) {
                    setCheckData(prev => ({...prev, amount: selectedInvoice.total}));
                }
            }
        }
    };
    
    const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let processedValue: string | number = value;
        if (name === 'amount') {
            processedValue = parseFloat(value) || 0;
        }
        setCheckData(prev => ({...prev, [name]: processedValue}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.invoiceId || formData.amount <= 0) {
            alert('Por favor, seleccione una orden y ingrese un monto válido.');
            return;
        }
        
        if (formData.method === PaymentMethod.Check) {
            if (!checkData.number || !checkData.bank) {
                alert('Por favor, complete los detalles del cheque.');
                return;
            }
            onSave(formData, {...checkData, amount: formData.amount}); // Use main amount for check
        } else {
            onSave(formData);
        }
    };

    const inputClasses = "w-full p-3 bg-slate-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="invoiceId" className="block text-sm font-medium text-slate-600 mb-1">Orden a Pagar</label>
                <select id="invoiceId" name="invoiceId" value={formData.invoiceId} onChange={handleChange} required className={inputClasses}>
                    <option value="">Seleccione una orden...</option>
                    {unpaidInvoices.map(inv => (
                        <option key={inv.id} value={inv.id}>
                            {inv.id} - ${inv.total.toLocaleString()} (Vence: {inv.dueDate})
                        </option>
                    ))}
                </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-slate-600 mb-1">Monto del Pago</label>
                    <input id="amount" type="number" name="amount" value={formData.amount > 0 ? formData.amount : ''} onChange={handleChange} required className={inputClasses} placeholder="0"/>
                </div>
                 <div>
                    <label htmlFor="date" className="block text-sm font-medium text-slate-600 mb-1">Fecha de Pago</label>
                    <input id="date" type="date" name="date" value={formData.date} onChange={handleChange} required className={inputClasses}/>
                </div>
            </div>

            <div>
                <label htmlFor="method" className="block text-sm font-medium text-slate-600 mb-1">Método de Pago</label>
                <select id="method" name="method" value={formData.method} onChange={handleChange} required className={inputClasses}>
                    {Object.values(PaymentMethod).filter(m => m !== PaymentMethod.CreditCard).map(method => (
                         <option key={method} value={method}>{method}</option>
                    ))}
                </select>
            </div>

            {formData.method === PaymentMethod.Check && (
                <div className="space-y-4 rounded-lg border border-slate-200 p-4 bg-slate-50">
                    <h3 className="font-semibold text-slate-700">Detalles del Cheque</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="checkNumber" className="block text-sm font-medium text-slate-600 mb-1">Número de Cheque</label>
                            <input id="checkNumber" type="text" name="number" value={checkData.number} onChange={handleCheckChange} required className={inputClasses}/>
                        </div>
                        <div>
                            <label htmlFor="checkBank" className="block text-sm font-medium text-slate-600 mb-1">Banco</label>
                            <select id="checkBank" name="bank" value={checkData.bank} onChange={handleCheckChange} required className={inputClasses}>
                                <option value="">Seleccione un banco</option>
                                {banks.map(bank => (
                                    <option key={bank.codigo_sbf} value={bank.nombre}>{bank.nombre}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="checkPaymentDate" className="block text-sm font-medium text-slate-600 mb-1">Fecha de Cobro</label>
                        <input id="checkPaymentDate" type="date" name="paymentDate" value={checkData.paymentDate} onChange={handleCheckChange} required className={inputClasses}/>
                    </div>
                </div>
            )}
            
            <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={onCancel} className="px-6 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">Guardar Pago</button>
            </div>
        </form>
    );
};

export default PaymentForm;