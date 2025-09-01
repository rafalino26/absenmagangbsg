'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FiX, FiEdit } from 'react-icons/fi';
import { NotificationState } from '@/app/types';
import { Role } from '@prisma/client';
import ManageDivisionsModal from './ManageDivisionsModal'; // Impor modal manage divisi

// Tipe data yang lebih lengkap
interface Division {
  id: number;
  name: string;
}
interface UserData {
  id: number;
  name: string;
  division: Division | null; // Diubah menjadi objek
  role: Role;
}
interface EditMentorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mentorData: UserData | null;
  setNotification: (notification: NotificationState | null) => void;
}

export default function EditMentorModal({ isOpen, onClose, onSuccess, mentorData, setNotification }: EditMentorModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State untuk form
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [divisionId, setDivisionId] = useState<string>('');
  
  // State untuk data & UI
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [isDivisionModalOpen, setDivisionModalOpen] = useState(false);

  // Fungsi untuk mengambil daftar divisi
  const fetchDivisions = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/divisions');
      if (res.ok) setDivisions(await res.json());
    } catch (error) { console.error("Gagal memuat divisi:", error); }
  }, []);

  // Isi form saat data mentor berubah & ambil data divisi
  useEffect(() => {
    if (isOpen) {
      fetchDivisions();
      if (mentorData) {
        setName(mentorData.name);
        setDivisionId(mentorData.division?.id?.toString() || '');
        setPassword('');
        setShowPassword(false);
      }
    }
  }, [isOpen, mentorData, fetchDivisions]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!mentorData) return;
    
    setIsSubmitting(true);
    try {
      const dataToUpdate: any = { 
        name,
        divisionId: parseInt(divisionId)
      };
      if (password) dataToUpdate.password = password;

      const response = await fetch(`/api/admin/mentors/${mentorData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToUpdate),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Gagal menyimpan perubahan.');
      }
      setNotification({ isOpen: true, title: 'Berhasil', message: 'Data akun berhasil diperbarui.', type: 'success' });
      onSuccess();
      onClose();
    } catch (error: any) {
      setNotification({ isOpen: true, title: 'Gagal', message: error.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !mentorData) return null;

  const userType = mentorData.role === Role.ADMIN ? 'Mentor' : 'Dosen';
  const divisionLabel = mentorData.role === Role.ADMIN ? 'Divisi' : 'Universitas / Instansi';

  return (
    <>
      <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-bold text-gray-800">Edit {userType}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FiX size={24}/></button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-black">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
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
                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="" disabled>-- Pilih {divisionLabel} --</option>
                {divisions.map(div => (
                  <option key={div.id} value={div.id}>{div.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password Baru (Opsional)</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full p-2 pr-10 border border-gray-300 rounded-md"
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
            <div className="pt-2">
              <button type="submit" disabled={isSubmitting} className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400">
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
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