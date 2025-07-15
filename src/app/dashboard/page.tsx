'use client';

import { useState, useEffect, useCallback, MouseEvent  } from 'react';
import { FiClock, FiEdit3, FiLogOut, FiX, FiCamera, FiEdit, FiChevronDown, FiDownload } from 'react-icons/fi';
import { CSVLink } from 'react-csv';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import AttendanceModal from '../components/Modal/AttendanceModal';
import LeaveRequestModal from '../components/Modal/LeaveRequestModal';
import ProfilePicModal from '../components/Modal/ProfilePicModal';
import HadirButton from '../components/Button/HadirButton';
import PulangButton from '../components/Button/PulangButton';
import LeaveRequestButton from '../components/Button/IzinButton';
import BankAccountModal from '../components/Modal/BankAccountModal';
import DashboardSkeleton from '../components/loading/DashboardSkeleton';
import UserDetailModal from '../components/Modal/UserDetailModal';
import NotificationModal from '../components/Modal/NotificationModal';
import SpinnerOverlay from '../components/loading/SpinnerOverlay';
import PhoneModal from '../components/Modal/PhoneModal';
import { NotificationState } from '../types';

interface HistoryItem {
  id: number;
  type: 'Hadir' | 'Pulang' | 'Izin';
  title: string;
  date: string;
  description: string;
  lat?: number; 
  lon?: number; 
  photoUrl?: string;
}

interface UserProfile {
  name: string;
  division: string;
  internshipPeriod: string;
}

interface LocationState {
  latitude: number;
  longitude: number;
}

const LocationMap = dynamic(() => import('../components/Modal/LocationMap'), {
  ssr: false, 
});

const isLate = (timeString: string): boolean => {
  try {
    const timePart = timeString.split(' ')[0];
    const [hour, minute] = timePart.split(':').map(Number);

    if (hour > 8) {
      return true;
    }
    if (hour === 8 && minute > 0) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Gagal mem-parsing waktu:", timeString, error);
    return false; 
  }
};

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [profilePic, setProfilePic] = useState('/avatar-default.png');
  const [bankAccount, setBankAccount] = useState<{ bank: string; number: string; } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasClockedIn, setHasClockedIn] = useState(false);
  const [hasClockedOut, setHasClockedOut] = useState(false);
  const [isAttendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [attendanceType, setAttendanceType] = useState<'Hadir' | 'Pulang'>('Hadir');
  const [isLeaveModalOpen, setLeaveModalOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isBankAccountModalOpen, setBankAccountModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [isPhoneModalOpen, setPhoneModalOpen] = useState(false);
  const closeNotification = () => setNotification(null);
  const router = useRouter();

    useEffect(() => {
      setIsClient(true);
    }, []);

   const fetchData = useCallback(async () => {
    try {
      const [userRes, historyRes] = await Promise.all([
        fetch('/api/users/me'),
        fetch('/api/attendances/history')
      ]);
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
        if (userData.bankName && userData.accountNumber) {
          setBankAccount({ bank: userData.bankName, number: userData.accountNumber });
        } else {
          setBankAccount(null);   
        }
        if (userData.phoneNumber) setPhoneNumber(userData.phoneNumber);
          else setPhoneNumber(null);
        if (userData.profilePicUrl) {
          setProfilePic(userData.profilePicUrl);
        } else {
          setProfilePic('/avatar-default.png');
        }
        
      } else { 
        console.error("Gagal mengambil data user");
      }

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData);
      }
    } catch (e) {
      console.error("Error mengambil data:", e);
      setError("Gagal memuat data.");
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchData().finally(() => setIsLoading(false));
  }, [fetchData]);

  useEffect(() => {
    if (!isLoading && history) {
      const todayString = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const clockedInToday = history.some(item => item.type === 'Hadir' && item.date === todayString);
      const clockedOutToday = history.some(item => item.type === 'Pulang' && item.date === todayString);
      setHasClockedIn(clockedInToday);
      setHasClockedOut(clockedOutToday);
    }
  }, [history, isLoading]);
    const openAttendanceModal = (type: 'Hadir' | 'Pulang') => {
    setAttendanceType(type);
    setAttendanceModalOpen(true);
  };

// Di dalam komponen DashboardPage

// 1. Siapkan header kolom yang baru untuk CSV
const csvHeaders = [
  { label: "Tanggal", key: "date" },
  { label: "Status", key: "title" },
  { label: "Keterangan", key: "description" },
  { label: "Hadir", key: "kehadiran" }, // <-- Kolom baru
];

