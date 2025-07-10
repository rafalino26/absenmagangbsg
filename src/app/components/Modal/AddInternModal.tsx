'use client';

import { useState } from 'react';
import { FiX } from 'react-icons/fi';

// Nanti tipe data ini akan kita sesuaikan dengan skema Prisma
// Tambahkan 'export' di depan interface
export interface NewInternData {
  name: string;
  division: string;
  period: string;
}

interface AddInternModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewInternData) => void;
}

export default function AddInternModal({ isOpen, onClose, onSubmit }: AddInternModalProps) {
  const [name, setName] = useState('');
  const [division, setDivision] = useState('');
  const [period, setPeriod] = useState('');

  const handleSubmit = () => {
    if (name && division && period) {
      onSubmit({ name, division, period});
      onClose();
    } else {
      alert("Semua field wajib diisi.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">Tambah Peserta Magang Baru</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FiX size={24}/></button>
        </div>
        
        <div className="p-6 flex-grow space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full p-2 text-black border border-gray-300 rounded-md"/>
          </div>
          <div>
            <label htmlFor="division" className="block text-sm font-medium text-gray-700">Divisi</label>
            <input type="text" id="division" value={division} onChange={(e) => setDivision(e.target.value)} className="mt-1 w-full p-2 text-black border border-gray-300 rounded-md"/>
          </div>
          <div>
            <label htmlFor="period" className="block text-sm font-medium text-gray-700">Periode Magang</label>
            <input type="text" id="period" value={period} onChange={(e) => setPeriod(e.target.value)} className="mt-1 w-full p-2 text-black border border-gray-300 rounded-md" placeholder="Contoh: 1 Agu 2025 - 31 Okt 2025"/>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t flex justify-end">
           <button type="button" onClick={handleSubmit} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700">Simpan</button>
        </div>
      </div>
    </div>
  );
}