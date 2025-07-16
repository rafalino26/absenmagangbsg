'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {  FiDownload, FiEye, FiPlus, FiTrash2, FiEdit, FiMoreVertical } from 'react-icons/fi';
import AdminDetailModal from '../../../components/Modal/AdminDetailModal';
import CustomDropdown from '../../../components/Modal/CustomDropdown';
import AddInternModal, { NewInternData } from '@/app/components/Modal/AddInternModal';
import { CSVLink } from 'react-csv';
import { InternSummary, NotificationState, AttendanceRecord } from '@/app/types';
import AdminDashboardSkeleton from '@/app/components/loading/AdminDashboardSkeleton';
import EditInternModal from '@/app/components/Modal/EditInternModal';
import NotificationModal   from '@/app/components/Modal/NotificationModal';
import AdminLiveDetailModal from '@/app/components/Modal/AdminLiveDetailModal';
import SpinnerOverlay from '@/app/components/loading/SpinnerOverlay';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatInternCode = (id: number): string => {
  return String(id).padStart(3, '0');
};

export default function AdminDashboardPage() {
  const [summaryData, setSummaryData] = useState<InternSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState('Semua Bulan');
  const [monthOptions, setMonthOptions] = useState(['Semua Bulan']);
  const [sortBy, setSortBy] = useState('Terbaru');
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState<InternSummary | null>(null);
  const [isAddInternModalOpen, setAddInternModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const closeNotification = () => setNotification(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [dailyLogData, setDailyLogData] = useState<AttendanceRecord[]>([]);
  const [isLiveDetailModalOpen, setLiveDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
 const fetchInterns = useCallback(async (month: string) => {
    // setIsLoading(true) dihapus dari sini
    try {
      const response = await fetch(`/api/interns?month=${encodeURIComponent(month)}`);
      if (response.ok) {
        const data = await response.json();
        setSummaryData(data);
      } else {
        console.error("Gagal mengambil data dari server");
        setSummaryData([]);
      }
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
    } 
    // finally { setIsLoading(false) } juga dihapus
  }, []);

  useEffect(() => {
    setIsLoading(true); // Nyalakan skeleton loading
    fetchInterns(monthFilter).finally(() => {
      setIsLoading(false); // Matikan skeleton loading setelah selesai
    });
  }, [monthFilter, fetchInterns]);

    useEffect(() => {
    const fetchMonthOptions = async () => {
      try {
        const response = await fetch('/api/months');
        if (response.ok) {
          const months: string[] = await response.json();
          setMonthOptions(['Semua Bulan', ...months]);
        }
      } catch (error) {
        console.error("Gagal mengambil opsi bulan:", error);
      }
    };
    fetchMonthOptions();
  }, []);

    useEffect(() => {
    fetchInterns(monthFilter);
  }, [monthFilter, fetchInterns])

    useEffect(() => {
    setIsClient(true);
  }, []);
  
const displayedData = useMemo(() => {
    let data = [...summaryData];
      if (searchQuery) {
    const lowercasedQuery = searchQuery.toLowerCase();
    data = data.filter(intern =>  
      intern.name.toLowerCase().includes(lowercasedQuery) ||
      formatInternCode(intern.id).includes(lowercasedQuery)
    );
  }
    switch (sortBy) {
      case 'Terbaru':
        data.sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());
        break;
        case 'Terlama':
        data.sort((b, a) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());
        break;
      case 'Abjad':
        data.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'Periode Magang':
         data.sort((a, b) => new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime());
        break;
    }
    return data;
  }, [summaryData, sortBy, searchQuery]);

      const csvHeaders = [
    { label: "No", key: "no" },
    { label: "Nama", key: "name" },
    { label: "Unit Kerja", key: "division" },
    { label: "No Rekening", key: "accountNumber" },
    { label: "Hari Kerja", key: "hadir" },
    { label: "Tidak Masuk Kerja (Tanggal)", key: "absenDates" },
    { label: "Uang Makan", key: "totalUangMakan" },
    { label: "Keterangan", key: "keterangan" },
  ];

     const csvData = displayedData.map((intern, index) => ({
  no: index + 1,
  name: intern.name,
  division: intern.division,
  accountNumber: intern.bankAccount ? `${intern.bankAccount.bank} - ${intern.bankAccount.number}` : '-',
  hadir: intern.hadir,
  absenDates: intern.absenDates, // Akan berisi placeholder '-' dari backend
  totalUangMakan: `Rp${new Intl.NumberFormat('id-ID').format(intern.totalUangMakan)}`,
  keterangan: intern.internshipPeriod, // Menggunakan data periode yang benar
}));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null); // Tutup menu
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

   const handleViewDetails = async (intern: InternSummary) => {
  setSelectedIntern(intern);
  setIsFetchingDetails(true);
  try {
    // Ubah URL fetch ke path yang baru
    const response = await fetch(`/api/interns/details?id=${intern.id}&month=${monthFilter}`);
    
    if (response.ok) {
      const data = await response.json();
      setDailyLogData(data);
      setDetailModalOpen(true);
    } else {
      setDailyLogData([]);
    }
  } catch (error) {
    console.error("Error fetching daily log:", error);
  } finally {
    setIsFetchingDetails(false);
  }
};

  const handleViewDayDetail = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setLiveDetailModalOpen(true);
  };

  const handleAddInternSubmit = async (data: NewInternData) => {
  setAddInternModalOpen(false); // Tutup modalnya dulu
  setIsSubmitting(true);
  try {
    const response = await fetch('/api/interns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Gagal menambah peserta.');
    }
    
    const newIntern = await response.json();
  
    await fetchInterns(monthFilter);

    setNotification({
      isOpen: true,
      title: 'Berhasil!',
      message: `Peserta baru ${newIntern.name} berhasil ditambahkan. Kode Magangnya adalah: ${formatInternCode(newIntern.id)}`,
      type: 'success',
    });

  } catch (error: any) {
    setNotification({
      isOpen: true,
      title: 'Gagal',
      message: error.message || 'Terjadi kesalahan.',
      type: 'error',
    });
  } finally {
    setIsSubmitting(false);
  }
};

  const handleEditClick = (intern: InternSummary) => {
    setSelectedIntern(intern);
    setEditModalOpen(true);
  };

   const handleEditSubmit = async (id: number, data: any) => {
    setEditModalOpen(false);
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/interns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Gagal memperbarui data.');
      }
      await fetchInterns(monthFilter);
      setNotification({
        isOpen: true,
        title: 'Berhasil',
        message: 'Data peserta berhasil diperbarui.',
        type: 'success',
      });
    } catch (error: any) {
      setNotification({
        isOpen: true,
        title: 'Gagal',
        message: 'Gagal memperbarui data.',
        type: 'error',
      });
    }
      finally {
    setIsSubmitting(false);
    }
  };

 const handleDeleteClick = (intern: InternSummary) => {
    setNotification({
      isOpen: true,
      title: 'Konfirmasi Hapus',
      message: `Anda yakin ingin menghapus peserta bernama ${intern.name}? Tindakan ini akan mengarsipkannya.`,
      type: 'confirm',
      onConfirm: () => performDelete(intern.id), // Panggil fungsi delete sebenarnya saat dikonfirmasi
    });
  };

  const performDelete = async (id: number) => {
  setIsSubmitting(true);
  try {
    const response = await fetch(`/api/interns/${id}`, { method: 'DELETE' });
    
    if (!response.ok) {
      throw new Error('Gagal menghapus peserta.');
    }

    // Refresh data dulu...
    await fetchInterns(monthFilter);

    // Baru tampilkan notifikasi sukses
    setNotification({ 
      isOpen: true, 
      title: 'Berhasil', 
      message: 'Peserta berhasil dihapus (diarsip).', 
      type: 'success' 
    });
    
  } catch (error: any) {
    setNotification({ 
      isOpen: true, 
      title: 'Gagal', 
      message: error.message || 'Terjadi kesalahan.', 
      type: 'error' 
    });
  } finally {
    setIsSubmitting(false); // Pastikan loading selalu berhenti
  }
};

   if (isLoading) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <>
    {isFetchingDetails && <SpinnerOverlay />}
    {isSubmitting && <SpinnerOverlay />}
    <div className="min-h-screen">    
      {/* Konten Utama Admin */}
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Rekapitulasi Absensi</h1>
            <p className="mt-1 text-md text-gray-600">Lihat dan kelola data absensi peserta magang.</p>
          </div>

          {/* Baris 1: Khusus untuk Filter */}
          <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border">
            <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
              <CustomDropdown
                label="Bulan"
                options={monthOptions}
                selectedValue={monthFilter}
                onSelect={setMonthFilter}
              />
              <CustomDropdown
                label="Urutkan"
                options={['Terbaru', 'Terlama', 'Abjad']}
                selectedValue={sortBy}
                onSelect={setSortBy}
              />
              <div>
            <label htmlFor="search" className="text-sm font-medium text-gray-700 mr-2">Cari Nama:</label>
            <input
              type="text"
              id="search"
              placeholder="Ketik nama/Kode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-auto rounded-md p-2 text-black border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            />
          </div>
            </div>
          </div>

          {/* Baris 2: Khusus untuk Tombol Aksi */}
          <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Tombol Tambah Peserta di Kiri */}
            <button 
              onClick={() => setAddInternModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors w-full md:w-auto"
            >
              <FiPlus />
              <span>Tambah Peserta</span>
            </button>

            {/* Tombol Download di Kanan */}
            <div className="w-full md:w-auto">
              {isClient && (
                <CSVLink
                  data={csvData}
                  headers={csvHeaders}
                  separator={";"}
                  filename={`Laporan_Absensi_${monthFilter.replace(' ', '_')}.csv`}
                  className="flex w-full items-center justify-center gap-2 bg-black text-white font-semibold py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <FiDownload />
                  <span className="lg:inline">Download</span>
                </CSVLink>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Peserta</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hadir</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Izin</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tidak Hadir</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Terlambat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Uang Makan</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center p-8 text-gray-500">Memuat data...</td>
              </tr>
            ) : (
                displayedData.map((intern) => (
                  <tr key={intern.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{intern.name}</div>
                      <div className="text-sm text-gray-500">Kode: {formatInternCode(intern.id)}| {intern.division}</div>
                      <div className="text-xs text-gray-500 mt-1">
                          Rek: {intern.bankAccount ? `${intern.bankAccount.bank} - ${intern.bankAccount.number}` : '-'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                        WA: {intern.phoneNumber || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-green-600 font-bold">{intern.hadir}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-blue-600 font-bold">{intern.izin}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-red-600 font-bold">{intern.absen}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-yellow-600 font-bold">{intern.terlambat}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-800">{formatCurrency(intern.totalUangMakan)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="relative inline-block text-left" ref={openMenuId === intern.id ? menuRef : null}>
                      <button
                        onClick={() => setOpenMenuId(openMenuId === intern.id ? null : intern.id)}
                        className="p-2 rounded-full hover:bg-gray-100"
                      >
                        <FiMoreVertical size={20} className="text-gray-600"/>
                      </button>
                      {openMenuId === intern.id && (
                        <div
                          className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                        >
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            <button
                              onClick={() => { handleViewDetails(intern); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <FiEye /> Lihat Detail
                            </button>
                            <button
                              onClick={() => { handleEditClick(intern); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <FiEdit /> Edit Peserta
                            </button>
                            <button
                              onClick={() => { handleDeleteClick(intern); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                              <FiTrash2 /> Hapus Peserta
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  </tr>
              ))
            )}
          </tbody>
          </table>
          </div>
        </div>
      </main>
    </div>
    <AddInternModal 
        isOpen={isAddInternModalOpen}
        onClose={() => setAddInternModalOpen(false)}
        onSubmit={handleAddInternSubmit}
      />
    <AdminDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        intern={selectedIntern}
        dailyLog={dailyLogData} // Gunakan data asli
        month={monthFilter}
        onViewDayDetail={handleViewDayDetail} // Oper fungsi ke modal
      />

      <AdminLiveDetailModal
        isOpen={isLiveDetailModalOpen}
        onClose={() => setLiveDetailModalOpen(false)}
        record={selectedRecord}
      />
    <EditInternModal 
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        internData={selectedIntern}
      />
      <NotificationModal
        isOpen={!!notification}
        onClose={closeNotification}
        title={notification?.title || ''}
        message={notification?.message || ''}
        type={notification?.type || 'success'}
        onConfirm={notification?.onConfirm}
      />
    </>
  );
}