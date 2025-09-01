'use client';

import { useState, useEffect, useCallback, FormEvent, useRef } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FiX, FiCalendar, FiEdit } from 'react-icons/fi';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { NotificationState } from '@/app/types';
import { Role } from '@prisma/client';
import ManageDivisionsModal from './ManageDivisionsModal'; 

// Tipe data yang lebih lengkap
interface Division {
  id: number;
  name: string;
}
interface User {
  id: number;
  name: string;
  role: Role;
  division?: Division | null; // Mentor punya divisi
}
interface InternData {
  id: number;
  name: string;
  division: Division | null;
  periodStartDate?: string | null;
  periodEndDate?: string | null;
  mentor?: { id: number; name: string; } | null;
  lecturer?: { id: number; name: string; } | null;
}
interface EditInternModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  internData: InternData | null;
  setNotification: (notification: NotificationState | null) => void;
}

export default function EditInternModal({ isOpen, onClose, onSuccess, internData, setNotification }: EditInternModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State untuk form
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // State baru untuk dropdown dinamis
  const [divisionId, setDivisionId] = useState<string>('');
  const [mentorId, setMentorId] = useState<string>('');
  const [lecturerId, setLecturerId] = useState<string>('');
  
  // State untuk menyimpan daftar pilihan
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [allMentors, setAllMentors] = useState<User[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<User[]>([]);
  const [lecturers, setLecturers] = useState<User[]>([]);
  
  const [isDivisionModalOpen, setDivisionModalOpen] = useState(false);

  // Fungsi untuk mengambil daftar divisi
  const fetchDivisions = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/divisions');
      if (res.ok) setDivisions(await res.json());
    } catch (error) { console.error("Gagal memuat divisi:", error); }
  }, []);

  // Isi form saat data intern berubah
  useEffect(() => {
    if (internData) {
      setName(internData.name);
      setDivisionId(internData.division?.id?.toString() || '');
      setMentorId(internData.mentor?.id?.toString() || '');
      setLecturerId(internData.lecturer?.id?.toString() || '');
      if (internData.periodStartDate && internData.periodEndDate) {
        setRange({ from: new Date(internData.periodStartDate), to: new Date(internData.periodEndDate) });
      }
      setPassword('');
      setShowPassword(false);
    }
  }, [internData]);

  // Ambil semua data (divisi, mentor, dosen) saat modal pertama kali dibuka
  useEffect(() => {
    if (isOpen) {
      fetchDivisions();
      
      const fetchUsers = async () => {
        try {
          const res = await fetch('/api/admin/mentors');
          if (!res.ok) throw new Error('Gagal memuat mentor & dosen');
          const users: User[] = await res.json();
          setAllMentors(users.filter(u => u.role === Role.ADMIN));
          setLecturers(users.filter(u => u.role === Role.LECTURER));
        } catch (error: any) {
          setNotification({ isOpen: true, title: 'Error', message: error.message, type: 'error' });
        }
      };
      fetchUsers();
    }
  }, [isOpen, fetchDivisions, setNotification]);

  // Filter mentor setiap kali divisi berubah
  useEffect(() => {
    if (divisionId) {
      const mentorsInDivision = allMentors.filter(
        mentor => mentor.division?.id === parseInt(divisionId)
      );
      setFilteredMentors(mentorsInDivision);
    } else {
      setFilteredMentors([]);
    }
  }, [divisionId, allMentors]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!internData) return;
    
    setIsSubmitting(true);
    try {
      const dataToSubmit: any = {
        name,
        divisionId: parseInt(divisionId),
        periodStartDate: range?.from,
        periodEndDate: range?.to,
        mentorId: mentorId ? parseInt(mentorId) : null,
        lecturerId: lecturerId ? parseInt(lecturerId) : null,
      };
      if (password) dataToSubmit.password = password;

      const response = await fetch(`/api/admin/manage-interns/${internData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Gagal menyimpan perubahan.');
      }
      setNotification({ isOpen: true, title: 'Berhasil', message: 'Data peserta berhasil diperbarui.', type: 'success' });
      onSuccess();
      onClose();
    } catch (error: any) {
      setNotification({ isOpen: true, title: 'Gagal', message: error.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  let displayValue = 'Pilih rentang tanggal...';
  if (range?.from && range.to) {
    displayValue = `${format(range.from, 'd LLL yyyy')} – ${format(range.to, 'd LLL yyyy')}`;
  }

  if (!isOpen || !internData) return null;

  return (
    <>
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">Edit Peserta Magang</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FiX size={24}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-black">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input type="text" id="edit-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
          </div>
           <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700">
                <span>Divisi</span>
                <button type="button" onClick={() => setDivisionModalOpen(true)} className="text-blue-600 hover:text-blue-800" title="Kelola Pilihan Divisi">
                  <FiEdit size={14} />
                </button>
              </label>
              <select
                value={divisionId}
                onChange={(e) => setDivisionId(e.target.value)}
                required
                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="" disabled>-- Pilih Divisi --</option>
                {divisions.map(div => (
                  <option key={div.id} value={div.id}>{div.name}</option>
                ))}
              </select>
            </div>
          <div>
            <label htmlFor="edit-period" className="block text-sm font-medium text-gray-700">Periode Magang</label>
            <div className="relative mt-1" ref={pickerRef}>
              <input
                id="edit-period"
                type="text"
                readOnly
                value={displayValue}
                onClick={() => setIsPickerOpen(true)}
                className="w-full p-2 border border-gray-300 rounded-md cursor-pointer pr-10"
              />
              <FiCalendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              
              {isPickerOpen && (
                <div className="absolute -mt-2 bg-white border rounded-md shadow-lg z-10">
                  <DayPicker
                    mode="range"
                    selected={range}
                    onSelect={(selectedRange) => {
                      setRange(selectedRange);
                      if (selectedRange?.from && selectedRange?.to) {
                        setIsPickerOpen(false);
                      }
                    }}
                    numberOfMonths={1}
                  />
                </div>
              )}
            </div>
          </div>
         <div>
              <label className="block text-sm font-medium text-gray-700">Pilih Mentor (Opsional)</label>
              <select
                value={mentorId}
                onChange={(e) => setMentorId(e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                disabled={!divisionId || filteredMentors.length === 0}
              >
                <option value="">-- Pilih Mentor --</option>
                {filteredMentors.map(mentor => (
                  <option key={mentor.id} value={mentor.id}>{mentor.name}</option>
                ))}
              </select>
            </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Pilih Dosen (Opsional)</label>
            <select
              value={lecturerId}
              onChange={(e) => setLecturerId(e.target.value)}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">-- Tanpa Dosen Pembimbing --</option>
              {lecturers.map(lecturer => (
                <option key={lecturer.id} value={lecturer.id}>{lecturer.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="edit-password" className="block text-sm font-medium text-gray-700">Password Baru (Opsional)</label>
            <div className="relative mt-1">
              <input
                id="edit-password"
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