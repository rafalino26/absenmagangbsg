'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { FiX, FiEye, FiEyeOff, FiEdit } from 'react-icons/fi';
import { NotificationState } from '@/app/types';
import { Role } from '@prisma/client';
import ManageDivisionsModal from './ManageDivisionsModal';
import ManageUniversitiesModal from './ManageUniversitiesModal';

interface Option { // Membuat interface generik untuk dropdown
  id: number;
  name: string;
}

interface AddMentorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  setNotification: (notification: NotificationState | null) => void;
}

export default function AddMentorModal({ isOpen, onClose, onSuccess, setNotification }: AddMentorModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>(Role.ADMIN);

  // --- PERBAIKAN 2: Pisahkan state untuk Divisi dan Universitas ---
  const [divisionId, setDivisionId] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [divisions, setDivisions] = useState<Option[]>([]);
  const [universities, setUniversities] = useState<Option[]>([]);
  const [isDivisionModalOpen, setDivisionModalOpen] = useState(false);
  const [isUniversityModalOpen, setUniversityModalOpen] = useState(false);
  // ----------------------------------------------------------------

  const fetchOptions = useCallback(async () => {
    try {
      // Ambil kedua data secara bersamaan untuk efisiensi
      const [divisionsRes, universitiesRes] = await Promise.all([
        fetch('/api/admin/divisions'),
        fetch('/api/admin/universities')
      ]);
      
      if (divisionsRes.ok) setDivisions(await divisionsRes.json());
      if (universitiesRes.ok) setUniversities(await universitiesRes.json());

    } catch (error) {
      console.error("Gagal memuat daftar pilihan", error);
      setNotification({ isOpen: true, title: 'Error', message: 'Gagal memuat daftar divisi atau universitas.', type: 'error' });
    }
  }, [setNotification]);

  // Reset state saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setName('');
      setPassword('');
      setShowPassword(false);
      setRole(Role.ADMIN);
      setDivisionId('');
      setUniversityId('');
      fetchOptions();
    }
  }, [isOpen, fetchOptions]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // --- PERBAIKAN 3: Siapkan data yang akan dikirim secara dinamis ---
    let payload: any = {
      name,
      password,
      role,
    };

    if (role === Role.ADMIN) {
      payload.divisionId = parseInt(divisionId);
    } else if (role === Role.LECTURER) {
      payload.universityId = parseInt(universityId);
    }
    // -----------------------------------------------------------------

    try {
      // Pastikan Anda sudah membuat API endpoint ini
      const response = await fetch('/api/admin/mentors', { // Endpoint yang lebih generik
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Gagal menambahkan akun.');
      }

      setNotification({ isOpen: true, title: 'Berhasil', message: 'Akun baru berhasil ditambahkan.', type: 'success' });
      onSuccess();
      onClose();
    } catch (error: any) {
      setNotification({ isOpen: true, title: 'Gagal', message: error.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;
  
  // Variabel dinamis untuk dropdown
  const isMentor = role === Role.ADMIN;
  const label = isMentor ? 'Divisi' : 'Universitas';
  const options = isMentor ? divisions : universities;
  const selectedId = isMentor ? divisionId : universityId;
  const setSelectedId = isMentor ? setDivisionId : setUniversityId;
  const openManageModal = isMentor ? () => setDivisionModalOpen(true) : () => setUniversityModalOpen(true);

  return (
    <>
      <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-40">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-bold text-gray-800">Tambah Akun Baru</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FiX size={24}/></button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 text-black">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipe Akun</label>
                <div className="mt-2 flex gap-4">
                  <label className="flex items-center">
                    <input type="radio" name="role" value={Role.ADMIN} checked={isMentor} onChange={() => setRole(Role.ADMIN)} className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"/>
                    <span className="ml-2 text-gray-800">Mentor</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="role" value={Role.LECTURER} checked={!isMentor} onChange={() => setRole(Role.LECTURER)} className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"/>
                    <span className="ml-2 text-gray-800">Dosen</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
              </div>

              {/* --- PERBAIKAN 4: Dropdown dinamis --- */}
              <div>
                <label className="flex items-center justify-between text-sm font-medium text-gray-700">
                  <span>{label}</span>
                  <button type="button" onClick={openManageModal} className="text-blue-600 hover:text-blue-800" title={`Kelola Pilihan ${label}`}>
                    <FiEdit size={14} />
                  </button>
                </label>
                <select 
                  value={selectedId} 
                  onChange={(e) => setSelectedId(e.target.value)} 
                  required 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="" disabled>-- Pilih {label} --</option>
                  {options.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                </select>
              </div>
              {/* ----------------------------------- */}

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full border border-gray-300 rounded-md shadow-sm p-2 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                  >
                    {showPassword ? <FiEye /> : <FiEyeOff />}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button type="submit" disabled={isSubmitting} className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400">
                {isSubmitting ? 'Menyimpan...' : 'Simpan Akun'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* --- PERBAIKAN 5: Tambahkan kedua modal manage --- */}
      <ManageDivisionsModal 
        isOpen={isDivisionModalOpen}
        onClose={() => setDivisionModalOpen(false)}
        setNotification={setNotification}
        onUpdate={fetchOptions} // onUpdate sekarang memanggil fetchOptions
      />
      <ManageUniversitiesModal
        isOpen={isUniversityModalOpen}
        onClose={() => setUniversityModalOpen(false)}
        setNotification={setNotification}
        onUpdate={fetchOptions} // onUpdate sekarang memanggil fetchOptions
      />
      {/* --------------------------------------------- */}
    </>
  );
}