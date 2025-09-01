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
import ManageUniversitiesModal from './ManageUniversitiesModal'; // PERBAIKAN 1: Impor modal universitas

// PERBAIKAN 2: Perbarui Tipe Data
interface Option {
  id: number;
  name: string;
}
interface User extends Option {
  role: Role;
  division?: Option | null;
  university?: Option | null;
}
interface InternData {
  id: number;
  name: string;
  division: Option | null;
  university: Option | null;
  periodStartDate?: string | null;
  periodEndDate?: string | null;
  mentor?: Option | null;
  lecturer?: Option | null;
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
  
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // PERBAIKAN 3: Tambah State untuk Universitas dan Dosen yang Difilter
  const [divisionId, setDivisionId] = useState<string>('');
  const [universityId, setUniversityId] = useState<string>('');
  const [mentorId, setMentorId] = useState<string>('');
  const [lecturerId, setLecturerId] = useState<string>('');
  
  const [divisions, setDivisions] = useState<Option[]>([]);
  const [universities, setUniversities] = useState<Option[]>([]);
  const [allMentors, setAllMentors] = useState<User[]>([]);
  const [allLecturers, setAllLecturers] = useState<User[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<User[]>([]);
  const [filteredLecturers, setFilteredLecturers] = useState<User[]>([]);
  
  const [isDivisionModalOpen, setDivisionModalOpen] = useState(false);
  const [isUniversityModalOpen, setUniversityModalOpen] = useState(false);

  // PERBAIKAN 4: Ambil semua data pilihan saat modal dibuka
  const fetchAllOptions = useCallback(async () => {
    try {
      const [divRes, uniRes, usersRes] = await Promise.all([
        fetch('/api/admin/divisions'),
        fetch('/api/admin/universities'),
        fetch('/api/admin/mentors')
      ]);

      if (divRes.ok) setDivisions(await divRes.json());
      if (uniRes.ok) setUniversities(await uniRes.json());
      if (usersRes.ok) {
        const users: User[] = await usersRes.json();
        setAllMentors(users.filter(u => u.role === Role.ADMIN));
        setAllLecturers(users.filter(u => u.role === Role.LECTURER));
      }
    } catch (error: any) {
      setNotification({ isOpen: true, title: 'Error', message: 'Gagal memuat data pilihan.', type: 'error' });
    }
  }, [setNotification]);

  useEffect(() => {
    if (isOpen) {
      fetchAllOptions();
    }
  }, [isOpen, fetchAllOptions]);

  // PERBAIKAN 5: Isi form saat data intern berubah
  useEffect(() => {
    if (internData) {
      setName(internData.name);
      setDivisionId(internData.division?.id?.toString() || '');
      setUniversityId(internData.university?.id?.toString() || '');
      setMentorId(internData.mentor?.id?.toString() || '');
      setLecturerId(internData.lecturer?.id?.toString() || '');
      if (internData.periodStartDate && internData.periodEndDate) {
        setRange({ from: new Date(internData.periodStartDate), to: new Date(internData.periodEndDate) });
      } else {
        setRange(undefined);
      }
      setPassword('');
      setShowPassword(false);
    }
  }, [internData]);

  // PERBAIKAN 6: Filter mentor setiap kali divisi berubah
  useEffect(() => {
    if (divisionId) {
      const mentorsInDivision = allMentors.filter(
        mentor => mentor.division?.id === parseInt(divisionId)
      );
      setFilteredMentors(mentorsInDivision);
      if (!mentorsInDivision.some(m => m.id.toString() === mentorId)) {
        setMentorId('');
      }
    } else {
      setFilteredMentors([]);
      setMentorId('');
    }
  }, [divisionId, allMentors, mentorId]);

  // PERBAIKAN 7: Filter dosen setiap kali universitas berubah
  useEffect(() => {
    if (universityId) {
      const lecturersInUniversity = allLecturers.filter(
        lecturer => lecturer.university?.id === parseInt(universityId)
      );
      setFilteredLecturers(lecturersInUniversity);
      if (!lecturersInUniversity.some(l => l.id.toString() === lecturerId)) {
        setLecturerId('');
      }
    } else {
      setFilteredLecturers([]);
      setLecturerId('');
    }
  }, [universityId, allLecturers, lecturerId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!internData) return;
    
    setIsSubmitting(true);
    try {
      // PERBAIKAN 8: Kirim universityId ke API
      const dataToSubmit: any = {
        name,
        divisionId: parseInt(divisionId),
        universityId: universityId ? parseInt(universityId) : null,
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
  if (range?.from) {
    displayValue = format(range.from, 'd LLL yyyy');
    if(range.to) {
        displayValue += ` – ${format(range.to, 'd LLL yyyy')}`;
    }
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
              <input type="text" id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
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

            {/* PERBAIKAN 9: Tambah dropdown universitas */}
            <div>
                <label className="flex items-center justify-between text-sm font-medium text-gray-700">
                    <span>Universitas (Opsional)</span>
                    <button type="button" onClick={() => setUniversityModalOpen(true)} className="text-blue-600 hover:text-blue-800" title="Kelola Pilihan Universitas">
                        <FiEdit size={14} />
                    </button>
                </label>
                <select
                    value={universityId}
                    onChange={(e) => setUniversityId(e.target.value)}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                >
                    <option value="">-- Pilih Universitas --</option>
                    {universities.map(uni => (
                        <option key={uni.id} value={uni.id}>{uni.name}</option>
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

            {/* PERBAIKAN 10: Modifikasi dropdown mentor */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Pilih Mentor (Opsional)</label>
              <select
                value={mentorId}
                onChange={(e) => setMentorId(e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                disabled={!divisionId || filteredMentors.length === 0}
              >
                <option value="">{divisionId ? (filteredMentors.length > 0 ? '-- Pilih Mentor --' : 'Tidak ada mentor di divisi ini') : '-- Pilih Divisi Dulu --'}</option>
                {filteredMentors.map(mentor => (
                  <option key={mentor.id} value={mentor.id}>{mentor.name}</option>
                ))}
              </select>
            </div>

            {/* PERBAIKAN 11: Modifikasi dropdown dosen */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Pilih Dosen (Opsional)</label>
              <select
                value={lecturerId}
                onChange={(e) => setLecturerId(e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                disabled={!universityId || filteredLecturers.length === 0}
              >
                <option value="">{universityId ? (filteredLecturers.length > 0 ? '-- Pilih Dosen --' : 'Tidak ada dosen di universitas ini') : '-- Pilih Universitas Dulu --'}</option>
                {filteredLecturers.map(lecturer => (
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
        onUpdate={fetchAllOptions}
      />
      {/* PERBAIKAN 12: Tambahkan ManageUniversitiesModal */}
      <ManageUniversitiesModal
        isOpen={isUniversityModalOpen}
        onClose={() => setUniversityModalOpen(false)}
        setNotification={setNotification}
        onUpdate={fetchAllOptions}
      />
    </>
  );
}