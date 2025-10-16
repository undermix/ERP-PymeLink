import React from 'react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, itemName, itemType }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <i className="fas fa-exclamation-triangle text-red-600 text-xl" aria-hidden="true"></i>
        </div>
        <h3 id="delete-modal-title" className="text-lg font-medium text-slate-900 mt-4">Eliminar {itemType}</h3>
        <div className="mt-2 text-sm text-slate-500">
          <p>¿Estás seguro que quieres eliminar <strong>{itemName}</strong>? Esta acción no se puede deshacer.</p>
        </div>
        <div className="mt-6 flex justify-center space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
