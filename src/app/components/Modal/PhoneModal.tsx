'use client';

import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

// 1. Definisikan props yang baru
interface PhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (phone: string) => void;
  currentPhone: string | null;
}

export default function PhoneModal({ isOpen, onClose, onSubmit, currentPhone }: PhoneModalProps) {
  // 2. State hanya untuk nomor telepon
  const [phoneNumber, setPhoneNumber] = useState('');

  // 3. useEffect untuk mengisi form dengan data yang sudah ada
  useEffect(() => {
    if (isOpen && currentPhone) {
      setPhoneNumber(currentPhone);
    } else {
      setPhoneNumber(''); // Kosongkan saat modal ditutup atau tidak ada data awal
    }
  }, [currentPhone, isOpen]);

  const handleSubmit = () => {
    // 4. Validasi simpel dan kirim hanya nomor telepon
    if (phoneNumber.trim().length > 9) { // Cek apakah nomor cukup panjang
      onSubmit(phoneNumber);
      onClose();
    } else {
      alert("Nomor telepon tidak valid. Harap isi dengan benar.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          {/* 5. Ganti Judul Modal */}
          <h3 className="text-lg font-bold text-gray-800">Informasi Nomor Telepon</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FiX size={24}/></button>
        </div>
        
        <div className="p-6 flex-grow space-y-4">
          {/* 6. Ganti Form Input menjadi untuk nomor telepon */}
          <div>
            <label htmlFor="phone-number" className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon (WhatsApp)</label>
            <input
              type="number"
              id="phone-number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full p-2 text-black border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              placeholder="Contoh: 081234567890"
            />
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
           <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Batal</button>
           <button type="button" onClick={handleSubmit} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">Simpan</button>
        </div>
      </div>
    </div>
  );
}