// app/admindashboard/(main)/log-harian/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiCheck, FiX, FiTool } from 'react-icons/fi';
import SpinnerOverlay from '@/app/components/loading/SpinnerOverlay';
import NotificationModal from '@/app/components/Modal/NotificationModal';
import { NotificationState } from '@/app/types';
import { useAuth } from '@/app/hooks/useAuth';
import { Role, LogStatus } from '@prisma/client';
import ManageActivitiesModal from '@/app/components/Modal/ManageActivitiesModal'; 

interface DailyLog {
  id: number;
  activity: string;
  status: LogStatus;
  notes: string | null;
  createdAt: string;
  user: {
    name: string;
    division: string;
  };
}

export default function DailyLogsPage() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [isManageActivitiesModalOpen, setManageActivitiesModalOpen] = useState(false);
  const auth = useAuth(); // Dapatkan role user yang login

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/logs');
      if (!response.ok) throw new Error('Gagal memuat data log.');
      setLogs(await response.json());
    } catch (error: any) {
      setNotification({ isOpen: true, title: 'Error', message: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleUpdateStatus = async (logId: number, status: LogStatus, notes?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/logs/${logId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
      if (!response.ok) throw new Error('Gagal memperbarui status log.');

      setNotification({ isOpen: true, title: 'Berhasil', message: 'Status log berhasil diperbarui.', type: 'success' });
      fetchLogs(); // Refresh data
    } catch (error: any) {
      setNotification({ isOpen: true, title: 'Gagal', message: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleApprove = (logId: number) => {
    handleUpdateStatus(logId, LogStatus.APPROVED);
  };

  const handleReject = (logId: number) => {
    const notes = prompt("Harap masukkan alasan penolakan:");
    if (notes) { // Hanya proses jika mentor memasukkan alasan
      handleUpdateStatus(logId, LogStatus.REJECTED, notes);
    }
  };

  return (
    <>
      {isLoading && <SpinnerOverlay />}
      
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Log Aktivitas Harian</h1>
          <p className="mt-1 text-md text-gray-600">Review dan validasi laporan aktivitas harian dari peserta magang.</p>
        </div>
        {/* Tombol ini hanya muncul untuk Superadmin */}
         {auth?.role === Role.SUPER_ADMIN && (
          <button 
            onClick={() => setManageActivitiesModalOpen(true)} // <-- Fungsikan tombol
            className="bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-800 flex items-center gap-2"
          >
            <FiTool /> Atur Pilihan Aktivitas
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peserta</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktivitas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{log.user.name}</div>
                    <div className="text-sm text-gray-500">{log.user.division}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-sm whitespace-normal">{log.activity}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        log.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        log.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                    }`}>
                      {log.status}
                    </span>
                    {log.status === 'REJECTED' && <p className="text-xs text-red-600 mt-1">Alasan: {log.notes}</p>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {log.status === 'PENDING' && auth?.role === Role.ADMIN && (
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleApprove(log.id)} className="p-2 text-green-600 hover:bg-green-100 rounded-full" title="Approve">
                          <FiCheck size={18} />
                        </button>
                        <button onClick={() => handleReject(log.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full" title="Reject">
                          <FiX size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center p-8 text-gray-500">
                  {isLoading ? 'Memuat data...' : 'Tidak ada log aktivitas.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ManageActivitiesModal
        isOpen={isManageActivitiesModalOpen}
        onClose={() => setManageActivitiesModalOpen(false)}
        setNotification={setNotification}
      />

      {notification && (
        <NotificationModal
          onClose={() => setNotification(null)}
          {...notification}
        />
      )}
    </>
  );
}