import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30 backdrop-blur-sm">
      <div className="bg-white text-black p-6 rounded-lg shadow-xl w-96 border border-gray-200">
        <h2 className="text-xl font-bold mb-4">Confirm Action</h2>
        <p className="text-gray-700 mb-6">Are you sure you want to clear all empty seats?</p>
        <div className="flex justify-end space-x-3">
          <button 
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors" 
            onClick={onConfirm}
          >
            Clear Seats
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;