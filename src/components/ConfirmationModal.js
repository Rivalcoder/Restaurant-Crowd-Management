import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-gray-50 text-black p-6 rounded shadow-lg">
        <h2 className="text-lg font-semibold">Confirm Action</h2>
        <p>Are you sure you want to clear all empty seats?</p>
        <div className="mt-4 flex justify-end">
          <button className="btn btn-secondary mr-2" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Clear Seats</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal; 