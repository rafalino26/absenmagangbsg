'use client';

import { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Menggunakan Fi untuk konsistensi
import { FiX  } from 'react-icons/fi'; // Menggunakan Fi untuk konsistensi
import { InternSummary } from '@/app/types';

// Tipe data untuk props yang diterima komponen ini
interface EditInternModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, data: Partial<InternSummary> & { password?: string }) => void;
  internData: InternSummary | null;
}

export default function EditInternModal({ isOpen, onClose, onSubmit, internData }: EditInternModalProps) {
  // State untuk setiap field di form
  const [name, setName] = useState('');
  const [division, setDivision] = useState('');
  const [period, setPeriod] = useState('');
  const [password, setPassword] = useState(''); // Untuk reset password
  const [showPassword, setShowPassword] = useState(false);

  // 1. useEffect untuk mengisi form dengan data yang ada saat modal dibuka
  useEffect(() => {
    if (internData) {
      setName(internData.name);
      setDivision(internData.division);
      // Asumsi internshipPeriod ada di InternSummary, jika tidak ada sesuaikan
      setPeriod((internData as any).internshipPeriod || ''); 
      setPassword(''); // Selalu kosongkan password saat modal dibuka
    }
  }, [internData]);

  const handleSubmit = () => {
    if (!internData) return; // Jaga-jaga jika data tidak ada

    // Siapkan data yang akan dikirim
    const dataToSubmit: any = {
      name,
      division,
      internshipPeriod: period,
    };

    // 2. Hanya tambahkan password jika field-nya diisi
    if (password) {
      dataToSubmit.password = password;
    }

    onSubmit(internData.id, dataToSubmit);
    onClose();
  };

  if (!isOpen || !internData) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          {/* 3. Judul diubah */}
          <h3 className="text-lg font-bold text-gray-800">Edit Peserta Magang</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FiX size={24}/></button>
        </div>
        
        <div className="p-6 flex-grow space-y-4">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input type="text" id="edit-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full p-2 text-black border border-gray-300 rounded-md"/>
          </div>
          <div>
            <label htmlFor="edit-division" className="block text-sm font-medium text-gray-700">Divisi</label>
            <input type="text" id="edit-division" value={division} onChange={(e) => setDivision(e.target.value)} className="mt-1 w-full p-2 text-black border border-gray-300 rounded-md"/>
          </div>
          <div>
            <label htmlFor="edit-period" className="block text-sm font-medium text-gray-700">Periode Magang</label>
            <input type="text" id="edit-period" value={period} onChange={(e) => setPeriod(e.target.value)} className="mt-1 w-full p-2 text-black border border-gray-300 rounded-md" placeholder="Contoh: 1 Agu 2025 - 31 Okt 2025"/>
          </div>

          {/* 4. Input untuk reset password */}
          <div>
            <label htmlFor="edit-password" className="block text-sm font-medium text-gray-700">Password Baru (Opsional)</label>
            <div className="relative mt-1">
              <input
                id="edit-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full text-black p-2 pr-10 border border-gray-300 rounded-md"
                placeholder="Kosongkan jika tidak ingin diubah"
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
           <button type="button" onClick={handleSubmit} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700">Simpan Perubahan</button>
        </div>
      </div>
    </div>
  );
}