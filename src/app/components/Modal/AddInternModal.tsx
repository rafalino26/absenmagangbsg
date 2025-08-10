'use client';

import { useState, useRef, useEffect  } from 'react';
import { FaEye, FaEyeSlash, FaCalendar } from 'react-icons/fa'; // Impor ikon mata
import { FiX } from 'react-icons/fi';
import { format } from 'date-fns';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { NotificationState } from '@/app/types';

interface Mentor {
  id: number;
  name: string;
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
  const [division, setDivision] = useState('');
  const [email, setEmail] = useState(''); // Email tetap opsional
  const [range, setRange] = useState<DateRange | undefined>();
  const [mentorId, setMentorId] = useState<string>(''); // State baru untuk menyimpan ID mentor terpilih
  
  // State untuk data & UI tambahan
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDivision('');
      setEmail('');
      setRange(undefined);
      setMentorId('');
      const fetchMentors = async () => {
        try {
          const response = await fetch('/api/admin/mentors');
          if (!response.ok) throw new Error('Gagal memuat daftar mentor.');
          setMentors(await response.json());
        } catch (error: any) {
          setNotification({ isOpen: true, title: 'Error', message: error.message, type: 'error' });
        }
      };
      fetchMentors();
    }
  }, [isOpen, setNotification]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !range?.from || !range.to) {
      alert("Nama, Divisi, Email, dan Periode wajib diisi.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/interns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          division,
          email,
          periodStartDate: range.from,
          periodEndDate: range.to,
           mentorId: mentorId ? parseInt(mentorId) : null,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Gagal menambahkan peserta.');
      }
      
      setNotification({ isOpen: true, title: 'Berhasil', message: 'Peserta baru berhasil ditambahkan.', type: 'success' });
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
    if (!range.to) {
      displayValue = format(range.from, 'd LLL yyyy');
    } else {
      displayValue = `${format(range.from, 'd LLL yyyy')} – ${format(range.to, 'd LLL yyyy')}`;
    }
  }

  return (
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
            <label className="block text-sm font-medium text-gray-700">Divisi</label>
            <input type="text" value={division} onChange={(e) => setDivision(e.target.value)} required className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
          </div>
          
          {/* --- DROPDOWN MENTOR BARU --- */}
           <div>
            <label className="block text-sm font-medium text-gray-700">Pilih Mentor (Opsional)</label>
            <select
              value={mentorId}
              onChange={(e) => setMentorId(e.target.value)}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">-- Belum Ditugaskan --</option>
              {mentors.map(mentor => (
                <option key={mentor.id} value={mentor.id}>
                  {mentor.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="period" className="block text-sm font-medium text-gray-700">Periode Magang</label>
            <div className="relative mt-1" ref={pickerRef}>
              {/* Input Teks sebagai Pemicu */}
              <input
                id="period"
                type="text"
                readOnly
                value={displayValue}
                onClick={() => setIsPickerOpen(true)}
                className="w-full p-2 text-black border border-gray-300 rounded-md cursor-pointer pr-10"
              />
              <FaCalendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              
              {/* Pop-up Kalender */}
              {isPickerOpen && (
                <div className="absolute -mt-12 text-black bg-white border rounded-md shadow-lg z-10">
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
  );
}


 