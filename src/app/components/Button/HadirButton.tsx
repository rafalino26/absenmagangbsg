// app/components/ClockInButton.tsx
'use client';

import { FiClock } from 'react-icons/fi';

interface HadirButtonProps {
  onClick: () => void;
  hasClockedIn: boolean;
  loading: boolean;
}

export default function HadirButton({ onClick, hasClockedIn, loading }: HadirButtonProps) {
  return (
    <button 
      onClick={onClick} 
      disabled={hasClockedIn || loading} 
      className={`group rounded-lg border bg-white p-6 text-left shadow-sm transition-all w-full
      ${(hasClockedIn || loading) ? 'cursor-not-allowed bg-gray-100 text-gray-400' : 'hover:border-red-500 hover:shadow-lg'}`}
    >
      <div className="flex items-center">
        <div className={`rounded-lg p-3 transition-colors ${(hasClockedIn || loading) ? 'bg-gray-200' : 'bg-red-100 group-hover:bg-red-200'}`}>
          <FiClock className={`h-6 w-6 ${(hasClockedIn || loading) ? 'text-gray-500' : 'text-red-600'}`}/>
        </div>
        <div className="ml-4">
          <h2 className="text-lg text-black font-semibold">{hasClockedIn ? 'Sudah Absen Masuk' : 'Absen Masuk'}</h2>
          <p className="mt-1 text-sm text-gray-500">Klik untuk mencatat kehadiran.</p>
        </div>
      </div>
    </button>
  );
}