// 2. Siapkan data dengan logika yang sudah diperbarui
const csvData = history
  // Filter untuk membuang "Absen Pulang"
  .filter(item => item.type !== 'Pulang')
  // Map untuk memformat setiap baris
  .map(item => {
    let description = item.description;

    // Tambahkan "(Terlambat)" jika user terlambat
    if (item.type === 'Hadir' && isLate(item.description)) {
      description = `(Terlambat) ${item.description} `;
    }

    return {
      date: item.date,
      title: item.title,
      description: description,
      // Kolom "Hadir" akan berisi 1 jika status Hadir, dan 0 jika Izin/Tidak Hadir
      kehadiran: item.type === 'Hadir' ? 1 : 0,
    };
  });


 const handleConfirmAttendance = async (photoFile: File) => {
  setAttendanceModalOpen(false);
  setIsSubmitting(true);
  setError(null);

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      };
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });

    const { latitude, longitude } = position.coords;
    const now = new Date();
    const clockInTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const isLate = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 0);

    const formData = new FormData();
    formData.append('photo', photoFile);
    formData.append('type', attendanceType);
    formData.append('latitude', String(latitude));
    formData.append('longitude', String(longitude));
    formData.append('description', `${clockInTime} WITA`);
    formData.append('isLate', String(isLate));
    
    const response = await fetch('/api/attendances', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Gagal melakukan absen ${attendanceType}.`);
    }
     setNotification({
    isOpen: true,
    title: 'Berhasil',
    message: `Absen ${attendanceType} telah berhasil dicatat.`,
    type: 'success',
  });
    await fetchData(); 
  } catch (err: any) {
    let message = err.message || "Gagal mendapatkan lokasi.";
    if (err.code === 1) message = "Anda menolak izin lokasi.";
    if (err.code === 3) message = "Waktu permintaan lokasi habis, sinyal mungkin lemah.";
    setError(message);
  } finally {
    setIsSubmitting(false);
  }
};
  
const handleLeaveRequest = () => {
    setLeaveModalOpen(true);
  };

const handleConfirmLeave = async ({ reason, attachment }: { reason: string, attachment: File | null }) => {
  setLeaveModalOpen(false);
  setIsSubmitting(true);
  setError(null);

  try {
    const formData = new FormData();
    formData.append('type', 'Izin');
    formData.append('description', reason);

    if (attachment) {
      formData.append('photo', attachment);
    }
    
    const response = await fetch('/api/attendances', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Gagal mengajukan izin.');
    }

   setNotification({
    isOpen: true,
    title: 'Berhasil',
    message: 'Pengajuan izin Anda telah berhasil dicatat.',
    type: 'success',
  });
    await fetchData();
  } catch (err: any) {
    setError(err.message || 'Terjadi kesalahan.');
  } finally {
    setIsSubmitting(false);
  }
};

const handleViewDetails = (item: HistoryItem) => {
    setSelectedHistoryItem(item);
    setDetailModalOpen(true);
  };

const handleProfilePicSubmit = async (newPhotoFile: File) => {
  setProfileModalOpen(false);
  setIsSubmitting(true);
  setError(null);

  const formData = new FormData();
  formData.append('photo', newPhotoFile);

  try {
    const response = await fetch('/api/users/profile', {
      method: 'PATCH',
      body: formData,
    });

    if (response.ok) {
      const updatedUserData = await response.json();
      setUser(updatedUserData); 
      if (updatedUserData.profilePicUrl) {
        setProfilePic(updatedUserData.profilePicUrl);
      }
     setNotification({
      isOpen: true,
      title: 'Berhasil',
      message: 'Foto profil Anda telah berhasil diperbarui.',
      type: 'success',
    });
    } else {
      const errorData = await response.json();
      setError(errorData.error || "Gagal memperbarui foto profil.");
    }
  } catch (e: any) {
    setError("Gagal terhubung ke server.");
  } finally {
    setIsSubmitting(false);
  }
};
  
const handleBankAccountSubmit = async (data: { bank: string; number: string }) => {
  setBankAccountModalOpen(false);
  setIsSubmitting(true);
  setError(null);

  const formData = new FormData();
  formData.append('bankName', data.bank);
  formData.append('accountNumber', data.number);

  try {
    const response = await fetch('/api/users/profile', {
      method: 'PATCH',
      body: formData,
    });

    if (response.ok) {
      const updatedUserData = await response.json();
      setUser(updatedUserData);
      if (updatedUserData.bankName && updatedUserData.accountNumber) {
        setBankAccount({ bank: updatedUserData.bankName, number: updatedUserData.accountNumber });
      }
      setNotification({
      isOpen: true,
      title: 'Berhasil',
      message: 'Informasi rekening berhasil disimpan.',
      type: 'success',
    });
    } else {
      const errorData = await response.json();
      setError(errorData.error || "Gagal menyimpan info rekening.");
    }
  } catch (e: any) {
    setError("Gagal terhubung ke server.");
  } finally {
    setIsSubmitting(false);
  }
};

const handlePhoneSubmit = async (phone: string) => {
  setPhoneModalOpen(false); // Tutup modal nomor HP
  setIsSubmitting(true);
  setError(null);

  const formData = new FormData();
  formData.append('phoneNumber', phone);

  try {
    const response = await fetch('/api/users/profile', {
      method: 'PATCH',
      body: formData,
    });

    if (response.ok) {
      // Ambil data user yang sudah ter-update dari respons API
      const updatedUserData = await response.json();
      
      // Perbarui state user dan nomor telepon secara lokal
      setUser(updatedUserData);
      if (updatedUserData.phoneNumber) {
        setPhoneNumber(updatedUserData.phoneNumber);
      }

      // Tampilkan notifikasi sukses
      setNotification({
        isOpen: true,
        title: 'Berhasil',
        message: 'Nomor telepon berhasil disimpan.',
        type: 'success',
      });
    } else {
      const errorData = await response.json();
      setError(errorData.error || "Gagal menyimpan nomor telepon.");
    }
  } catch (e: any) {
    setError("Gagal terhubung ke server.");
  } finally {
    setIsSubmitting(false);
  }
};

  const handleLogout = () => {
    setNotification({
      isOpen: true,
      title: 'Konfirmasi Logout',
      message: 'Anda yakin ingin keluar dari sesi ini?',
      type: 'confirm',
      onConfirm: performLogout,
    });
  };

  const performLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin'); 
  };

  if (isLoading) {
    return (
      <>
         <header className="bg-red-600 shadow-sm">
          <div className="max-w-7xl px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0">
                <div className="w-[50px] aspect-square rounded-full overflow-hidden shadow-lg">
                  <Image src="/logobsg.jpg" width={800} height={500} alt="Logo" className="w-full h-full object-cover"/>
                </div>
              </div>
              <div><h1 className="text-xl font-bold text-white">Absen Magang</h1></div>
            </div>
          </div>
        </header>
        <main>
          <DashboardSkeleton />
        </main>
      </>
    );
  }

  return (
    <>
    {isSubmitting && <SpinnerOverlay />}
      <div className="bg-gray-50 min-h-screen">
<header className="bg-red-600 shadow-sm">
  <div className="   px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
  
    <div className="flex items-center gap-2">
      <div className="flex-shrink-0">
        <div className="w-[50px] aspect-square rounded-full overflow-hidden shadow-lg">
          <Image src="/logobsg.jpg" width={800} height={500} alt="Logo" className="w-full h-full object-cover"/>
        </div>
      </div>
      <div><h1 className="text-xl font-bold text-white">Absen Magang</h1></div>
    </div>
    <button 
      onClick={handleLogout}
      className="p-2 text-white rounded-full hover:bg-red-700"
      title="Logout"
    >
      <FiLogOut size={22} />
    </button>
  </div>
</header>
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 md:gap-6 mb-8">
              <div className="flex-shrink-0">
                <button 
                  onClick={() => setProfileModalOpen(true)}
                  className="relative group"
                >
                  <Image
                    src={profilePic}
                    alt="Foto profil"
                    width={80}
                    height={80}
                    className="w-24 h-24 md:w-24 md:h-24 rounded-full object-cover shadow-md"
                  />
                  <div className="absolute inset-0 rounded-full transition-all flex items-center justify-center">
                    <FiCamera className="text-black opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                  </div>
                </button>
              </div>
              <div className="flex-grow pt-2">
              <h1 className="text-lg md:text-3xl font-bold text-gray-900">Halo, {user?.name}!</h1>
              <p className="mt-1 text-sm md:text-base text-gray-600">{user?.division} | Periode: {user?.internshipPeriod}</p>              
              <div className="mt-2 flex items-center gap-2">
                <p className="text-xs md:text-sm text-gray-600">
                  No. Rekening: 
                  {bankAccount ? (
                    <span className="font-semibold text-gray-800 ml-1">{bankAccount.bank} - {bankAccount.number}</span>
                  ) : (
                    <span className="text-red-500 ml-1">Silakan masukkan rekening Anda</span>
                  )}
                </p>
                <button
                  onClick={() => setBankAccountModalOpen(true)}
                  className="p-1 text-gray-500 hover:text-red-600 hover:bg-black rounded-full"
                  aria-label="Edit Informasi Rekening"
                >
                  <FiEdit size={16} />
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <p className="text-xs md:text-sm text-gray-600">
                  No. WA: 
                  {phoneNumber ? (
                    <span className="font-semibold text-gray-800 ml-1">{phoneNumber}</span>
                  ) : (
                    <span className="text-red-500 ml-1">Silakan masukkan nomor WA</span>
                  )}
                </p>
                <button onClick={() => setPhoneModalOpen(true)} className="p-1 text-gray-500 hover:text-black hover:bg-red-50 rounded-full">
                  <FiEdit size={16} />
                </button>
              </div>
              <div className="mt-2 text-lg min-h-[20px]">
              {error && <p className="text-red-600 font-semibold">Error: {error}</p>}
            </div>
            </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <HadirButton
                onClick={() => openAttendanceModal('Hadir')}
                hasClockedIn={hasClockedIn}
                loading={isSubmitting}
              />
               <PulangButton
                onClick={() => openAttendanceModal('Pulang')}
                hasClockedIn={hasClockedIn}
                hasClockedOut={hasClockedOut}
                loading={isSubmitting}
              />
              <LeaveRequestButton
                onClick={handleLeaveRequest}
                loading={isSubmitting}
              />
            </div>
            <div className="mt-10">
               <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              >
                <h2 className="text-xl font-bold text-gray-800">Riwayat Absensi Terkini</h2>
              <div className="flex items-center gap-4">
                {isClient && (
                  // 1. Bungkus CSVLink dengan <span> dan pindahkan onClick ke sini
                  <span onClick={(e) => e.stopPropagation()}>
                    <CSVLink
                      data={csvData}
                      headers={csvHeaders}
                      separator={";"}
                      filename={`Riwayat_Absen_${user?.name}.csv`}
                      className="flex items-center gap-2 text-sm bg-black text-white py-1 px-3 rounded-lg hover:bg-gray-800"
                    >
                      <FiDownload size={16} />
                      <span>Download</span>
                    </CSVLink>
                  </span>
                )}
                <FiChevronDown 
                  className={`text-gray-500 transition-transform duration-300 ${isHistoryOpen ? 'rotate-180' : ''}`} 
                  size={24} 
                />
              </div>
              </div>
               <div 
              className={`transition-all duration-500 ease-in-out overflow-hidden 
                ${isHistoryOpen ? 'max-h-screen mt-4' : 'max-h-0'}`
              }
            >
              <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {history.length === 0 ? (
                    <li className="p-4 text-center text-gray-500">Belum ada riwayat absensi.</li>
                  ) : (
                    history.map((item) => (
                      // 1. Ganti dari 'flex' menjadi 'grid' dan definisikan 3 kolom
                      <li key={item.id} className="p-4 grid grid-cols-[auto_1fr_auto] items-center gap-4 hover:bg-gray-50">
                        
                        {/* Kolom 1: Ikon Status */}
                        <span className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full text-white 
                          ${item.type === 'Hadir' ? 'bg-green-500' : item.type === 'Pulang' ? 'bg-orange-500' : 'bg-blue-500'}`}>
                          {item.type === 'Hadir' && <FiClock size={20}/>}
                          {item.type === 'Pulang' && <FiLogOut size={20}/>}
                          {item.type === 'Izin' && <FiEdit3 size={20}/>}
                        </span>
                        
                        {/* Kolom 2: Info Teks (mengisi sisa ruang) */}
                        <div>
                          <p className="font-semibold text-gray-800">{item.title}</p>
                          <p className="text-sm text-gray-600">{item.date}</p>
                          {item.type === 'Hadir' && isLate(item.description) ? (
                            <p className="text-sm text-red-600 font-bold">{item.description} (Terlambat)</p>
                          ) : (
                            <p className="text-sm text-gray-500">{item.description}</p>
                          )}
                        </div>
                        
                        {/* Kolom 3: Tombol Aksi */}
                        {item.lat && item.lon && (
                          <div className="flex flex-col items-center gap-1">
                            <button 
                              onClick={() => handleViewDetails(item)} 
                              className="text-sm bg-gray-600 text-white font-semibold py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                              Lihat Detail
                            </button>
                            <p className="text-xs text-gray-400">
                              {item.lat.toFixed(4)}, {item.lon.toFixed(4)}
                            </p>
                          </div>
                        )}
                      </li>
                    ))
                  )}
                </ul>
              </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setAttendanceModalOpen(false)}
        onSubmit={handleConfirmAttendance}
        attendanceType={attendanceType}
      />
      <LeaveRequestModal 
       isOpen={isLeaveModalOpen} 
       onClose={() => setLeaveModalOpen(false)} 
       onSubmit={handleConfirmLeave} 
      />
       <ProfilePicModal
        isOpen={isProfileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onSubmit={handleProfilePicSubmit}
        currentImageUrl={profilePic}
      />
      <BankAccountModal
        isOpen={isBankAccountModalOpen}
        onClose={() => setBankAccountModalOpen(false)}
        onSubmit={handleBankAccountSubmit}
        currentAccount={bankAccount}
      />
      <PhoneModal
        isOpen={isPhoneModalOpen}
        onClose={() => setPhoneModalOpen(false)}
        onSubmit={handlePhoneSubmit}
        currentPhone={phoneNumber}
      />
        <UserDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        record={selectedHistoryItem}
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