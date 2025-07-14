'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { FiX, FiImage, FiMapPin } from 'react-icons/fi';

// 1. Hapus impor dari @/types

// 2. Buat interface lokal yang sesuai dengan data dari DashboardPage
interface HistoryItem {
  id: number;
  type: 'Hadir' | 'Pulang' | 'Izin';
  title: string;
  date: string;
  description: string;
  lat?: number;
  lon?: number;
  photoUrl?: string | null;
}

// 3. Gunakan interface lokal ini untuk props
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: HistoryItem | null;
}

const LocationMap = dynamic(() => import('./LocationMap'), { ssr: false });

export default function UserDetailModal({ isOpen, onClose, record }: ModalProps) {
  const [activeTab, setActiveTab] = useState<'bukti' | 'peta'>('bukti');

  useEffect(() => {
    if (record) {
      setActiveTab('bukti');
    }
  }, [record]);
  
  if (!isOpen || !record) return null;

  const hasLocation = record.lat && record.lon;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Detail: {record.title}</h3>
            <p className="text-sm text-gray-500">{record.date}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FiX size={24}/></button>
        </div>
        
        {/* Navigasi Tab */}
        <div className="p-2 border-b flex">
          <button 
            onClick={() => setActiveTab('bukti')}
            className={`flex-1 py-2 px-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'bukti' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <FiImage /> Bukti
          </button>
          <button 
            onClick={() => setActiveTab('peta')}
            disabled={!hasLocation}
            className={`flex-1 py-2 px-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'peta' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:bg-gray-100'} disabled:text-gray-300 disabled:hover:bg-transparent`}
          >
            <FiMapPin /> Peta Lokasi
          </button>
        </div>

        {/* Konten Tab */}
        <div className="p-6 overflow-y-auto">
          {activeTab === 'bukti' && (
            <div>
              {record.photoUrl ? (
                <Image src={record.photoUrl} alt={`Bukti ${record.title}`} width={500} height={500} className="rounded-lg w-full h-auto" />
              ) : (
                <p className="text-center text-gray-500">Tidak ada bukti visual untuk entri ini.</p>
              )}
              {record.type === 'Izin' && <p className="mt-4 p-3 bg-gray-100 rounded-md"><b>Alasan:</b> {record.description}</p>}
            </div>
          )}

          {activeTab === 'peta' && hasLocation && (
            <div className="h-80 w-full">
              <LocationMap position={[record.lat!, record.lon!]} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}