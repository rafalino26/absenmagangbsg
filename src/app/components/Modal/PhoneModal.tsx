'use client';

import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

interface PhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (phone: string) => void;
  currentPhone: string | null;
}

export default function PhoneModal({ isOpen, onClose, onSubmit, currentPhone }: PhoneModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen && currentPhone) {
      setPhoneNumber(currentPhone);
    } else {
      setPhoneNumber('');
      setErrorMessage('');
    }
  }, [currentPhone, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setPhoneNumber(value);
      setErrorMessage('');
    } else {
      setErrorMessage('Nomor telepon hanya boleh berisi angka.');
    }
  };

  const handleSubmit = () => {
    if (phoneNumber.trim().length > 9) {
      onSubmit(phoneNumber);
      onClose();
    } else {
      setErrorMessage('Nomor telepon tidak valid. Minimal 10 digit.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">Informasi Nomor Telepon</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6 flex-grow space-y-4">
          <div>
            <label htmlFor="phone-number" className="block text-sm font-medium text-gray-700 mb-2">
              Nomor Telepon (WhatsApp)
            </label>
            <input
              type="text"
              id="phone-number"
              value={phoneNumber}
              onChange={handleChange}
              className="w-full p-2 text-black border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              placeholder="Contoh: 081234567890"
              inputMode="numeric"
              pattern="[0-9]*"
            />
            {errorMessage && (
              <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
            )}
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
