'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { FiX, FiImage, FiMapPin } from 'react-icons/fi';

// Tipe data yang diterima dari halaman riwayat
interface LiveHistoryItem {
  id: number;
  name: string;
  type: 'Hadir' | 'Pulang' | 'Izin';
  description: string;
  photoUrl?: string | null;
  location?: { lat: number; lon: number; } | null;
  title: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: LiveHistoryItem | null;
}

// Impor peta secara dinamis
const LocationMap = dynamic(() => import('../Modal/LocationMap'), { ssr: false });

export default function AdminLiveDetailModal({ isOpen, onClose, record }: ModalProps) {
  const [activeTab, setActiveTab] = useState<'bukti' | 'peta'>('bukti');

  // Reset tab ke 'bukti' setiap kali record baru dipilih
  useEffect(() => {
    if (record) {
      setActiveTab('bukti');
    }
  }, [record]);
  
  if (!isOpen || !record) return null;

  const hasLocation = record.location && record.location.lat && record.location.lon;

  return (
    <div className="fixed inset-0 backdrop-blur flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Detail: {record.title || record.type}</h3>
            <p className="text-sm text-gray-500">{record.name}</p>
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
              {record.type === 'Izin' ? (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700">Alasan Izin:</h4>
                  <p className="p-3 bg-gray-100 rounded-md text-gray-800">{record.description}</p>
                  {record.photoUrl && (
                    <>
                      <h4 className="font-semibold text-gray-700 mt-4">Lampiran:</h4>
                      <Image src={record.photoUrl} alt="Lampiran Izin" width={500} height={500} className="rounded-lg w-full h-auto" />
                    </>
                  )}
                </div>
              ) : (
                <Image src={record.photoUrl!} alt={`Bukti ${record.type}`} width={500} height={500} className="rounded-lg w-full h-auto" />
              )}
            </div>
          )}

          {activeTab === 'peta' && hasLocation && (
            <div className="h-80 w-full">
              <LocationMap position={[record.location!.lat, record.location!.lon]} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}