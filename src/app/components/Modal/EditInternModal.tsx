'use client';

import { useState, useEffect, useRef } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Menggunakan Fi untuk konsistensi
import { FiX, FiCalendar  } from 'react-icons/fi'; // Menggunakan Fi untuk konsistensi
import { InternSummary } from '@/app/types';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { NotificationState } from '@/app/types';

// Tipe data untuk props
interface InternData {
  id: number;
  name: string;
  division: string;
  periodStartDate?: string | null;
  periodEndDate?: string | null;
  mentor?: { id: number; name: string } | null;
}
interface Mentor {
  id: number;
  name: string;
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
  const [division, setDivision] = useState('');
  const [period, setPeriod] = useState('');
  const [password, setPassword] = useState(''); // Untuk reset password
  const [showPassword, setShowPassword] = useState(false);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [mentorId, setMentorId] = useState<string>('');
  const [range, setRange] = useState<DateRange | undefined>();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (internData) {
      setName(internData.name);
      setDivision(internData.division);
      setMentorId(internData.mentor?.id?.toString() || '');
      if (internData.periodStartDate && internData.periodEndDate) {
        setRange({ from: new Date(internData.periodStartDate), to: new Date(internData.periodEndDate) });
      }
    }
  }, [internData]);

  // Ambil daftar mentor saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      const fetchMentors = async () => {
        try {
          const res = await fetch('/api/admin/mentors');
          if (!res.ok) throw new Error('Gagal memuat mentor');
          setMentors(await res.json());
        } catch (error: any) {
          setNotification({ isOpen: true, title: 'Error', message: error.message, type: 'error' });
        }
      };
      fetchMentors();
    }
  }, [isOpen, setNotification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!internData) return;
    
    setIsSubmitting(true);
    try {
      const dataToSubmit: any = {
        name,
        division,
        periodStartDate: range?.from,
        periodEndDate: range?.to,
        mentorId: parseInt(mentorId),
      };
      if (password) dataToSubmit.password = password;

      const response = await fetch(`/api/admin/interns/${internData.id}`, {
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
  };
  
    let displayValue = 'Pilih rentang tanggal...';
  if (range?.from && range.to) {
    displayValue = `${format(range.from, 'd LLL yyyy')} – ${format(range.to, 'd LLL yyyy')}`;
  }

  if (!isOpen || !internData) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          {/* 3. Judul diubah */}
          <h3 className="text-lg font-bold text-gray-800">Edit Peserta Magang</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FiX size={24}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-black">
        <div className="flex-grow space-y-4">
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
            <div className="relative mt-1" ref={pickerRef}>
              <input
                id="edit-period"
                type="text"
                readOnly
                value={displayValue}
                onClick={() => setIsPickerOpen(true)}
                className="w-full p-2 text-black border border-gray-300 rounded-md cursor-pointer pr-10"
              />
              <FiCalendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              
              {isPickerOpen && (
                <div className="absolute -mt-2 bg-white border rounded-md text-black shadow-lg z-10">
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
            <label className="block text-sm font-medium text-gray-700">Pilih Mentor</label>
            <select
              value={mentorId}
              onChange={(e) => setMentorId(e.target.value)}
              required
              className="mt-1 w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="" disabled>-- Tugaskan ke Mentor --</option>
              {mentors.map(mentor => (
                <option key={mentor.id} value={mentor.id}>{mentor.name}</option>
              ))}
            </select>
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
          <button type="submit" disabled={isSubmitting} className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400">
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
        </div>
        </form>
      </div>
    </div>
  );
}