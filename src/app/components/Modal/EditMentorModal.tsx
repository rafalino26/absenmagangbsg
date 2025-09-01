'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FiX, FiEdit } from 'react-icons/fi';
import { NotificationState } from '@/app/types';
import { Role } from '@prisma/client';
import ManageDivisionsModal from './ManageDivisionsModal';
import ManageUniversitiesModal from './ManageUniversitiesModal'; // PERBAIKAN 1: Impor modal universitas

// Interface generik untuk dropdown
interface Option {
  id: number;
  name: string;
}

// PERBAIKAN 2: Perbarui UserData untuk menyertakan university
interface UserData {
  id: number;
  name: string;
  division: Option | null;
  university: Option | null; // Tambahkan university
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
  
  // PERBAIKAN 3: Pisahkan state untuk Divisi dan Universitas
  const [divisionId, setDivisionId] = useState<string>('');
  const [universityId, setUniversityId] = useState<string>('');
  const [divisions, setDivisions] = useState<Option[]>([]);
  const [universities, setUniversities] = useState<Option[]>([]);
  const [isDivisionModalOpen, setDivisionModalOpen] = useState(false);
  const [isUniversityModalOpen, setUniversityModalOpen] = useState(false);

  // Fungsi untuk mengambil daftar divisi & universitas
  const fetchOptions = useCallback(async () => {
    try {
      const [divisionsRes, universitiesRes] = await Promise.all([
        fetch('/api/admin/divisions'),
        fetch('/api/admin/universities')
      ]);
      if (divisionsRes.ok) setDivisions(await divisionsRes.json());
      if (universitiesRes.ok) setUniversities(await universitiesRes.json());
    } catch (error) { console.error("Gagal memuat pilihan:", error); }
  }, []);

  // Isi form saat data mentor berubah & ambil data
  useEffect(() => {
    if (isOpen) {
      fetchOptions();
      if (mentorData) {
        setName(mentorData.name);
        setPassword('');
        setShowPassword(false);
        // PERBAIKAN 4: Isi state yang sesuai berdasarkan peran
        if (mentorData.role === Role.ADMIN) {
          setDivisionId(mentorData.division?.id?.toString() || '');
          setUniversityId('');
        } else if (mentorData.role === Role.LECTURER) {
          setUniversityId(mentorData.university?.id?.toString() || '');
          setDivisionId('');
        }
      }
    }
  }, [isOpen, mentorData, fetchOptions]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!mentorData) return;
    
    setIsSubmitting(true);
    try {
      // PERBAIKAN 5: Buat payload update secara dinamis
      const dataToUpdate: any = { name };
      if (password) {
        dataToUpdate.password = password;
      }

      if (mentorData.role === Role.ADMIN) {
        dataToUpdate.divisionId = parseInt(divisionId);
      } else if (mentorData.role === Role.LECTURER) {
        dataToUpdate.universityId = parseInt(universityId);
      }

      const response = await fetch(`/api/admin/mentors/${mentorData.id}`, { // Gunakan endpoint user generik
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

  // PERBAIKAN 6: Variabel dinamis untuk dropdown
  const isMentor = mentorData.role === Role.ADMIN;
  const label = isMentor ? 'Divisi' : 'Universitas';
  const options = isMentor ? divisions : universities;
  const selectedId = isMentor ? divisionId : universityId;
  const setSelectedId = isMentor ? setDivisionId : setUniversityId;
  const openManageModal = isMentor ? () => setDivisionModalOpen(true) : () => setUniversityModalOpen(true);

  return (
    <>
      <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-bold text-gray-800">Edit {isMentor ? 'Mentor' : 'Dosen'}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FiX size={24}/></button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-black">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
            </div>
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
                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="" disabled>-- Pilih {label} --</option>
                {options.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
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
      
      {/* PERBAIKAN 7: Sertakan kedua modal manage */}
      <ManageDivisionsModal 
        isOpen={isDivisionModalOpen}
        onClose={() => setDivisionModalOpen(false)}
        setNotification={setNotification}
        onUpdate={fetchOptions}
      />
      <ManageUniversitiesModal
        isOpen={isUniversityModalOpen}
        onClose={() => setUniversityModalOpen(false)}
        setNotification={setNotification}
        onUpdate={fetchOptions}
      />
    </>
  );
}