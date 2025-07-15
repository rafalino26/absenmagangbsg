'use client';

import Image from 'next/image';
import { FiX } from 'react-icons/fi';

// 1. Buat interface yang benar untuk data tiket
interface HelpdeskTicket {
  id: number;
  user: { name: string };
  createdAt: string;
  status: string;
  description: string;
  proofUrl?: string | null;
}

// 2. Perbarui props untuk menggunakan tipe HelpdeskTicket
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: HelpdeskTicket | null;
}

export default function HelpdeskDetailModal({ isOpen, onClose, ticket }: ModalProps) {
  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            {/* 3. Perbarui JSX untuk menggunakan properti yang benar */}
            <h3 className="text-lg font-bold text-gray-800">Detail Laporan dari: {ticket.user.name}</h3>
            <p className="text-sm text-gray-500">{new Date(ticket.createdAt).toLocaleString('id-ID')}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FiX size={24}/></button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Deskripsi Masalah:</h4>
            <p className="p-3 bg-gray-50 rounded-md text-gray-800 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {ticket.proofUrl && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Bukti Lampiran:</h4>
              <Image 
                src={ticket.proofUrl} 
                alt="Bukti Laporan" 
                width={500} 
                height={500} 
                className="rounded-lg w-full h-auto border"
              />
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t flex justify-end">
          <button 
            type="button"
            onClick={onClose}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}