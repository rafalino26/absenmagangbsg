'use client';

import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Impor ikon mata
import { FiX } from 'react-icons/fi';

// 1. Tambahkan properti 'password' di interface
export interface NewInternData {
  name: string;
  division: string;
  period: string;
  password: string; 
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
  // 2. Tambahkan state untuk password
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    // 4. Perbarui validasi dan data yang dikirim
    if (name && division && period && password) {
      onSubmit({ name, division, period, password });
      onClose();
    } else {
      alert("Semua field wajib diisi.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50">
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

          {/* 3. Tambahkan input untuk password di sini */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password Awal</label>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full text-black p-2 pr-10 border border-gray-300 rounded-md"
                placeholder="Buat password untuk peserta"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
          </div>

        </div>

        <div className="p-4 bg-gray-50 border-t flex justify-end">
           <button type="button" onClick={handleSubmit} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700">Simpan</button>
        </div>
      </div>
    </div>
  );
}