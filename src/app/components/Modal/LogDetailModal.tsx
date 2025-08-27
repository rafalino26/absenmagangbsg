// app/components/Modal/LogDetailModal.tsx
'use client';

import { FiX } from 'react-icons/fi';
import Image from 'next/image';
import { LogStatus } from '@prisma/client';

// Tipe data untuk log yang diterima modal ini
interface LogData {
  activity: string;
  photoUrl: string | null;
  status: LogStatus;
  notes: string | null;
}

interface LogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  logData: LogData | null;
}

export default function LogDetailModal({ isOpen, onClose, logData }: LogDetailModalProps) {
  if (!isOpen || !logData) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">Detail Laporan Aktivitas</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FiX size={24}/></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <h4 className="font-semibold text-gray-700">Aktivitas yang Dilaporkan:</h4>
            <p className="mt-1 text-gray-800 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">{logData.activity}</p>
          </div>

          {logData.status === 'REJECTED' && logData.notes && (
             <div>
                <h4 className="font-semibold text-red-700">Alasan Penolakan:</h4>
                <p className="mt-1 text-red-800 bg-red-50 p-3 rounded-md">{logData.notes}</p>
            </div>
          )}

          <div>
            <h4 className="font-semibold text-gray-700">Bukti Foto:</h4>
            {logData.photoUrl ? (
              <div className="mt-2 relative w-full h-80 border rounded-md overflow-hidden">
                <Image src={logData.photoUrl} alt="Bukti Aktivitas" layout="fill" objectFit="contain" />
              </div>
            ) : (
              <p className="mt-1 text-gray-500 italic">Tidak ada foto yang dilampirkan.</p>
            )}
          </div>
        </div>
         <div className="p-4 bg-gray-50 border-t flex justify-end">
            <button onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Tutup</button>
        </div>
      </div>
    </div>
  );
}