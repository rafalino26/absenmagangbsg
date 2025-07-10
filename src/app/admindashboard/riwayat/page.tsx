'use client';

import { useState } from 'react';
import { FiEye } from 'react-icons/fi';
// 1. Impor modal baru
import AdminLiveDetailModal from '@/app/components/Modal/AdminLiveDetailModal';

// 2. Perbarui tipe data agar lebih fleksibel
interface LiveHistoryItem {
  id: number;
  name: string;
  type: 'Hadir' | 'Pulang' | 'Izin';
  title: string; // "Absen Masuk", "Absen Pulang", "Pengajuan Izin"
  description: string; // Berisi jam atau alasan
  isLate?: boolean;
  photoUrl?: string | null;
  location?: { lat: number; lon: number; } | null;
}

// 3. Perbarui mock data agar lebih realistis
const mockLiveHistory: LiveHistoryItem[] = [
  { id: 1, name: 'Rafael Lalujan', type: 'Hadir', title: 'Absen Masuk', description: '08:15 WITA', isLate: true, photoUrl: 'https://i.pravatar.cc/300?img=1', location: { lat: 1.4912, lon: 124.8491 } },
  { id: 2, name: 'Siti Rahayu', type: 'Izin', title: 'Pengajuan Izin', description: 'Sakit, ada acara keluarga mendadak.', photoUrl: null, location: null },
  { id: 3, name: 'Budi Santoso', type: 'Hadir', title: 'Absen Masuk', description: '07:55 WITA', isLate: false, photoUrl: 'https://i.pravatar.cc/300?img=2', location: { lat: 1.4748, lon: 124.8421 } },
];

export default function LiveAttendancePage() {
  const [liveHistory, setLiveHistory] = useState(mockLiveHistory);
  // 4. Aktifkan state untuk modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<LiveHistoryItem | null>(null);

  const handleViewDetails = (record: LiveHistoryItem) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Riwayat Absensi Hari Ini</h1>
          <p className="mt-1 text-md text-gray-600">Melihat data absensi yang masuk secara real-time.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Peserta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {liveHistory.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.type === 'Hadir' ? 'bg-green-100 text-green-800' :
                        item.type === 'Pulang' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                        {item.title}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${item.isLate ? 'text-red-600' : 'text-gray-700'}`}>
                    {item.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button 
                      onClick={() => handleViewDetails(item)}
                      className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-900 mx-auto"
                    >
                      <FiEye />
                      <span>Lihat Detail</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Render modal di sini */}
      <AdminLiveDetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        record={selectedRecord} 
      />
    </>
  );
}