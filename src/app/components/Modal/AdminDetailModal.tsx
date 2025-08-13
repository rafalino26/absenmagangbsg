'use client';

import { useState, useEffect, useRef  } from 'react';
import { FiX, FiChevronDown, FiEye } from 'react-icons/fi';
import { InternSummary, AttendanceRecord  } from '@/app/types';

interface AdminDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  intern: InternSummary | null;
  dailyLog: AttendanceRecord[];
  onViewDayDetail: (record: AttendanceRecord) => void;
  month: string;
}

type FilterStatus = 'Semua' | 'Hadir' | 'Terlambat' | 'Izin' | 'Pulang';

const getStatusText = (log: AttendanceRecord): string => {
  if (log.type === 'Hadir' && log.isLate) return 'Hadir (Terlambat)';
  if (log.type === 'Hadir') return 'Hadir';
  if (log.type === 'Izin') return 'Izin';
  if (log.type === 'Pulang') return 'Pulang';
  return 'Tidak Hadir'; 
};

const getStatusColor = (statusText: string) => {
  if (statusText === 'Hadir') return 'text-green-600';
  if (statusText === 'Izin') return 'text-blue-600';
  if (statusText === 'Pulang') return 'text-orange-600';
  return 'text-red-600'; 
};

export default function AdminDetailModal({ isOpen, onClose, intern, dailyLog, onViewDayDetail, month }: AdminDetailModalProps) {
  // 1. State untuk filter aktif dan log yang akan ditampilkan
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('Semua');
  const [filteredLog, setFilteredLog] = useState<AttendanceRecord[]>(dailyLog);

  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 2. useEffect untuk menjalankan logika filter setiap kali filter atau data utama berubah
  useEffect(() => {
    if (!isOpen) return;

    if (activeFilter === 'Semua') {
      setFilteredLog(dailyLog);
    } else {
      const newFilteredLog = dailyLog.filter(log => {
        // PERBAIKAN LOGIKA FILTER DI SINI
        switch (activeFilter) {
          case 'Hadir':
            return log.type === 'Hadir' && !log.isLate;
          case 'Terlambat':
            return log.type === 'Hadir' && log.isLate;
          case 'Izin':
            return log.type === 'Izin';
          case 'Pulang':
            return log.type === 'Pulang'; 
          default:
            return false;
        }
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

  const filterButtons: FilterStatus[] = ['Semua', 'Hadir', 'Terlambat', 'Izin', 'Pulang'];

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b">
         <div>
          <h3 className="text-lg font-bold text-gray-800">Detail Absensi: {intern.name}</h3>
          <p className="text-sm text-gray-500">
            {month === 'Semua Bulan' 
              ? 'Rekapitulasi untuk semua bulan' 
              : `Rekapitulasi untuk bulan ${month}`
            }
          </p>
        </div>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-800"><FiX size={24}/></button>
        </div>
         <div className="p-4 border-b flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Filter Status:</span>
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between w-48 bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <span>{activeFilter}</span>
              <FiChevronDown className={`ml-2 h-5 w-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
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
            {filteredLog.length > 0 ? (
              filteredLog.map((log) => {
                console.log("Mengecek log:", log);
                const statusText = getStatusText(log); // Dapatkan teks status
                return (
                  <li key={log.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{log.date}</p>
                      <p className={`text-sm font-bold ${getStatusColor(statusText)}`}>
                        {statusText}
                      </p>
                      <p className={`text-sm ${log.isLate && log.type === 'Hadir' ? 'text-red-600' : 'text-gray-500'}`}>
                        {log.description}
                      </p>
                    </div>
                    {(log.photoUrl || (log.lat && log.lon)) && (
                      <button 
                        onClick={() => onViewDayDetail(log)}
                        className="flex items-center gap-1 text-sm bg-gray-600 text-white font-semibold py-2 px-3 rounded-lg hover:bg-gray-700"
                      >
                        <FiEye size={14}/>
                        <span>Bukti</span>
                      </button>
                    )}
                  </li>
                );
              })
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