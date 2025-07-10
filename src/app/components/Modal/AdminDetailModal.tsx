'use client';

import { useState, useEffect, useRef  } from 'react';
import { FiX, FiChevronDown } from 'react-icons/fi';

// Tipe data (tetap sama)
interface DailyLogItem { date: string; status: 'Hadir' | 'Hadir (Terlambat)' | 'Izin' | 'Tidak Hadir'; description: string; photoUrl?: string | null; }
interface InternSummary { name: string; internCode: string; }

interface AdminDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  intern: InternSummary | null;
  dailyLog: DailyLogItem[];
  month: string;
}

// Tipe untuk filter
type FilterStatus = 'Semua' | 'Hadir' | 'Terlambat' | 'Izin' | 'Tidak Hadir';

const getStatusColor = (status: string) => {
  if (status.includes('Terlambat')) return 'text-yellow-600';
  if (status === 'Hadir') return 'text-green-600';
  if (status === 'Izin') return 'text-blue-600';
  return 'text-red-600'; // Tidak Hadir
};

export default function AdminDetailModal({ isOpen, onClose, intern, dailyLog, month }: AdminDetailModalProps) {
  // 1. State untuk filter aktif dan log yang akan ditampilkan
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('Semua');
  const [filteredLog, setFilteredLog] = useState<DailyLogItem[]>(dailyLog);

  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 2. useEffect untuk menjalankan logika filter setiap kali filter atau data utama berubah
  useEffect(() => {
    // Pastikan data log di-reset jika data prop berubah (misal, user lain dipilih)
    if (!isOpen) return;

    if (activeFilter === 'Semua') {
      setFilteredLog(dailyLog);
    } else {
      const newFilteredLog = dailyLog.filter(log => {
        if (activeFilter === 'Terlambat') {
          return log.status.includes('Terlambat');
        }
        // Ini akan cocok dengan 'Hadir' tapi tidak 'Hadir (Terlambat)'
        if (activeFilter === 'Hadir') {
            return log.status === 'Hadir';
        }
        return log.status === activeFilter;
      });
      setFilteredLog(newFilteredLog);
    }
  }, [activeFilter, dailyLog, isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Reset filter ke 'Semua' saat modal ditutup
  const handleClose = () => {
    setActiveFilter('Semua');
    onClose();
  };

  if (!isOpen || !intern) return null;

  const filterButtons: FilterStatus[] = ['Semua', 'Hadir', 'Terlambat', 'Izin', 'Tidak Hadir'];

  return (
    <div className="fixed inset-0 backdrop-blur flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Detail Absensi: {intern.name}</h3>
            <p className="text-sm text-gray-500">Rekapitulasi untuk bulan {month}</p>
          </div>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-800"><FiX size={24}/></button>
        </div>
        
        {/* 3. Tampilkan tombol-tombol filter di sini */}
         <div className="p-4 border-b flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Filter Status:</span>
          <div className="relative" ref={dropdownRef}>
            {/* Tombol utama dropdown */}
            <button 
              onClick={() => setDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between w-48 bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <span>{activeFilter}</span>
              <FiChevronDown className={`ml-2 h-5 w-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Menu dropdown yang muncul */}
            {isDropdownOpen && (
              <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg border">
                <div className="py-1">
                  {filterButtons.map(filter => (
                    <button
                      key={filter}
                      onClick={() => {
                        setActiveFilter(filter);
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 overflow-y-auto">
          <ul className="space-y-3">
            {/* 4. Render daftar berdasarkan state 'filteredLog' */}
            {filteredLog.length > 0 ? (
              filteredLog.map((log, index) => (
                  <li key={index} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{log.date}</p>
                    <p className={`text-sm font-bold ${getStatusColor(log.status)}`}>
                      {log.status}
                    </p>
                    <p className="text-sm text-gray-500">{log.description}</p>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">Tidak ada data untuk filter "{activeFilter}".</p>
            )}
          </ul>
        </div>

        <div className="p-4 bg-gray-50 border-t flex justify-end">
          <button onClick={handleClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Tutup</button>
        </div>
      </div>
    </div>
  );
}