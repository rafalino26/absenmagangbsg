'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiEye } from 'react-icons/fi';
import AdminLiveDetailModal from '@/app/components/Modal/AdminLiveDetailModal';
import { AttendanceRecord } from '@/app/types';
import CustomDropdown from '@/app/components/Modal/CustomDropdown';
import AdminDashboardSkeleton from '@/app/components/loading/AdminDashboardSkeleton';

export default function LiveAttendancePage() {
  const [liveHistory, setLiveHistory] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [dateFilter, setDateFilter] = useState('Hari Ini');
  const dateOptions = ['Hari Ini', 'Semua Hari'];

   const fetchLiveHistory = useCallback(async (filter: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/attendances/live?filter=${encodeURIComponent(filter)}`);
      if (response.ok) {
        const data = await response.json();
        setLiveHistory(data);
      } else {
        console.error("Gagal mengambil data riwayat live");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveHistory(dateFilter);
  }, [dateFilter, fetchLiveHistory]);

  const handleViewDetails = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

   if (isLoading) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Riwayat Absensi</h1>
          <p className="mt-1 text-md text-gray-600">Melihat data absensi yang masuk.</p>
        </div>
         <CustomDropdown
            label="Tampilkan"
            options={dateOptions}
            selectedValue={dateFilter}
            onSelect={setDateFilter}
          />
        <div className="bg-white rounded-lg shadow-sm border mt-4 overflow-hidden">
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
              {isLoading ? (
                <tr><td colSpan={4} className="text-center p-8 text-gray-500">Memuat data...</td></tr>
              ) : liveHistory.length > 0 ? (
                liveHistory.map((item) => (
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
                     <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      (item.isLate && item.type === 'Hadir') ? 'text-red-600' : 'text-gray-700'
                    }`}>
                      {item.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex flex-col items-center gap-1">
                    <button 
                      onClick={() => handleViewDetails(item)} 
                      className="text-sm bg-gray-600 text-white font-semibold py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Lihat Detail
                    </button>
                  </div>
                  </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="text-center p-8 text-gray-500">Belum ada absensi untuk hari ini.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminLiveDetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        record={selectedRecord} 
      />
    </>
  );
}