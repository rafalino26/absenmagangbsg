'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { FiFilter, FiDownload, FiEye, FiPlus } from 'react-icons/fi';
import Image from 'next/image';
import AdminDetailModal from '../../components/Modal/AdminDetailModal';
import CustomDropdown from '../../components/Modal/CustomDropdown';
import AddInternModal, { NewInternData } from '@/app/components/Modal/AddInternModal';
import { CSVLink } from 'react-csv';
import { InternSummary, DailyLogItem } from '@/app/types';

const mockDailyLog: DailyLogItem[] = [
    { date: 'Senin, 7 Juli 2025', status: 'Hadir (Terlambat)', description: 'Masuk: 08:15 WITA', photoUrl: 'https://i.pravatar.cc/300?img=1' },
    { date: 'Jumat, 4 Juli 2025', status: 'Izin', description: 'Sakit, ada surat dokter.', photoUrl: 'https://i.pravatar.cc/300?img=2' },
    { date: 'Kamis, 3 Juli 2025', status: 'Hadir', description: 'Masuk: 07:55 WITA', photoUrl: 'https://i.pravatar.cc/300?img=3' },
    { date: 'Rabu, 2 Juli 2025', status: 'Tidak Hadir', description: 'Tanpa Keterangan', photoUrl: null },
    { date: 'Selasa, 1 Juli 2025', status: 'Hadir', description: 'Masuk: 07:59 WITA', photoUrl: 'https://i.pravatar.cc/300?img=4' },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatInternCode = (id: number): string => {
  // Mengubah angka menjadi string dan menambah '0' di depan sampai panjangnya 3 karakter
  return String(id).padStart(3, '0');
};

export default function AdminDashboardPage() {
  const [summaryData, setSummaryData] = useState<InternSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('Juli 2025');
  const [monthFilter, setMonthFilter] = useState('Semua Bulan');
  const [sortBy, setSortBy] = useState('Terbaru');
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState<InternSummary | null>(null);
  const [isAddInternModalOpen, setAddInternModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const fetchInterns = useCallback(async (month: string) => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }, []);

    useEffect(() => {
    fetchInterns(monthFilter);
  }, [monthFilter, fetchInterns])

    useEffect(() => {
    setIsClient(true);
  }, []);

 const monthOptions = ['Semua Bulan', 'Juli 2025', 'Juni 2025', 'Mei 2025'];;
  
const displayedData = useMemo(() => {
    let data = [...summaryData];
    switch (sortBy) {
      case 'Terbaru':
        data.sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());
        break;
      case 'Abjad':
        data.sort((a, b) => a.name.localeCompare(b.name));
        break;
      // 'Periode Magang' bisa disamakan dengan 'Terbaru' untuk sementara
      case 'Periode Magang':
         data.sort((a, b) => new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime());
        break;
    }
    return data;
  }, [summaryData, sortBy]);

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
    absenDates: '10, 11 Juli 2025', // Placeholder, nanti data ini diambil dari detail log
    totalUangMakan: intern.totalUangMakan,
    keterangan: `Periode Magang ${new Date(intern.joinDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`,
  }));

  // 3. Buat fungsi untuk membuka modal dan memilih intern
  const handleViewDetails = (intern: InternSummary) => {
    setSelectedIntern(intern);
    setDetailModalOpen(true);
    // Di aplikasi nyata, di sini kita akan fetch 'mockDailyLog' dari API
  };

  const handleAddInternSubmit = async (data: NewInternData) => {
    try {
      const response = await fetch('/api/interns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const newIntern = await response.json();
        alert(`Peserta baru ${newIntern.name} berhasil ditambahkan! Kode Magangnya adalah: ${formatInternCode(newIntern.id)}`);
        fetchInterns(monthFilter); // Refresh data sesuai filter aktif
      } else {
        const errorData = await response.json();
        alert(`Gagal menambahkan peserta: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
      alert("Tidak dapat terhubung ke server.");
    }
  };

  return (
    <>
    <div className="min-h-screen">    
      {/* Konten Utama Admin */}
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Rekapitulasi Absensi</h1>
            <p className="mt-1 text-md text-gray-600">Lihat dan kelola data absensi peserta magang.</p>
          </div>

          {/* Bagian Kontrol */}
            <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border 
              flex flex-col gap-4 
              md:flex-row md:items-center md:justify-between"
            >
              <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:gap-6">
                <CustomDropdown
            label="Bulan"
            options={monthOptions} // <-- Gunakan opsi dinamis
            selectedValue={monthFilter}
            onSelect={setMonthFilter}
        />
                <CustomDropdown
                  label="Urutkan"
                  options={['Terbaru', 'Abjad', 'Periode Magang']}
                  selectedValue={sortBy}
                  onSelect={setSortBy}
                />
              </div>
              <div className="w-full md:w-auto">
  {isClient && (
    <CSVLink
      data={csvData}
      headers={csvHeaders}
      separator={";"} // <-- TAMBAHKAN PROPERTI INI
      filename={`Laporan_Absensi_${monthFilter.replace(' ', '_')}.csv`}
      className="flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors w-full"
    >
      <FiDownload />
      <span>Download Laporan</span>
    </CSVLink>
  )}
</div>
            </div>
             <div className="mb-4 flex justify-end">
      <button 
        onClick={() => setAddInternModalOpen(true)}
        className="flex items-center gap-2 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
      >
        <FiPlus />
        <span>Tambah Peserta</span>
      </button>
    </div>
          {/* Tabel Rekapan */}
          <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Peserta</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hadir</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Izin</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tidak Hadir</th>
                  {/* 3. Tambahkan kolom header 'Terlambat' */}
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Terlambat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Uang Makan</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
              // 6. Tampilkan pesan loading
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-green-600 font-bold">{intern.hadir}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-blue-600 font-bold">{intern.izin}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-red-600 font-bold">{intern.absen}</td>
                    {/* 4. Tampilkan data 'terlambat' di setiap baris */}
                    <td className="px-6 py-4 whitespace-nowrap text-center text-yellow-600 font-bold">{intern.terlambat}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-800">{formatCurrency(intern.totalUangMakan)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                       <button 
                          onClick={() => handleViewDetails(intern)}
                          className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-900 mx-auto"
                        >
                          <FiEye />
                          <span>Lihat Detail</span>
                        </button>
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
        dailyLog={mockDailyLog} // Untuk sekarang, kita pakai data palsu
        month={selectedMonth}
      />
    </>
  );
}