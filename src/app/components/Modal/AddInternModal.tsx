'use client';

import { useState, useRef, useEffect, FormEvent, useCallback } from 'react';
import { FaEye, FaEyeSlash, FaCalendar } from 'react-icons/fa';
import { FiX, FiEdit } from 'react-icons/fi';
import { format } from 'date-fns';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { NotificationState } from '@/app/types';
import { Role } from '@prisma/client';
import ManageDivisionsModal from './ManageDivisionsModal'; 
import ManageUniversitiesModal from './ManageUniversitiesModal'; // PERBAIKAN 1: Impor modal universitas

// PERBAIKAN 2: Perbarui Tipe Data
interface Option {
  id: number;
  name: string;
}
interface SelectableUser extends Option {
  role: Role;
  division?: Option | null;
  university?: Option | null;
}

interface AddInternModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  setNotification: (notification: NotificationState | null) => void;
}

export default function AddInternModal({ isOpen, onClose, onSuccess, setNotification }: AddInternModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State untuk form
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); 
  const [range, setRange] = useState<DateRange | undefined>();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  
  // PERBAIKAN 3: Tambah State untuk Universitas dan Dosen yang Difilter
  const [divisionId, setDivisionId] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [mentorId, setMentorId] = useState<string>('');
  const [lecturerId, setLecturerId] = useState<string>(''); 
  
  const [divisions, setDivisions] = useState<Option[]>([]);
  const [universities, setUniversities] = useState<Option[]>([]);
  const [allMentors, setAllMentors] = useState<SelectableUser[]>([]);
  const [allLecturers, setAllLecturers] = useState<SelectableUser[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<SelectableUser[]>([]);
  const [filteredLecturers, setFilteredLecturers] = useState<SelectableUser[]>([]);
  
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
        const users: SelectableUser[] = await usersRes.json();
        setAllMentors(users.filter(user => user.role === Role.ADMIN));
        setAllLecturers(users.filter(user => user.role === Role.LECTURER));
      }
    } catch (error) { console.error("Gagal memuat data pilihan:", error); }
  }, []);

  // Reset form dan fetch data saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setName('');
      setEmail('');
      setRange(undefined);
      setDivisionId('');
      setUniversityId('');
      setMentorId('');
      setLecturerId('');
      fetchAllOptions();
    }
  }, [isOpen, fetchAllOptions]);

  // PERBAIKAN 5: Filter mentor setiap kali divisi berubah
  useEffect(() => {
    if (divisionId) {
      const mentorsInDivision = allMentors.filter(
        (mentor) => mentor.division?.id === parseInt(divisionId)
      );
      setFilteredMentors(mentorsInDivision);
      setMentorId('');
    } else {
      setFilteredMentors([]);
      setMentorId('');
    }
  }, [divisionId, allMentors]);

  // PERBAIKAN 6: Filter dosen setiap kali universitas berubah
  useEffect(() => {
    if (universityId) {
      const lecturersInUniversity = allLecturers.filter(
        (lecturer) => lecturer.university?.id === parseInt(universityId)
      );
      setFilteredLecturers(lecturersInUniversity);
      setLecturerId('');
    } else {
      setFilteredLecturers([]);
      setLecturerId('');
    }
  }, [universityId, allLecturers]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !divisionId || !email || !range?.from || !range.to) {
      setNotification({ isOpen: true, title: 'Input Tidak Lengkap', message: 'Nama, Divisi, Email, dan Periode wajib diisi.', type: 'error' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // PERBAIKAN 7: Kirim universityId ke API
      const response = await fetch('/api/admin/manage-interns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          divisionId: parseInt(divisionId),
          universityId: universityId ? parseInt(universityId) : null,
          periodStartDate: range.from,
          periodEndDate: range.to,
          mentorId: mentorId ? parseInt(mentorId) : null,
          lecturerId: lecturerId ? parseInt(lecturerId) : null,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gagal menambahkan peserta.');
      
      setNotification({ isOpen: true, title: 'Berhasil', message: `Peserta baru berhasil ditambahkan. Info login dikirim ke ${email}.`, type: 'success' });
      onSuccess();
      onClose();

    } catch (error: any) {
      setNotification({ isOpen: true, title: 'Gagal', message: error.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pickerRef]);

  if (!isOpen) return null;

  let displayValue = 'Pilih rentang tanggal...';
  if (range?.from) {
    displayValue = format(range.from, 'd LLL yyyy');
    if(range.to) {
        displayValue += ` – ${format(range.to, 'd LLL yyyy')}`;
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-bold text-gray-800">Tambah Peserta Magang Baru</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FiX size={24}/></button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-black">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
            </div>
            
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700">
                <span>Divisi</span>
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
                <option value="" disabled>-- Pilih Divisi --</option>
                {divisions.map(div => <option key={div.id} value={div.id}>{div.name}</option>)}
              </select>
            </div>
            
            {/* PERBAIKAN 8: Tambahkan dropdown universitas */}
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

            {/* PERBAIKAN 9: Modifikasi dropdown dosen */}
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
              <label htmlFor="period" className="block text-sm font-medium text-gray-700">Periode Magang</label>
              <div className="relative mt-1" ref={pickerRef}>
                <input
                  id="period" type="text" readOnly
                  value={displayValue}
                  onClick={() => setIsPickerOpen(true)}
                  className="w-full p-2 text-black border border-gray-300 rounded-md cursor-pointer pr-10"
                />
                <FaCalendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                {isPickerOpen && (
                  <div className="absolute -mt-36 text-black bg-white border rounded-md shadow-lg z-10">
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
              <label className="block text-sm font-medium text-gray-700">Email Peserta</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full p-2 border border-gray-300 rounded-md" placeholder="Untuk mengirim info login"/>
            </div>
    
            <div className="pt-4">
              <button type="submit" disabled={isSubmitting} className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400">
                {isSubmitting ? 'Menyimpan...' : 'Simpan Peserta'}
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
      {/* PERBAIKAN 10: Tambahkan ManageUniversitiesModal */}
      <ManageUniversitiesModal
        isOpen={isUniversityModalOpen}
        onClose={() => setUniversityModalOpen(false)}
        setNotification={setNotification}
        onUpdate={fetchAllOptions}
      />
    </>
  );
}