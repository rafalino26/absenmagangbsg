'use client';

import { FiEdit3 } from 'react-icons/fi';

interface LeaveRequestButtonProps {
  onClick: () => void;
  loading: boolean;
}

export default function LeaveRequestButton({ onClick, loading }: LeaveRequestButtonProps) {
  return (
    <button 
      onClick={onClick} 
      disabled={loading}
      className="group rounded-lg border bg-white p-6 text-left shadow-sm transition-all w-full disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 hover:border-blue-500 hover:shadow-lg"
    >
      <div className="flex items-center">
        <div className="rounded-lg bg-blue-100 p-3 transition-colors group-hover:bg-blue-200">
          <FiEdit3 className="h-6 w-6 text-blue-600" />
        </div>
        <div className="ml-4">
          <h2 className="text-lg font-semibold text-gray-900">Ajukan Izin</h2>
          <p className="mt-1 text-sm text-gray-500">Tidak bisa masuk? Buat pengajuan.</p>
        </div>
      </div>
    </button>
  );
}