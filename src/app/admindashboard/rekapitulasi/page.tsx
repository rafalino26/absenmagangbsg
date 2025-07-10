'use client';

import { useState, useMemo, useEffect } from 'react';
import { FiFilter, FiDownload, FiEye, FiPlus } from 'react-icons/fi';
import Image from 'next/image';
import AdminDetailModal from '../../components/Modal/AdminDetailModal';
import CustomDropdown from '../../components/Modal/CustomDropdown';
import AddInternModal, { NewInternData } from '@/app/components/Modal/AddInternModal';
import { CSVLink } from 'react-csv';

// 1. Tambahkan properti 'terlambat' pada tipe data
interface InternSummary {
  id: number;
  name: string;
  internCode: string;
  division: string;
  hadir: number;
  izin: number;
  absen: number;
  terlambat: number; // <-- Kolom baru
  totalUangMakan: number;
  bankAccount: { bank: string; number: string; } | null; // <-- Tambah info rekening
  joinDate: Date;
}

interface DailyLogItem { 
    date: string; 
    status: 'Hadir' | 'Hadir (Terlambat)' | 'Izin' | 'Tidak Hadir'; 
    description: string; 
    photoUrl?: string | null; 
}

// 2. Tambahkan data 'terlambat' pada mock data
const initialSummaryData: InternSummary[] = [
  { id: 1, name: 'Rafael Lalujan', internCode: '001', division: 'Human Capital', hadir: 18, izin: 1, absen: 1, terlambat: 5, totalUangMakan: 270000, bankAccount: { bank: 'BSG', number: '123456789' }, joinDate: new Date('2025-07-01') },
  { id: 2, name: 'Budi Santoso', internCode: '002', division: 'IT Support', hadir: 20, izin: 0, absen: 0, terlambat: 1, totalUangMakan: 300000, bankAccount: { bank: 'BSG', number: '987654321' }, joinDate: new Date('2025-07-02') },
  { id: 3, name: 'Siti Rahayu', internCode: '003', division: 'Marketing', hadir: 19, izin: 0, absen: 1, terlambat: 0, totalUangMakan: 285000, bankAccount: null, joinDate: new Date('2025-07-05') },
];

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

export default function AdminDashboardPage() {
  const [summaryData, setSummaryData] = useState<InternSummary[]>(initialSummaryData);
  const [selectedMonth, setSelectedMonth] = useState('Juli 2025');
  const [monthFilter, setMonthFilter] = useState('Juli 2025');
  const [sortBy, setSortBy] = useState('Terbaru');
    // 2. Tambahkan state untuk mengontrol modal detail
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState<InternSummary | null>(null);
  const [isAddInternModalOpen, setAddInternModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

    useEffect(() => {
    setIsClient(true);
  }, []);
  
  const displayedData = useMemo(() => {
    let data = [...summaryData];

    // Nanti logika filter bulan akan ada di sini
    // data = data.filter(intern => ...);

    // Logika sorting
    switch (sortBy) {
      case 'Terbaru':
        data.sort((a, b) => b.joinDate.getTime() - a.joinDate.getTime());
        break;
      case 'Abjad':
        data.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'Periode Magang':
        // Asumsi periode sama dengan tanggal masuk untuk sementara
        data.sort((a, b) => a.joinDate.getTime() - b.joinDate.getTime());
        break;
    }
    return data;
  }, [summaryData, monthFilter, sortBy]);

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
    keterangan: `Periode Magang ${intern.joinDate.toLocaleDateString('id-ID')}`, // Contoh keterangan
  }));

  // 3. Buat fungsi untuk membuka modal dan memilih intern
  const handleViewDetails = (intern: InternSummary) => {
    setSelectedIntern(intern);
    setDetailModalOpen(true);
    // Di aplikasi nyata, di sini kita akan fetch 'mockDailyLog' dari API
  };

  const handleAddInternSubmit = (data: NewInternData) => {
    console.log("Data intern baru:", data);
    alert(`Peserta baru ${data.name} berhasil ditambahkan (simulasi).`);
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
                  options={['Juli 2025', 'Juni 2025', 'Mei 2025']}
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
                {displayedData.map((intern) => (
                  <tr key={intern.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{intern.name}</div>
                      <div className="text-sm text-gray-500">Kode: {intern.internCode} | {intern.division}</div>
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
                ))}
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