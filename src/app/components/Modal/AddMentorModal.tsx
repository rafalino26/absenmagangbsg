'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { FiX, FiEye, FiEyeOff, FiEdit } from 'react-icons/fi'; // Impor ikon mata
import { NotificationState } from '@/app/types';
import { Role } from '@prisma/client';
import ManageDivisionsModal from './ManageDivisionsModal';

interface Division {
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
  const [divisionId, setDivisionId] = useState(''); // State untuk ID divisi yang dipilih
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [isDivisionModalOpen, setDivisionModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State untuk ikon mata
  const [role, setRole] = useState<Role>(Role.ADMIN);

  const fetchDivisions = useCallback(async () => {
      try {
        const response = await fetch('/api/admin/divisions');
        if (response.ok) {
          setDivisions(await response.json());
        }
      } catch (error) {
        console.error("Gagal memuat daftar divisi", error);
      }
    }, []);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setPassword('');
      setShowPassword(false);
      setRole(Role.ADMIN);
      setDivisionId('');
      fetchDivisions();
    }
  }, [isOpen, fetchDivisions]);

 const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/mentors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          password, 
          role, 
          divisionId: parseInt(divisionId) // Kirim ID divisi
        }),
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
  
  const divisionLabel = role === Role.ADMIN ? 'Divisi' : 'Universitas / Instansi';
  const divisionPlaceholder = role === Role.ADMIN ? 'Contoh: Human Capital' : 'Contoh: Universitas Sam Ratulangi';

  return (
    <>
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-40">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">Tambah Mentor Baru</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FiX size={24}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 text-black">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipe Akun</label>
              <div className="mt-2 flex gap-4">
                <label className="flex items-center">
                  <input type="radio" name="role" value={Role.ADMIN} checked={role === Role.ADMIN} onChange={() => setRole(Role.ADMIN)} className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"/>
                  <span className="ml-2 text-gray-800">Mentor</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="role" value={Role.LECTURER} checked={role === Role.LECTURER} onChange={() => setRole(Role.LECTURER)} className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"/>
                  <span className="ml-2 text-gray-800">Dosen</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
            </div>
           <div>
                <label className="flex items-center justify-between text-sm font-medium text-gray-700">
                  <span>{divisionLabel}</span>
                  <button type="button" onClick={() => setDivisionModalOpen(true)} className="text-blue-600 hover:text-blue-800" title="Kelola Pilihan">
                    <FiEdit size={14} />
                  </button>
                </label>
                <select 
                  value={divisionId} 
                  onChange={(e) => setDivisionId(e.target.value)} 
                  required 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="" disabled>-- Pilih {divisionLabel} --</option>
                  {divisions.map(div => <option key={div.id} value={div.id}>{div.name}</option>)}
                </select>
              </div>
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
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <FiEye /> : <FiEyeOff />}
                </button>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <button type="submit" disabled={isSubmitting} className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400">
              {isSubmitting ? 'Menyimpan...' : 'Simpan Mentor'}
            </button>
          </div>
        </form>
      </div>
    </div>
    <ManageDivisionsModal 
        isOpen={isDivisionModalOpen}
        onClose={() => setDivisionModalOpen(false)}
        setNotification={setNotification}
        onUpdate={fetchDivisions}
      />
    </>
  );
}