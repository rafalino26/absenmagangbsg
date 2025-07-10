'use client';

import { FiLogOut } from 'react-icons/fi';

interface PulangButtonProps {
  onClick: () => void;
  hasClockedIn: boolean;
  hasClockedOut: boolean;
  loading: boolean;
}

export default function PulangButton({ onClick, hasClockedIn, hasClockedOut, loading }: PulangButtonProps) {
  const isDisabled = !hasClockedIn || hasClockedOut || loading;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`group rounded-lg border bg-white p-6 text-left shadow-sm transition-all w-full
      ${isDisabled ? 'cursor-not-allowed bg-gray-100 text-gray-400' : 'hover:border-orange-500 hover:shadow-lg'}`}
    >
      <div className="flex items-center">
        <div className={`rounded-lg p-3 transition-colors ${isDisabled ? 'bg-gray-200' : 'bg-orange-100 group-hover:bg-orange-200'}`}>
          <FiLogOut className={`h-6 w-6 ${isDisabled ? 'text-gray-500' : 'text-orange-600'}`} />
        </div>
        <div className="ml-4">
          <h2 className="text-lg text-black font-semibold">{hasClockedOut ? 'Sudah Absen Pulang' : 'Absen Pulang'}</h2>
          <p className="mt-1 text-sm text-gray-500">Selesaikan harimu & catat waktu pulang.</p>
        </div>
      </div>
    </button>
  );
}