'use client';

import { useState, useRef, useEffect  } from 'react';
import { FaEye, FaEyeSlash, FaCalendar } from 'react-icons/fa'; // Impor ikon mata
import { FiX } from 'react-icons/fi';
import { format } from 'date-fns';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

// 1. Tambahkan properti 'password' di interface
export interface NewInternData {
  name: string;
  division: string;
  email: string;
  periodStartDate: Date;
  periodEndDate: Date;
}

interface AddInternModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewInternData) => void;
}

export default function AddInternModal({ isOpen, onClose, onSubmit }: AddInternModalProps) {
  const [name, setName] = useState('');
  const [division, setDivision] = useState('');
  const [period, setPeriod] = useState('');
  const [email, setEmail] = useState('');
  const [range, setRange] = useState<DateRange | undefined>();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = () => {
    if (name && division && email && range?.from && range.to) {
      onSubmit({
        name,
        division,
        email,
        periodStartDate: range.from,
        periodEndDate: range.to,
      });
      handleClose();
    } else {
      alert("Semua field wajib diisi, termasuk rentang tanggal periode.");
    }
  };
  
  const handleClose = () => {
    setRange(undefined);
    setName('');
    setDivision('');
    setEmail('');
    setIsPickerOpen(false); // Pastikan picker juga tertutup
    onClose();
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
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">Tambah Peserta Magang Baru</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FiX size={24}/></button>
        </div>
        
        <div className="p-6 flex-grow space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full p-2 text-black border border-gray-300 rounded-md"/>
          </div>
          <div>
            <label htmlFor="division" className="block text-sm font-medium text-gray-700">Divisi</label>
            <input type="text" id="division" value={division} onChange={(e) => setDivision(e.target.value)} className="mt-1 w-full p-2 text-black border border-gray-300 rounded-md"/>
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
                <div className="absolute -mt-2 text-black bg-white border rounded-md shadow-lg z-10">
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
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Peserta</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full p-2 text-black border border-gray-300 rounded-md"
              placeholder="Untuk mengirim info login"
            />
          </div>
    
        </div>
        <div className="p-4 bg-gray-50 border-t flex justify-end">
           <button type="button" onClick={handleSubmit} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700">Simpan</button>
        </div>
      </div>
    </div>

  );
}