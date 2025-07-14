'use client';

import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

interface BankAccount {
  bank: string;
  number: string;
}

interface BankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BankAccount) => void;
  currentAccount: BankAccount | null;
}

export default function BankAccountModal({ isOpen, onClose, onSubmit, currentAccount }: BankAccountModalProps) {
  // 1. State 'bank' sudah tidak diperlukan lagi
  const [accountNumber, setAccountNumber] = useState('');

  useEffect(() => {
    // Hanya mengisi nomor rekening yang sudah ada
    if (currentAccount) {
      setAccountNumber(currentAccount.number);
    } else {
      setAccountNumber('');
    }
  }, [currentAccount, isOpen]);

  const handleSubmit = () => {
    // 2. Logika submit disederhanakan
    if (accountNumber.trim()) {
      // Nama bank di-hardcode menjadi 'BSG' saat dikirim
      onSubmit({ bank: 'BSG', number: accountNumber });
      onClose();
    } else {
      alert("Nomor rekening tidak boleh kosong.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">Informasi Rekening Bank</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FiX size={24}/></button>
        </div>
        
        <div className="p-6 flex-grow space-y-4">
          {/* 3. Hapus dropdown bank dan ganti dengan teks instruksi */}
          <div className="p-3 rounded-md text-center">
            <p className="text-sm font-semibold text-red-600">
              WAJIB MEMASUKAN REKENING BANK BSG
            </p>
          </div>
          
          <div>
            <label htmlFor="account-number" className="block text-sm font-medium text-gray-700 mb-2">Nomor Rekening BSG</label>
            <input
              type="number"
              id="account-number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full p-2 text-black border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              placeholder="Masukkan nomor rekening BSG Anda..."
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